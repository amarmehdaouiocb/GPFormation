import Stripe from "stripe";
import { sendRecoveryRegistrationEmail } from "@/lib/email";
import { processCapturedRecoveryPayment } from "@/lib/recovery-payment";
import {
  cancelRecoveryPaymentAuthorization,
  claimRecoveryPayment,
  completeRecoveryPayment,
  markRecoveryPaymentAuthorized,
} from "@/lib/recovery-registration";
import { getRecoveryPaymentMetadata } from "@/lib/stripe";

export const runtime = "nodejs";

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getPaymentLinkId(
  paymentLink: string | Stripe.PaymentLink | null,
): string | null {
  if (typeof paymentLink === "string") {
    return paymentLink;
  }

  return paymentLink?.id ?? null;
}

async function processLegacyCheckoutEvent(
  session: Stripe.Checkout.Session,
): Promise<string> {
  if (session.payment_status !== "paid") {
    return "Payment not confirmed";
  }

  const expectedPaymentLinkId = process.env.STRIPE_RECOVERY_PAYMENT_LINK_ID;
  if (
    !expectedPaymentLinkId ||
    getPaymentLinkId(session.payment_link) !== expectedPaymentLinkId
  ) {
    return "Payment Link ignored";
  }

  const reference = session.client_reference_id;
  if (!reference?.startsWith("recovery_")) {
    return "Registration reference ignored";
  }

  const claim = await claimRecoveryPayment(session.id, reference);
  if (claim.status === "processed") {
    return "Paid registration already processed";
  }

  await sendRecoveryRegistrationEmail(claim.data, {
    stripePaymentId: session.id,
    amountTotal: session.amount_total,
    currency: session.currency,
  });
  await completeRecoveryPayment(session.id, reference);
  return "Paid registration processed";
}

async function processPaymentIntentEvent(
  event: Stripe.Event,
): Promise<string> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const metadata = getRecoveryPaymentMetadata(paymentIntent);

  if (!metadata) {
    return "PaymentIntent ignored";
  }

  if (event.type === "payment_intent.amount_capturable_updated") {
    await markRecoveryPaymentAuthorized(paymentIntent.id, metadata.reference);
    return "Payment authorization recorded";
  }

  if (event.type === "payment_intent.succeeded") {
    const status = await processCapturedRecoveryPayment(
      paymentIntent,
      metadata.reference,
    );
    return `Captured payment ${status}`;
  }

  if (event.type === "payment_intent.canceled") {
    await cancelRecoveryPaymentAuthorization(
      paymentIntent.id,
      metadata.reference,
    );
    return "Payment authorization canceled";
  }

  return "Event ignored";
}

export async function POST(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = Stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      getRequiredEnvironmentVariable("STRIPE_WEBHOOK_SECRET"),
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return new Response("Invalid Stripe webhook", { status: 400 });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      return new Response(
        await processLegacyCheckoutEvent(
          event.data.object as Stripe.Checkout.Session,
        ),
        { status: 200 },
      );
    }

    if (
      event.type === "payment_intent.amount_capturable_updated" ||
      event.type === "payment_intent.succeeded" ||
      event.type === "payment_intent.canceled"
    ) {
      return new Response(await processPaymentIntentEvent(event), {
        status: 200,
      });
    }

    return new Response("Event ignored", { status: 200 });
  } catch (error) {
    console.error("Recovery payment webhook processing failed", {
      eventId: event.id,
      eventType: event.type,
      error,
    });
    return new Response("Webhook processing failed", { status: 500 });
  }
}

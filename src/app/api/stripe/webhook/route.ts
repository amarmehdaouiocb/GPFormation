import Stripe from "stripe";
import { sendRecoveryRegistrationEmail } from "@/lib/email";
import {
  claimRecoveryPayment,
  completeRecoveryPayment,
} from "@/lib/recovery-registration";

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

function isPaidRecoveryEvent(event: Stripe.Event): boolean {
  return (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  );
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

  if (!isPaidRecoveryEvent(event)) {
    return new Response("Event ignored", { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return new Response("Payment not confirmed", { status: 200 });
  }

  const expectedPaymentLinkId = process.env.STRIPE_RECOVERY_PAYMENT_LINK_ID;

  if (!expectedPaymentLinkId) {
    console.error("STRIPE_RECOVERY_PAYMENT_LINK_ID is not configured");
    return new Response("Webhook configuration error", { status: 500 });
  }

  if (getPaymentLinkId(session.payment_link) !== expectedPaymentLinkId) {
    return new Response("Payment Link ignored", { status: 200 });
  }

  const reference = session.client_reference_id;

  if (!reference?.startsWith("recovery_")) {
    return new Response("Registration reference ignored", { status: 200 });
  }

  try {
    const claim = await claimRecoveryPayment(session.id, reference);

    if (claim.status === "processed") {
      return new Response("Paid registration already processed", { status: 200 });
    }

    await sendRecoveryRegistrationEmail(claim.data, {
      checkoutSessionId: session.id,
      amountTotal: session.amount_total,
      currency: session.currency,
    });
    await completeRecoveryPayment(session.id, reference);
  } catch (error) {
    console.error("Paid recovery registration processing failed", {
      checkoutSessionId: session.id,
      error,
    });
    return new Response("Webhook processing failed", { status: 500 });
  }

  return new Response("Paid registration processed", { status: 200 });
}

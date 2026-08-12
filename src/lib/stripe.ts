import "server-only";

import Stripe from "stripe";

export const RECOVERY_PAYMENT_AMOUNT = 21_900;
export const RECOVERY_PAYMENT_CURRENCY = "eur";

let stripeClient: Stripe | undefined;

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required");
  }

  stripeClient ??= new Stripe(secretKey);
  return stripeClient;
}

export function getRecoveryPaymentMetadata(
  paymentIntent: Stripe.PaymentIntent,
): { reference: string; sessionStart: string } | null {
  const { registration_reference: reference, session_start: sessionStart } =
    paymentIntent.metadata;

  if (
    paymentIntent.metadata.payment_type !== "recovery_points" ||
    !reference?.startsWith("recovery_") ||
    !/^\d{4}-\d{2}-\d{2}$/.test(sessionStart ?? "")
  ) {
    return null;
  }

  return { reference, sessionStart };
}

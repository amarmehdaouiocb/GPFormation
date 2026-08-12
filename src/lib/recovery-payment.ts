import "server-only";

import type Stripe from "stripe";
import {
  sendRecoveryAuthorizationEmail,
  sendRecoveryRegistrationEmail,
} from "@/lib/email";
import {
  claimAuthorizedRecoveryPaymentEmail,
  claimCapturedRecoveryPaymentEmail,
  completeAuthorizedRecoveryPaymentEmail,
  completeCapturedRecoveryPaymentEmail,
  releaseAuthorizedRecoveryPaymentEmail,
  releaseCapturedRecoveryPaymentEmail,
} from "@/lib/recovery-registration";

export async function processAuthorizedRecoveryPayment(
  paymentIntent: Stripe.PaymentIntent,
  reference: string,
  adminUrl: string,
): Promise<"processed" | "processing"> {
  const claim = await claimAuthorizedRecoveryPaymentEmail(
    paymentIntent.id,
    reference,
  );

  if (claim.status !== "ready") {
    return claim.status;
  }

  try {
    await sendRecoveryAuthorizationEmail(claim.data, {
      stripePaymentId: paymentIntent.id,
      amountTotal: paymentIntent.amount,
      currency: paymentIntent.currency,
      adminUrl,
    });
    await completeAuthorizedRecoveryPaymentEmail(paymentIntent.id, reference);
    return "processed";
  } catch (error) {
    try {
      await releaseAuthorizedRecoveryPaymentEmail(paymentIntent.id, reference);
    } catch (releaseError) {
      console.error("Unable to release recovery authorization email claim", {
        paymentIntentId: paymentIntent.id,
        releaseError,
      });
    }
    throw error;
  }
}

export async function processCapturedRecoveryPayment(
  paymentIntent: Stripe.PaymentIntent,
  reference: string,
): Promise<"processed" | "processing"> {
  const claim = await claimCapturedRecoveryPaymentEmail(
    paymentIntent.id,
    reference,
  );

  if (claim.status !== "ready") {
    return claim.status;
  }

  try {
    await sendRecoveryRegistrationEmail(claim.data, {
      stripePaymentId: paymentIntent.id,
      amountTotal: paymentIntent.amount_received || paymentIntent.amount,
      currency: paymentIntent.currency,
    });
    await completeCapturedRecoveryPaymentEmail(paymentIntent.id, reference);
    return "processed";
  } catch (error) {
    try {
      await releaseCapturedRecoveryPaymentEmail(paymentIntent.id, reference);
    } catch (releaseError) {
      console.error("Unable to release recovery payment email claim", {
        paymentIntentId: paymentIntent.id,
        releaseError,
      });
    }
    throw error;
  }
}

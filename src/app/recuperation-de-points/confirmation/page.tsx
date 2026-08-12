import Link from "next/link";
import { CheckCircle, Clock, XCircle } from "@phosphor-icons/react/dist/ssr";
import { getRecoveryPaymentMetadata, getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";

interface ConfirmationPageProps {
  searchParams: Promise<{ payment_intent?: string | string[] }>;
}

export default async function RecoveryPaymentConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const paymentIntentId = (await searchParams).payment_intent;
  let status: "authorized" | "paid" | "error" = "error";

  if (
    typeof paymentIntentId === "string" &&
    /^pi_[A-Za-z0-9_]{8,255}$/.test(paymentIntentId)
  ) {
    try {
      const paymentIntent = await getStripeClient().paymentIntents.retrieve(
        paymentIntentId,
      );
      const metadata = getRecoveryPaymentMetadata(paymentIntent);

      if (metadata) {
        if (
          paymentIntent.status === "requires_capture" ||
          paymentIntent.status === "processing"
        ) {
          status = "authorized";
        } else if (paymentIntent.status === "succeeded") {
          status = "paid";
        }
      }
    } catch (error) {
      console.error("Unable to load recovery payment confirmation", error);
    }
  }

  const content = {
    authorized: {
      icon: <Clock size={42} weight="duotone" className="text-amber-600" />,
      eyebrow: "Autorisation reçue",
      title: "Votre demande est en cours de validation",
      description:
        "Votre carte n’est pas encore débitée. GP Formation vérifie le dossier et la disponibilité de la session avant de confirmer l’inscription et d’encaisser le paiement.",
    },
    paid: {
      icon: <CheckCircle size={42} weight="fill" className="text-[#2E7D32]" />,
      eyebrow: "Paiement validé",
      title: "Votre inscription est confirmée",
      description:
        "Le paiement a bien été encaissé après validation de votre dossier par GP Formation.",
    },
    error: {
      icon: <XCircle size={42} weight="duotone" className="text-red-600" />,
      eyebrow: "Vérification impossible",
      title: "Nous ne pouvons pas confirmer cette demande",
      description:
        "Aucun débit n’est confirmé sur cette page. Revenez au formulaire ou contactez GP Formation au 01 45 09 09 35.",
    },
  }[status];

  return (
    <main className="flex min-h-[75vh] items-center bg-[#f7f7f2] px-5 py-32">
      <section className="mx-auto w-full max-w-2xl border border-zinc-200 bg-white p-7 shadow-[0_24px_80px_rgba(24,24,27,0.08)] sm:p-10">
        {content.icon}
        <p className="mt-6 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#2E7D32]">
          {content.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-zinc-950 sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-zinc-600">
          {content.description}
        </p>
        <Link
          href="/recuperation-de-points"
          className="mt-8 inline-flex bg-zinc-950 px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-zinc-800"
        >
          Retour à la formation
        </Link>
      </section>
    </main>
  );
}

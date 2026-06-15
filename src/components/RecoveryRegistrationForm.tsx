"use client";

import { useActionState, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  submitRecoveryRegistration,
  type RecoveryRegistrationState,
} from "@/app/recuperation-de-points/action";

interface RecoveryRegistrationFormProps {
  paymentLink: string;
}

const inputClass =
  "w-full rounded-none border-0 border-b-2 border-zinc-300 bg-transparent px-0 py-3 text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950";
const labelClass = "text-xs font-bold uppercase tracking-widest text-zinc-950";

function Field({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className={inputClass}
      />
    </div>
  );
}

export default function RecoveryRegistrationForm({
  paymentLink,
}: RecoveryRegistrationFormProps) {
  const [state, formAction, isPending] = useActionState<
    RecoveryRegistrationState,
    FormData
  >(submitRecoveryRegistration, null);

  useEffect(() => {
    if (!state?.success) return;

    const timeoutId = window.setTimeout(() => {
      window.location.href = paymentLink;
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [paymentLink, state?.success]);

  return (
    <section
      id="inscription-points"
      className="mt-16 scroll-mt-28 border border-zinc-200 bg-zinc-50 p-6 md:p-8 lg:p-10"
    >
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow mb-2 block text-[0.7rem] text-[#4CAF50]">
            Inscription avant paiement
          </span>
          <h3 className="text-2xl font-bold tracking-tight text-zinc-950 md:text-3xl">
            Informations du permis de conduire
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 md:text-base">
            Renseignez les champs du permis nouveau format. Les informations sont
            envoyées à GP Formation, puis vous êtes redirigé vers le paiement
            sécurisé.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
          <CreditCard size={20} weight="duotone" className="text-[#4CAF50]" />
          Paiement après formulaire
        </div>
      </div>

      {state?.success ? (
        <div className="flex flex-col items-center gap-4 border border-[#4CAF50]/30 bg-white p-8 text-center">
          <CheckCircle size={42} weight="fill" className="text-[#4CAF50]" />
          <div>
            <p className="text-xl font-bold text-zinc-950">Informations envoyées</p>
            <p className="mt-2 text-zinc-600">{state.message}</p>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-8">
          {state && !state.success && (
            <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-4">
              <WarningCircle
                size={22}
                weight="fill"
                className="mt-0.5 shrink-0 text-red-500"
              />
              <p className="text-sm leading-relaxed text-red-700">{state.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field
              id="email"
              label="Email"
              type="email"
              placeholder="email@example.com"
              autoComplete="email"
            />
            <Field
              id="telephone"
              label="Téléphone"
              type="tel"
              placeholder="06 12 34 56 78"
              autoComplete="tel"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field id="nom" label="Nom - champ 1" autoComplete="family-name" />
            <Field id="prenoms" label="Prénom(s) - champ 2" autoComplete="given-name" />
            <Field id="dateNaissance" label="Date de naissance - champ 3" type="date" />
            <Field id="lieuNaissance" label="Lieu de naissance - champ 3" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-3">
              <Field id="adresse" label="Adresse actuelle" autoComplete="street-address" />
            </div>
            <Field id="codePostal" label="Code postal" autoComplete="postal-code" />
            <div className="md:col-span-2">
              <Field id="ville" label="Ville" autoComplete="address-level2" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field id="numeroPermis" label="Numéro de permis - champ 5" />
            <Field id="autoriteDelivrance" label="Autorité de délivrance - champ 4c" />
            <Field
              id="dateDelivranceTitre"
              label="Date de délivrance du titre - champ 4a"
              type="date"
            />
            <Field
              id="dateExpirationTitre"
              label="Date de fin de validité du titre - champ 4b"
              type="date"
            />
            <Field id="categoriePermis" label="Catégorie du permis - champ 9" placeholder="B" />
            <Field
              id="dateObtentionCategorie"
              label="Date d'obtention catégorie - verso colonne 10"
              type="date"
            />
          </div>

          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="consentement"
              name="consentement"
              required
              className="mt-1 h-5 w-5 cursor-pointer accent-zinc-950"
            />
            <label
              htmlFor="consentement"
              className="cursor-pointer select-none text-sm leading-snug text-zinc-600"
            >
              J&apos;accepte que ces informations soient transmises à GP Formation
              afin de préparer mon inscription au stage de récupération de points.
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="group flex w-full items-center justify-between bg-zinc-950 px-6 py-5 font-bold uppercase tracking-wide text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{isPending ? "Enregistrement..." : "Continuer vers le paiement"}</span>
            <ArrowRight
              size={20}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </form>
      )}
    </section>
  );
}

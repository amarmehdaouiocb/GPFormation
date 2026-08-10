"use client";

import { useActionState } from "react";
import { ArrowRight, LockKey, WarningCircle } from "@phosphor-icons/react";
import {
  loginAdmin,
  type AdminLoginState,
} from "@/app/admin/actions";

const initialState: AdminLoginState = null;

export default function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAdmin,
    initialState,
  );

  return (
    <form action={formAction} className="mt-10 space-y-6">
      {state && (
        <div
          role="alert"
          className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
        >
          <WarningCircle className="mt-0.5 shrink-0" size={20} weight="fill" />
          <p>{state.message}</p>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="username"
          className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-zinc-500"
        >
          Identifiant
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          autoFocus
          className="w-full border border-zinc-300 bg-white px-4 py-3.5 text-base text-zinc-950 outline-none transition-colors focus:border-[#2E7D32]"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-zinc-500"
        >
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full border border-zinc-300 bg-white px-4 py-3.5 text-base text-zinc-950 outline-none transition-colors focus:border-[#2E7D32]"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="group flex w-full items-center justify-between bg-zinc-950 px-5 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#2E7D32] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex items-center gap-3">
          <LockKey size={19} weight="duotone" />
          {isPending ? "Connexion…" : "Se connecter"}
        </span>
        <ArrowRight
          size={19}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>
    </form>
  );
}

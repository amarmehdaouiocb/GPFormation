import Image from "next/image";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.72fr)]">
      <section className="relative hidden overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.22) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="relative flex items-center gap-4">
          <div className="h-2.5 w-2.5 rounded-full bg-[#59c653] shadow-[0_0_24px_rgba(89,198,83,.8)]" />
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-400">
            Accès interne sécurisé
          </span>
        </div>

        <div className="relative max-w-2xl pb-12">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#79d676]">
            Grand Paris Formation
          </p>
          <h1 className="mt-6 max-w-xl text-6xl font-bold leading-[0.92] tracking-[-0.055em] xl:text-7xl">
            Suivi des inscriptions aux stages.
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-zinc-400">
            Consultez les dossiers des élèves uniquement après validation de leur
            paiement Stripe.
          </p>
        </div>

        <p className="relative font-mono text-[0.65rem] uppercase tracking-[0.18em] text-zinc-600">
          Données chiffrées · Session limitée à 8 heures
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
        <div className="w-full max-w-md">
          <Image
            src="/logo_gpformation_clean.png"
            alt="Grand Paris Formation"
            width={320}
            height={90}
            priority
            className="h-auto w-64 object-contain object-left"
          />
          <div className="mt-14 border-l-4 border-[#4CAF50] pl-5">
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#2E7D32]">
              Administration
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-zinc-950">
              Connexion
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              Utilisez les identifiants transmis par le gestionnaire du site.
            </p>
          </div>

          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}

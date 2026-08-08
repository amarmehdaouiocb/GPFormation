import Link from "next/link";

type FaqItem = {
  question: string;
  paragraphs: string[];
  bullets?: string[];
};

type FaqSection = {
  label: string;
  title: string;
  description: string;
  items: FaqItem[];
};

const FAQ_SECTIONS: FaqSection[] = [
  {
    label: "01 — Votre projet",
    title: "Formations et prérequis",
    description:
      "Les parcours proposés et les conditions pour commencer votre formation.",
    items: [
      {
        question: "Quelles formations sont proposées ?",
        paragraphs: [
          "Nous proposons des formations complètes pour devenir chauffeur de Taxi et/ou VTC, ainsi que des stages de récupération de points.",
        ],
      },
      {
        question: "Qui peut s'inscrire à une formation Taxi ou VTC ?",
        paragraphs: [
          "Toute personne souhaitant exercer le métier de chauffeur peut s'inscrire, sous réserve de remplir les conditions légales : permis de conduire valide, pièce d'identité ou titre de séjour en cours de validité.",
        ],
      },
      {
        question: "Quels sont les prérequis pour devenir chauffeur Taxi ou VTC ?",
        paragraphs: [
          "Vous devez obligatoirement être titulaire du permis de conduire de catégorie B depuis au moins 3 ans, ou 2 ans si vous avez suivi la conduite accompagnée.",
        ],
      },
      {
        question:
          "Puis-je suivre la formation si mon casier judiciaire B2 n'est pas vierge ?",
        paragraphs: [
          "Oui, vous pouvez suivre la formation et passer les examens T3P.",
          "Il vous faudra demander, à l'aide d'un avocat, l'effacement de votre casier judiciaire pour effectuer votre demande de carte professionnelle.",
        ],
      },
    ],
  },
  {
    label: "02 — La formation",
    title: "Organisation, tarifs et examen",
    description:
      "Le rythme des cours, la pratique, les financements et la préparation à l'examen.",
    items: [
      {
        question: "Combien de temps dure la formation ?",
        paragraphs: [
          "Nous proposons 4 formules afin de nous adapter à votre rythme et à vos disponibilités :",
        ],
        bullets: [
          "Formule Journée : de 9h30 à 16h30, pendant 3 semaines, soit 90 heures de formation.",
          "Formule Soirée : de 18h00 à 20h30, pendant 4 semaines, soit 50 heures de formation.",
          "Formule Accélérée : de 18h00 à 21h00, pendant 6 jours, soit 18 heures de formation.",
          "Formule E-learning : 60 jours d'accès à notre application dédiée à la préparation à l'examen, disponible sur l'Apple Store et Google Play.",
        ],
      },
      {
        question:
          "Proposez-vous également la partie pratique dans votre formation ?",
        paragraphs: [
          "Oui. Notre formation comprend la partie théorique et la partie pratique. Pour la partie pratique, vous bénéficiez de :",
        ],
        bullets: [
          "3 heures de formation en salle pour étudier les attentes du jury à l'examen.",
          "3 heures de conduite sur le lieu de l'examen, à bord d'un véhicule équipé de doubles commandes, afin de vous entraîner dans les conditions réelles de l'épreuve.",
          "La mise à disposition du véhicule le jour de l'examen.",
        ],
      },
      {
        question: "Combien coûte la formation ?",
        paragraphs: [
          "Le tarif de la formation s'élève à 1 500 €. À ce montant s'ajoutent les frais d'inscription à l'examen, à régler directement auprès de la Chambre de Métiers et de l'Artisanat (CMA), l'organisme chargé de l'organisation des examens.",
          "Pour l'année 2026, le coût total à prévoir est de 1 741 € :",
        ],
        bullets: [
          "Formation : 1 500 €.",
          "Frais d'examen CMA : 241 €.",
        ],
      },
      {
        question: "La formation prépare-t-elle à l'examen officiel ?",
        paragraphs: [
          "Oui. Nos formations sont spécialement conçues pour répondre au référentiel T3P.",
        ],
      },
      {
        question: "Quel est le taux de réussite de votre centre ?",
        paragraphs: [
          "N'hésitez pas à nous contacter pour connaître nos derniers résultats.",
        ],
      },
      {
        question: "Les formations sont-elles éligibles à un financement ?",
        paragraphs: [
          "Selon votre situation, plusieurs solutions de financement peuvent être possibles : CPF, France Travail, OPCO, financement personnel, etc. Nous vous accompagnons dans vos démarches et proposons des facilités de paiement en 3 fois sans frais.",
        ],
      },
      {
        question: "Proposez-vous des cours en présentiel ou à distance ?",
        paragraphs: [
          "Nous proposons des formations en présentiel et à distance via notre application disponible sur l'Apple Store et Google Play.",
        ],
      },
      {
        question: "Organisez-vous des examens blancs ?",
        paragraphs: [
          "Oui. Des examens blancs sont organisés afin de vous entraîner dans les conditions réelles et d'évaluer votre progression.",
        ],
      },
      {
        question: "Que se passe-t-il en cas d'échec à l'examen ?",
        paragraphs: [
          "Vous avez la possibilité de revenir une seconde fois en formation sans contrepartie financière. Vous devrez vous acquitter uniquement des frais d'inscription aux examens : 241 € pour l'examen théorique ou 118 € pour l'examen pratique (tarifs 2026).",
        ],
      },
    ],
  },
  {
    label: "03 — Au quotidien",
    title: "Inscription et vie au centre",
    description:
      "Les documents à préparer, les services sur place et les moyens de nous contacter.",
    items: [
      {
        question: "Comment s'inscrire ?",
        paragraphs: [
          "Vous pouvez vous inscrire par téléphone ou directement sur place, avec ou sans rendez-vous.",
        ],
      },
      {
        question: "Quels documents sont nécessaires pour l'inscription ?",
        paragraphs: ["Les documents à fournir sont les suivants :"],
        bullets: [
          "Une pièce d'identité.",
          "Le permis de conduire.",
          "Un justificatif de domicile de moins de 3 mois.",
          "Une photo d'identité.",
          "Votre signature sur fond blanc.",
        ],
      },
      {
        question: "Le matériel pédagogique est-il fourni ?",
        paragraphs: [
          "Oui. Un sac vous est remis à l'entrée en formation comprenant un livre, un cahier, un stylo et une calculatrice.",
        ],
      },
      {
        question: "Pourquoi choisir votre centre de formation ?",
        paragraphs: [],
        bullets: [
          "Des formateurs expérimentés.",
          "Une préparation complète aux examens.",
          "Un accompagnement personnalisé.",
          "Une aide pour vos démarches administratives.",
          "Un suivi jusqu'à l'obtention de votre carte professionnelle.",
        ],
      },
      {
        question: "Y a-t-il un parking à proximité ?",
        paragraphs: [
          "Oui. Un parking couvert est situé juste en face, ce qui vous permet de vous garer facilement pendant votre formation. Notre partenariat vous permet de bénéficier d'un tarif préférentiel.",
        ],
      },
      {
        question: "Y a-t-il un endroit pour se restaurer ?",
        paragraphs: [
          "Oui. Une cantine municipale est située à 50 m de l'établissement. Notre partenariat vous permet d'y déjeuner autour d'un repas équilibré à moindre coût.",
        ],
      },
      {
        question: "Comment vous contacter ?",
        paragraphs: [],
        bullets: [
          "Par téléphone au 01 45 09 09 35.",
          "Par email à contact@gpformation.fr.",
          "Via le formulaire de contact.",
          "Sur place, avec ou sans rendez-vous.",
        ],
      },
    ],
  },
];

const faqItems = FAQ_SECTIONS.flatMap((section) => section.items);
const faqNumbersByQuestion = new Map(
  faqItems.map((item, index) => [item.question, index + 1]),
);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: [...item.paragraphs, ...(item.bullets ?? [])].join(" "),
    },
  })),
};

export const metadata: import("next").Metadata = {
  title: "Questions fréquentes",
  description:
    "Toutes les réponses sur les formations TAXI et VTC de GP Formation : prérequis, tarifs, financements, examens et inscription.",
  alternates: { canonical: "/faq" },
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Questions fréquentes — GP Formation",
    description:
      "Prérequis, tarifs, financements, examens et inscription : consultez les réponses aux questions fréquentes.",
    url: "/faq",
  },
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="relative overflow-hidden bg-zinc-950 pb-20 pt-40 text-white md:pb-28 md:pt-48">
        <div
          aria-hidden
          className="dot-grid-pattern absolute inset-0 opacity-20 [mask-image:radial-gradient(circle_at_top_right,black,transparent_62%)]"
        />
        <div className="absolute -right-28 top-20 h-80 w-80 rounded-full bg-[#4CAF50]/15 blur-3xl" />

        <div className="container-custom relative z-10 grid gap-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="max-w-4xl">
            <span className="eyebrow mb-6 block text-[0.7rem] text-[#74D34B]">
              Centre d&apos;aide · GP Formation
            </span>
            <h1 className="max-w-3xl font-[family-name:var(--font-bricolage)] text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl md:text-7xl">
              Vos questions,
              <span className="block text-[#74D34B]">nos réponses.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
              Retrouvez l&apos;essentiel pour préparer votre formation, comprendre
              les examens et organiser votre inscription.
            </p>
          </div>

          <aside className="border-l border-white/15 pl-7">
            <p className="font-[family-name:var(--font-bricolage)] text-7xl font-semibold tracking-[-0.06em] text-white">
              20
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-zinc-400">
              réponses pratiques
            </p>
            <Link
              href="/contact"
              className="group mt-8 inline-flex items-center gap-3 text-sm font-semibold text-[#74D34B]"
            >
              Une autre question ?
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </aside>
        </div>
      </section>

      <div className="bg-zinc-50 py-20 md:py-28">
        <div className="container-custom space-y-20 md:space-y-28">
          {FAQ_SECTIONS.map((section) => (
            <section
              key={section.label}
              className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-20"
            >
              <div className="lg:sticky lg:top-36 lg:self-start">
                <span className="eyebrow block text-[0.65rem] text-[#4CAF50]">
                  {section.label}
                </span>
                <h2 className="mt-4 font-[family-name:var(--font-bricolage)] text-3xl font-semibold tracking-[-0.035em] text-zinc-950">
                  {section.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                  {section.description}
                </p>
              </div>

              <div className="border-t border-zinc-300">
                {section.items.map((item) => (
                  <details
                    key={item.question}
                    className="group border-b border-zinc-300 open:bg-white"
                  >
                    <summary className="flex cursor-pointer list-none items-start gap-5 px-1 py-6 marker:content-none md:gap-8 md:px-6 md:py-8 [&::-webkit-details-marker]:hidden">
                      <span className="mt-1 w-7 shrink-0 font-mono text-[0.65rem] tracking-[0.14em] text-zinc-400">
                        {String(faqNumbersByQuestion.get(item.question)).padStart(
                          2,
                          "0",
                        )}
                      </span>
                      <span className="flex-1 font-[family-name:var(--font-bricolage)] text-lg font-semibold leading-snug tracking-[-0.02em] text-zinc-950 md:text-xl">
                        {item.question}
                      </span>
                      <span
                        aria-hidden
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-lg font-light text-zinc-700 transition-all duration-300 group-open:rotate-45 group-open:border-[#4CAF50] group-open:bg-[#4CAF50] group-open:text-white"
                      >
                        +
                      </span>
                    </summary>

                    <div className="pb-8 pl-[3.25rem] pr-4 text-[0.95rem] leading-relaxed text-zinc-600 md:pb-10 md:pl-[5.75rem] md:pr-20">
                      <div className="space-y-4">
                        {item.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                      {item.bullets ? (
                        <ul className="mt-5 space-y-3">
                          {item.bullets.map((bullet) => (
                            <li key={bullet} className="flex gap-3">
                              <span className="mt-[0.68rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#4CAF50]" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <section className="bg-white py-20 md:py-24">
        <div className="container-custom">
          <div className="flex flex-col items-start justify-between gap-8 border-l-4 border-[#4CAF50] bg-zinc-950 px-7 py-10 text-white md:flex-row md:items-center md:px-12 md:py-12">
            <div>
              <span className="eyebrow block text-[0.65rem] text-[#74D34B]">
                Besoin d&apos;un conseil personnalisé ?
              </span>
              <h2 className="mt-4 font-[family-name:var(--font-bricolage)] text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
                Parlons de votre projet.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="tel:0145090935"
                className="border border-white/25 px-5 py-3 text-sm font-semibold transition-colors hover:border-white hover:bg-white hover:text-zinc-950"
              >
                01 45 09 09 35
              </a>
              <Link
                href="/contact"
                className="bg-[#4CAF50] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3f9f44]"
              >
                Nous contacter →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

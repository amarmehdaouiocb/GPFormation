"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, GraduationCap, CheckCircle } from "@phosphor-icons/react";
import ScrollHeroSection from "./ScrollHeroSection";

interface HomeContentProps {
  markdownContent: string;
}

const GENERATED_IMAGE_BASE = "/images/gpformation-generated";

// ----------------------------------------------------------------------
// STATS SECTION : Minimal, Data-driven
// ----------------------------------------------------------------------
const StatsSection = () => (
  <section className="py-20 bg-zinc-50">
    <div className="container-custom">
      <div className="grid grid-cols-2 md:grid-cols-2 gap-x-8 gap-y-12 max-w-2xl mx-auto">
        {[
          { value: "12", suffix: "ans", label: "D'expérience dans la formation" },
          { value: "100", suffix: "%", label: "Certifié et reconnu Qualiopi" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            className="flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            <div className="flex items-baseline mb-2">
              <span className="text-5xl md:text-6xl font-bold tracking-tighter text-zinc-950">
                {stat.value}
              </span>
              <span className="text-2xl font-semibold text-[#4CAF50] ml-1">
                {stat.suffix}
              </span>
            </div>
            <div className="w-full h-px bg-zinc-200 my-4"></div>
            <span className="text-sm font-medium text-zinc-600 leading-snug">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ----------------------------------------------------------------------
// FORMATIONS SECTION : Editorial Grid
// ----------------------------------------------------------------------
const EditorialFormations = () => (
  <section className="py-24 lg:py-32">
    <div className="container-custom">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 mb-6">
            L'itinéraire de votre réussite.
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed">
            Nos formations s'adaptent à votre profil et à votre emploi du temps. Que vous débutiez ou que vous souhaitiez faire évoluer votre carrière.
          </p>
        </div>
        <Link href="/tarifs" className="inline-flex items-center gap-2 font-semibold text-[#4CAF50] hover:text-zinc-950 transition-colors pb-1 border-b-2 border-[#4CAF50] hover:border-zinc-950 self-start md:self-auto">
          Voir les tarifs & financements
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TAXI */}
        <Link href="/formation-taxi" className="group flex flex-col border border-zinc-200 hover:border-zinc-950 transition-colors">
          <div className="relative aspect-[16/9] md:aspect-[3/2] overflow-hidden bg-zinc-100">
            <Image 
              src={`${GENERATED_IMAGE_BASE}/formation-taxi-card.webp`}
              alt="Formation TAXI" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          </div>
          <div className="p-8 md:p-10 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4CAF50]">Formation initiale en centre & à distance</span>
              <ArrowRight size={20} className="text-zinc-400 group-hover:text-zinc-950 group-hover:translate-x-2 transition-all" />
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-4">Chauffeur(e) de TAXI</h3>
            <p className="text-zinc-600 line-clamp-2">
              Découvrez nos différentes formules pour devenir chauffeur(e) de TAXI. Un accompagnement de l&apos;inscription à l&apos;examen.
            </p>
          </div>
        </Link>

        {/* VTC */}
        <Link href="/formation-vtc" className="group flex flex-col border border-zinc-200 hover:border-zinc-950 transition-colors">
          <div className="relative aspect-[16/9] md:aspect-[3/2] overflow-hidden bg-zinc-100">
            <Image 
              src="/images/vtc-berline-noire.jpg" 
              alt="Formation VTC" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          </div>
          <div className="p-8 md:p-10 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4CAF50]">Formation initiale en centre & à distance</span>
              <ArrowRight size={20} className="text-zinc-400 group-hover:text-zinc-950 group-hover:translate-x-2 transition-all" />
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-4">Chauffeur(e) de VTC</h3>
            <p className="text-zinc-600 line-clamp-2">
              Devenez chauffeur VTC grâce à nos formules flexibles : cours du soir, à distance ou en accéléré. S&apos;adapte à votre rythme.
            </p>
          </div>
        </Link>
      </div>

      {/* Autres Formations (Ligne inférieure) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Link href="/recuperation-de-points" className="group border border-zinc-200 hover:border-zinc-950 transition-colors bg-zinc-50 hover:bg-white flex flex-col overflow-hidden">
          <div className="relative aspect-[16/9] bg-zinc-100 overflow-hidden">
            <Image
              src={`${GENERATED_IMAGE_BASE}/stage-points-road-safety-training.webp`}
              alt="Stage de récupération de points"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-between flex-1 min-h-[240px]">
            <div>
              <CheckCircle size={32} className="text-[#4CAF50] mb-6" weight="duotone" />
              <h3 className="text-2xl font-bold tracking-tight mb-3">Récupération de points</h3>
              <p className="text-zinc-600">Vous avez commis une infraction ? Récupérez jusqu&apos;à 4 points 24h après votre stage.</p>
            </div>
            <div className="flex items-center gap-2 mt-8 text-sm font-bold tracking-widest uppercase text-zinc-950">
              En savoir plus <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link href="/formation-taxi/formation-passerelle" className="group border border-zinc-200 hover:border-zinc-950 transition-colors bg-zinc-50 hover:bg-white flex flex-col overflow-hidden">
          <div className="relative aspect-[16/9] bg-zinc-100 overflow-hidden">
            <Image
              src={`${GENERATED_IMAGE_BASE}/reussite-carte-professionnelle.webp`}
              alt="Formation passerelle TAXI et VTC"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-between flex-1 min-h-[240px]">
            <div>
              <GraduationCap size={32} className="text-[#4CAF50] mb-6" weight="duotone" />
              <h3 className="text-2xl font-bold tracking-tight mb-3">Formations Passerelles</h3>
              <p className="text-zinc-600">Devenez Taxi si vous êtes VTC, ou VTC si vous êtes Taxi. Élargissez vos opportunités.</p>
            </div>
            <div className="flex items-center gap-2 mt-8 text-sm font-bold tracking-widest uppercase text-zinc-950">
              Voir le programme <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  </section>
);

// ----------------------------------------------------------------------
// ABOUT SECTION : Clean Typographique
// ----------------------------------------------------------------------
const AboutSection = () => (
  <section className="py-24 lg:py-32 bg-zinc-950 text-white">
    <div className="container-custom">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">
        <div className="lg:col-span-5">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Au service de votre mobilité professionnelle.
          </h2>
          <div className="w-16 h-1 bg-[#4CAF50] mb-8"></div>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Implanté à Aulnay-sous-Bois, notre centre vous accompagne chaque année à atteindre vos objectifs professionnels dans le secteur du transport privé.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 text-white font-medium hover:text-[#4CAF50] transition-colors pb-1 border-b border-white hover:border-[#4CAF50]">
            Prendre un rendez-vous gratuit
          </Link>
        </div>
        
        <div className="lg:col-span-6 lg:col-start-7">
          <ul className="flex flex-col gap-px bg-zinc-800">
            {[
              { title: "Financement sur-mesure", desc: "CPF, Pôle emploi, et autres dispositifs pour vous aider à financer votre projet." },
              { title: "Infrastructures adaptées", desc: "Centre accessible PMR, parking sécurisé EIFFIA, et cantine à tarif réduit." },
              { title: "Accompagnement complet", desc: "De l'inscription à l'obtention de la carte professionnelle." }
            ].map((item, i) => (
              <li key={i} className="bg-zinc-950 py-6 md:py-8 border-b border-zinc-800 last:border-0">
                <h4 className="text-xl font-bold mb-3 flex items-center gap-4">
                  <span className="text-[#4CAF50] font-mono text-sm">0{i + 1}.</span> {item.title}
                </h4>
                <p className="text-zinc-400 leading-relaxed pl-9">
                  {item.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);


export default function HomeContent({ markdownContent }: HomeContentProps) {
  return (
    <div className="flex flex-col bg-white">
      <ScrollHeroSection />
      <StatsSection />
      <EditorialFormations />
      <AboutSection />
    </div>
  );
}

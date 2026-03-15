"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle, CaretRight, GraduationCap } from "@phosphor-icons/react";
import MarkdownRenderer from "./MarkdownRenderer";

interface SubFormation {
  title: string;
  description: string;
  href: string;
}

interface FormationFamilyTemplateProps {
  title: string;
  subtitle: string;
  content: string; // The markdown content
  subFormations: SubFormation[];
  breadcrumbs: { label: string; href: string }[];
}

export default function FormationFamilyTemplate({ title, subtitle, content, subFormations, breadcrumbs }: FormationFamilyTemplateProps) {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-zinc-950 pt-32 pb-24 md:pt-40 md:pb-32 border-b border-zinc-800 relative overflow-hidden">
        {/* Subtle mesh background effect for premium feel */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-[#4CAF50]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container-custom relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-bold font-mono tracking-widest text-zinc-500 uppercase mb-12 overflow-x-auto pb-2">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
                <CaretRight size={14} />
                <Link 
                  href={crumb.href} 
                  className={idx === breadcrumbs.length - 1 ? "text-white" : "hover:text-white transition-colors"}
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter text-white mb-8 leading-[0.95]"
              >
                {title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl md:text-2xl text-zinc-400 max-w-2xl leading-relaxed font-light"
              >
                {subtitle}
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-4 flex flex-col gap-px bg-zinc-800 border border-zinc-800"
            >
              <div className="bg-zinc-950 p-8 flex items-start gap-5">
                <CheckCircle className="text-[#4CAF50] shrink-0 mt-1" size={24} weight="duotone" />
                <div>
                  <h4 className="font-bold text-white mb-2 text-lg">Centre Agréé</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">Reconnu par la préfecture pour l'examen officiel.</p>
                </div>
              </div>
              <div className="bg-zinc-950 p-8 flex items-start gap-5">
                <GraduationCap className="text-[#4CAF50] shrink-0 mt-1" size={24} weight="duotone" />
                <div>
                  <h4 className="font-bold text-white mb-2 text-lg">Éligible CPF</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">Financez votre formation jusqu'à 100%.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content & Programs */}
      <section className="py-20 md:py-32">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left: General Info from Markdown */}
            <div className="lg:col-span-7">
              <MarkdownRenderer content={content} />
            </div>

            {/* Right: Sub-formations Navigation */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <h3 className="eyebrow text-zinc-400 mb-2">
                Choisissez votre formule
              </h3>
              {subFormations.map((form, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 20 }}
                >
                  <Link 
                    href={form.href}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-8 bg-zinc-50 border border-zinc-200 hover:border-zinc-950 transition-colors"
                  >
                    <div className="mb-6 md:mb-0 md:pr-8">
                      <h4 className="text-2xl font-bold tracking-tight text-zinc-950 mb-2 group-hover:text-[#4CAF50] transition-colors">
                        {form.title}
                      </h4>
                      <p className="text-zinc-600 leading-relaxed font-light">
                        {form.description}
                      </p>
                    </div>
                    <div className="w-12 h-12 shrink-0 rounded-full border border-zinc-300 flex items-center justify-center text-zinc-950 group-hover:bg-zinc-950 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                      <ArrowRight size={20} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="border-t border-zinc-200 bg-zinc-50">
        <div className="container-custom py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 mb-6">
              Vous avez des questions ?
            </h2>
            <p className="text-lg text-zinc-600 mb-10">
              Nos conseillers sont là pour vous guider vers la meilleure formule selon votre profil et vous accompagner sur les démarches de financement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-zinc-950 text-white font-medium hover:bg-zinc-800 transition-colors"
              >
                Prendre rendez-vous
              </Link>
              <a 
                href="tel:0145090935"
                className="w-full sm:w-auto px-8 py-4 bg-white border border-zinc-300 text-zinc-950 font-medium hover:border-zinc-950 transition-colors"
              >
                Appeler le 01 45 09 09 35
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

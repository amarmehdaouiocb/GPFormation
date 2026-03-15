"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight, Clock, MapPin, Euro, Award } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

interface FormationDetailTemplateProps {
  title: string;
  content: string; // Markdown
  breadcrumbs: { label: string; href: string }[];
  price?: string;
  duration?: string;
  location?: string;
  certification?: string;
}

export default function FormationDetailTemplate({ 
  title, 
  content, 
  breadcrumbs,
  price = "Sur devis",
  duration = "Nous consulter",
  location = "Aulnay-sous-Bois",
  certification = "Attestation de réussite"
}: FormationDetailTemplateProps) {
  return (
    <div className="bg-white min-h-screen">
      {/* Header Syllabus */}
      <section className="bg-zinc-950 text-white pt-32 pb-32 md:pt-40 md:pb-40 border-b border-zinc-800 relative overflow-hidden">
        {/* Decorative elements for premium feel */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-[#4CAF50]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-custom relative z-10">
          {/* Breadcrumbs - Dark mode version */}
          <nav className="flex items-center gap-2 text-xs font-bold font-mono tracking-widest text-zinc-500 uppercase mb-12 overflow-x-auto pb-2">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
                <ChevronRight size={14} />
                <Link 
                  href={crumb.href} 
                  className={idx === breadcrumbs.length - 1 ? "text-white" : "hover:text-white transition-colors"}
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-8 bg-[#4CAF50]"></div>
                <span className="eyebrow text-[#4CAF50]">
                  Fiche Formation
                </span>
              </div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter mb-10 leading-[0.95]"
              >
                {title}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link 
                  href="/contact"
                  className="inline-flex items-center gap-4 px-8 py-5 bg-[#4CAF50] text-white font-bold tracking-wide uppercase text-sm hover:bg-[#3d9640] transition-transform hover:scale-[0.98] group"
                >
                  <span>Demander une inscription</span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>

            {/* Fiche Technique Grid */}
            <motion.div 
              className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-px bg-zinc-800 border border-zinc-800"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-zinc-950 p-8 flex flex-col gap-3">
                <span className="eyebrow text-zinc-500 flex items-center gap-2">
                  <Clock size={16} className="text-[#4CAF50]" /> Durée
                </span>
                <span className="text-xl font-bold">{duration}</span>
              </div>
              <div className="bg-zinc-950 p-8 flex flex-col gap-3">
                <span className="eyebrow text-zinc-500 flex items-center gap-2">
                  <Euro size={16} className="text-[#4CAF50]" /> Financement
                </span>
                <span className="text-xl font-bold">{price}</span>
              </div>
              <div className="bg-zinc-950 p-8 flex flex-col gap-3">
                <span className="eyebrow text-zinc-500 flex items-center gap-2">
                  <MapPin size={16} className="text-[#4CAF50]" /> Lieu
                </span>
                <span className="text-xl font-bold">{location}</span>
              </div>
              <div className="bg-zinc-950 p-8 flex flex-col gap-3">
                <span className="eyebrow text-zinc-500 flex items-center gap-2">
                  <Award size={16} className="text-[#4CAF50]" /> Validation
                </span>
                <span className="text-xl font-bold">{certification}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content (Syllabus/Programme) */}
      <section className="py-20 md:py-32">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-950 mb-12 pb-4 border-b border-zinc-200">
              Programme et détails
            </h2>
            
            <MarkdownRenderer content={content} />

            {/* Document Download / Info Box */}
            <div className="mt-16 bg-[#4CAF50]/10 border border-[#4CAF50]/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-xl font-bold text-zinc-950 mb-2">Besoin d'aide pour le financement ?</h4>
                <p className="text-zinc-700">Nos équipes vous accompagnent dans le montage de votre dossier CPF ou Pôle Emploi.</p>
              </div>
              <Link href="/contact" className="w-full sm:w-auto px-6 py-3 bg-zinc-950 text-white font-medium hover:bg-zinc-800 transition-colors whitespace-nowrap">
                Nous contacter
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

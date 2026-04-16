"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ArrowRight, CaretRight } from "@phosphor-icons/react";

interface MarkdownPageProps {
  content: string;
  title?: string;
  breadcrumbs?: { label: string; href: string }[];
}

export default function MarkdownPage({ content, title, breadcrumbs }: MarkdownPageProps) {
  return (
    <article className="min-h-screen bg-white pb-16 sm:pb-24">
      {/* Editorial Header / Hero */}
      <div className="bg-zinc-50 border-b border-zinc-200 pt-24 sm:pt-28 pb-14 sm:pb-20 md:pt-32 md:pb-28">
        <div className="container-custom">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-500 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <Link href="/" className="hover:text-zinc-950 transition-colors">Accueil</Link>
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-2 whitespace-nowrap">
                  <CaretRight size={14} />
                  <Link
                    href={crumb.href}
                    className={idx === breadcrumbs.length - 1 ? "text-zinc-950" : "hover:text-zinc-950 transition-colors"}
                  >
                    {crumb.label}
                  </Link>
                </div>
              ))}
            </nav>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-zinc-950 max-w-4xl leading-[1.1]">
            {title || "Page d'information"}
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container-custom pt-12 sm:pt-16 md:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-start">
          
          {/* Main Prose */}
          <div className="lg:col-span-8">
            <div className="prose prose-base sm:prose-lg prose-zinc max-w-none
              prose-headings:tracking-tight prose-headings:font-bold prose-headings:text-zinc-950
              prose-h1:hidden /* H1 is handled by the Hero section above */
              prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-8 sm:prose-h2:mt-12 prose-h2:mb-4 sm:prose-h2:mb-6 prose-h2:pb-3 sm:prose-h2:pb-4 prose-h2:border-b prose-h2:border-zinc-200
              prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-6 sm:prose-h3:mt-8 prose-h3:mb-3 sm:prose-h3:mb-4
              prose-p:leading-relaxed prose-p:text-zinc-600 prose-p:mb-5 sm:prose-p:mb-6
              prose-a:text-[#4CAF50] prose-a:font-semibold hover:prose-a:text-zinc-950 prose-a:transition-colors prose-a:no-underline
              prose-ul:list-disc prose-ul:pl-5 sm:prose-ul:pl-6 prose-ul:text-zinc-600 prose-ul:space-y-2 prose-ul:mb-6 sm:prose-ul:mb-8
              prose-ol:list-decimal prose-ol:pl-5 sm:prose-ol:pl-6 prose-ol:text-zinc-600 prose-ol:space-y-2 prose-ol:mb-6 sm:prose-ol:mb-8
              prose-li:marker:text-[#4CAF50]
              prose-strong:text-zinc-950 prose-strong:font-bold
              prose-blockquote:border-l-4 prose-blockquote:border-[#4CAF50] prose-blockquote:pl-4 sm:prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-zinc-800 prose-blockquote:bg-zinc-50 prose-blockquote:py-3 sm:prose-blockquote:py-4 prose-blockquote:pr-3 sm:prose-blockquote:pr-4
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
            
            {/* Elegant CTA at the end of the content */}
            <div className="mt-14 sm:mt-20 pt-10 sm:pt-12 border-t border-zinc-200">
              <div className="bg-zinc-50 border border-zinc-200 p-6 sm:p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mb-2">Prêt à démarrer ?</h3>
                  <p className="text-sm sm:text-base text-zinc-600">Prenez rendez-vous avec un conseiller pour discuter de votre projet.</p>
                </div>
                <Link
                  href="/contact"
                  className="w-full md:w-auto flex items-center justify-center gap-3 sm:gap-4 px-6 sm:px-8 py-3.5 sm:py-4 bg-zinc-950 text-white font-medium hover:bg-zinc-800 transition-colors group whitespace-nowrap text-sm sm:text-base"
                >
                  <span>Nous contacter</span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="hidden lg:block lg:col-span-4 sticky top-32">
            <div className="bg-zinc-50 border border-zinc-200 p-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-950 mb-6">À propos de cette page</h3>
              <p className="text-zinc-600 text-sm leading-relaxed mb-8">
                Vous consultez les informations officielles de GP Formation, centre de formation agréé TAXI et VTC en Île-de-France.
              </p>
              
              <div className="space-y-4">
                <Link href="/tarifs" className="flex items-center justify-between p-4 bg-white border border-zinc-200 hover:border-zinc-950 transition-colors group">
                  <span className="font-semibold text-sm">Voir les tarifs</span>
                  <ArrowRight size={16} className="text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                </Link>
                <Link href="/contact" className="flex items-center justify-between p-4 bg-white border border-zinc-200 hover:border-[#4CAF50] transition-colors group">
                  <span className="font-semibold text-sm">Prendre rendez-vous</span>
                  <ArrowRight size={16} className="text-zinc-400 group-hover:text-[#4CAF50] transition-colors" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </article>
  );
}

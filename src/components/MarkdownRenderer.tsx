"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle, CaretRight, Info } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Fonction pour séparer le contenu par les balises H2 (##)
function parseMarkdownIntoSections(content: string) {
  const sections = content.split(/(?=^## )/m);
  return sections;
}

// Fonction pour séparer une section H2 en sous-sections H3 (###)
function parseH2SectionIntoCards(sectionContent: string) {
  // Le premier élément est soit du texte d'intro, soit le H2
  const parts = sectionContent.split(/(?=^### )/m);
  return parts;
}

// Composants de base pour ReactMarkdown pour conserver l'esthétique sur les textes bruts
const baseMarkdownComponents = {
  h1: () => null,
  h2: ({ node, ...props }: any) => (
    <div className="mt-20 mb-8 first:mt-0">
      <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-950 mb-4 flex items-center gap-4">
        <span className="w-8 h-1 bg-[#4CAF50] inline-block rounded-full"></span>
        {props.children}
      </h2>
    </div>
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 mb-6 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center shrink-0">
        <CaretRight className="text-[#4CAF50]" size={20} weight="bold" />
      </div>
      {props.children}
    </h3>
  ),
  p: ({ node, children, ...props }: any) => (
    <p className="text-lg md:text-xl text-zinc-600 leading-[1.8] mb-6 font-light" {...props}>
      {children}
    </p>
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="flex flex-col gap-3 my-6 pl-0 list-none">
      {props.children}
    </ul>
  ),
  li: ({ node, ...props }: any) => (
    <li className="flex items-start gap-4 p-4 md:p-5 bg-zinc-50 border border-zinc-200 rounded-xl hover:border-[#4CAF50]/30 hover:bg-white transition-colors group">
      <div className="mt-0.5 shrink-0 text-[#4CAF50]">
        <CheckCircle size={24} weight="duotone" />
      </div>
      <span className="text-zinc-700 group-hover:text-zinc-950 leading-relaxed font-medium transition-colors text-lg">
        {props.children}
      </span>
    </li>
  ),
  table: ({ node, ...props }: any) => (
    <div className="my-10 w-full overflow-x-auto rounded-2xl border border-zinc-200 shadow-sm">
      <table className="w-full text-left border-collapse min-w-[600px]" {...props}>
        {props.children}
      </table>
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-zinc-950 text-white" {...props}>
      {props.children}
    </thead>
  ),
  th: ({ node, ...props }: any) => (
    <th className="py-4 px-6 font-semibold uppercase tracking-widest text-xs whitespace-nowrap" {...props}>
      {props.children}
    </th>
  ),
  td: ({ node, ...props }: any) => (
    <td className="py-4 px-6 border-t border-zinc-100 bg-white text-zinc-600 align-middle" {...props}>
      {props.children}
    </td>
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="hover:bg-zinc-50/50 transition-colors" {...props}>
      {props.children}
    </tr>
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="my-8 p-6 md:p-8 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col md:flex-row gap-6 items-start">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-zinc-200 shrink-0 shadow-sm">
        <Info className="text-[#4CAF50]" size={24} weight="duotone" />
      </div>
      <div className="text-zinc-800 font-medium text-lg italic leading-relaxed pt-2">
        {props.children}
      </div>
    </blockquote>
  ),
  a: ({ node, ...props }: any) => (
    <a 
      className="font-semibold text-[#4CAF50] hover:text-zinc-950 underline decoration-2 decoration-[#4CAF50]/30 hover:decoration-zinc-950 underline-offset-4 transition-all" 
      target="_blank" 
      rel="noopener noreferrer" 
      {...props}
    >
      {props.children}
    </a>
  ),
  strong: ({ node, ...props }: any) => (
    <strong className="font-bold text-zinc-950" {...props}>
      {props.children}
    </strong>
  ),
};

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const sections = parseMarkdownIntoSections(content);

  return (
    <div className={cn("markdown-premium-layout w-full", className)}>
      {sections.map((section, sectionIndex) => {
        const parts = parseH2SectionIntoCards(section);
        
        return (
          <div key={sectionIndex} className="mb-24 w-full">
            {/* Rendu de la première partie (qui contient généralement le H2 et un paragraphe d'intro) */}
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={baseMarkdownComponents}>
              {parts[0]}
            </ReactMarkdown>

            {/* Si on a des sous-sections H3, on les affiche sous forme de Grille (Bento) */}
            {parts.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8 w-full">
                {parts.slice(1).map((cardContent, cardIndex) => (
                  <div 
                    key={cardIndex} 
                    className="bg-zinc-50/50 border border-zinc-200 rounded-[2rem] p-8 md:p-10 hover:shadow-xl hover:border-zinc-300 transition-all duration-300 flex flex-col w-full"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={baseMarkdownComponents}>
                      {cardContent}
                    </ReactMarkdown>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

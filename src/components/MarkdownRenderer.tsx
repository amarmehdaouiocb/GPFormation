"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { CheckCircle, CaretRight, Info } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import React from "react";

function isInternalHref(href: unknown): href is string {
  return typeof href === "string" && (href.startsWith("/") || href.startsWith("#"));
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function parseMarkdownIntoSections(content: string) {
  const sections = content.split(/(?=^## )/m);
  return sections;
}

function parseH2SectionIntoCards(sectionContent: string) {
  const parts = sectionContent.split(/(?=^### )/m);
  return parts;
}

function extractH2Title(section: string): string | null {
  const match = section.match(/^## (.+)$/m);
  return match ? match[1] : null;
}

const baseMarkdownComponents = {
  h1: () => null,
  h2: () => null,
  h3: ({ node, ...props }: any) => {
    const children = React.Children.toArray(props.children);
    const firstChild = children[0] as any;
    const isLinkedHeading =
      React.isValidElement(firstChild) &&
      (firstChild.type === "a" || (firstChild.props as any)?.href);

    return (
      <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 mb-5 flex items-center gap-3 group/h3">
        <div
          className={cn(
            "w-9 h-9 rounded-full bg-[#4CAF50]/10 flex items-center justify-center shrink-0 transition-colors",
            isLinkedHeading && "group-hover/h3:bg-[#4CAF50]/25"
          )}
        >
          <CaretRight className="text-[#4CAF50]" size={18} weight="bold" />
        </div>
        <span
          className={cn(
            isLinkedHeading &&
              "[&_a]:no-underline [&_a]:text-zinc-900 [&_a]:hover:text-[#4CAF50] [&_a]:transition-colors"
          )}
        >
          {props.children}
        </span>
      </h3>
    );
  },
  p: ({ node, children, ...props }: any) => (
    <p className="text-lg md:text-xl text-zinc-600 leading-[1.8] mb-5 font-light" {...props}>
      {children}
    </p>
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="flex flex-col gap-0 my-5 pl-0 list-none divide-y divide-zinc-100">
      {props.children}
    </ul>
  ),
  li: ({ node, ...props }: any) => (
    <li className="flex items-start gap-3 py-3 group">
      <div className="mt-1 shrink-0 text-[#4CAF50]">
        <CheckCircle size={20} weight="duotone" />
      </div>
      <span className="text-zinc-800 group-hover:text-zinc-950 leading-relaxed font-medium transition-colors text-[1.05rem]">
        {props.children}
      </span>
    </li>
  ),
  table: ({ node, ...props }: any) => (
    <div className="my-8 w-full overflow-x-auto rounded-xl border border-zinc-200 shadow-sm">
      <table className="w-full text-left border-collapse min-w-[600px]" {...props}>
        {props.children}
      </table>
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-zinc-950 text-white [&>tr>th:first-child]:rounded-tl-xl [&>tr>th:last-child]:rounded-tr-xl" {...props}>
      {props.children}
    </thead>
  ),
  th: ({ node, ...props }: any) => (
    <th className="py-4 px-5 font-semibold uppercase tracking-widest text-xs whitespace-nowrap" {...props}>
      {props.children}
    </th>
  ),
  td: ({ node, ...props }: any) => (
    <td className="py-3.5 px-5 border-t border-zinc-100 text-zinc-600 align-middle" {...props}>
      {props.children}
    </td>
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="even:bg-zinc-50/70 hover:bg-zinc-50 transition-colors" {...props}>
      {props.children}
    </tr>
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="my-8 p-5 md:p-6 bg-[#4CAF50]/5 border-l-4 border-[#4CAF50] flex gap-4 items-start rounded-r-lg">
      <Info className="text-[#4CAF50] shrink-0 mt-0.5" size={20} weight="duotone" />
      <div className="text-zinc-800 font-medium text-base leading-relaxed [&>p]:mb-0">
        {props.children}
      </div>
    </blockquote>
  ),
  a: ({ node, ...props }: any) => {
    const { href, children, ...rest } = props;
    if (isInternalHref(href)) {
      return (
        <Link
          href={href}
          className="font-semibold text-[#4CAF50] hover:text-zinc-950 underline decoration-2 decoration-[#4CAF50]/30 hover:decoration-zinc-950 underline-offset-4 transition-all"
          {...rest}
        >
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        className="font-semibold text-[#4CAF50] hover:text-zinc-950 underline decoration-2 decoration-[#4CAF50]/30 hover:decoration-zinc-950 underline-offset-4 transition-all"
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  },
  strong: ({ node, ...props }: any) => (
    <strong className="font-bold text-zinc-950" {...props}>
      {props.children}
    </strong>
  ),
};

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const sections = parseMarkdownIntoSections(content);
  let h2Counter = 0;

  return (
    <div className={cn("markdown-premium-layout w-full", className)}>
      {sections.map((section, sectionIndex) => {
        const parts = parseH2SectionIntoCards(section);
        const h2Title = extractH2Title(section);

        if (h2Title) {
          h2Counter++;
        }

        const currentNumber = h2Counter;
        const formattedNumber = String(currentNumber).padStart(2, "0");
        const h3Cards = parts.slice(1);
        const isOddCards = h3Cards.length % 2 !== 0;
        const isAlternateSection = h2Title && currentNumber % 2 === 0;

        return (
          <div
            key={sectionIndex}
            className={cn(
              "w-full",
              sectionIndex > 0 && h2Title && "pt-14 mt-14 border-t border-zinc-200",
              isAlternateSection && "bg-zinc-50 rounded-3xl p-8 -mx-4 md:-mx-8"
            )}
          >
            {h2Title ? (
              <div className="relative mb-10">
                <span
                  className="absolute -top-6 -left-2 text-[5rem] md:text-[7rem] font-black text-[#4CAF50]/[0.12] leading-none select-none pointer-events-none font-[family-name:var(--font-bricolage)]"
                  aria-hidden="true"
                >
                  {formattedNumber}
                </span>
                <div className="relative">
                  <span className="eyebrow text-[#4CAF50] mb-2 block text-[0.7rem]">
                    {formattedNumber}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-950">
                    {h2Title}
                  </h2>
                </div>
              </div>
            ) : null}

            <ReactMarkdown remarkPlugins={[remarkGfm]} components={baseMarkdownComponents}>
              {h2Title ? parts[0].replace(/^## .+$/m, "") : parts[0]}
            </ReactMarkdown>

            {h3Cards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 w-full">
                {h3Cards.map((cardContent, cardIndex) => {
                  const isLastOdd = isOddCards && cardIndex === h3Cards.length - 1;
                  return (
                    <div
                      key={cardIndex}
                      className={cn(
                        "border rounded-2xl p-7 md:p-8",
                        isAlternateSection
                          ? "bg-white border-zinc-200"
                          : "bg-zinc-50 border-zinc-300",
                        "hover:shadow-lg hover:border-l-[#4CAF50] hover:border-l-4 transition-all duration-300",
                        "flex flex-col w-full",
                        isLastOdd && "md:col-span-2"
                      )}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={baseMarkdownComponents}>
                        {cardContent}
                      </ReactMarkdown>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

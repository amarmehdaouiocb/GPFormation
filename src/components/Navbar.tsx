"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import BookingWidget from "./BookingWidget";

const formationsTaxi = [
  { name: "Formation Initiale TAXI", href: "/formation-taxi/formation-initiale" },
  { name: "Formation Continue TAXI", href: "/formation-taxi/formation-continue" },
  { name: "Formation à la mobilité", href: "/formation-taxi/formation-mobilite" },
  { name: "Passerelle VTC vers TAXI", href: "/formation-taxi/formation-passerelle" },
];

const formationsVtc = [
  { name: "Formation Initiale VTC", href: "/formation-vtc/formation-initiale" },
  { name: "Formation Continue VTC", href: "/formation-vtc/formation-continue" },
  { name: "Formation VTC à distance", href: "/formation-vtc/formation-distance" },
  { name: "Formation VTC cours du soir", href: "/formation-vtc/cours-du-soir" },
  { name: "Passerelle TAXI vers VTC", href: "/formation-vtc/formation-passerelle" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isTransparent = isHome && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (isHome && !mobileMenuOpen) {
        const atTop = currentY < 50;
        const pastHero = currentY > window.innerHeight * 2;
        setIsNavHidden(!atTop && !pastHero);
      }

      setIsScrolled(currentY > window.innerHeight * 0.15);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome, mobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b",
          "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isNavHidden && !mobileMenuOpen
            ? "-translate-y-full opacity-0"
            : "translate-y-0 opacity-100",
          isTransparent
            ? "bg-transparent border-transparent py-8"
            : isScrolled
              ? "bg-white/95 backdrop-blur-sm border-zinc-200 py-3 shadow-sm"
              : "bg-white border-transparent py-6"
        )}
      >
        <div className="container-custom flex items-center justify-between">
          {/* Logo — couleurs originales */}
          <Link href="/" className="relative flex items-center gap-2 z-50 group">
            <Image
              src="/logo_gpformation_clean.png"
              alt="GP Formation Logo"
              width={320}
              height={90}
              className="w-auto h-20 md:h-24 object-contain transition-all duration-300 group-hover:scale-105 origin-left"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <div
              className="relative group"
              onMouseEnter={() => setActiveDropdown('taxi')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={cn(
                "flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors py-2",
                isTransparent ? "text-white/90 hover:text-white" : "text-zinc-500 hover:text-zinc-950"
              )}>
                Formations TAXI <ChevronDown size={12} className={cn("transition-transform duration-300", activeDropdown === 'taxi' ? "rotate-180" : "")} />
              </button>
              <AnimatePresence>
                {activeDropdown === 'taxi' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 pt-3 w-72"
                  >
                    <div className="bg-white border border-zinc-200 shadow-xl rounded-xl p-2 flex flex-col gap-0.5">
                      {formationsTaxi.map((item) => (
                        <Link key={item.href} href={item.href} className="block px-4 py-2.5 text-[13px] font-medium text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 rounded-lg transition-colors">
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="relative group"
              onMouseEnter={() => setActiveDropdown('vtc')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={cn(
                "flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors py-2",
                isTransparent ? "text-white/90 hover:text-white" : "text-zinc-500 hover:text-zinc-950"
              )}>
                Formations VTC <ChevronDown size={12} className={cn("transition-transform duration-300", activeDropdown === 'vtc' ? "rotate-180" : "")} />
              </button>
              <AnimatePresence>
                {activeDropdown === 'vtc' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 pt-3 w-72"
                  >
                    <div className="bg-white border border-zinc-200 shadow-xl rounded-xl p-2 flex flex-col gap-0.5">
                      {formationsVtc.map((item) => (
                        <Link key={item.href} href={item.href} className="block px-4 py-2.5 text-[13px] font-medium text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 rounded-lg transition-colors">
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/recuperation-de-points" className={cn(
              "text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors",
              isTransparent ? "text-white/90 hover:text-white" : "text-zinc-500 hover:text-zinc-950"
            )}>
              Récupération de points
            </Link>
            <Link href="/tarifs" className={cn(
              "text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors",
              isTransparent ? "text-white/90 hover:text-white" : "text-zinc-500 hover:text-zinc-950"
            )}>
              Tarifs
            </Link>
            <Link href="/contact" className={cn(
              "text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors",
              isTransparent ? "text-white/90 hover:text-white" : "text-zinc-500 hover:text-zinc-950"
            )}>
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className={cn("lg:hidden z-50 p-2 -mr-2 transition-colors", isTransparent ? "text-white" : "text-black")}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={28} strokeWidth={1.5} className={cn(isTransparent && "text-black")} /> : <Menu size={28} strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-white flex flex-col pt-32 px-6 pb-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-8 flex-1 max-w-lg mx-auto w-full">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.15em]">TAXI</h3>
                <div className="flex flex-col gap-3">
                  {formationsTaxi.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold tracking-tight text-zinc-900 hover:text-[#4CAF50] transition-colors">
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-zinc-100" />

              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.15em]">VTC</h3>
                <div className="flex flex-col gap-3">
                  {formationsVtc.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold tracking-tight text-zinc-900 hover:text-[#4CAF50] transition-colors">
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-zinc-100" />

              <div className="flex flex-col gap-3">
                <Link href="/recuperation-de-points" onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold tracking-tight text-zinc-900 hover:text-[#4CAF50] transition-colors">Récupération de points</Link>
                <Link href="/tarifs" onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold tracking-tight text-zinc-900 hover:text-[#4CAF50] transition-colors">Tarifs</Link>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-xl font-semibold tracking-tight text-zinc-900 hover:text-[#4CAF50] transition-colors">Contact</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <BookingWidget />
    </>
  );
}

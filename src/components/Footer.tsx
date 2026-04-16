"use client";

import Link from "next/link";
import Image from "next/image";
import { Envelope, Phone, MapPin, InstagramLogo, FacebookLogo } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer className="bg-white pt-16 sm:pt-20 md:pt-24 pb-10 md:pb-12 border-t border-zinc-200">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 lg:gap-16 mb-14 sm:mb-20">

          {/* Brand */}
          <div className="space-y-6 sm:space-y-8 sm:col-span-2 lg:col-span-1">
            <Image
              src="/logo_gpformation_clean.png"
              alt="Grand Paris Formation Logo"
              width={320}
              height={90}
              className="w-auto h-16 sm:h-20 object-contain"
            />
            <p className="text-zinc-600 text-sm leading-relaxed max-w-[280px]">
              Centre de formation TAXI / VTC en Île-de-France. Nous vous accompagnons vers la réussite de votre examen.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 border border-zinc-200 flex items-center justify-center text-zinc-950 hover:bg-[#4CAF50] hover:text-white hover:border-[#4CAF50] transition-colors">
                <InstagramLogo size={18} weight="fill" />
              </a>
              <a href="#" className="w-10 h-10 border border-zinc-200 flex items-center justify-center text-zinc-950 hover:bg-[#4CAF50] hover:text-white hover:border-[#4CAF50] transition-colors">
                <FacebookLogo size={18} weight="fill" />
              </a>
            </div>
          </div>

          {/* Formations */}
          <div className="space-y-6">
            <h4 className="font-bold text-zinc-950 uppercase tracking-widest text-sm">Formations</h4>
            <ul className="space-y-4 text-sm text-zinc-600">
              <li><Link href="/formation-taxi" className="hover:text-[#4CAF50] hover:translate-x-1 transition-all inline-block">Formation TAXI</Link></li>
              <li><Link href="/formation-vtc" className="hover:text-[#4CAF50] hover:translate-x-1 transition-all inline-block">Formation VTC</Link></li>
              <li><Link href="/formation-taxi/formation-passerelle" className="hover:text-[#4CAF50] hover:translate-x-1 transition-all inline-block">Passerelle VTC vers TAXI</Link></li>
              <li><Link href="/formation-vtc/formation-passerelle" className="hover:text-[#4CAF50] hover:translate-x-1 transition-all inline-block">Passerelle TAXI vers VTC</Link></li>
              <li><Link href="/recuperation-de-points" className="hover:text-[#4CAF50] hover:translate-x-1 transition-all inline-block">Récupération de points</Link></li>
            </ul>
          </div>

          {/* Liens Utiles */}
          <div className="space-y-6">
            <h4 className="font-bold text-zinc-950 uppercase tracking-widest text-sm">Liens Utiles</h4>
            <ul className="space-y-4 text-sm text-zinc-600">
              <li><Link href="/tarifs" className="hover:text-[#4CAF50] hover:translate-x-1 transition-all inline-block">Tarifs & Financements</Link></li>
              <li><Link href="/blog" className="hover:text-[#4CAF50] hover:translate-x-1 transition-all inline-block">Actualités & Blog</Link></li>
              <li><Link href="/services" className="hover:text-[#4CAF50] hover:translate-x-1 transition-all inline-block">Services</Link></li>
              <li><Link href="/contact" className="hover:text-[#4CAF50] hover:translate-x-1 transition-all inline-block">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="font-bold text-zinc-950 uppercase tracking-widest text-sm">Contact</h4>
            <ul className="space-y-4 text-sm text-zinc-600">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#4CAF50] shrink-0 mt-0.5" weight="duotone" />
                <span>Aulnay-sous-Bois, Île-de-France</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#4CAF50] shrink-0" weight="duotone" />
                <a href="tel:0145090935" className="hover:text-[#4CAF50] transition-colors">01 45 09 09 35</a>
              </li>
              <li className="flex items-center gap-3">
                <Envelope size={18} className="text-[#4CAF50] shrink-0" weight="duotone" />
                <a href="mailto:contact@gpformation.fr" className="hover:text-[#4CAF50] transition-colors">contact@gpformation.fr</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 sm:pt-8 border-t border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-[11px] sm:text-xs text-zinc-500 font-medium tracking-wide text-center md:text-left">
          <p>© {new Date().getFullYear()} GP Formation. Tous droits réservés.</p>
          <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 justify-center">
            <Link href="/mentions-legales" className="hover:text-zinc-950">Mentions légales</Link>
            <Link href="/cgv" className="hover:text-zinc-950">CGV</Link>
            <Link href="/politique-de-confidentialite" className="hover:text-zinc-950">Politique de confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

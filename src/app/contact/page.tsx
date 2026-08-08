"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Envelope, Phone, MapPin, ArrowRight, Clock, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { submitContact, type ContactState } from "./action";

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState<ContactState, FormData>(
    submitContact,
    null,
  );

  return (
    <div className="container-custom pt-32 md:pt-44 pb-20 md:pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

        {/* Contact Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[#4CAF50]"></div>
              <span className="text-sm font-bold uppercase tracking-widest text-[#4CAF50]">
                Nous contacter
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-zinc-950 mb-8 leading-none">
              Parlons de votre <br />
              projet
            </h1>
            <p className="text-lg text-zinc-600 max-w-md leading-relaxed">
              Une question sur nos formations ? Un besoin d&apos;accompagnement spécifique ? Notre équipe est à votre écoute.
            </p>
          </div>

          <div className="space-y-10 pt-4">
            <div className="flex items-start gap-6 group">
              <div className="mt-1">
                <MapPin size={28} className="text-zinc-400 group-hover:text-[#4CAF50] transition-colors" weight="light" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-950 mb-2">Notre Centre</h3>
                <p className="text-zinc-600 text-lg leading-relaxed">
                  Aulnay-sous-Bois, Île-de-France<br />
                  <span className="text-sm text-zinc-500">Accessible aux personnes à mobilité réduite</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="mt-1">
                <Phone size={28} className="text-zinc-400 group-hover:text-[#4CAF50] transition-colors" weight="light" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-950 mb-2">Téléphone</h3>
                <a href="tel:0145090935" className="text-zinc-600 text-lg hover:text-[#4CAF50] transition-colors">
                  01 45 09 09 35
                </a>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="mt-1">
                <Envelope size={28} className="text-zinc-400 group-hover:text-[#4CAF50] transition-colors" weight="light" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-950 mb-2">Email</h3>
                <a href="mailto:contact@gpformation.fr" className="text-zinc-600 text-lg hover:text-[#4CAF50] transition-colors">
                  contact@gpformation.fr
                </a>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="mt-1">
                <Clock size={28} className="text-zinc-400 group-hover:text-[#4CAF50] transition-colors" weight="light" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-950 mb-2">Horaires d&apos;ouverture</h3>
                <p className="text-zinc-600 text-lg leading-relaxed">
                  Lundi au vendredi : 09h30 – 12h30 et 13h30 – 17h30<br />
                  <span className="text-sm text-zinc-500">Samedi & Dimanche : Fermé</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-50 border border-zinc-200 p-8 md:p-12 lg:p-14"
        >
          {state?.success ? (
            <div className="flex flex-col items-center gap-5 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4CAF50]/10">
                <CheckCircle size={40} weight="fill" className="text-[#4CAF50]" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-zinc-950">Message envoyé</p>
                <p className="mt-3 text-zinc-600 max-w-sm leading-relaxed">{state.message}</p>
              </div>
            </div>
          ) : (
            <form action={formAction} className="space-y-8">
              <AnimatePresence>
                {state && !state.success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-3 border border-red-200 bg-red-50 p-4"
                  >
                    <WarningCircle size={22} weight="fill" className="shrink-0 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-700 leading-relaxed">{state.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label htmlFor="prenom" className="text-sm font-bold uppercase tracking-widest text-zinc-950">Prénom</label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    required
                    className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-300 focus:outline-none focus:border-zinc-950 transition-colors rounded-none placeholder:text-zinc-400"
                    placeholder="Jean"
                  />
                </div>
                <div className="space-y-3">
                  <label htmlFor="nom" className="text-sm font-bold uppercase tracking-widest text-zinc-950">Nom</label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    required
                    className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-300 focus:outline-none focus:border-zinc-950 transition-colors rounded-none placeholder:text-zinc-400"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label htmlFor="telephone" className="text-sm font-bold uppercase tracking-widest text-zinc-950">Téléphone</label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    required
                    className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-300 focus:outline-none focus:border-zinc-950 transition-colors rounded-none placeholder:text-zinc-400"
                    placeholder="06 12 34 56 78"
                  />
                </div>
                <div className="space-y-3">
                  <label htmlFor="email" className="text-sm font-bold uppercase tracking-widest text-zinc-950">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-300 focus:outline-none focus:border-zinc-950 transition-colors rounded-none placeholder:text-zinc-400"
                    placeholder="jean.dupont@email.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="message" className="text-sm font-bold uppercase tracking-widest text-zinc-950">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-300 focus:outline-none focus:border-zinc-950 transition-colors rounded-none resize-none placeholder:text-zinc-400"
                  placeholder="Comment pouvons-nous vous aider ?"
                />
              </div>

              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="consentement"
                  name="consentement"
                  required
                  className="mt-1 w-5 h-5 accent-zinc-950 cursor-pointer"
                />
                <label htmlFor="consentement" className="text-sm text-zinc-600 leading-snug cursor-pointer select-none">
                  En soumettant ce formulaire, j&apos;accepte que les informations saisies soient exploitées dans le cadre de la demande de contact et de la relation commerciale.
                </label>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-between px-8 py-5 bg-zinc-950 text-white font-medium hover:bg-zinc-800 transition-colors group mt-8 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{isPending ? "Envoi en cours…" : "Envoyer le message"}</span>
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          )}
        </motion.div>

      </div>
    </div>
  );
}

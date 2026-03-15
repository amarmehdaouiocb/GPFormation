"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Envelope, Phone, MapPin, PaperPlaneTilt, ArrowRight } from "@phosphor-icons/react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    message: "",
    consentement: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message envoyé ! (Simulation)");
  };

  return (
    <div className="container-custom py-20 md:py-32">
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
              projet.
            </h1>
            <p className="text-lg text-zinc-600 max-w-md leading-relaxed">
              Une question sur nos formations ? Un besoin d'accompagnement spécifique ? Notre équipe pédagogique est à votre écoute.
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
          </div>
        </motion.div>

        {/* Contact Form Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-50 border border-zinc-200 p-8 md:p-12 lg:p-14"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label htmlFor="prenom" className="text-sm font-bold uppercase tracking-widest text-zinc-950">Prénom</label>
                <input 
                  type="text" 
                  id="prenom"
                  required
                  className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-300 focus:outline-none focus:border-zinc-950 transition-colors rounded-none placeholder:text-zinc-400"
                  placeholder="Jean"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label htmlFor="nom" className="text-sm font-bold uppercase tracking-widest text-zinc-950">Nom</label>
                <input 
                  type="text" 
                  id="nom"
                  required
                  className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-300 focus:outline-none focus:border-zinc-950 transition-colors rounded-none placeholder:text-zinc-400"
                  placeholder="Dupont"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label htmlFor="telephone" className="text-sm font-bold uppercase tracking-widest text-zinc-950">Téléphone</label>
                <input 
                  type="tel" 
                  id="telephone"
                  required
                  className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-300 focus:outline-none focus:border-zinc-950 transition-colors rounded-none placeholder:text-zinc-400"
                  placeholder="06 12 34 56 78"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label htmlFor="email" className="text-sm font-bold uppercase tracking-widest text-zinc-950">Email</label>
                <input 
                  type="email" 
                  id="email"
                  required
                  className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-300 focus:outline-none focus:border-zinc-950 transition-colors rounded-none placeholder:text-zinc-400"
                  placeholder="jean.dupont@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="message" className="text-sm font-bold uppercase tracking-widest text-zinc-950">Message</label>
              <textarea 
                id="message"
                rows={4}
                required
                className="w-full px-0 py-3 bg-transparent border-b-2 border-zinc-300 focus:outline-none focus:border-zinc-950 transition-colors rounded-none resize-none placeholder:text-zinc-400"
                placeholder="Comment pouvons-nous vous aider ?"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>

            <div className="flex items-start gap-4">
              <input 
                type="checkbox" 
                id="consentement"
                required
                className="mt-1 w-5 h-5 accent-zinc-950 cursor-pointer"
                checked={formData.consentement}
                onChange={(e) => setFormData({...formData, consentement: e.target.checked})}
              />
              <label htmlFor="consentement" className="text-sm text-zinc-600 leading-snug cursor-pointer select-none">
                En soumettant ce formulaire, j'accepte que les informations saisies soient exploitées dans le cadre de la demande de contact et de la relation commerciale.
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-between px-8 py-5 bg-zinc-950 text-white font-medium hover:bg-zinc-800 transition-colors group mt-8"
            >
              <span>Envoyer le message</span>
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface PricingTemplateProps {
  title: string;
  content: string;
}

// Custom parser
function parsePricingData(markdown: string) {
  const categories: any[] = [];
  const categoryBlocks = markdown.split(/\n##\s+/);
  
  const introBlock = categoryBlocks.shift() || "";
  
  for (const block of categoryBlocks) {
    const lines = block.split('\n');
    const categoryTitle = lines[0].trim();
    const rest = lines.slice(1).join('\n');
    
    const planBlocks = rest.split(/\n###\s+/);
    const plans: any[] = [];
    
    for (let i = 1; i < planBlocks.length; i++) {
      const planLines = planBlocks[i].split('\n');
      const planTitle = planLines[0].trim();
      
      let price = "";
      let subtitle = "";
      const features: string[] = [];
      const forfaits: string[] = [];
      
      for (let j = 1; j < planLines.length; j++) {
        const line = planLines[j].trim();
        if (!line) continue;
        
        if (line.startsWith('- ')) {
          features.push(line.replace('- ', ''));
        } else if (line.startsWith('**') && (line.includes('€') || line.includes('prix')) && !line.toLowerCase().includes('forfait')) {
          price = line.replace(/\*\*/g, '');
        } else if (line.toLowerCase().includes('forfait')) {
          forfaits.push(line.replace(/\*\*/g, ''));
        } else if (!line.startsWith('**') && subtitle === "" && price === "") {
          subtitle = line;
        }
      }
      
      plans.push({ title: planTitle, subtitle, price, features, forfaits });
    }
    
    categories.push({ title: categoryTitle, plans });
  }
  
  return categories;
}

export default function PricingTemplate({ title, content }: PricingTemplateProps) {
  const categories = parsePricingData(content);

  if (!categories || categories.length === 0) {
    return (
      <div className="container-custom py-32 text-center">
        <h1 className="text-4xl font-bold">Tarifs</h1>
      </div>
    );
  }

  const mainCategory = categories.find(c => c.title.includes("FORMATION TAXI / VTC"));
  const specificTaxi = categories.find(c => c.title.includes("SPÉCIFIQUES TAXI"));
  const specificVtc = categories.find(c => c.title.includes("SPÉCIFIQUES VTC"));
  const otherFormations = categories.find(c => c.title.includes("AUTRES"));

  return (
    <div className="bg-white min-h-screen">
      
      {/* Editorial Hero */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 bg-white">
        <div className="container-custom">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <span className="eyebrow text-zinc-400 mb-6 block">Investissez dans votre réussite</span>
            <h1 className="text-6xl md:text-8xl lg:text-[8rem] font-bold tracking-tighter text-zinc-950 mb-8 leading-[0.9]">
              Tarifs & <br/> Formules.
            </h1>
            <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed max-w-2xl font-light">
              Des formations premium, transparentes et sans frais cachés. Éligibles au financement CPF avec facilités de paiement.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Pricing List - Editorial Style */}
      {mainCategory && (
        <section className="pb-32">
          <div className="container-custom">
            <div className="border-t-2 border-zinc-950 pt-8 mb-16">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-950 mb-2">Formation TAXI & VTC</h2>
              <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Tronc commun & Formules initiales</p>
            </div>

            <div className="flex flex-col">
              {mainCategory.plans.map((plan: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="group grid grid-cols-1 lg:grid-cols-12 gap-8 py-12 border-b border-zinc-200 hover:bg-zinc-50 transition-colors -mx-6 px-6 md:-mx-12 md:px-12 rounded-2xl"
                >
                  {/* Title & Subtitle */}
                  <div className="lg:col-span-4 flex flex-col justify-center">
                    <h3 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-950 mb-3">{plan.title}</h3>
                    {plan.subtitle && <p className="text-zinc-500 font-medium leading-relaxed">{plan.subtitle}</p>}
                  </div>

                  {/* Features */}
                  <div className="lg:col-span-4 flex flex-col justify-center">
                    <ul className="flex flex-col gap-3">
                      {plan.features.map((feat: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-zinc-700">
                          <CheckCircle2 size={18} className="text-[#4CAF50] shrink-0 mt-0.5" strokeWidth={2} />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price & Action */}
                  <div className="lg:col-span-4 flex flex-col justify-center lg:items-end lg:text-right">
                    <div className="mb-2">
                      <span className="eyebrow text-zinc-400 block mb-1">
                        {plan.price.includes('À partir') ? 'Prix de départ' : 'Tarif unique'}
                      </span>
                      <div className="text-4xl md:text-5xl font-mono font-bold tracking-tighter text-zinc-950">
                        {plan.price.replace('À partir de ', '')}
                      </div>
                    </div>

                    {plan.forfaits.length > 0 && (
                      <div className="mt-4 mb-6 space-y-2 lg:text-right w-full lg:w-auto">
                        {plan.forfaits.map((forfait: string, i: number) => (
                          <div key={i} className="text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white flex justify-between lg:justify-end gap-6 items-center">
                            <span className="text-zinc-500">{forfait.split(':')[0]}</span>
                            <span className="font-bold text-zinc-950 font-mono">{forfait.split(':')[1]}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Link 
                      href="/contact"
                      className="mt-4 lg:mt-auto inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm text-zinc-950 hover:text-[#4CAF50] transition-colors group/link"
                    >
                      S'inscrire <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Specific Formations - Split Layout */}
      <section className="py-32 bg-zinc-50 border-t border-zinc-200">
        <div className="container-custom">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* TAXI */}
            {specificTaxi && (
              <div>
                <div className="mb-12 flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-950 text-white flex items-center justify-center font-bold text-xl rounded-none">T</div>
                  <h2 className="text-3xl font-bold tracking-tight text-zinc-950">Spécifiques TAXI</h2>
                </div>
                
                <div className="flex flex-col border-t border-zinc-300">
                  {specificTaxi.plans.map((plan: any, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="py-8 border-b border-zinc-200 flex flex-col md:flex-row md:items-start justify-between gap-6 group hover:pl-4 transition-all"
                    >
                      <div>
                        <h4 className="text-2xl font-bold text-zinc-950 mb-2">{plan.title}</h4>
                        {plan.subtitle && <p className="text-zinc-500 mb-4 max-w-sm">{plan.subtitle}</p>}
                        <div className="text-sm font-mono text-zinc-500 flex flex-col gap-1">
                          {plan.features.slice(0,2).map((f:string, j:number) => <span key={j}>— {f}</span>)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-3xl font-bold font-mono text-zinc-950 group-hover:text-[#4CAF50] transition-colors">{plan.price}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* VTC */}
            {specificVtc && (
              <div>
                <div className="mb-12 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#4CAF50] text-white flex items-center justify-center font-bold text-xl rounded-none">V</div>
                  <h2 className="text-3xl font-bold tracking-tight text-zinc-950">Spécifiques VTC</h2>
                </div>
                
                <div className="flex flex-col border-t border-zinc-300">
                  {specificVtc.plans.map((plan: any, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="py-8 border-b border-zinc-200 flex flex-col md:flex-row md:items-start justify-between gap-6 group hover:pl-4 transition-all"
                    >
                      <div>
                        <h4 className="text-2xl font-bold text-zinc-950 mb-2">{plan.title}</h4>
                        {plan.subtitle && <p className="text-zinc-500 mb-4 max-w-sm">{plan.subtitle}</p>}
                        <div className="text-sm font-mono text-zinc-500 flex flex-col gap-1">
                          {plan.features.slice(0,2).map((f:string, j:number) => <span key={j}>— {f}</span>)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-3xl font-bold font-mono text-zinc-950 group-hover:text-[#4CAF50] transition-colors">{plan.price}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Autres Formations */}
      {otherFormations && (
        <section className="py-32 bg-white">
          <div className="container-custom">
            <div className="border-t-2 border-zinc-950 pt-8 mb-16">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-950">Autres Formations</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {otherFormations.plans.map((plan: any, i: number) => (
                <div key={i} className="bg-zinc-50 border border-zinc-200 p-10 md:p-12">
                  <h3 className="text-3xl font-bold tracking-tighter text-zinc-950 mb-3">{plan.title}</h3>
                  <p className="text-zinc-500 mb-8">{plan.subtitle}</p>
                  
                  <div className="text-4xl font-black font-mono text-zinc-950 mb-8 pb-8 border-b border-zinc-200">
                    {plan.price}
                  </div>
                  
                  <ul className="flex flex-col gap-4">
                    {plan.features.map((feat: string, j: number) => (
                      <li key={j} className="flex items-start gap-3 text-zinc-700">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-zinc-950 shrink-0"></span>
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Financement Brutalist Banner */}
      <section className="bg-zinc-950 text-white py-32">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <span className="eyebrow text-[#4CAF50] mb-6 block">Un financement accessible</span>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 leading-tight">
              Payez en 3x ou 4x sans frais.
            </h3>
            <p className="text-xl text-zinc-400 font-light leading-relaxed">
              Nous sommes certifiés Qualiopi. Utilisez vos droits CPF ou faites appel à Pôle Emploi pour financer jusqu'à 100% de votre formation.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Link 
              href="/contact"
              className="flex items-center justify-center gap-4 px-10 py-6 bg-white text-zinc-950 font-bold uppercase tracking-widest hover:bg-[#4CAF50] hover:text-white transition-colors w-full"
            >
              Monter un dossier <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

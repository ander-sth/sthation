"use client"

import Image from "next/image"
import { Upload, Users, CheckCircle, Award, Bitcoin } from "lucide-react"

const steps = [
  {
    icon: <Upload className="h-8 w-8" />,
    number: "01",
    title: "Captação",
    description: "Projetos captam recursos de doadores. 80% vai direto para a Instituição executora.",
  },
  {
    icon: <CheckCircle className="h-8 w-8" />,
    number: "02",
    title: "Prova de Ação",
    description: "A Instituição executa e coleta evidências com metadados invioláveis (GPS, Timestamp).",
  },
  {
    icon: <Users className="h-8 w-8" />,
    number: "03",
    title: "Validação VCA",
    description: "Checkers auditam as evidências. Com >80% de aprovação, o projeto é validado.",
    hasImage: true,
  },
  {
    icon: <Award className="h-8 w-8" />,
    number: "04",
    title: "Certificação",
    description: "Analistas certificadores verificam a conformidade técnica do impacto.",
  },
  {
    icon: <Bitcoin className="h-8 w-8" />,
    number: "05",
    title: "Inscrição Eterna",
    description: "O dossiê completo é gravado na blockchain, garantindo imutabilidade.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative bg-[#0a2f2f] py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 mesh-pattern-dark" />

      {/* Glowing orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl md:text-5xl font-bold text-white uppercase">
            Da Ação à <span className="text-teal-400">Imutabilidade</span>
          </h2>
          <p className="text-lg text-teal-400/80">Um pipeline tecnológico auditável de ponta a ponta</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-400 via-teal-400/50 to-transparent" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative flex items-start gap-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                {/* Content card */}
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"} pl-20 md:pl-0`}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-teal-400/20 p-6 hover:border-teal-400/50 transition-all">
                    <span className="text-teal-400 font-mono text-sm">{step.number}</span>
                    <h3 className="text-xl font-bold text-white mt-1 mb-2 uppercase">{step.title}</h3>
                    <p className="text-white/70">{step.description}</p>
                    {"hasImage" in step && step.hasImage && (
                      <Image
                        src="/vca-banner.jpg"
                        alt="Validacao por Consenso Aferido"
                        width={400}
                        height={240}
                        className="mt-4 h-auto w-full rounded-xl"
                      />
                    )}
                  </div>
                </div>

                {/* Icon circle */}
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#0a2f2f] border-2 border-teal-400 flex items-center justify-center text-teal-400 glow-teal">
                    {step.icon}
                  </div>
                </div>

                {/* Empty space for alternating layout */}
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

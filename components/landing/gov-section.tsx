import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Landmark, ShieldCheck, Leaf, FileCheck, ArrowRight } from "lucide-react"

export function GovSection() {
  const features = [
    {
      icon: Landmark,
      stat: "50",
      label: "Projetos por Plano",
      description: "Inscreva ate 50 projetos de acoes sociais e ambientais por pacote contratado.",
    },
    {
      icon: ShieldCheck,
      stat: "Dupla",
      label: "Verificacao",
      description: "Acoes sociais verificadas por Checkers (VCA). Acoes ambientais por Certificadoras.",
    },
    {
      icon: FileCheck,
      stat: "100%",
      label: "Registro Imutavel",
      description: "Cada projeto verificado e registrado permanentemente na Blockchain.",
    },
  ]

  return (
    <section className="relative overflow-hidden">
      {/* Top divider */}
      <div className="h-1 bg-teal-400" />

      {/* Dark section */}
      <div className="relative bg-[#0a2f2f] py-20">
        <div className="absolute inset-0 mesh-pattern-dark" />

        <div className="container relative mx-auto px-4">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2">
              <Landmark className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium text-teal-400 uppercase tracking-wider">Novo</span>
            </div>
            <h2 className="mb-4 text-4xl font-black text-white md:text-5xl text-balance">
              Sthation <span className="text-teal-400">Gov</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white/60 text-pretty">
              Gestao Publica com Transparencia na Blockchain. Prefeituras podem inscrever projetos de acoes sociais e
              ambientais para verificacao independente e registro imutavel.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mx-auto mb-12 grid max-w-4xl gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="group rounded-2xl border border-teal-400/20 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-teal-400/40 hover:bg-white/10"
              >
                <feature.icon className="mb-4 h-8 w-8 text-teal-400" />
                <div className="mb-1 text-3xl font-black text-white">{feature.stat}</div>
                <div className="mb-2 text-sm font-bold text-teal-400 uppercase tracking-wider">{feature.label}</div>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* How it works mini */}
          <div className="mx-auto mb-12 max-w-3xl rounded-2xl border border-teal-400/20 bg-white/5 p-8 backdrop-blur-sm">
            <h3 className="mb-6 text-center text-xl font-bold text-white">Como Funciona</h3>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { step: "1", title: "Contrate", desc: "Adquira o plano on-demand" },
                { step: "2", title: "Inscreva", desc: "Cadastre ate 50 projetos" },
                { step: "3", title: "Verifique", desc: "Checkers ou Certificadoras" },
                { step: "4", title: "Registre", desc: "Imutavel na Blockchain" },
              ].map((item, i) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-400 text-sm font-bold text-[#0a2f2f]">
                    {item.step}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{item.title}</div>
                    <div className="text-xs text-white/50">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold rounded-full px-8 glow-teal"
            >
              <Link href="/gov">
                Conheca o Sthation Gov
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom banner */}
      <div className="bg-teal-400 py-3">
        <p className="text-center text-sm font-bold text-[#0a2f2f] uppercase tracking-widest">
          Gestao Publica Transparente. Impacto Verificado. Blockchain.
        </p>
      </div>
    </section>
  )
}

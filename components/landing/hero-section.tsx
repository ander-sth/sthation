"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, TrendingUp, LinkIcon, Check } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <>
      <section className="relative min-h-[90vh] overflow-hidden bg-[#0a2f2f]">
        {/* Mesh pattern overlay */}
        <div className="absolute inset-0 mesh-pattern-dark" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/50 via-transparent to-cyan-900/30" />
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#0a2f2f] to-transparent" />

        {/* Glowing orbs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 uppercase">
                STHATION <span className="text-teal-400">NOBIS</span>
              </h1>

              <p className="text-xl md:text-2xl text-teal-400 mb-8">Veja o Impacto Real na Blockchain</p>

              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-white text-lg">
                  <Check className="h-6 w-6 text-teal-400" />
                  100% Rastreável
                </li>
                <li className="flex items-center gap-3 text-white text-lg">
                  <Check className="h-6 w-6 text-teal-400" />
                  80% para o Impacto
                </li>
                <li className="flex items-center gap-3 text-white text-lg">
                  <Check className="h-6 w-6 text-teal-400" />
                  Validado pela Comunidade
                </li>
              </ul>

              <Button
                size="lg"
                asChild
                className="bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold text-lg px-8 py-6 rounded-full glow-teal"
              >
                <Link href="/projetos">
                  COMECE AGORA
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Right - Blockchain visualization */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-lg">
                {/* Central glowing element */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-teal-400/20 to-cyan-400/20 blur-xl animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-48 h-48 rounded-full border-2 border-teal-400/30 animate-spin"
                    style={{ animationDuration: "20s" }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-32 h-32 rounded-full border border-cyan-400/50 animate-spin"
                    style={{ animationDuration: "15s", animationDirection: "reverse" }}
                  />
                </div>
                {/* Diamond/gem icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-400 transform rotate-45 glow-teal-strong" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#0a2f2f] py-16">
        <div className="absolute inset-0 mesh-pattern-dark" />
        <div className="container relative mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard icon={<Shield className="h-6 w-6" />} value="100%" label="RASTREÁVEL" />
            <StatCard icon={<TrendingUp className="h-6 w-6" />} value="80%" label="PARA IMPACTO" />
            <StatCard icon={<LinkIcon className="h-6 w-6" />} value="IMUTÁVEL" label="NA BLOCKCHAIN" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-2">
          {/* Left - Dark with big text */}
          <div className="bg-[#0a2f2f] p-12 md:p-20 flex flex-col justify-center min-h-[500px] relative">
            <div className="absolute inset-0 mesh-pattern-dark" />
            <div className="relative">
              <span className="text-7xl md:text-9xl font-bold text-teal-400 block mb-4">80%</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white uppercase leading-tight">
                Do seu dinheiro
                <br />
                vai direto para
                <br />
                <span className="text-teal-400">quem faz acontecer</span>
              </h2>
            </div>
          </div>

          {/* Right - Flow diagram placeholder */}
          <div className="bg-white p-12 md:p-20 flex items-center justify-center min-h-[500px]">
            <div className="max-w-md">
              <div className="flex items-center justify-between mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#0a2f2f] flex items-center justify-center mb-2">
                    <span className="text-teal-400 font-bold">$</span>
                  </div>
                  <span className="text-sm font-medium text-[#0a2f2f]">Origem do Capital</span>
                </div>
                <div className="flex-1 h-1 bg-teal-400 mx-4" />
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-teal-400 flex items-center justify-center mb-2 glow-teal">
                    <span className="text-[#0a2f2f] font-bold">✓</span>
                  </div>
                  <span className="text-sm font-medium text-[#0a2f2f]">Impacto Real</span>
                </div>
              </div>
              <div className="space-y-3 text-[#0a2f2f]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full" />
                  <span>Intermediação Mínima</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full" />
                  <span>Processamento Seguro</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full" />
                  <span>Registro Imutável</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full" />
                  <span>Destino Transparente</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bg-teal-400 py-4">
          <div className="container mx-auto px-4">
            <p className="text-center text-[#0a2f2f] font-bold uppercase tracking-wider">
              Transparência Total. Impacto Real. Blockchain.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-teal-400/30 p-6 text-center hover:border-teal-400 transition-all hover:glow-teal">
      <div className="inline-flex items-center justify-center text-teal-500 mb-2">{icon}</div>
      <div className="text-3xl font-bold text-[#0a2f2f]">{value}</div>
      <div className="text-sm font-semibold text-[#0a2f2f] uppercase tracking-wide">{label}</div>
    </div>
  )
}

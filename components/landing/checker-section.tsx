"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { UserCheck, GraduationCap, ShieldCheck, Coins, ArrowRight, CheckCircle2 } from "lucide-react"

const benefits = [
  {
    icon: GraduationCap,
    title: "Formacao Gratuita",
    description: "Acesse a Sthation Academy e obtenha certificacao como auditor comunitario sem custo.",
  },
  {
    icon: ShieldCheck,
    title: "Valide Impactos Reais",
    description: "Analise evidencias de projetos sociais com fotos, GPS e documentos e vote pela aprovacao ou rejeicao.",
  },
  {
    icon: Coins,
    title: "Receba Recompensas",
    description: "Ganhe tokens NOBIS por cada validacao realizada no sistema VCA (Validacao Comunitaria de Acoes).",
  },
]

const requirements = [
  "Ter 18 anos ou mais",
  "Completar o curso na Sthation Academy",
  "Obter aprovacao no exame de certificacao",
  "Manter conduta etica nas validacoes",
]

export function CheckerSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-32">
      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left - Content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0a2f2f]/20 bg-[#0a2f2f]/5 px-4 py-2">
              <UserCheck className="h-4 w-4 text-[#0a2f2f]" />
              <span className="text-sm font-medium text-[#0a2f2f] uppercase tracking-wider">Comunidade</span>
            </div>

            <h2 className="mb-4 text-3xl font-black text-[#0a2f2f] md:text-5xl text-balance">
              Seja um <span className="text-teal-600">Checker</span>
            </h2>

            <p className="mb-8 text-lg text-foreground/60 leading-relaxed text-pretty">
              Checkers sao auditores comunitarios que garantem a veracidade dos projetos sociais na plataforma.
              Atraves do VCA (Validacao Comunitaria de Acoes), voce analisa evidencias reais e vota pela
              aprovacao ou rejeicao de cada projeto. Sua participacao e fundamental para manter a transparencia
              do ecossistema.
            </p>

            {/* Benefits */}
            <div className="mb-8 space-y-5">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0a2f2f]/10">
                    <benefit.icon className="h-5 w-5 text-[#0a2f2f]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{benefit.title}</h3>
                    <p className="text-sm text-foreground/60 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              asChild
              size="lg"
              className="bg-[#0a2f2f] hover:bg-[#0a2f2f]/90 text-white font-bold rounded-full px-8"
            >
              <Link href="/register">
                Quero ser Checker
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Right - VCA visual + Requirements card */}
          <div className="flex flex-col items-center gap-8 lg:justify-end">
            {/* VCA Infographic */}
            <div className="w-full max-w-md">
              <Image
                src="/vca-banner.jpg"
                alt="Validacao por Consenso Aferido - 10 validadores, 6 criterios, score 0-100"
                width={640}
                height={400}
                className="h-auto w-full rounded-2xl shadow-lg"
              />
            </div>

            <div className="w-full max-w-md rounded-2xl border border-[#0a2f2f]/10 bg-[#0a2f2f] p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/20">
                  <UserCheck className="h-6 w-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Como se tornar Checker</h3>
                  <p className="text-sm text-white/60">Passo a passo</p>
                </div>
              </div>

              <div className="mb-8 space-y-4">
                {requirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-[#0a2f2f]">
                      {i + 1}
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{req}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-teal-400/20 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-400" />
                  <span className="text-sm font-bold text-teal-400">Vantagens exclusivas</span>
                </div>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-teal-400" />
                    Acesso ao painel VCA de votacao
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-teal-400" />
                    Recompensas em tokens NOBIS
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-teal-400" />
                    Certificado de auditor comunitario
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-teal-400" />
                    Participacao no ecossistema descentralizado
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

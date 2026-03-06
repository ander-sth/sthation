import Link from "next/link"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Landmark,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  Users,
  Leaf,
  CheckCircle2,
  Lock,
  BarChart3,
  Building2,
} from "lucide-react"
import { GOV_PLAN_DEFAULT } from "@/lib/types/gov"

export const metadata = {
  title: "Sthation Gov - Gestao Publica com Transparencia na Blockchain",
  description:
    "Prefeituras podem inscrever projetos de acoes sociais e ambientais para verificacao independente e registro imutavel na blockchain.",
}

export default function GovPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0a2f2f] py-24 md:py-32">
          <div className="absolute inset-0 mesh-pattern-dark" />
          <div className="container relative mx-auto px-4 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2">
              <Landmark className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium text-teal-400 uppercase tracking-wider">Sthation Gov</span>
            </div>
            <h1 className="mb-6 text-4xl font-black text-white md:text-6xl text-balance">
              Transforme a <span className="text-teal-400">Gestao Publica</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/60 leading-relaxed text-pretty">
              Inscreva projetos de acoes sociais e ambientais da sua prefeitura para verificacao independente. Cada
              projeto verificado e registrado permanentemente na Blockchain.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold rounded-full px-8 glow-teal"
              >
                <Link href="/register">
                  Contratar Plano
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-teal-400/30 text-teal-400 hover:bg-teal-400/10 rounded-full px-8 bg-transparent"
              >
                <Link href="/gov/hall">Ver Hall Gov</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-16 grid max-w-3xl gap-6 md:grid-cols-3">
              {[
                { value: "50", label: "Projetos por Plano" },
                { value: "2x", label: "Verificacao Dupla" },
                { value: "100%", label: "Rastreavel" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-teal-400/20 bg-white/5 px-6 py-4 backdrop-blur-sm"
                >
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-sm font-medium text-teal-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-4 text-center text-3xl font-black text-[#0a2f2f] md:text-4xl text-balance">
              Como Funciona
            </h2>
            <p className="mx-auto mb-16 max-w-2xl text-center text-[#0a2f2f]/60">
              Um processo simples em 4 etapas para trazer transparencia total as acoes da sua prefeitura.
            </p>

            <div className="mx-auto max-w-4xl">
              <div className="grid gap-8 md:grid-cols-4">
                {[
                  {
                    step: "1",
                    icon: Building2,
                    title: "Contrate o Plano",
                    desc: "Adquira o plano on-demand e tenha acesso ao painel exclusivo para prefeituras.",
                  },
                  {
                    step: "2",
                    icon: FileCheck,
                    title: "Inscreva Projetos",
                    desc: "Cadastre ate 50 projetos de acoes sociais ou ambientais com evidencias.",
                  },
                  {
                    step: "3",
                    icon: ShieldCheck,
                    title: "Verificacao",
                    desc: "Acoes sociais sao verificadas por Checkers (VCA). Ambientais por Certificadoras.",
                  },
                  {
                    step: "4",
                    icon: Lock,
                    title: "Registro Imutavel",
                    desc: "Projetos verificados sao registrados permanentemente na Blockchain.",
                  },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0a2f2f]">
                      <item.icon className="h-8 w-8 text-teal-400" />
                    </div>
                    <div className="mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-[#0a2f2f]">
                      {item.step}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-[#0a2f2f]">{item.title}</h3>
                    <p className="text-sm text-[#0a2f2f]/60 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Verificacao dupla */}
        <section className="relative bg-[#0a2f2f] py-20">
          <div className="absolute inset-0 mesh-pattern-dark" />
          <div className="container relative mx-auto px-4">
            <h2 className="mb-4 text-center text-3xl font-black text-white md:text-4xl text-balance">
              Verificacao <span className="text-teal-400">Dupla</span>
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-white/60">
              Cada tipo de projeto passa por um processo de verificacao especializado.
            </p>

            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              {/* Social */}
              <div className="rounded-2xl border border-teal-400/20 bg-white/5 p-8 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/20">
                    <Users className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Acoes Sociais</h3>
                    <Badge className="bg-teal-400/20 text-teal-400 border-0">Checkers (VCA)</Badge>
                  </div>
                </div>
                <p className="mb-4 text-white/60 leading-relaxed">
                  Projetos de educacao, saude, assistencia social e cultura sao verificados pela comunidade de Checkers
                  atraves do sistema VCA (Validacao por Consenso Aberto).
                </p>
                <ul className="space-y-2">
                  {["10 Checkers independentes", "Checklist de 6 criterios", "Consenso de 60% para aprovacao", "Revisao de evidencias fotograficas"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-white/50">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>

              {/* Ambiental */}
              <div className="rounded-2xl border border-teal-400/20 bg-white/5 p-8 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/20">
                    <Leaf className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Acoes Ambientais</h3>
                    <Badge className="bg-teal-400/20 text-teal-400 border-0">Certificadoras</Badge>
                  </div>
                </div>
                <p className="mb-4 text-white/60 leading-relaxed">
                  Projetos de sustentabilidade, preservacao e reducao de carbono sao analisados por Analistas
                  Certificadores especializados com certificacao tecnica.
                </p>
                <ul className="space-y-2">
                  {["Analise tecnica especializada", "Certificacao de dados ambientais", "Validacao de metodologia", "Parecer tecnico detalhado"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-white/50">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Plano */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-4 text-center text-3xl font-black text-[#0a2f2f] md:text-4xl">Plano On-Demand</h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-[#0a2f2f]/60">
              Um unico plano completo para prefeituras que buscam transparencia.
            </p>

            <div className="mx-auto max-w-lg rounded-2xl border-2 border-teal-400 bg-[#0a2f2f] p-8">
              <div className="mb-6 text-center">
                <Badge className="mb-4 bg-teal-400/20 text-teal-400 border-0 uppercase tracking-wider">
                  Mais Popular
                </Badge>
                <h3 className="mb-2 text-2xl font-bold text-white">{GOV_PLAN_DEFAULT.name}</h3>
                <div className="mb-1">
                  <span className="text-4xl font-black text-white">
                    R$ {GOV_PLAN_DEFAULT.priceInBRL.toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm text-white/50">por pacote de {GOV_PLAN_DEFAULT.maxProjects} projetos / {GOV_PLAN_DEFAULT.validityDays} dias</p>
              </div>

              <ul className="mb-8 space-y-3">
                {GOV_PLAN_DEFAULT.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                className="w-full bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold rounded-full glow-teal"
              >
                <Link href="/register">
                  Contratar Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Hall preview */}
        <section className="relative bg-[#0a2f2f] py-20">
          <div className="absolute inset-0 mesh-pattern-dark" />
          <div className="container relative mx-auto px-4 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2">
              <BarChart3 className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium text-teal-400 uppercase tracking-wider">Hall Sthation Gov</span>
            </div>
            <h2 className="mb-4 text-3xl font-black text-white md:text-4xl text-balance">
              Projetos Verificados de <span className="text-teal-400">Prefeituras</span>
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-white/60">
              Veja todos os projetos de gestao publica ja verificados e registrados na Blockchain.
            </p>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-teal-400/30 text-teal-400 hover:bg-teal-400/10 rounded-full px-8 bg-transparent"
            >
              <Link href="/gov/hall">
                Acessar Hall Gov
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Bottom banner */}
        <div className="bg-teal-400 py-3">
          <p className="text-center text-sm font-bold text-[#0a2f2f] uppercase tracking-widest">
            Gestao Publica Transparente. Impacto Verificado. Blockchain.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

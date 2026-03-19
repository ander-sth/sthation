"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Zap, 
  ArrowRight, 
  Shield, 
  Globe, 
  Layers,
  Bitcoin,
  Hexagon,
  ChevronRight,
  Leaf,
  Heart,
  CheckCircle2,
  TrendingUp,
  Lock,
  Sparkles,
  LogIn,
  UserPlus
} from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function NobisCoreLanding() {
  const { data: stats } = useSWR("/api/nobiscore/stats", fetcher)

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/nobiscore" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-black flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tracking-tight">NobisCore</span>
              <span className="text-xs text-black/40">by STHATION</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm text-black/60 hover:text-black transition-colors">
              Como Funciona
            </a>
            <a href="#beneficios" className="text-sm text-black/60 hover:text-black transition-colors">
              Beneficios
            </a>
            <a href="#tecnologia" className="text-sm text-black/60 hover:text-black transition-colors">
              Tecnologia
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/nobiscore/hall">
              <Button variant="outline" className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-semibold rounded-full px-5">
                Hall de Projetos
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-black/60 hover:text-black hover:bg-black/5">
                Voltar a Sthation
              </Button>
            </Link>
            <Link href="/nobiscore/login">
              <Button className="bg-black text-white hover:bg-black/90 font-semibold rounded-full px-6">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 mb-8">
              <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
              <span className="text-sm text-black/60">Polygon to Bitcoin Bridge</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Transforme Impacto em
              <br />
              <span className="text-black/80">
                Inscriptions Bitcoin
              </span>
            </h1>
            
            <p className="text-xl text-black/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              A ponte que conecta seus tokens de impacto social e ambiental da Polygon 
              para inscriptions imutáveis no Bitcoin. Eternize seu legado na blockchain mais segura do mundo.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/nobiscore/login">
                <Button size="lg" className="bg-black text-white hover:bg-black/90 font-semibold rounded-full px-8 h-14 text-lg">
                  <LogIn className="mr-2 h-5 w-5" />
                  Entrar na Conta
                </Button>
              </Link>
              <Link href="/nobiscore/cadastro">
                <Button size="lg" variant="outline" className="border-black/20 text-black hover:bg-black/5 rounded-full px-8 h-14 text-lg">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Criar Conta
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats - Dados Reais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { label: "IACs Registrados", value: stats?.totalOnPolygon || 0, icon: Layers },
              { label: "Inscriptions Criadas", value: stats?.totalInscriptions || 0, icon: Bitcoin },
              { label: "Beneficiários", value: stats?.totalBeneficiaries?.toLocaleString("pt-BR") || 0, icon: Heart },
              { label: "Impactos Validados", value: (stats?.socialCount || 0) + (stats?.environmentalCount || 0), icon: Leaf },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-black/5 border border-black/10">
                <stat.icon className="h-6 w-6 mx-auto mb-3 text-black/40" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-black/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-24 px-6 bg-black/[0.02]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-black/60 max-w-xl mx-auto">
              Em três passos simples, transforme seus tokens de impacto em ativos permanentes no Bitcoin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Faça Login e Conecte suas Carteiras",
                description: "Entre na sua conta Sthation, depois conecte sua carteira EVM (MetaMask) para Polygon e sua carteira Bitcoin (Xverse, Unisat).",
                icon: Lock,
              },
              {
                step: "02", 
                title: "Selecione seus Tokens",
                description: "Escolha os tokens de impacto (IACs) que deseja transformar em inscriptions permanentes no Bitcoin.",
                icon: Layers,
              },
              {
                step: "03",
                title: "Burn & Mint",
                description: "O token é queimado na Polygon e uma inscription é gerada no Bitcoin com todos os dados de impacto.",
                icon: Sparkles,
              }
            ].map((item, i) => (
              <div key={i} className="relative p-8 rounded-2xl bg-black/5 border border-black/10 hover:border-black/20 transition-colors group">
                <div className="absolute -top-4 -right-4 text-6xl font-bold text-black/5 group-hover:text-black/10 transition-colors">
                  {item.step}
                </div>
                <div className="inline-flex p-3 rounded-xl bg-black/10 mb-6">
                  <item.icon className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-black/60 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Flow Diagram */}
          <div className="mt-16 p-8 rounded-2xl bg-black/5 border border-black/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-black/10 flex items-center justify-center">
                  <Hexagon className="h-8 w-8 text-black/60" />
                </div>
                <div>
                  <div className="text-sm text-black/40">Origem</div>
                  <div className="font-semibold">Polygon (ERC-1155)</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-black/40">
                <div className="h-px w-12 bg-black/20 hidden md:block" />
                <ChevronRight className="h-5 w-5" />
                <span className="text-sm">Burn</span>
                <ChevronRight className="h-5 w-5" />
                <div className="h-px w-12 bg-black/20 hidden md:block" />
              </div>

              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-black/10 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-black/60" />
                </div>
                <div>
                  <div className="text-sm text-black/40">Processamento</div>
                  <div className="font-semibold">NobisCore Bridge</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-black/40">
                <div className="h-px w-12 bg-black/20 hidden md:block" />
                <ChevronRight className="h-5 w-5" />
                <span className="text-sm">Mint</span>
                <ChevronRight className="h-5 w-5" />
                <div className="h-px w-12 bg-black/20 hidden md:block" />
              </div>

              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-black/10 flex items-center justify-center">
                  <Bitcoin className="h-8 w-8 text-black/60" />
                </div>
                <div>
                  <div className="text-sm text-black/40">Destino</div>
                  <div className="font-semibold">Bitcoin (Inscription)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Por que Inscriptions?</h2>
            <p className="text-black/60 max-w-xl mx-auto">
              A segurança e imutabilidade do Bitcoin para certificar impacto real
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Shield,
                title: "Imutável e Permanente",
                description: "Inscriptions são gravadas diretamente no Bitcoin, a blockchain mais segura e descentralizada do mundo. Seus dados de impacto existirão para sempre."
              },
              {
                icon: Globe,
                title: "Reconhecimento Global",
                description: "Inscriptions Bitcoin são reconhecidas mundialmente. Seu impacto ganha visibilidade e credibilidade em qualquer lugar do planeta."
              },
              {
                icon: TrendingUp,
                title: "Valorização Real",
                description: "Diferente de tokens inflacionários, inscriptions são ativos escassos com potencial de valorização baseado em seu impacto real."
              },
              {
                icon: CheckCircle2,
                title: "Auditável e Transparente",
                description: "Qualquer pessoa pode verificar a autenticidade e os dados de impacto diretamente na blockchain Bitcoin."
              }
            ].map((benefit, i) => (
              <div key={i} className="flex gap-6 p-6 rounded-2xl bg-black/5 border border-black/10 hover:border-black/20 transition-colors">
                <div className="shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-black/10 flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-black/80" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-black/60 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tecnologia */}
      <section id="tecnologia" className="py-24 px-6 bg-black/[0.02]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Tecnologia de Ponta</h2>
              <p className="text-black/60 mb-8 leading-relaxed">
                NobisCore utiliza a infraestrutura mais avançada para garantir 
                segurança, velocidade e confiabilidade em cada transação.
              </p>

              <div className="space-y-4">
                {[
                  "Smart Contracts auditados na Polygon",
                  "Protocolo Ordinals para inscriptions",
                  "Verificação on-chain de queima",
                  "Prova criptográfica de impacto",
                  "Integração com STHATION Platform"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-black/60" />
                    <span className="text-black/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-black/5 rounded-3xl blur-3xl" />
              <div className="relative p-8 rounded-3xl bg-black/5 border border-black/10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-black/10">
                    <div className="text-sm text-black/40 mb-1">Network</div>
                    <div className="font-mono text-sm">Polygon PoS</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-black/10">
                    <div className="text-sm text-black/40 mb-1">Protocol</div>
                    <div className="font-mono text-sm">Ordinals</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-black/10">
                    <div className="text-sm text-black/40 mb-1">Token</div>
                    <div className="font-mono text-sm">ERC-1155</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-black/10">
                    <div className="text-sm text-black/40 mb-1">Output</div>
                    <div className="font-mono text-sm">Inscription</div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 rounded-xl bg-black/5 border border-black/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-black/60" />
                    <span className="text-sm font-medium">Segurança</span>
                  </div>
                  <p className="text-xs text-black/60">
                    Todas as transações são verificadas e assinadas por múltiplas partes antes da execução.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="p-12 rounded-3xl bg-black/5 border border-black/10">
            <h2 className="text-4xl font-bold mb-4">Pronto para Eternizar seu Impacto?</h2>
            <p className="text-black/60 mb-8 max-w-xl mx-auto">
              Crie sua conta ou faça login para começar a transformar tokens de impacto em inscriptions Bitcoin.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/nobiscore/cadastro">
                <Button size="lg" className="bg-black text-white hover:bg-black/90 font-semibold rounded-full px-10 h-14 text-lg">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Criar Conta Grátis
                </Button>
              </Link>
              <Link href="/nobiscore/login">
                <Button size="lg" variant="outline" className="border-black/20 text-black hover:bg-black/5 rounded-full px-10 h-14 text-lg">
                  <LogIn className="mr-2 h-5 w-5" />
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-black/10">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-black/40 text-sm">
            <Zap className="h-4 w-4" />
            <span>NobisCore by STHATION</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-black/40">
            <Link href="/" className="hover:text-black transition-colors">
              Sthation
            </Link>
            <Link href="/projetos" className="hover:text-black transition-colors">
              Projetos
            </Link>
            <Link href="/hall-de-impacto" className="hover:text-black transition-colors">
              Hall de Impacto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

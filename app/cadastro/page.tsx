"use client"

import Link from "next/link"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Building2,
  Leaf,
  Landmark,
  UserCheck,
  FlaskConical,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

const cadastroOptions = [
  {
    title: "Doador",
    description: "Pessoa fisica ou juridica que deseja apoiar projetos sociais e ambientais",
    icon: Heart,
    href: "/cadastro/doador",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    features: [
      "Doe para projetos validados",
      "Acompanhe o impacto das suas doacoes",
      "Receba Nobis (ativos de impacto)",
      "Acesse o Hall de Doadores",
    ],
  },
  {
    title: "Instituicao Social",
    description: "ONGs, associacoes e entidades que executam projetos de impacto social",
    icon: Building2,
    href: "/cadastro/instituicao?type=INSTITUICAO",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    features: [
      "Cadastre projetos sociais (IACs)",
      "Receba doacoes via crowdfunding",
      "Valide impacto com VCA",
      "Emita Nobis para doadores",
    ],
  },
  {
    title: "Empresa Ambiental",
    description: "Empresas que geram creditos de carbono e impacto ambiental mensuravel",
    icon: Leaf,
    href: "/cadastro/instituicao?type=EMPRESA_AMBIENTAL",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    features: [
      "Registre projetos ambientais",
      "Conecte sensores IoT",
      "Obtenha certificacao tecnica",
      "Emita creditos de carbono",
    ],
  },
  {
    title: "Prefeitura / Governo",
    description: "Orgaos publicos que desejam validar e registrar projetos governamentais",
    icon: Landmark,
    href: "/cadastro/instituicao?type=PREFEITURA",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    features: [
      "Registre projetos governamentais",
      "Valide com VCA ou certificadora",
      "Inscreva na blockchain Polygon",
      "Transparencia para o cidadao",
    ],
  },
  {
    title: "Checker (Validador VCA)",
    description: "Cidadaos que desejam participar da validacao comunitaria de projetos",
    icon: UserCheck,
    href: "/cadastro/checker",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    features: [
      "Valide projetos sociais",
      "Ganhe reputacao na plataforma",
      "Receba recompensas por validacoes",
      "Faca parte da governanca",
    ],
  },
  {
    title: "Analista Certificador",
    description: "Profissionais tecnicos que certificam projetos ambientais",
    icon: FlaskConical,
    href: "/cadastro/certificador",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    features: [
      "Certifique projetos ambientais",
      "Valide dados de sensores IoT",
      "Emita pareceres tecnicos",
      "Remuneracao por certificacao",
    ],
  },
]

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Junte-se a Plataforma Sthation
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o tipo de cadastro que melhor se encaixa no seu perfil e comece a fazer parte
              do ecossistema de impacto social e ambiental verificado.
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cadastroOptions.map((option) => {
              const Icon = option.icon
              return (
                <Card
                  key={option.title}
                  className="group relative overflow-hidden border-border hover:border-[#0a2f2f]/50 transition-all duration-300 hover:shadow-lg"
                >
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-xl ${option.bgColor} flex items-center justify-center mb-4`}
                    >
                      <Icon className={`h-6 w-6 ${option.color}`} />
                    </div>
                    <CardTitle className="text-xl">{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {option.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full bg-[#0a2f2f] hover:bg-[#0a2f2f]/90">
                      <Link href={option.href}>
                        Cadastrar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Already have account */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              Ja tem uma conta?{" "}
              <Link href="/login" className="text-[#0a2f2f] font-medium hover:underline">
                Faca login
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

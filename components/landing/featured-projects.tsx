"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Users,
  ArrowRight,
  Heart,
  UtensilsCrossed,
  GraduationCap,
  Home,
  Briefcase,
  Stethoscope,
  HandHeart,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import useSWR from "swr"
import { FundingStatus, FUNDING_STATUS_CONFIG } from "@/lib/types/funding"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const SOCIAL_CATEGORY_ICONS: Record<string, { icon: typeof Heart; bg: string; color: string }> = {
  "Alimentacao": { icon: UtensilsCrossed, bg: "bg-amber-500/10", color: "text-amber-600" },
  "Educacao": { icon: GraduationCap, bg: "bg-blue-500/10", color: "text-blue-600" },
  "Assistencia Social": { icon: Home, bg: "bg-rose-500/10", color: "text-rose-600" },
  "Capacitacao": { icon: Briefcase, bg: "bg-purple-500/10", color: "text-purple-600" },
  "Saude": { icon: Stethoscope, bg: "bg-emerald-500/10", color: "text-emerald-600" },
}

export function FeaturedProjects() {
  // Buscar projetos da API (dados reais do banco)
  const { data, isLoading } = useSWR("/api/funding-projects?status=FUNDING&limit=3", fetcher, {
    revalidateOnFocus: false,
  })

  // Usar apenas dados reais da API
  const activeProjects = data?.projects || []

  return (
    <section id="projetos" className="relative bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-teal-400 bg-teal-400/10 px-4 py-2 text-sm font-medium text-[#0a2f2f] mb-4">
            <Heart className="h-4 w-4 text-teal-500" />
            Projetos Sociais
          </div>
          <h2 className="mb-4 text-3xl md:text-4xl font-bold text-[#0a2f2f] uppercase">
            Projetos Buscando <span className="text-teal-500">Apoio</span>
          </h2>
          <p className="mx-auto max-w-2xl text-[#0a2f2f]/70">
            Escolha um projeto, faça sua doação e acompanhe cada etapa da execução. Transparência total do início ao
            fim.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && (
            <div className="col-span-3 flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          )}
          {!isLoading && activeProjects.map((project: any) => {
            // Compatibilidade com API e mock data
            const currentAmount = project.currentAmount ?? project.current_amount ?? 0
            const goalAmount = project.goalAmount ?? project.costModel?.metaTotal ?? project.goal_amount ?? 0
            const progressPercent = goalAmount > 0 ? Math.round((currentAmount / goalAmount) * 100) : 0
            const status = project.status
            const statusConfig = FUNDING_STATUS_CONFIG[status as FundingStatus] || { label: status }
            const locationName = project.location?.name ?? project.location_name ?? ""
            const locationState = project.location?.state ?? project.location_state ?? ""
            const donors = project.donorsCount ?? project.donors_count ?? 0
            const beneficiaries = project.estimatedBeneficiaries ?? project.estimated_beneficiaries ?? 0

            return (
              <Card
                key={project.id}
                className="overflow-hidden border-2 border-gray-100 hover:border-teal-400/50 transition-all hover:shadow-xl bg-white"
              >
                <div className="relative">
                  {(() => {
                    const cat = SOCIAL_CATEGORY_ICONS[project.category] || { icon: HandHeart, bg: "bg-teal-500/10", color: "text-teal-600" }
                    const IconComp = cat.icon
                    return (
                      <div className={`h-48 w-full flex items-center justify-center ${cat.bg}`}>
                        <IconComp className={`h-16 w-16 ${cat.color}`} />
                      </div>
                    )
                  })()}
                  <Badge className="absolute right-3 top-3 bg-teal-500 text-white border-0">{statusConfig.label}</Badge>
                </div>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-bold text-[#0a2f2f]">{project.title}</h3>
                  <p className="flex items-center gap-1 text-sm text-[#0a2f2f]/60">
                    <MapPin className="h-3 w-3" />
                    {locationName}, {locationState}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="line-clamp-2 text-sm text-[#0a2f2f]/70">{project.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#0a2f2f]/60">Arrecadado</span>
                      <span className="font-bold text-[#0a2f2f]">
                        R$ {currentAmount.toLocaleString("pt-BR")} de R${" "}
                        {goalAmount.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-[#0a2f2f]/60">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-teal-500" />
                      {donors} doadores
                    </span>
                    <span>{beneficiaries} beneficiados</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-100 bg-gray-50/50 pt-4">
                  <Button asChild className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-full">
                    <Link href={`/projetos/${project.id}`}>
                      Apoiar Projeto
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <Button
            variant="outline"
            size="lg"
            asChild
            className="border-2 border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white font-bold rounded-full px-8 bg-transparent"
          >
            <Link href="/projetos">
              Ver Todos os Projetos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

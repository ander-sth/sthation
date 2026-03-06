"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  MapPin,
  Users,
  ArrowRight,
  Filter,
  Heart,
  Clock,
  Leaf,
  Shield,
  TreePine,
  Award,
  UtensilsCrossed,
  GraduationCap,
  Home,
  Briefcase,
  Stethoscope,
  HandHeart,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { FundingStatus, FUNDING_STATUS_CONFIG } from "@/lib/types/funding"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const SOCIAL_CATEGORY_ICONS: Record<string, { icon: typeof Heart; bg: string; color: string }> = {
  "Alimentacao": { icon: UtensilsCrossed, bg: "bg-amber-500/10", color: "text-amber-600" },
  "Educacao": { icon: GraduationCap, bg: "bg-blue-500/10", color: "text-blue-600" },
  "Assistencia Social": { icon: Home, bg: "bg-rose-500/10", color: "text-rose-600" },
  "Capacitacao": { icon: Briefcase, bg: "bg-purple-500/10", color: "text-purple-600" },
  "Saude": { icon: Stethoscope, bg: "bg-emerald-500/10", color: "text-emerald-600" },
}

// Categorias sociais
const socialCategories = [
  "Todas",
  "Alimentacao e Seguranca Alimentar",
  "Educacao e Qualificacao Profissional",
  "Assistencia Social",
  "Protecao Animal",
  "Saude e Bem-Estar",
  "Meio Ambiente",
]

// Categorias ambientais (TSB)
const environmentalCategories = [
  "Todas",
  "Mitigacao de Mudancas Climaticas",
  "Uso Sustentavel de Recursos Hidricos",
  "Economia Circular",
  "Prevencao da Poluicao",
  "Biodiversidade e Ecossistemas",
  "Energia Renovavel",
  "Agricultura Regenerativa",
]

const states = ["Todos", "SP", "RJ", "RS", "CE", "BA", "MG", "GO", "PA", "PI", "AM"]

type ProjectTab = "sociais" | "ambientais"

export default function ProjetosPage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") === "ambientais" ? "ambientais" : "sociais"
  const [activeTab, setActiveTab] = useState<ProjectTab>(initialTab)

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "ambientais" || tab === "sociais") {
      setActiveTab(tab)
    }
  }, [searchParams])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Todas")
  const [state, setState] = useState("Todos")
  const [statusFilter, setStatusFilter] = useState("all")

  // Buscar dados da API (dados reais do banco)
  const { data: socialData, isLoading: socialLoading } = useSWR("/api/funding-projects?limit=50", fetcher, {
    revalidateOnFocus: false,
  })
  const { data: envData, isLoading: envLoading } = useSWR("/api/iac?type=AMBIENTAL&limit=50", fetcher, {
    revalidateOnFocus: false,
  })

  // Usar apenas dados reais da API
  const socialProjects = socialData?.projects || []
  const envProjects = envData?.projects || []

  // Reset filters on tab change
  const handleTabChange = (tab: ProjectTab) => {
    setActiveTab(tab)
    setSearch("")
    setCategory("Todas")
    setState("Todos")
    setStatusFilter("all")
  }

  // Filtrar projetos sociais (compativel com API e mock)
  const filteredSocialProjects = socialProjects.filter((project: any) => {
    const status = project.status ?? project.funding?.status
    if (status === FundingStatus.DRAFT || status === "DRAFT") return false
    const matchesSearch =
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      (project.description || "").toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "Todas" || project.category === category
    const locationState = project.location?.state ?? project.location_state ?? ""
    const matchesState = state === "Todos" || locationState === state
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "funding" && (status === FundingStatus.FUNDING || status === "FUNDING")) ||
      (statusFilter === "funded" && (status === FundingStatus.FUNDED || status === "FUNDED")) ||
      (statusFilter === "executing" && (status === FundingStatus.EXECUTING || status === "EXECUTING"))
    return matchesSearch && matchesCategory && matchesState && matchesStatus
  })

  // Filtrar projetos ambientais (compativel com API e mock)
  const filteredEnvironmentalProjects = envProjects.filter((project: any) => {
    const matchesSearch =
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      (project.description || "").toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "Todas" || project.category === category
    const locationState = project.location?.state ?? project.location_state ?? ""
    const matchesState = state === "Todos" || locationState === state
    const status = project.status
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "executing" && (status === "EXECUTING" || status === "CERTIFIED")) ||
      (statusFilter === "certified" && status === "CERTIFIED") ||
      (statusFilter === "nobis" && status === "NOBIS_EMITTED")
    return matchesSearch && matchesCategory && matchesState && matchesStatus
  })

  const isSocial = activeTab === "sociais"
  const categories = isSocial ? socialCategories : environmentalCategories

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-[#0a2f2f] py-16 overflow-hidden">
          <div className="absolute inset-0 mesh-pattern-dark" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />

          <div className="container relative mx-auto px-4">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-teal-400/20 text-teal-400 border-teal-400/30">
                {isSocial ? (
                  <>
                    <Heart className="mr-1 h-3 w-3" />
                    Projetos Verificados
                  </>
                ) : (
                  <>
                    <Leaf className="mr-1 h-3 w-3" />
                    Projetos Certificados
                  </>
                )}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 uppercase text-balance">
                {"Projetos "}
                <span className="text-teal-400">{isSocial ? "Sociais" : "Ambientais"}</span>
              </h1>
              <p className="text-lg text-white/70">
                {isSocial
                  ? "Encontre projetos sociais verificados e faca sua doacao com total transparencia. Acompanhe o impacto de cada centavo doado na blockchain."
                  : "Projetos ambientais validados por Analistas Certificadores. Sem doacoes - empresas registram impacto ambiental para certificacao e emissao de NOBIS."}
              </p>
            </div>

            {/* Tab toggle */}
            <div className="mt-8 flex gap-2 max-w-md">
              <button
                onClick={() => handleTabChange("sociais")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-semibold text-sm uppercase tracking-wide transition-all ${
                  isSocial
                    ? "bg-teal-400 text-[#0a2f2f]"
                    : "bg-white/5 text-white/60 border border-teal-400/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Heart className="h-4 w-4" />
                Sociais
              </button>
              <button
                onClick={() => handleTabChange("ambientais")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-semibold text-sm uppercase tracking-wide transition-all ${
                  !isSocial
                    ? "bg-emerald-400 text-[#0a2f2f]"
                    : "bg-white/5 text-white/60 border border-teal-400/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Leaf className="h-4 w-4" />
                Ambientais
              </button>
            </div>

            {/* Stats */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3 max-w-2xl">
              {isSocial ? (
                <>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-teal-400/20 p-4 text-center">
                    <div className="text-3xl font-bold text-teal-400">
                      {socialProjects.filter((p: any) => p.status === FundingStatus.FUNDING || p.status === "FUNDING").length}
                    </div>
                    <div className="text-sm text-white/60 uppercase tracking-wide">Projetos Captando</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-teal-400/20 p-4 text-center">
                    <div className="text-3xl font-bold text-teal-400">
                      {socialProjects.reduce((acc: number, p: any) => acc + (p.donorsCount ?? p.donors_count ?? 0), 0).toLocaleString("pt-BR")}
                    </div>
                    <div className="text-sm text-white/60 uppercase tracking-wide">Doadores</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-teal-400/20 p-4 text-center">
                    <div className="text-3xl font-bold text-teal-400">
                      {socialProjects.filter((p: any) => p.status === FundingStatus.EXECUTING || p.status === "EXECUTING").length}
                    </div>
                    <div className="text-sm text-white/60 uppercase tracking-wide">Em Execucao</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-emerald-400/20 p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-400">
                      {envProjects.length}
                    </div>
                    <div className="text-sm text-white/60 uppercase tracking-wide">Projetos Ativos</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-emerald-400/20 p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-400">
                      {envProjects.filter((p: any) => p.status === "CERTIFIED" || p.status === "NOBIS_EMITTED").length}
                    </div>
                    <div className="text-sm text-white/60 uppercase tracking-wide">Certificados</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-emerald-400/20 p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-400">
                      {envProjects.filter((p: any) => p.status === "NOBIS_EMITTED").length}
                    </div>
                    <div className="text-sm text-white/60 uppercase tracking-wide">NOBIS Emitidos</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Info bar - explica o fluxo */}
        <section className={`py-4 ${isSocial ? "bg-rose-500/10 border-y border-rose-500/20" : "bg-emerald-500/10 border-y border-emerald-500/20"}`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 text-sm">
              {isSocial ? (
                <>
                  <Shield className="h-5 w-5 text-rose-400 shrink-0" />
                  <p className="text-white/80">
                    <strong className="text-rose-400">Fluxo Social:</strong>{" "}
                    {"Projetos recebem doacoes, executam acoes e passam pela checkagem VCA (Verificacao Comunitaria de Autenticidade) com Checkers."}
                  </p>
                </>
              ) : (
                <>
                  <Award className="h-5 w-5 text-emerald-400 shrink-0" />
                  <p className="text-white/80">
                    <strong className="text-emerald-400">Fluxo Ambiental:</strong>{" "}
                    {"Empresas registram impacto ambiental sem doacoes. Validacao exclusiva por Analistas Certificadores para emissao de creditos e NOBIS."}
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Filters + Grid */}
        <section className="bg-[#071f1f] py-8">
          <div className="container mx-auto px-4">
            {/* Filtros */}
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-teal-400/20 bg-white/5 backdrop-blur-sm p-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  placeholder={isSocial ? "Buscar projetos sociais..." : "Buscar projetos ambientais..."}
                  className="pl-9 bg-white/5 border-teal-400/20 text-white placeholder:text-white/40"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full sm:w-56 bg-white/5 border-teal-400/20 text-white">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="w-full sm:w-32 bg-white/5 border-teal-400/20 text-white">
                    <MapPin className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-44 bg-white/5 border-teal-400/20 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {isSocial ? (
                      <>
                        <SelectItem value="funding">Captando</SelectItem>
                        <SelectItem value="funded">Financiado</SelectItem>
                        <SelectItem value="executing">Em Execucao</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="executing">Em Execucao</SelectItem>
                        <SelectItem value="certified">Certificado</SelectItem>
                        <SelectItem value="nobis">NOBIS Emitido</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid de projetos SOCIAIS */}
            {isSocial && (
              <>
                {socialLoading && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                  </div>
                )}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredSocialProjects.map((project: any) => {
                    // Compatibilidade com API e mock data
                    const currentAmount = project.currentAmount ?? project.current_amount ?? 0
                    const goalAmount = project.costModel?.metaTotal ?? project.goal_amount ?? 0
                    const progressPercent = goalAmount > 0 ? Math.round((currentAmount / goalAmount) * 100) : 0
                    const status = project.status as FundingStatus
                    const statusConfig = FUNDING_STATUS_CONFIG[status] || { label: status, color: "bg-gray-500" }
                    const deadline = project.deadline ?? project.end_date
                    const daysLeft = deadline
                      ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                      : null
                    const locationName = project.location?.name ?? project.location_name ?? ""
                    const locationState = project.location?.state ?? project.location_state ?? ""
                    const donorsCount = project.donorsCount ?? project.donors_count ?? 0

                    return (
                      <Card
                        key={project.id}
                        className="overflow-hidden transition-all hover:shadow-lg border-teal-400/20 bg-white/5 backdrop-blur-sm hover:border-teal-400/40 hover:bg-white/10"
                      >
                        <div className="relative">
                          {(() => {
                            const cat = SOCIAL_CATEGORY_ICONS[project.category] || { icon: HandHeart, bg: "bg-teal-500/10", color: "text-teal-400" }
                            const IconComp = cat.icon
                            return (
                              <div className={`h-48 w-full flex items-center justify-center ${cat.bg}`}>
                                <IconComp className={`h-16 w-16 ${cat.color}`} />
                              </div>
                            )
                          })()}
                          <Badge className={`absolute right-2 top-2 ${statusConfig.color}`}>{statusConfig.label}</Badge>
                          {daysLeft !== null && (status === FundingStatus.FUNDING || status === ("FUNDING" as FundingStatus)) && (
                            <Badge variant="secondary" className="absolute left-2 top-2">
                              <Clock className="mr-1 h-3 w-3" />
                              {daysLeft} dias restantes
                            </Badge>
                          )}
                          <Badge className="absolute left-2 bottom-2 bg-rose-500/80 text-white border-0 text-xs">
                            <Heart className="mr-1 h-3 w-3" />
                            Social
                          </Badge>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="line-clamp-1 text-lg text-white">{project.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 text-white/50">
                            <MapPin className="h-3 w-3" />
                            {locationName}, {locationState}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="line-clamp-2 text-sm text-white/50">{project.description}</p>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/50">Arrecadado</span>
                              <span className="font-medium text-white">{progressPercent}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-2 bg-white/10 [&>div]:bg-teal-400" />
                            <div className="flex items-center justify-between text-xs text-white/40">
                              <span>R$ {currentAmount.toLocaleString("pt-BR")}</span>
                              <span>Meta: R$ {goalAmount.toLocaleString("pt-BR")}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-white/50">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {donorsCount} doadores
                            </span>
                            <Badge variant="outline" className="text-xs border-teal-400/30 text-teal-400">
                              {(project.category || "").split(" ")[0]}
                            </Badge>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-teal-400/10 pt-4">
                          <Button asChild className="w-full bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold">
                            <Link href={`/projetos/${project.id}`}>
                            {project.status === FundingStatus.FUNDING ? "Apoiar Projeto" : "Ver Detalhes"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
              </>
            )}

            {/* Grid de projetos AMBIENTAIS */}
            {!isSocial && (
              <>
                {envLoading && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  </div>
                )}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredEnvironmentalProjects.map((project: any) => {
                    // Compatibilidade com API e mock
                    const status = project.status
                    const statusLabel = status === "CERTIFIED" ? "Certificado" : status === "NOBIS_EMITTED" ? "NOBIS Emitido" : "Em Execucao"
                    const statusColor = status === "CERTIFIED" ? "bg-emerald-500/80 text-white" : status === "NOBIS_EMITTED" ? "bg-teal-500/80 text-white" : "bg-amber-500/80 text-white"
                    const locationName = project.location?.name ?? project.location_name ?? ""
                    const locationState = project.location?.state ?? project.location_state ?? ""
                    const sensors = project.sensors ?? project.sensor_count ?? 0
                    const tco2e = project.tco2eAvoided ?? project.tco2e_avoided ?? 0
                    const evidences = project.evidences ?? project.evidence_count ?? 0
                    const company = project.company ?? project.institution_name ?? ""
                    const tsbCategory = project.tsbCategory ?? project.tsb_category_id ?? ""

                    return (
                      <Card
                        key={project.id}
                        className="overflow-hidden transition-all hover:shadow-lg border-emerald-400/20 bg-white/5 backdrop-blur-sm hover:border-emerald-400/40 hover:bg-white/10"
                      >
                        <div className="relative">
                          <div className="h-48 w-full bg-gradient-to-br from-emerald-900/50 to-[#071f1f] flex items-center justify-center">
                            <TreePine className="h-16 w-16 text-emerald-400/30" />
                          </div>
                          <Badge className={`absolute right-2 top-2 ${statusColor}`}>{statusLabel}</Badge>
                          <Badge className="absolute left-2 bottom-2 bg-emerald-500/80 text-white border-0 text-xs">
                            <Leaf className="mr-1 h-3 w-3" />
                            Ambiental
                          </Badge>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="line-clamp-1 text-lg text-white">{project.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 text-white/50">
                            <MapPin className="h-3 w-3" />
                            {locationName}, {locationState}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="line-clamp-2 text-sm text-white/50">{project.description}</p>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Award className="h-4 w-4 text-emerald-400" />
                              <span className="text-white/60">
                                {project.certifiedBy ? `Cert. ${project.certifiedBy.split(" - ")[0]}` : "Validacao por Analistas Certificadores"}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="rounded-lg bg-white/5 p-2 text-center">
                                <p className="text-xs text-white/40">Sensores</p>
                                <p className="font-bold text-emerald-400 text-sm">{sensors}</p>
                              </div>
                              <div className="rounded-lg bg-white/5 p-2 text-center">
                                <p className="text-xs text-white/40">tCO2e</p>
                                <p className="font-bold text-emerald-400 text-sm">{tco2e}</p>
                              </div>
                              <div className="rounded-lg bg-white/5 p-2 text-center">
                                <p className="text-xs text-white/40">Evidencias</p>
                                <p className="font-bold text-emerald-400 text-sm">{evidences}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-white/50">
                            <span className="text-xs">{tsbCategory} - {project.category}</span>
                            <span className="text-xs text-white/40">{company}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-emerald-400/10 pt-4 flex flex-col gap-2">
                          <div className="w-full rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-center">
                            <p className="text-xs text-amber-400 font-medium">Este projeto nao recebe doacoes</p>
                          </div>
                          <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a2f2f] font-bold">
                            <Link href={`/projetos/ambientais/${project.id}`}>
                              Ver Detalhes
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}

            {/* Empty state */}
            {isSocial && filteredSocialProjects.length === 0 && (
              <div className="py-20 text-center">
                <Heart className="mx-auto mb-4 h-12 w-12 text-white/20" />
                <p className="text-lg font-medium text-white/40">Nenhum projeto social encontrado</p>
                <p className="text-sm text-white/30">Tente ajustar os filtros para ver mais resultados</p>
              </div>
            )}
            {!isSocial && filteredEnvironmentalProjects.length === 0 && (
              <div className="py-20 text-center">
                <TreePine className="mx-auto mb-4 h-12 w-12 text-white/20" />
                <p className="text-lg font-medium text-white/40">Nenhum projeto ambiental encontrado</p>
                <p className="text-sm text-white/30">Tente ajustar os filtros para ver mais resultados</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

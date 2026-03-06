"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  MapPin,
  Leaf,
  Bitcoin,
  CheckCircle2,
  Shield,
  Trophy,
  TrendingUp,
  UtensilsCrossed,
  GraduationCap,
  Home,
  Briefcase,
  Stethoscope,
  HandHeart,
  TreePine,
  Zap,
  Recycle,
  Droplets,
  Building2,
  Heart,
  Clock,
  ExternalLink,
  FileCheck,
  Users,
  ShieldCheck,
  Play,
  HandCoins,
  ChevronRight,
  Eye,
  ArrowRight,
  Loader2,
  Landmark,
  Factory,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Prefeituras cadastradas
const PREFEITURAS = [
  { id: "joinville", name: "Prefeitura de Joinville", state: "SC", municipality: "Joinville" }
]

// Projetos da Prefeitura de Joinville
const JOINVILLE_PROJECTS = [
  {
    id: "joinville-saf",
    title: "Servico de Acolhimento Familiar - Familias Acolhedoras",
    code: "SAS.UPE.SAF",
    type: "SOCIAL",
    status: "VERIFICADO",
    description: "Programa que oferece acolhimento temporario em ambiente familiar para criancas e adolescentes afastados de suas familias de origem, proporcionando cuidado individualizado.",
    category: "Assistencia Social",
    location: { name: "Joinville", state: "SC" },
    organization: { name: "Prefeitura de Joinville", type: "GOV" },
    prefeituraId: "joinville",
    metrics: {
      totalInvested: 850000,
      beneficiaries: 127,
      impactScore: 92,
    },
    validation: {
      checkersCount: 5,
      certifiersCount: 2,
      approvalRate: 98,
    },
    timeline: [
      { id: "1", phase: "CAPTACAO", title: "Projeto Inscrito", description: "Projeto cadastrado na plataforma Gov", timestamp: "2024-01-15T10:00:00Z" },
      { id: "2", phase: "EXECUCAO", title: "Em Execucao", description: "Familias acolhedoras ativas no programa", timestamp: "2024-02-01T10:00:00Z" },
      { id: "3", phase: "CHECAGEM", title: "Validacao VCA", description: "Checkers validaram as evidencias", timestamp: "2024-06-15T10:00:00Z" },
      { id: "4", phase: "CERTIFICACAO", title: "Certificado", description: "Certificadora validou o impacto", timestamp: "2024-07-01T10:00:00Z" },
    ],
    updatedAt: "2024-07-01T10:00:00Z",
  },
  {
    id: "joinville-cavr",
    title: "Casa Abrigo Viva Rosa",
    code: "SAS.UPE.CAVR",
    type: "SOCIAL",
    status: "VERIFICADO",
    description: "Unidade de acolhimento institucional que oferece protecao integral a mulheres em situacao de violencia domestica e seus filhos, garantindo sigilo e seguranca.",
    category: "Assistencia Social",
    location: { name: "Joinville", state: "SC" },
    organization: { name: "Prefeitura de Joinville", type: "GOV" },
    prefeituraId: "joinville",
    metrics: {
      totalInvested: 1200000,
      beneficiaries: 89,
      impactScore: 95,
    },
    validation: {
      checkersCount: 6,
      certifiersCount: 2,
      approvalRate: 100,
    },
    timeline: [
      { id: "1", phase: "CAPTACAO", title: "Projeto Inscrito", description: "Projeto cadastrado na plataforma Gov", timestamp: "2024-01-20T10:00:00Z" },
      { id: "2", phase: "EXECUCAO", title: "Em Execucao", description: "Casa Abrigo em operacao continua", timestamp: "2024-02-15T10:00:00Z" },
      { id: "3", phase: "CHECAGEM", title: "Validacao VCA", description: "Checkers validaram as evidencias", timestamp: "2024-05-20T10:00:00Z" },
      { id: "4", phase: "CERTIFICACAO", title: "Certificado", description: "Certificadora validou o impacto", timestamp: "2024-06-10T10:00:00Z" },
    ],
    updatedAt: "2024-06-10T10:00:00Z",
  },
  {
    id: "joinville-ure",
    title: "Unidade de Recuperacao Energetica (URE)",
    code: "SEMA.URE",
    type: "AMBIENTAL",
    status: "VERIFICADO",
    description: "Usina que transforma residuos solidos urbanos em energia eletrica, reduzindo o volume de aterro sanitario e gerando energia limpa para a cidade.",
    category: "Energia Renovavel",
    location: { name: "Joinville", state: "SC" },
    organization: { name: "Prefeitura de Joinville", type: "GOV" },
    prefeituraId: "joinville",
    metrics: {
      totalInvested: 45000000,
      carbonCredits: 12500,
      energyGenerated: 28000,
      impactScore: 98,
    },
    validation: {
      certifiersCount: 3,
      approvalRate: 100,
    },
    timeline: [
      { id: "1", phase: "CAPTACAO", title: "Projeto Inscrito", description: "Projeto cadastrado na plataforma Gov", timestamp: "2023-06-01T10:00:00Z" },
      { id: "2", phase: "EXECUCAO", title: "Em Operacao", description: "URE em operacao gerando energia", timestamp: "2023-12-01T10:00:00Z" },
      { id: "3", phase: "CERTIFICACAO", title: "Certificado", description: "Certificadora ambiental validou creditos de carbono", timestamp: "2024-03-15T10:00:00Z" },
      { id: "4", phase: "INSCRICAO", title: "Registrado Blockchain", description: "Creditos registrados na Polygon", timestamp: "2024-04-01T10:00:00Z" },
    ],
    inscription: {
      inscriptionId: "polygon-0x7f3a9c8b2d...",
      blockHeight: 54892341,
      inscribedAt: "2024-04-01T10:00:00Z",
    },
    updatedAt: "2024-04-01T10:00:00Z",
  },
]
import { type ImpactRecord, type TimelineEvent, PHASE_CONFIG } from "@/lib/types/impact-registry"

const PHASE_ICONS: Record<string, React.ReactNode> = {
  CAPTACAO: <Heart className="h-4 w-4" />,
  DOACAO: <HandCoins className="h-4 w-4" />,
  EXECUCAO: <Play className="h-4 w-4" />,
  CHECAGEM: <Users className="h-4 w-4" />,
  CERTIFICACAO: <ShieldCheck className="h-4 w-4" />,
  INSCRICAO: <Bitcoin className="h-4 w-4" />,
  CONCLUIDO: <Trophy className="h-4 w-4" />,
}

function TimelineView({ timeline, type }: { timeline?: TimelineEvent[]; type: "SOCIAL" | "AMBIENTAL" }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum evento na trilha de impacto</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {timeline.map((event, index) => {
        const config = PHASE_CONFIG[event.phase]
        const isLast = index === timeline.length - 1

        return (
          <div key={event.id} className="relative flex gap-4">
            {!isLast && <div className="absolute left-[19px] top-10 h-full w-0.5 bg-border" />}

            <div
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                event.phase === "CONCLUIDO"
                  ? "border-amber-500 bg-amber-500/10 text-amber-600"
                  : event.phase === "INSCRICAO"
                    ? "border-orange-500 bg-orange-500/10 text-orange-600"
                    : "border-teal-400 bg-teal-400/10 text-teal-500"
              }`}
            >
              {PHASE_ICONS[event.phase]}
            </div>

            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="font-medium text-sm">{event.title}</p>
              <p className="text-sm text-muted-foreground">{event.description}</p>

              {event.data && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(event.data).map(([key, value]) => (
                    <span key={key} className="text-xs bg-muted px-2 py-1 rounded">
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}

              {event.hash && (
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground font-mono">
                  <FileCheck className="h-3 w-3" />
                  {event.hash.substring(0, 30)}...
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const IMPACT_ICONS: Record<string, { icon: typeof Heart; bg: string; color: string }> = {
  "Alimentacao e Seguranca Alimentar": { icon: UtensilsCrossed, bg: "from-amber-900/60 to-amber-950/80", color: "text-amber-400" },
  "Educacao": { icon: GraduationCap, bg: "from-blue-900/60 to-blue-950/80", color: "text-blue-400" },
  "Assistencia Social": { icon: Home, bg: "from-rose-900/60 to-rose-950/80", color: "text-rose-400" },
  "Capacitacao": { icon: Briefcase, bg: "from-purple-900/60 to-purple-950/80", color: "text-purple-400" },
  "Saude": { icon: Stethoscope, bg: "from-emerald-900/60 to-emerald-950/80", color: "text-emerald-400" },
  "Energia Renovavel": { icon: Zap, bg: "from-emerald-900/60 to-emerald-950/80", color: "text-emerald-400" },
  "Economia Circular": { icon: Recycle, bg: "from-teal-900/60 to-teal-950/80", color: "text-teal-400" },
  "Reflorestamento": { icon: TreePine, bg: "from-green-900/60 to-green-950/80", color: "text-green-400" },
  "Uso Sustentavel de Recursos Hidricos": { icon: Droplets, bg: "from-cyan-900/60 to-cyan-950/80", color: "text-cyan-400" },
}

function ImpactCard({ record }: { record: ImpactRecord }) {
  const isSocial = record.type === "SOCIAL"
  const fallback = isSocial
    ? { icon: HandHeart, bg: "from-rose-900/60 to-rose-950/80", color: "text-rose-400" }
    : { icon: Leaf, bg: "from-emerald-900/60 to-emerald-950/80", color: "text-emerald-400" }
  const catIcon = IMPACT_ICONS[record.category] || fallback
  const CatIconComp = catIcon.icon

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg border-teal-200 bg-white shadow-sm hover:border-teal-400 h-full">
      {/* Icone com badges */}
      <div className="relative h-40 shrink-0">
        <div className={`h-full w-full flex items-center justify-center bg-gradient-to-br ${catIcon.bg}`}>
          <CatIconComp className={`h-16 w-16 ${catIcon.color} opacity-80`} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <Badge className={`${isSocial ? "bg-rose-500" : "bg-emerald-500"} text-white border-0`}>
            {isSocial ? <Heart className="mr-1 h-3 w-3" /> : <Leaf className="mr-1 h-3 w-3" />}
            {isSocial ? "Social" : "Ambiental"}
          </Badge>

          {record.status === "INSCRITO" && record.inscription && (
            <Badge className="bg-amber-500 text-white border-0">
              <Bitcoin className="mr-1 h-3 w-3" />
              Inscrito
            </Badge>
          )}
          {record.status === "EM_ANDAMENTO" && (
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              Em andamento
            </Badge>
          )}
        </div>

        {/* Titulo sobre a imagem */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-lg line-clamp-1 drop-shadow-md">{record.title}</h3>
          <p className="text-white/80 text-xs flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {record.location.name}, {record.location.state}
          </p>
        </div>
      </div>

      {/* Conteudo */}
      <CardContent className="flex-1 p-4 space-y-4 bg-white">
        {/* Categoria */}
        <Badge variant="outline" className="text-xs border-teal-300 text-teal-700">
          {record.category}
        </Badge>

        {/* Descricao */}
        <p className="text-sm text-gray-600 line-clamp-2">{record.description}</p>

        {/* Metricas em grid organizado */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-teal-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Custo de geracao</p>
            <p className="font-bold text-sm text-teal-700">R$ {(record.metrics?.totalInvested ?? 0).toLocaleString("pt-BR")}</p>
          </div>
          <div className="bg-teal-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{isSocial ? "Beneficiarios" : "Creditos CO2"}</p>
            <p className="font-bold text-sm text-teal-700">
              {isSocial
                ? (record.metrics?.beneficiaries ?? 0).toLocaleString("pt-BR")
                : `${record.metrics?.carbonCredits ?? 0} tCO2`}
            </p>
          </div>
        </div>

        {/* Validacao */}
        {record.validation && (
          <div className="flex items-center gap-3 text-xs text-gray-500 border-t border-teal-100 pt-3">
            {isSocial && record.validation.checkersCount && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-teal-600" />
                <span>{record.validation.checkersCount} checkers</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-teal-600" />
              <span>{record.validation.certifiersCount} certificadores</span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer fixo no final */}
      <CardFooter className="p-4 pt-0 mt-auto bg-white">
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 shrink-0">
              <Building2 className="h-3 w-3 text-teal-600" />
            </div>
            <span className="text-xs text-gray-600 truncate">{record.organization.name}</span>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-teal-300 hover:bg-teal-50 hover:border-teal-500 text-teal-700 bg-white"
              >
                <Eye className="mr-1 h-3 w-3" />
                Ver Trilha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {isSocial ? (
                    <Heart className="h-5 w-5 text-rose-500" />
                  ) : (
                    <Leaf className="h-5 w-5 text-emerald-500" />
                  )}
                  {record.title}
                </DialogTitle>
                <DialogDescription>Trilha completa do impacto - {record.organization.name}</DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                <TimelineView timeline={record.timeline} type={record.type} />
              </div>

              {record.inscription && (
                <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bitcoin className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">Inscrito no Bitcoin</span>
                  </div>
                  <div className="space-y-1 text-xs font-mono text-muted-foreground">
                    <p>Inscription ID: {record.inscription.inscriptionId}</p>
                    <p>Block: {record.inscription.blockHeight}</p>
                    <p>Data: {new Date(record.inscription.inscribedAt).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              )}

              {record.availableForTrading && record.tradingPlatformUrl && (
                <div className="mt-4 flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-sm">Disponível para negociação</p>
                    <p className="text-xs text-muted-foreground">
                      Este impacto pode ser negociado na plataforma externa
                    </p>
                  </div>
                  <Button size="sm" className="bg-teal-500 hover:bg-teal-400 text-[#0a2f2f]" asChild>
                    <a href={record.tradingPlatformUrl} target="_blank" rel="noopener noreferrer">
                      Negociar
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  )
}

export function HallDeImpactoContent() {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"TODOS" | "INSCRITO" | "EM_ANDAMENTO">("TODOS")
  const [sortBy, setSortBy] = useState("recent")
  const [activeTab, setActiveTab] = useState("social")
  const [selectedPrefeitura, setSelectedPrefeitura] = useState<string | null>(null)

  // Buscar registros da API (dados reais do banco)
  const { data, isLoading } = useSWR("/api/impact-records?limit=50", fetcher, {
    revalidateOnFocus: false,
  })

  // Usar dados reais da API + projetos de prefeituras
  const impactRecords = data?.records || []
  
  // Separar por tipo
  const socialRecords = impactRecords.filter((r: any) => r.type === "SOCIAL")
  const ambientalRecords = impactRecords.filter((r: any) => r.type === "AMBIENTAL")
  
  // Projetos de Joinville (separados do hall geral)
  const joinvilleSocialProjects = JOINVILLE_PROJECTS.filter(p => p.type === "SOCIAL")
  const joinvilleAmbientalProjects = JOINVILLE_PROJECTS.filter(p => p.type === "AMBIENTAL")

  const filterRecords = (records: any[]) => {
    return records.filter((record: any) => {
      const matchesSearch =
        record.title.toLowerCase().includes(search.toLowerCase()) ||
        (record.organization?.name || record.organization_name || "").toLowerCase().includes(search.toLowerCase())
      const matchesStatus = filterStatus === "TODOS" || record.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }
  
  const filteredSocialRecords = filterRecords(socialRecords)
  const filteredAmbientalRecords = filterRecords(ambientalRecords)

  const sortRecords = (records: any[]) => {
    return [...records].sort((a, b) => {
      switch (sortBy) {
        case "cost-asc":
          return (a.metrics?.totalInvested || 0) - (b.metrics?.totalInvested || 0)
        case "cost-desc":
          return (b.metrics?.totalInvested || 0) - (a.metrics?.totalInvested || 0)
        case "score":
          return (b.metrics?.impactScore || 0) - (a.metrics?.impactScore || 0)
        default:
          return new Date(b.updatedAt || b.updated_at).getTime() - new Date(a.updatedAt || a.updated_at).getTime()
      }
    })
  }
  
  const sortedSocialRecords = sortRecords(filteredSocialRecords)
  const sortedAmbientalRecords = sortRecords(filteredAmbientalRecords)

  // Estatisticas gerais (incluindo prefeituras)
  const allRecords = [...impactRecords, ...JOINVILLE_PROJECTS]
  const totalInvested = allRecords.reduce((sum: number, r: any) => sum + (r.metrics?.totalInvested || 0), 0)
  const totalBeneficiaries = allRecords
    .filter((r: any) => r.type === "SOCIAL")
    .reduce((sum: number, r: any) => sum + (r.metrics?.beneficiaries || 0), 0)
  const totalCarbon = allRecords
    .filter((r: any) => r.type === "AMBIENTAL")
    .reduce((sum: number, r: any) => sum + (r.metrics?.carbonCredits || 0), 0)
  const inscribedCount = allRecords.filter((r: any) => r.status === "INSCRITO" || r.inscription).length

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-[#0a2f2f] to-[#f0fdf4] py-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl" />

          <div className="container relative mx-auto px-4">
            <div className="max-w-3xl mb-8">
              <Badge className="mb-4 bg-teal-500/20 text-teal-700 border-teal-500/30">
                <Trophy className="mr-1 h-3 w-3" />
                Registro Imutavel
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0a2f2f] mb-4 uppercase">
                Hall de <span className="text-teal-600">Impacto</span>
              </h1>
              <p className="text-lg text-[#0a2f2f]/70">
                Registro publico de todos os impactos sociais e ambientais validados pela STHATION. Cada registro contem
                a trilha completa: da captacao ate a inscricao no Bitcoin.
              </p>
            </div>

            {/* Estatisticas */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 max-w-4xl">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200 p-4 text-center shadow-sm">
                <TrendingUp className="h-5 w-5 text-teal-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-teal-700">R$ {(totalInvested / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-gray-600">Total Investido</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200 p-4 text-center shadow-sm">
                <Heart className="h-5 w-5 text-rose-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-teal-700">{totalBeneficiaries.toLocaleString("pt-BR")}</div>
                <div className="text-sm text-gray-600">Beneficiarios</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200 p-4 text-center shadow-sm">
                <Leaf className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-teal-700">{totalCarbon} tCO2</div>
                <div className="text-sm text-gray-600">Creditos CO2</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-teal-200 p-4 text-center shadow-sm">
                <Bitcoin className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-teal-700">
                  {inscribedCount}/{impactRecords.length}
                </div>
                <div className="text-sm text-gray-600">Inscritos</div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f0fdf4] py-8">
          <div className="container mx-auto px-4">
            {/* Abas principais */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-white border border-teal-200 mb-6 h-auto p-1 flex-wrap shadow-sm">
                <TabsTrigger 
                  value="social" 
                  className="data-[state=active]:bg-rose-500 data-[state=active]:text-white text-gray-700 flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Impacto Social
                </TabsTrigger>
                <TabsTrigger 
                  value="ambiental" 
                  className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-gray-700 flex items-center gap-2"
                >
                  <Leaf className="h-4 w-4" />
                  Impacto Ambiental
                </TabsTrigger>
                <TabsTrigger 
                  value="prefeituras" 
                  className="data-[state=active]:bg-teal-600 data-[state=active]:text-white text-gray-700 flex items-center gap-2"
                >
                  <Landmark className="h-4 w-4" />
                  Prefeituras
                </TabsTrigger>
              </TabsList>

              {/* Filtros e ordenacao */}
              {activeTab !== "prefeituras" && (
                <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-teal-200 bg-white shadow-sm p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Buscar projeto ou organizacao..."
                        className="pl-9 bg-gray-50 border-teal-200 text-gray-900 placeholder:text-gray-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                      <SelectTrigger className="w-full sm:w-36 bg-gray-50 border-teal-200 text-gray-900">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODOS">Todos</SelectItem>
                        <SelectItem value="INSCRITO">Inscritos</SelectItem>
                        <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-44 bg-gray-50 border-teal-200 text-gray-900">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Mais recentes</SelectItem>
                      <SelectItem value="cost-asc">Menor custo</SelectItem>
                      <SelectItem value="cost-desc">Maior custo</SelectItem>
                      <SelectItem value="score">Maior pontuacao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Tab Impacto Social */}
              <TabsContent value="social" className="mt-0">
                <Card className="border-rose-200 bg-rose-50 mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="h-5 w-5 text-rose-500" />
                      <h3 className="font-semibold text-gray-900">Fluxo de Impacto Social</h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 flex-wrap mb-2">
                      <Badge variant="outline" className="text-xs border-rose-300 text-rose-700">Captacao</Badge>
                      <ChevronRight className="h-3 w-3" />
                      <Badge variant="outline" className="text-xs border-rose-300 text-rose-700">Doacoes</Badge>
                      <ChevronRight className="h-3 w-3" />
                      <Badge variant="outline" className="text-xs border-rose-300 text-rose-700">Execucao</Badge>
                      <ChevronRight className="h-3 w-3" />
                      <Badge variant="outline" className="text-xs border-rose-300 text-rose-700">Checkers</Badge>
                      <ChevronRight className="h-3 w-3" />
                      <Badge variant="outline" className="text-xs border-rose-300 text-rose-700">Certificadores</Badge>
                      <ChevronRight className="h-3 w-3" />
                      <Badge className="text-xs bg-amber-500 text-white">Inscription</Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      Instituicoes criam cards de captacao, recebem doacoes, executam e passam por validacao.
                    </p>
                  </CardContent>
                </Card>

                {isLoading && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {sortedSocialRecords.map((record: any) => (
                    <ImpactCard key={record.id} record={record} />
                  ))}
                </div>

                {!isLoading && sortedSocialRecords.length === 0 && (
                  <div className="py-20 text-center">
                    <Heart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">Nenhum impacto social encontrado</p>
                    <p className="text-sm text-gray-400">Projetos sociais validados aparecerao aqui</p>
                  </div>
                )}
              </TabsContent>

              {/* Tab Impacto Ambiental */}
              <TabsContent value="ambiental" className="mt-0">
                <Card className="border-emerald-200 bg-emerald-50 mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Leaf className="h-5 w-5 text-emerald-500" />
                      <h3 className="font-semibold text-gray-900">Fluxo de Impacto Ambiental</h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 flex-wrap mb-2">
                      <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700">Registro</Badge>
                      <ChevronRight className="h-3 w-3" />
                      <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700">Certificadores</Badge>
                      <ChevronRight className="h-3 w-3" />
                      <Badge className="text-xs bg-amber-500 text-white">Inscription</Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      Empresas registram dados de impacto ambiental, certificam e registram no Bitcoin.
                    </p>
                  </CardContent>
                </Card>

                {isLoading && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {sortedAmbientalRecords.map((record: any) => (
                    <ImpactCard key={record.id} record={record} />
                  ))}
                </div>

                {!isLoading && sortedAmbientalRecords.length === 0 && (
                  <div className="py-20 text-center">
                    <Leaf className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">Nenhum impacto ambiental encontrado</p>
                    <p className="text-sm text-gray-400">Projetos ambientais validados aparecerao aqui</p>
                  </div>
                )}
              </TabsContent>

              {/* Tab Prefeituras */}
              <TabsContent value="prefeituras" className="mt-0">
                {!selectedPrefeitura ? (
                  <>
                    <Card className="border-teal-200 bg-teal-50 mb-6">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Landmark className="h-5 w-5 text-teal-600" />
                          <h3 className="font-semibold text-gray-900">Impactos de Gestao Publica</h3>
                        </div>
                        <p className="text-xs text-gray-600">
                          Prefeituras inscritas no Sthation Gov podem publicar seus projetos sociais e ambientais com total transparencia.
                          Os recursos sao proprios da prefeitura, demonstrando o impacto gerado com verba publica.
                        </p>
                      </CardContent>
                    </Card>

                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecione uma Prefeitura</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {PREFEITURAS.map((pref) => {
                        const prefProjects = JOINVILLE_PROJECTS.filter(p => p.prefeituraId === pref.id)
                        const totalInvPref = prefProjects.reduce((s, p) => s + (p.metrics?.totalInvested || 0), 0)
                        const totalBenPref = prefProjects.filter(p => p.type === "SOCIAL").reduce((s, p) => s + (p.metrics?.beneficiaries || 0), 0)
                        
                        return (
                          <Card 
                            key={pref.id}
                            className="border-teal-200 bg-white hover:bg-teal-50 hover:border-teal-400 cursor-pointer transition-all shadow-sm"
                            onClick={() => setSelectedPrefeitura(pref.id)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="rounded-full bg-teal-100 p-3">
                                  <Landmark className="h-6 w-6 text-teal-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{pref.name}</h4>
                                  <p className="text-xs text-gray-500">{pref.municipality}, {pref.state}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-teal-50 rounded-lg p-2">
                                  <p className="text-lg font-bold text-teal-700">{prefProjects.length}</p>
                                  <p className="text-xs text-gray-500">Projetos</p>
                                </div>
                                <div className="bg-teal-50 rounded-lg p-2">
                                  <p className="text-lg font-bold text-teal-700">{totalBenPref}</p>
                                  <p className="text-xs text-gray-500">Beneficiados</p>
                                </div>
                                <div className="bg-teal-50 rounded-lg p-2">
                                  <p className="text-lg font-bold text-teal-700">R$ {(totalInvPref/1000000).toFixed(1)}M</p>
                                  <p className="text-xs text-gray-500">Investido</p>
                                </div>
                              </div>
                              <Button variant="outline" className="w-full mt-4 text-teal-700 border-teal-300 hover:bg-teal-100">
                                Ver Projetos
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Hall da Prefeitura selecionada */}
                    {(() => {
                      const pref = PREFEITURAS.find(p => p.id === selectedPrefeitura)
                      const prefProjects = JOINVILLE_PROJECTS.filter(p => p.prefeituraId === selectedPrefeitura)
                      const socialProjects = prefProjects.filter(p => p.type === "SOCIAL")
                      const ambientalProjects = prefProjects.filter(p => p.type === "AMBIENTAL")
                      const totalInvPref = prefProjects.reduce((s, p) => s + (p.metrics?.totalInvested || 0), 0)
                      const totalBenPref = socialProjects.reduce((s, p) => s + (p.metrics?.beneficiaries || 0), 0)
                      const totalCarbonPref = ambientalProjects.reduce((s, p) => s + (p.metrics?.carbonCredits || 0), 0)
                      
                      return (
                        <>
                          <Button 
                            variant="ghost" 
                            className="mb-4 text-gray-600 hover:text-gray-900"
                            onClick={() => setSelectedPrefeitura(null)}
                          >
                            <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
                            Voltar para lista de prefeituras
                          </Button>
                          
                          <Card className="border-teal-300 bg-gradient-to-r from-teal-50 to-cyan-50 mb-6 shadow-sm">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="rounded-full bg-teal-100 p-4">
                                    <Landmark className="h-8 w-8 text-teal-600" />
                                  </div>
                                  <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{pref?.name}</h2>
                                    <p className="text-gray-600">{pref?.municipality}, {pref?.state}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4 text-center">
                                  <div>
                                    <p className="text-2xl font-bold text-teal-700">{prefProjects.length}</p>
                                    <p className="text-xs text-gray-500">Projetos</p>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold text-teal-700">{totalBenPref}</p>
                                    <p className="text-xs text-gray-500">Beneficiados</p>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold text-teal-700">{totalCarbonPref} tCO2</p>
                                    <p className="text-xs text-gray-500">Creditos</p>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold text-teal-700">R$ {(totalInvPref/1000000).toFixed(1)}M</p>
                                    <p className="text-xs text-gray-500">Investido</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Projetos Sociais */}
                          {socialProjects.length > 0 && (
                            <>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Heart className="h-5 w-5 text-rose-500" />
                                Projetos Sociais ({socialProjects.length})
                              </h3>
                              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 mb-8">
                                {socialProjects.map((project) => (
                                  <ImpactCard key={project.id} record={project as any} />
                                ))}
                              </div>
                            </>
                          )}

                          {/* Projetos Ambientais */}
                          {ambientalProjects.length > 0 && (
                            <>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Leaf className="h-5 w-5 text-emerald-500" />
                                Projetos Ambientais ({ambientalProjects.length})
                              </h3>
                              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {ambientalProjects.map((project) => (
                                  <ImpactCard key={project.id} record={project as any} />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      )
                    })()}
                  </>
                )}
              </TabsContent>
            </Tabs>

            {/* Info sobre negociacao */}
            <div className="mt-12 rounded-xl border border-teal-200 bg-white shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-teal-100 p-3 shrink-0">
                  <ExternalLink className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">Negociacao de Impactos</h3>
                  <p className="text-gray-600 text-sm">
                    A STHATION e uma plataforma de <strong>registro e validacao</strong> de impactos. A negociacao dos
                    impactos sociais e ambientais acontece em plataformas parceiras especializadas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-teal-400 py-4">
          <div className="container mx-auto px-4">
            <p className="text-center text-[#0a2f2f] font-bold uppercase tracking-wider">
              Transparência Total. Impacto Real. Blockchain.
            </p>
          </div>
        </section>

        <section className="relative bg-[#0a2f2f] py-16 overflow-hidden">
          <div className="absolute inset-0 mesh-pattern-dark" />
          <div className="container relative mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Faça Parte do <span className="text-teal-400">Impacto Imutável</span>
            </h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Sua doação é 100% rastreável e validada pela comunidade. Cada ação é registrada permanentemente na
              blockchain.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold rounded-full glow-teal"
            >
              <Link href="/projetos">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

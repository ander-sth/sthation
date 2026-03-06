"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Search,
  Eye,
  Send,
  MoreHorizontal,
  MapPin,
  FileCheck,
  Leaf,
  Cpu,
  BarChart3,
  Factory,
  Zap,
  Droplets,
  Recycle,
  TreePine,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Categorias ambientais
const ENVIRONMENTAL_CATEGORIES = [
  { code: "COMPOSTAGEM", name: "Compostagem e Residuos Organicos", icon: Recycle },
  { code: "ENERGIA", name: "Energia Renovavel", icon: Zap },
  { code: "RECICLAGEM", name: "Reciclagem Industrial", icon: Factory },
  { code: "REFLORESTAMENTO", name: "Reflorestamento e Restauracao", icon: TreePine },
  { code: "HIDRICOS", name: "Recursos Hidricos", icon: Droplets },
  { code: "BIODIGESTAO", name: "Biodigestao e Bioenergia", icon: Leaf },
]

// Status dos projetos ambientais
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Rascunho", color: "bg-gray-500/10 text-gray-600" },
  COLLECTING: { label: "Coletando Dados IoT", color: "bg-blue-500/10 text-blue-600" },
  SUBMITTED: { label: "Aguardando Certificacao", color: "bg-amber-500/10 text-amber-600" },
  VALIDATED: { label: "Validado", color: "bg-emerald-500/10 text-emerald-600" },
  CERTIFIED: { label: "Certificado", color: "bg-emerald-500/10 text-emerald-600" },
  REJECTED: { label: "Rejeitado", color: "bg-red-500/10 text-red-600" },
  INSCRIBED: { label: "Inscrito na Blockchain", color: "bg-[#0a2f2f]/10 text-[#0a2f2f]" },
  MINTED: { label: "Mintado", color: "bg-[#0a2f2f]/10 text-[#0a2f2f]" },
}

export default function EnvironmentalProjectsPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Buscar projetos ambientais da API (dados reais do banco) - filtrados pelo owner_id do usuario
  const { data, isLoading } = useSWR(
    user?.id ? `/api/iac?type=AMBIENTAL&owner_id=${user.id}&limit=50` : null, 
    fetcher, 
    { revalidateOnFocus: false }
  )

  const environmentalProjects = (data?.projects || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category?.toUpperCase().replace(/ /g, "_") || "OUTROS",
    status: p.status,
    location: `${p.location_name || p.locationName || ""}, ${p.location_state || p.locationState || ""}`,
    partner: p.institution?.name || p.institution_name || "",
    createdAt: p.created_at || p.createdAt,
    iotSensors: p.iot_sensors || 0,
    dataPoints: p.data_points || 0,
    lastReading: p.last_reading || null,
    metrics: {
      inputKg: p.metrics?.inputKg || 0,
      outputKg: p.metrics?.outputKg || 0,
      co2eAvoided: p.metrics?.co2eAvoided || p.vca_score || 0,
      cyclesCompleted: p.metrics?.cyclesCompleted || 0,
    },
    evidences: p.evidences || 0,
    collectionProgress: p.collection_progress || 0,
  }))

  const filtered = environmentalProjects.filter((p: any) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || p.status === statusFilter
    const matchCategory = categoryFilter === "all" || p.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  const stats = {
    total: environmentalProjects.length,
    collecting: environmentalProjects.filter((p: any) => p.status === "COLLECTING").length,
    awaitingCert: environmentalProjects.filter((p: any) => p.status === "SUBMITTED").length,
    certified: environmentalProjects.filter(
      (p: any) => p.status === "CERTIFIED" || p.status === "INSCRIBED" || p.status === "VALIDATED"
    ).length,
    totalCo2e: environmentalProjects.reduce((sum: number, p: any) => sum + (p.metrics?.co2eAvoided || 0), 0),
    totalSensors: environmentalProjects.reduce((sum: number, p: any) => sum + (p.iotSensors || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Projetos Ambientais</h1>
          <p className="text-foreground/60">
            Registre dados IoT dos seus projetos ambientais. A certificacao e feita por Analistas Certificadores (sem VCA).
          </p>
        </div>
        <Button asChild className="bg-[#0a2f2f] hover:bg-[#0a2f2f]/90 text-white">
          <Link href="/dashboard/environmental/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              Coletando Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.collecting}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-600" />
              Aguardando Cert.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.awaitingCert}</div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              tCO2e Evitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.totalCo2e.toLocaleString("pt-BR")}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a2f2f]/5 border-[#0a2f2f]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#0a2f2f] flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Sensores IoT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0a2f2f]">{stats.totalSensors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Info banner */}
      <Card className="border-[#0a2f2f]/20 bg-[#0a2f2f]/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-[#0a2f2f]" />
          <div className="text-sm text-foreground/70">
            <p className="font-medium text-foreground">Fluxo Ambiental: sem doacoes, sem VCA</p>
            <p>
              Projetos ambientais registram dados via sensores IoT (Arduino, balancas, medidores). 
              Quando a coleta esta completa, submeta para certificacao por um Analista Certificador. 
              Apos certificacao, o impacto e inscrito na blockchain.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters + List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
              <Input
                placeholder="Buscar projetos ambientais..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {ENVIRONMENTAL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.code} value={cat.code}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((project) => {
              const statusCfg = STATUS_CONFIG[project.status]
              const category = ENVIRONMENTAL_CATEGORIES.find((c) => c.code === project.category)
              const CategoryIcon = category?.icon || Leaf
              const canSubmit = project.status === "COLLECTING" && project.collectionProgress >= 70

              return (
                <div
                  key={project.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 hover:border-[#0a2f2f]/30 transition-colors"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      {/* Title + status */}
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <CategoryIcon className="h-5 w-5 text-[#0a2f2f]" />
                        <h3 className="font-semibold">{project.title}</h3>
                        <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                      </div>

                      <p className="mb-3 text-sm text-foreground/60 line-clamp-2">{project.description}</p>

                      {/* IoT data progress */}
                      {project.status === "COLLECTING" && (
                        <div className="mb-3 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground/60">Coleta de dados IoT</span>
                            <span className="font-medium">{project.collectionProgress}%</span>
                          </div>
                          <Progress value={project.collectionProgress} className="h-2" />
                        </div>
                      )}

                      {/* Metrics row */}
                      <div className="mb-3 flex flex-wrap gap-3">
                        {project.metrics.co2eAvoided > 0 && (
                          <div className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600">
                            {project.metrics.co2eAvoided} tCO2e evitados
                          </div>
                        )}
                        {project.metrics.inputKg > 0 && (
                          <div className="rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600">
                            {project.metrics.inputKg.toLocaleString("pt-BR")} kg entrada
                          </div>
                        )}
                        {(project.metrics as Record<string, number>).kwhGenerated > 0 && (
                          <div className="rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600">
                            {((project.metrics as Record<string, number>).kwhGenerated || 0).toLocaleString("pt-BR")} kWh gerados
                          </div>
                        )}
                        {(project.metrics as Record<string, number>).biogasM3 > 0 && (
                          <div className="rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-600">
                            {((project.metrics as Record<string, number>).biogasM3 || 0).toLocaleString("pt-BR")} m3 biogas
                          </div>
                        )}
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap gap-4 text-xs text-foreground/60">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {project.location}
                        </span>
                        <span className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5">
                          {category?.name || project.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          {project.iotSensors} sensores
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {project.dataPoints.toLocaleString("pt-BR")} leituras
                        </span>
                        <span className="flex items-center gap-1">
                          <FileCheck className="h-3 w-3" />
                          {project.evidences} evidencias
                        </span>
                      </div>

                      {/* Submission hint */}
                      {project.status === "COLLECTING" && project.collectionProgress < 70 && (
                        <p className="mt-2 text-xs text-amber-600">
                          Coleta minima de 70% necessaria para submeter a certificacao.
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/environmental/${project.id}`}>
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
                        </Link>
                      </Button>
                      {canSubmit && (
                        <Button size="sm" className="bg-[#0a2f2f] hover:bg-[#0a2f2f]/90 text-white">
                          <Send className="mr-1 h-4 w-4" />
                          Solicitar Cert.
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(project.status === "DRAFT" || project.status === "COLLECTING") && (
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                          )}
                          <DropdownMenuItem>Ver Dados IoT</DropdownMenuItem>
                          <DropdownMenuItem>Exportar Relatorio</DropdownMenuItem>
                          <DropdownMenuItem>Ver Audit Log</DropdownMenuItem>
                          {project.status === "DRAFT" && (
                            <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="py-12 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0a2f2f]" />
                <p className="mt-2 text-foreground/60">Carregando projetos...</p>
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="py-12 text-center">
                <Leaf className="mx-auto h-12 w-12 text-foreground/30 mb-4" />
                <h3 className="font-medium text-lg mb-1">Nenhum projeto encontrado</h3>
                <p className="text-foreground/60 mb-4">
                  Crie seu primeiro projeto ambiental para comecar a registrar dados IoT
                </p>
                <Button asChild className="bg-[#0a2f2f] hover:bg-[#0a2f2f]/90 text-white">
                  <Link href="/dashboard/environmental/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Projeto
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

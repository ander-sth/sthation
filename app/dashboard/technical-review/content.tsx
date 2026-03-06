"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Award,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Leaf,
  FileText,
  ImageIcon,
  Video,
  ExternalLink,
  Search,
  Filter,
  ChevronDown,
  Shield,
  Hash,
  Cpu,
  Factory,
  Thermometer,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Tipos - SOMENTE projetos ambientais (empresas de impacto ambiental)
interface EnvironmentalProject {
  id: string
  title: string
  company: string
  companyLogo: string
  category: string
  location: string
  submittedAt: string
  status: "PENDING" | "IN_REVIEW" | "CERTIFIED" | "REJECTED" | "NEEDS_INFO"
  evidences: {
    type: "PHOTO" | "VIDEO" | "DOCUMENT" | "IOT"
    url: string
    description: string
    timestamp: string
    hash: string
  }[]
  metrics: {
    carbonCredits?: number
    wasteProcessed?: number
    energySaved?: number
    totalInvested: number
    impactScore: number
  }
  iotSummary?: {
    deviceId: string
    deviceType: string
    totalReadings: number
    lastReading: string
    inputKg: number
    outputKg: number
    conversionRate: number
  }
  certifierNotes: {
    certifier: string
    note: string
    score: number
    date: string
  }[]
}

// Projetos serao carregados da API - sem dados mock
const initialProjects: EnvironmentalProject[] = []

export function TechnicalReviewContent() {
  const [projects, setProjects] = useState<EnvironmentalProject[]>(initialProjects)
  const [selectedProject, setSelectedProject] = useState<EnvironmentalProject | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [reviewForm, setReviewForm] = useState({
    technicalScore: 85,
    methodologyValid: true,
    evidencesValid: true,
    metricsAccurate: true,
    iotDataValid: true,
    comments: "",
    decision: "" as "CERTIFIED" | "REJECTED" | "NEEDS_INFO" | "",
  })

  const categories = [...new Set(projects.map((p) => p.category))]

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || project.category === filterCategory
    const matchesStatus = filterStatus === "all" || project.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    pending: projects.filter((p) => p.status === "PENDING").length,
    inReview: projects.filter((p) => p.status === "IN_REVIEW").length,
    certified: projects.filter((p) => p.status === "CERTIFIED").length,
    needsInfo: projects.filter((p) => p.status === "NEEDS_INFO").length,
  }

  const handleStartReview = (project: EnvironmentalProject) => {
    setSelectedProject(project)
    setReviewDialogOpen(true)
    setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, status: "IN_REVIEW" as const } : p)))
  }

  const handleSubmitReview = () => {
    if (!selectedProject || !reviewForm.decision) return

    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject.id
          ? { ...p, status: reviewForm.decision as "CERTIFIED" | "REJECTED" | "NEEDS_INFO" }
          : p,
      ),
    )

    setReviewDialogOpen(false)
    setSelectedProject(null)
    setReviewForm({
      technicalScore: 85,
      methodologyValid: true,
      evidencesValid: true,
      metricsAccurate: true,
      iotDataValid: true,
      comments: "",
      decision: "",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
            <Clock className="h-3 w-3 mr-1" /> Aguardando
          </Badge>
        )
      case "IN_REVIEW":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
            <FileCheck className="h-3 w-3 mr-1" /> Em Analise
          </Badge>
        )
      case "CERTIFIED":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Certificado
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" /> Rejeitado
          </Badge>
        )
      case "NEEDS_INFO":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" /> Info Pendente
          </Badge>
        )
      default:
        return null
    }
  }

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case "PHOTO":
        return <ImageIcon className="h-4 w-4" />
      case "VIDEO":
        return <Video className="h-4 w-4" />
      case "DOCUMENT":
        return <FileText className="h-4 w-4" />
      case "IOT":
        return <Cpu className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Leaf className="h-8 w-8 text-emerald-600" />
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Certificacao Ambiental</h1>
        </div>
        <p className="text-foreground/60 mt-1">
          Valide e certifique projetos de <strong>impacto ambiental</strong> submetidos por empresas. 
          Analise dados IoT, laudos tecnicos e evidencias para emitir o parecer de certificacao.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-blue-700">
          <Shield className="h-4 w-4 shrink-0" />
          <span>
            Esta area e exclusiva para <strong>Analistas Certificadores</strong>. 
            Projetos sociais sao validados pelo VCA (Checkers) e nao aparecem aqui.
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Certificacao</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-foreground/60">projetos na fila</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Analise</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inReview}</div>
            <p className="text-xs text-foreground/60">sendo avaliados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certified}</div>
            <p className="text-xs text-foreground/60">prontos para registro</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Info Pendente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.needsInfo}</div>
            <p className="text-xs text-foreground/60">aguardando documentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
          <Input
            placeholder="Buscar por projeto ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              {filterCategory === "all" ? "Todas Categorias" : filterCategory}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterCategory("all")}>Todas Categorias</DropdownMenuItem>
            {categories.map((cat) => (
              <DropdownMenuItem key={cat} onClick={() => setFilterCategory(cat)}>{cat}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              {filterStatus === "all"
                ? "Todos os Status"
                : filterStatus === "PENDING"
                  ? "Aguardando"
                  : filterStatus === "IN_REVIEW"
                    ? "Em Analise"
                    : filterStatus === "NEEDS_INFO"
                      ? "Info Pendente"
                      : "Certificados"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus("all")}>Todos os Status</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("PENDING")}>Aguardando</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("IN_REVIEW")}>Em Analise</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("NEEDS_INFO")}>Info Pendente</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("CERTIFIED")}>Certificados</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Leaf className="h-12 w-12 text-foreground/30 mb-4" />
              <p className="text-lg font-medium text-foreground/60">Nenhum projeto ambiental encontrado</p>
              <p className="text-sm text-foreground/40">Ajuste os filtros para ver mais resultados</p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Project Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                          <Leaf className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <div className="flex items-center gap-2">
                            <Factory className="h-3.5 w-3.5 text-foreground/40" />
                            <p className="text-sm text-foreground/60">{project.company}</p>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-4">
                      <Badge variant="secondary" className="gap-1">
                        <Leaf className="h-3 w-3" />
                        Ambiental
                      </Badge>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {project.category}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {project.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Submetido em {new Date(project.submittedAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>

                    {/* IoT Summary - exclusivo de projetos ambientais */}
                    {project.iotSummary && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Cpu className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">Dados IoT do Dispositivo</span>
                          <Badge variant="outline" className="ml-auto text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                            {project.iotSummary.totalReadings} leituras
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-foreground/40 text-xs">Device ID</p>
                            <p className="font-mono font-medium text-foreground/80">{project.iotSummary.deviceId}</p>
                          </div>
                          <div>
                            <p className="text-foreground/40 text-xs">Tipo</p>
                            <p className="font-medium text-foreground/80 truncate">{project.iotSummary.deviceType}</p>
                          </div>
                          {project.iotSummary.inputKg > 0 && (
                            <div>
                              <p className="text-foreground/40 text-xs">Entrada</p>
                              <p className="font-bold text-foreground/80">{project.iotSummary.inputKg.toLocaleString("pt-BR")} kg</p>
                            </div>
                          )}
                          {project.iotSummary.outputKg > 0 && (
                            <div>
                              <p className="text-foreground/40 text-xs">Saida</p>
                              <p className="font-bold text-emerald-600">{project.iotSummary.outputKg.toLocaleString("pt-BR")} kg</p>
                            </div>
                          )}
                        </div>
                        {project.iotSummary.conversionRate > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-foreground/40">Taxa de conversao</span>
                              <span className="font-medium text-emerald-600">{project.iotSummary.conversionRate}%</span>
                            </div>
                            <Progress value={project.iotSummary.conversionRate} className="h-1.5" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {project.metrics.carbonCredits && (
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <Leaf className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                          <p className="text-lg font-bold">{project.metrics.carbonCredits.toLocaleString("pt-BR")}</p>
                          <p className="text-xs text-foreground/60">tCO2e</p>
                        </div>
                      )}
                      {project.metrics.wasteProcessed && (
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <Thermometer className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                          <p className="text-lg font-bold">{project.metrics.wasteProcessed.toLocaleString("pt-BR")}</p>
                          <p className="text-xs text-foreground/60">kg processados</p>
                        </div>
                      )}
                      {project.metrics.energySaved && (
                        <div className="text-center p-3 bg-muted/30 rounded-lg">
                          <Cpu className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                          <p className="text-lg font-bold">{project.metrics.energySaved.toLocaleString("pt-BR")}</p>
                          <p className="text-xs text-foreground/60">kWh gerados</p>
                        </div>
                      )}
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <Award className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                        <p className="text-lg font-bold">{project.metrics.impactScore.toLocaleString("pt-BR")}</p>
                        <p className="text-xs text-foreground/60">Impact Score</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <Hash className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                        <p className="text-lg font-bold">{project.evidences.length}</p>
                        <p className="text-xs text-foreground/60">Evidencias</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Panel */}
                  <div className="lg:w-64 bg-muted/30 p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l">
                    <div>
                      <h4 className="font-medium mb-3">Evidencias</h4>
                      <div className="space-y-2">
                        {project.evidences.slice(0, 3).map((evidence, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {getEvidenceIcon(evidence.type)}
                            <span className="truncate flex-1">{evidence.type}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      {project.certifierNotes.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2 text-sm">Notas do Certificador</h4>
                          <p className="text-xs text-foreground/60 line-clamp-3">
                            {project.certifierNotes[project.certifierNotes.length - 1].note}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      {project.status === "PENDING" && (
                        <Button className="w-full" onClick={() => handleStartReview(project)}>
                          <FileCheck className="h-4 w-4 mr-2" />
                          Iniciar Certificacao
                        </Button>
                      )}
                      {project.status === "IN_REVIEW" && (
                        <Button className="w-full" onClick={() => handleStartReview(project)}>
                          <FileCheck className="h-4 w-4 mr-2" />
                          Continuar Analise
                        </Button>
                      )}
                      {project.status === "CERTIFIED" && (
                        <Button variant="outline" className="w-full bg-transparent" disabled>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Certificado
                        </Button>
                      )}
                      {project.status === "NEEDS_INFO" && (
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => handleStartReview(project)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Revisar Novamente
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-600" />
              Certificacao Ambiental - {selectedProject?.title}
            </DialogTitle>
            <DialogDescription>
              Valide os dados IoT, evidencias e documentacao da empresa para emitir o parecer de certificacao ambiental.
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <Tabs defaultValue="evidences" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="evidences">Evidencias</TabsTrigger>
                <TabsTrigger value="iot">Dados IoT / Sensores</TabsTrigger>
                <TabsTrigger value="review">Parecer Certificacao</TabsTrigger>
              </TabsList>

              <TabsContent value="evidences" className="space-y-4 mt-4">
                {selectedProject.evidences.map((evidence, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          {getEvidenceIcon(evidence.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{evidence.type}</h4>
                            <Badge variant="outline" className="text-xs">
                              {new Date(evidence.timestamp).toLocaleDateString("pt-BR")}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground/60 mt-1">{evidence.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-foreground/40">
                            <Hash className="h-3 w-3" />
                            <code className="bg-muted px-1 rounded">{evidence.hash}</code>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="iot" className="space-y-4 mt-4">
                {selectedProject.iotSummary ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Cpu className="h-5 w-5 text-emerald-600" />
                          Resumo do Dispositivo IoT
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-foreground/40">Device ID</p>
                            <p className="font-mono font-medium">{selectedProject.iotSummary.deviceId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-foreground/40">Tipo do Dispositivo</p>
                            <p className="font-medium">{selectedProject.iotSummary.deviceType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-foreground/40">Total de Leituras</p>
                            <p className="text-2xl font-bold">{selectedProject.iotSummary.totalReadings.toLocaleString("pt-BR")}</p>
                          </div>
                          <div>
                            <p className="text-xs text-foreground/40">Ultima Leitura</p>
                            <p className="font-medium">{new Date(selectedProject.iotSummary.lastReading).toLocaleString("pt-BR")}</p>
                          </div>
                        </div>
                        {selectedProject.iotSummary.inputKg > 0 && (
                          <div className="rounded-lg border p-4 mt-4">
                            <h4 className="text-sm font-medium mb-3">Fluxo de Conversao</h4>
                            <div className="flex items-center gap-4">
                              <div className="text-center flex-1">
                                <p className="text-2xl font-bold">{selectedProject.iotSummary.inputKg.toLocaleString("pt-BR")} kg</p>
                                <p className="text-xs text-foreground/40">Entrada (residuos)</p>
                              </div>
                              <div className="text-foreground/30 text-2xl">{">"}</div>
                              <div className="text-center flex-1">
                                <p className="text-2xl font-bold text-emerald-600">{selectedProject.iotSummary.outputKg.toLocaleString("pt-BR")} kg</p>
                                <p className="text-xs text-foreground/40">Saida (composto)</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    {/* Certifier Notes History */}
                    {selectedProject.certifierNotes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Historico de Notas do Certificador</h4>
                        {selectedProject.certifierNotes.map((note, idx) => (
                          <Card key={idx} className="mb-3">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{note.certifier}</h4>
                                  <p className="text-xs text-foreground/40">
                                    {new Date(note.date).toLocaleDateString("pt-BR")}
                                  </p>
                                </div>
                                <Badge
                                  variant={note.score >= 80 ? "default" : note.score >= 60 ? "secondary" : "destructive"}
                                >
                                  Score: {note.score}
                                </Badge>
                              </div>
                              <p className="mt-3 text-sm">{note.note}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Cpu className="h-12 w-12 text-foreground/30 mb-4" />
                      <p className="text-foreground/60">Nenhum dado IoT disponivel para este projeto</p>
                      <p className="text-xs text-foreground/40 mt-1">A empresa nao enviou dados de dispositivos para este card</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="review" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <Label>Score de Certificacao</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={reviewForm.technicalScore}
                        onChange={(e) => setReviewForm({ ...reviewForm, technicalScore: Number(e.target.value) })}
                        className="w-24"
                      />
                      <Progress value={reviewForm.technicalScore} className="flex-1 h-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card
                      className={`p-4 cursor-pointer transition-colors ${reviewForm.methodologyValid ? "border-emerald-500 bg-emerald-500/10" : "border-red-500 bg-red-500/10"}`}
                      onClick={() => setReviewForm({ ...reviewForm, methodologyValid: !reviewForm.methodologyValid })}
                    >
                      <div className="text-center">
                        {reviewForm.methodologyValid ? (
                          <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
                        ) : (
                          <XCircle className="h-8 w-8 mx-auto text-red-500" />
                        )}
                        <p className="mt-2 text-sm font-medium">Metodologia</p>
                      </div>
                    </Card>
                    <Card
                      className={`p-4 cursor-pointer transition-colors ${reviewForm.evidencesValid ? "border-emerald-500 bg-emerald-500/10" : "border-red-500 bg-red-500/10"}`}
                      onClick={() => setReviewForm({ ...reviewForm, evidencesValid: !reviewForm.evidencesValid })}
                    >
                      <div className="text-center">
                        {reviewForm.evidencesValid ? (
                          <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
                        ) : (
                          <XCircle className="h-8 w-8 mx-auto text-red-500" />
                        )}
                        <p className="mt-2 text-sm font-medium">Evidencias</p>
                      </div>
                    </Card>
                    <Card
                      className={`p-4 cursor-pointer transition-colors ${reviewForm.metricsAccurate ? "border-emerald-500 bg-emerald-500/10" : "border-red-500 bg-red-500/10"}`}
                      onClick={() => setReviewForm({ ...reviewForm, metricsAccurate: !reviewForm.metricsAccurate })}
                    >
                      <div className="text-center">
                        {reviewForm.metricsAccurate ? (
                          <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
                        ) : (
                          <XCircle className="h-8 w-8 mx-auto text-red-500" />
                        )}
                        <p className="mt-2 text-sm font-medium">Metricas</p>
                      </div>
                    </Card>
                    <Card
                      className={`p-4 cursor-pointer transition-colors ${reviewForm.iotDataValid ? "border-emerald-500 bg-emerald-500/10" : "border-red-500 bg-red-500/10"}`}
                      onClick={() => setReviewForm({ ...reviewForm, iotDataValid: !reviewForm.iotDataValid })}
                    >
                      <div className="text-center">
                        {reviewForm.iotDataValid ? (
                          <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500" />
                        ) : (
                          <XCircle className="h-8 w-8 mx-auto text-red-500" />
                        )}
                        <p className="mt-2 text-sm font-medium">Dados IoT</p>
                      </div>
                    </Card>
                  </div>

                  <div>
                    <Label htmlFor="comments">Parecer de Certificacao</Label>
                    <Textarea
                      id="comments"
                      placeholder="Descreva sua analise tecnica como Analista Certificador..."
                      value={reviewForm.comments}
                      onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Decisao Final</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                      <Button
                        variant={reviewForm.decision === "CERTIFIED" ? "default" : "outline"}
                        className={reviewForm.decision === "CERTIFIED" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                        onClick={() => setReviewForm({ ...reviewForm, decision: "CERTIFIED" })}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Certificar
                      </Button>
                      <Button
                        variant={reviewForm.decision === "NEEDS_INFO" ? "default" : "outline"}
                        className={reviewForm.decision === "NEEDS_INFO" ? "bg-orange-600 hover:bg-orange-700" : ""}
                        onClick={() => setReviewForm({ ...reviewForm, decision: "NEEDS_INFO" })}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Solicitar Info
                      </Button>
                      <Button
                        variant={reviewForm.decision === "REJECTED" ? "default" : "outline"}
                        className={reviewForm.decision === "REJECTED" ? "bg-red-600 hover:bg-red-700" : ""}
                        onClick={() => setReviewForm({ ...reviewForm, decision: "REJECTED" })}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitReview} disabled={!reviewForm.decision || !reviewForm.comments}>
              Emitir Parecer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

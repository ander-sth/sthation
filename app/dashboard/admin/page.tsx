"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { 
  Users, Leaf, Heart, Landmark, Search, Eye, CheckCircle2, Clock, 
  AlertCircle, FileCheck, TrendingUp, Building2, MapPin, ChevronRight,
  Shield, Loader2, Filter, MoreVertical
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { UserRole } from "@/lib/types/users"
import { redirect } from "next/navigation"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Status labels e cores
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  // Trilha
  DRAFT: { label: "Rascunho", color: "text-gray-600", bgColor: "bg-gray-100" },
  FUNDING: { label: "Em Captacao", color: "text-blue-600", bgColor: "bg-blue-100" },
  EXECUTING: { label: "Em Execucao", color: "text-amber-600", bgColor: "bg-amber-100" },
  VALIDATING: { label: "Em Validacao", color: "text-purple-600", bgColor: "bg-purple-100" },
  CERTIFYING: { label: "Certificando", color: "text-indigo-600", bgColor: "bg-indigo-100" },
  // Registro Polygon
  PENDING_REGISTRATION: { label: "Trilha em Processo", color: "text-orange-600", bgColor: "bg-orange-100" },
  REGISTERED: { label: "Trilha Registrada", color: "text-teal-600", bgColor: "bg-teal-100" },
  NOBIS_REGISTERED: { label: "NOBIS Registrado", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  // Ambientais
  COLLECTING: { label: "Coletando Dados", color: "text-cyan-600", bgColor: "bg-cyan-100" },
  CERTIFIED: { label: "Certificado", color: "text-green-600", bgColor: "bg-green-100" },
  INSCRIBED: { label: "NOBIS Registrado", color: "text-emerald-700", bgColor: "bg-emerald-100" },
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  DOADOR: "Doador",
  INSTITUICAO_SOCIAL: "Instituicao Social",
  EMPRESA_AMBIENTAL: "Empresa Ambiental",
  CHECKER: "Checker",
  ANALISTA_CERTIFICADOR: "Analista Certificador",
  PREFEITURA: "Prefeitura",
}

export default function AdminPanelPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  // Buscar dados
  const { data: usersData, isLoading: usersLoading } = useSWR("/api/users?limit=100", fetcher)
  const { data: socialData, isLoading: socialLoading } = useSWR("/api/iac?type=SOCIAL&limit=100", fetcher)
  const { data: ambientalData, isLoading: ambientalLoading } = useSWR("/api/iac?type=AMBIENTAL&limit=100", fetcher)
  const { data: govData, isLoading: govLoading } = useSWR("/api/iac?source=GOV&limit=100", fetcher)

  const users = usersData?.users || []
  const socialProjects = socialData?.projects || []
  const ambientalProjects = ambientalData?.projects || []
  const govProjects = govData?.projects || []

  // Verificar permissao
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a2f2f]" />
      </div>
    )
  }

  if (!user || user.role !== UserRole.ADMIN) {
    redirect("/dashboard")
  }

  // Estatisticas
  const totalUsers = users.length
  const totalSocialProjects = socialProjects.length
  const totalAmbientalProjects = ambientalProjects.length
  const totalGovProjects = govProjects.length
  const nobisRegistered = [...socialProjects, ...ambientalProjects].filter(
    (p: any) => p.status === "INSCRIBED" || p.status === "NOBIS_REGISTERED"
  ).length

  // Filtrar por busca
  const filteredUsers = users.filter((u: any) => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSocial = socialProjects.filter((p: any) =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.institution_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAmbiental = ambientalProjects.filter((p: any) =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.institution_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredGov = govProjects.filter((p: any) =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.institution_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Shield className="h-8 w-8 text-[#0a2f2f]" />
          Painel Administrativo
        </h1>
        <p className="text-foreground/60">Gestao completa da plataforma STHATION NOBIS</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-[#0a2f2f]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-foreground/60">cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-rose-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              Projetos Sociais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{totalSocialProjects}</div>
            <p className="text-xs text-foreground/60">instituicoes</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-500" />
              Projetos Ambientais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{totalAmbientalProjects}</div>
            <p className="text-xs text-foreground/60">empresas</p>
          </CardContent>
        </Card>

        <Card className="border-teal-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-teal-600" />
              Projetos Gov
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{totalGovProjects}</div>
            <p className="text-xs text-foreground/60">prefeituras</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#0a2f2f] to-[#0a2f2f]/80 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              NOBIS Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nobisRegistered}</div>
            <p className="text-xs text-white/60">na Polygon</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar usuarios, projetos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Visao Geral</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Sociais</span>
          </TabsTrigger>
          <TabsTrigger value="ambiental" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            <span className="hidden sm:inline">Ambientais</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Projetos Sociais Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Projetos Sociais Recentes
                </CardTitle>
                <CardDescription>Ultimos projetos cadastrados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {socialLoading ? (
                  <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                ) : socialProjects.slice(0, 5).map((project: any) => (
                  <ProjectListItem key={project.id} project={project} type="SOCIAL" />
                ))}
                {!socialLoading && socialProjects.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Nenhum projeto social cadastrado</p>
                )}
              </CardContent>
            </Card>

            {/* Projetos Ambientais Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-500" />
                  Projetos Ambientais Recentes
                </CardTitle>
                <CardDescription>Ultimos projetos cadastrados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {ambientalLoading ? (
                  <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                ) : ambientalProjects.slice(0, 5).map((project: any) => (
                  <ProjectListItem key={project.id} project={project} type="AMBIENTAL" />
                ))}
                {!ambientalLoading && ambientalProjects.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Nenhum projeto ambiental cadastrado</p>
                )}
              </CardContent>
            </Card>

            {/* Projetos de Prefeituras */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-teal-600" />
                  Projetos de Prefeituras
                </CardTitle>
                <CardDescription>Projetos sociais e ambientais de gestao publica</CardDescription>
              </CardHeader>
              <CardContent>
                {govLoading ? (
                  <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                ) : govProjects.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Nenhum projeto de prefeitura cadastrado</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {govProjects.slice(0, 6).map((project: any) => (
                      <ProjectListItem key={project.id} project={project} type={project.type || "GOV"} showPrefeitura />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Cadastrados ({filteredUsers.length})</CardTitle>
              <CardDescription>Todos os usuarios da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum usuario encontrado</p>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#0a2f2f]/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-[#0a2f2f]" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name || "Sem nome"}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {ROLE_LABELS[user.role] || user.role}
                        </Badge>
                        <Badge variant={user.is_active ? "default" : "secondary"} className={user.is_active ? "bg-emerald-500" : ""}>
                          {user.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Projects Tab */}
        <TabsContent value="social" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                Projetos Sociais ({filteredSocial.length})
              </CardTitle>
              <CardDescription>Projetos de instituicoes sociais</CardDescription>
            </CardHeader>
            <CardContent>
              {socialLoading ? (
                <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
              ) : filteredSocial.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum projeto social encontrado</p>
              ) : (
                <div className="space-y-3">
                  {filteredSocial.map((project: any) => (
                    <ProjectDetailCard key={project.id} project={project} type="SOCIAL" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ambiental Projects Tab */}
        <TabsContent value="ambiental" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-500" />
                Projetos Ambientais ({filteredAmbiental.length})
              </CardTitle>
              <CardDescription>Projetos de empresas ambientais</CardDescription>
            </CardHeader>
            <CardContent>
              {ambientalLoading ? (
                <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
              ) : filteredAmbiental.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum projeto ambiental encontrado</p>
              ) : (
                <div className="space-y-3">
                  {filteredAmbiental.map((project: any) => (
                    <ProjectDetailCard key={project.id} project={project} type="AMBIENTAL" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componente de item de projeto para lista compacta
function ProjectListItem({ project, type, showPrefeitura }: { project: any; type: string; showPrefeitura?: boolean }) {
  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.DRAFT
  const isSocial = type === "SOCIAL"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isSocial ? "bg-rose-100" : "bg-emerald-100"}`}>
              {isSocial ? <Heart className="h-5 w-5 text-rose-500" /> : <Leaf className="h-5 w-5 text-emerald-500" />}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{project.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {showPrefeitura && project.prefeitura_name ? project.prefeitura_name : project.institution_name || "Sem instituicao"}
              </p>
            </div>
          </div>
          <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0 shrink-0`}>
            {statusConfig.label}
          </Badge>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <ProjectDetailDialog project={project} type={type} />
      </DialogContent>
    </Dialog>
  )
}

// Componente de card detalhado de projeto
function ProjectDetailCard({ project, type }: { project: any; type: string }) {
  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.DRAFT
  const isSocial = type === "SOCIAL"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="p-4 rounded-xl border hover:border-[#0a2f2f]/30 hover:shadow-sm cursor-pointer transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${isSocial ? "bg-rose-100" : "bg-emerald-100"}`}>
                {isSocial ? <Heart className="h-6 w-6 text-rose-500" /> : <Leaf className="h-6 w-6 text-emerald-500" />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold">{project.title}</p>
                <p className="text-sm text-muted-foreground">{project.institution_name || "Sem instituicao"}</p>
                {project.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {project.location}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                {statusConfig.label}
              </Badge>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Detalhes
              </Button>
            </div>
          </div>

          {/* Metricas */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            {isSocial ? (
              <>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Meta</p>
                  <p className="font-semibold">R$ {((project.funding_goal || 0) / 1000).toFixed(0)}k</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Arrecadado</p>
                  <p className="font-semibold">R$ {((project.current_funding || 0) / 1000).toFixed(0)}k</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Beneficiarios</p>
                  <p className="font-semibold">{project.beneficiaries || 0}</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">CO2 Evitado</p>
                  <p className="font-semibold">{project.carbon_credits || 0} tCO2</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Sensores</p>
                  <p className="font-semibold">{project.sensors_count || 0}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Coleta</p>
                  <p className="font-semibold text-xs">{project.data_collection_type || "Manual"}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <ProjectDetailDialog project={project} type={type} />
      </DialogContent>
    </Dialog>
  )
}

// Dialog com detalhes do projeto e trilha
function ProjectDetailDialog({ project, type }: { project: any; type: string }) {
  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.DRAFT
  const isSocial = type === "SOCIAL"

  // Trilha do projeto
  const socialTrail = [
    { step: "Cadastro", status: "completed", date: project.created_at },
    { step: "Captacao", status: project.status === "FUNDING" ? "current" : project.current_funding > 0 ? "completed" : "pending" },
    { step: "Execucao", status: project.status === "EXECUTING" ? "current" : ["VALIDATING", "CERTIFYING", "REGISTERED", "NOBIS_REGISTERED", "INSCRIBED"].includes(project.status) ? "completed" : "pending" },
    { step: "Validacao VCA", status: project.status === "VALIDATING" ? "current" : ["CERTIFYING", "REGISTERED", "NOBIS_REGISTERED", "INSCRIBED"].includes(project.status) ? "completed" : "pending" },
    { step: "Certificacao", status: project.status === "CERTIFYING" ? "current" : ["REGISTERED", "NOBIS_REGISTERED", "INSCRIBED"].includes(project.status) ? "completed" : "pending" },
    { step: "Registro Polygon", status: ["REGISTERED", "NOBIS_REGISTERED", "INSCRIBED"].includes(project.status) ? "completed" : "pending" },
    { step: "NOBIS Registrado", status: ["NOBIS_REGISTERED", "INSCRIBED"].includes(project.status) ? "completed" : "pending" },
  ]

  const ambientalTrail = [
    { step: "Cadastro", status: "completed", date: project.created_at },
    { step: "Coleta de Dados", status: project.status === "COLLECTING" ? "current" : ["CERTIFYING", "CERTIFIED", "REGISTERED", "NOBIS_REGISTERED", "INSCRIBED"].includes(project.status) ? "completed" : "pending" },
    { step: "Certificacao", status: project.status === "CERTIFYING" || project.status === "CERTIFIED" ? "current" : ["REGISTERED", "NOBIS_REGISTERED", "INSCRIBED"].includes(project.status) ? "completed" : "pending" },
    { step: "Registro Polygon", status: ["REGISTERED", "NOBIS_REGISTERED", "INSCRIBED"].includes(project.status) ? "completed" : "pending" },
    { step: "NOBIS Registrado", status: ["NOBIS_REGISTERED", "INSCRIBED"].includes(project.status) ? "completed" : "pending" },
  ]

  const trail = isSocial ? socialTrail : ambientalTrail

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isSocial ? "bg-rose-100" : "bg-emerald-100"}`}>
            {isSocial ? <Heart className="h-5 w-5 text-rose-500" /> : <Leaf className="h-5 w-5 text-emerald-500" />}
          </div>
          <div>
            <p className="text-lg">{project.title}</p>
            <p className="text-sm font-normal text-muted-foreground">{project.institution_name}</p>
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6 mt-4">
        {/* Status Atual */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">Status Atual</p>
            <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0 mt-1`}>
              {statusConfig.label}
            </Badge>
          </div>
          {project.location && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Localizacao</p>
              <p className="flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {project.location}
              </p>
            </div>
          )}
        </div>

        {/* Descricao */}
        {project.description && (
          <div>
            <p className="text-sm font-medium mb-2">Descricao</p>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
        )}

        {/* Metricas */}
        <div>
          <p className="text-sm font-medium mb-3">Metricas do Projeto</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {isSocial ? (
              <>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Meta de Captacao</p>
                  <p className="font-bold text-lg">R$ {((project.funding_goal || 0) / 1000).toFixed(0)}k</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Arrecadado</p>
                  <p className="font-bold text-lg text-[#0a2f2f]">R$ {((project.current_funding || 0) / 1000).toFixed(0)}k</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Beneficiarios</p>
                  <p className="font-bold text-lg">{project.beneficiaries || 0}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Doacoes</p>
                  <p className="font-bold text-lg">{project.donations_count || 0}</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">CO2 Evitado</p>
                  <p className="font-bold text-lg text-emerald-600">{project.carbon_credits || 0} tCO2</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Sensores IoT</p>
                  <p className="font-bold text-lg">{project.sensors_count || 0}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Tipo Coleta</p>
                  <p className="font-bold text-sm">{project.data_collection_type || "Manual"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Categoria</p>
                  <p className="font-bold text-sm truncate">{project.category || "Ambiental"}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Trilha de Registro */}
        <div>
          <p className="text-sm font-medium mb-3">Trilha de Registro</p>
          <div className="space-y-3">
            {trail.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  item.status === "completed" ? "bg-emerald-100" :
                  item.status === "current" ? "bg-amber-100" : "bg-gray-100"
                }`}>
                  {item.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : item.status === "current" ? (
                    <Clock className="h-4 w-4 text-amber-600" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.status === "pending" ? "text-muted-foreground" : ""}`}>
                    {item.step}
                  </p>
                  {item.date && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                {index < trail.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

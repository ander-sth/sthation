"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Landmark,
  Plus,
  Search,
  FileCheck,
  ShieldCheck,
  Lock,
  Users,
  Leaf,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import {
  GovProjectType,
  GovProjectStatus,
  GOV_STATUS_CONFIG,
  GOV_PROJECT_TYPE_CONFIG,
  GOV_PLAN_DEFAULT,
} from "@/lib/types/gov"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function StatusIcon({ status }: { status: GovProjectStatus }) {
  switch (status) {
    case GovProjectStatus.INSCRITO:
      return <Clock className="h-4 w-4 text-blue-400" />
    case GovProjectStatus.EM_ANALISE:
      return <AlertCircle className="h-4 w-4 text-amber-400" />
    case GovProjectStatus.VERIFICADO:
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    case GovProjectStatus.REPROVADO:
      return <XCircle className="h-4 w-4 text-red-400" />
    case GovProjectStatus.INSCRITO_BLOCKCHAIN:
      return <Lock className="h-4 w-4 text-teal-600" />
  }
}

export default function GovDashboardPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Buscar dados da API
  const { data: subData, isLoading: subLoading } = useSWR("/api/gov/subscription", fetcher, { revalidateOnFocus: false })
  const { data: projData, isLoading: projLoading } = useSWR("/api/gov/projects", fetcher, { revalidateOnFocus: false })

  const sub = subData?.subscription || { plan: GOV_PLAN_DEFAULT, projectsUsed: 0, status: "INACTIVE" }
  const projects = projData?.projects || []

  const filtered = projects.filter((p: any) => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = typeFilter === "all" || p.type === typeFilter
    const matchStatus = statusFilter === "all" || p.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const projectsRemaining = (sub.plan?.maxProjects || 0) - (sub.projectsUsed || 0)
  const usagePercent = sub.plan?.maxProjects ? ((sub.projectsUsed || 0) / sub.plan.maxProjects) * 100 : 0

  const countByStatus = {
    inscrito: projects.filter((p: any) => p.status === GovProjectStatus.INSCRITO).length,
    emAnalise: projects.filter((p: any) => p.status === GovProjectStatus.EM_ANALISE).length,
    verificado: projects.filter((p: any) => p.status === GovProjectStatus.VERIFICADO).length,
    blockchain: projects.filter((p: any) => p.status === GovProjectStatus.INSCRITO_BLOCKCHAIN).length,
    reprovado: projects.filter((p: any) => p.status === GovProjectStatus.REPROVADO).length,
  }
  
  const isLoading = subLoading || projLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sthation Gov</h1>
          <p className="text-foreground/60">Painel de gestao de projetos da prefeitura</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="border-border text-foreground hover:bg-muted">
            <Link href="/gov/hall">Ver Hall Gov</Link>
          </Button>
          <Button
            asChild
            className="bg-[#0a2f2f] hover:bg-[#0a2f2f]/90 text-white font-bold rounded-full"
            disabled={projectsRemaining <= 0}
          >
            <Link href="/dashboard/gov/new">
              <Plus className="mr-2 h-4 w-4" />
              Inscrever Projeto
            </Link>
          </Button>
        </div>
      </div>

      {/* Plano ativo */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a2f2f]/10">
                <Landmark className="h-5 w-5 text-[#0a2f2f]" />
              </div>
              <div>
                <CardTitle className="text-foreground">{sub.plan.name}</CardTitle>
                <CardDescription className="text-foreground/60">
                  Expira em {new Date(sub.expiresAt).toLocaleDateString("pt-BR")}
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">Ativo</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-foreground/60">Projetos utilizados</span>
            <span className="font-bold text-foreground">
              {sub.projectsUsed} / {sub.plan.maxProjects}
            </span>
          </div>
          <Progress value={usagePercent} className="h-2 bg-muted [&>div]:bg-[#0a2f2f]" />
          <p className="mt-2 text-xs text-foreground/40">
            {projectsRemaining} projetos restantes neste plano
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Inscritos", value: countByStatus.inscrito, icon: FileCheck, color: "text-blue-400" },
          { label: "Em Analise", value: countByStatus.emAnalise, icon: AlertCircle, color: "text-amber-400" },
          { label: "Verificados", value: countByStatus.verificado, icon: ShieldCheck, color: "text-emerald-400" },
          { label: "Blockchain", value: countByStatus.blockchain, icon: Lock, color: "text-teal-600" },
          { label: "Reprovados", value: countByStatus.reprovado, icon: XCircle, color: "text-red-400" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-foreground/60">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <Input
            placeholder="Buscar projeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-44 bg-muted border-border text-foreground">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value={GovProjectType.SOCIAL}>Social</SelectItem>
            <SelectItem value={GovProjectType.AMBIENTAL}>Ambiental</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-44 bg-muted border-border text-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {Object.entries(GOV_STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de projetos */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Projetos Inscritos ({filtered.length})</CardTitle>
          <CardDescription className="text-foreground/60">
            Gerencie os projetos inscritos no Sthation Gov
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground/60">Projeto</TableHead>
                  <TableHead className="text-foreground/60">Tipo</TableHead>
                  <TableHead className="text-foreground/60">Status</TableHead>
                  <TableHead className="text-foreground/60">Verificacao</TableHead>
                  <TableHead className="text-foreground/60 text-right">Investido</TableHead>
                  <TableHead className="text-foreground/60 text-right">Beneficiarios</TableHead>
                  <TableHead className="text-foreground/60">Blockchain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((project) => {
                  const statusCfg = GOV_STATUS_CONFIG[project.status]
                  return (
                    <TableRow key={project.id} className="border-border hover:bg-muted">
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{project.title}</div>
                          <div className="text-xs text-foreground/40">
                            {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {project.type === GovProjectType.SOCIAL ? (
                            <Users className="h-3.5 w-3.5 text-[#0a2f2f]" />
                          ) : (
                            <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                          <span className="text-sm text-foreground/70">
                            {GOV_PROJECT_TYPE_CONFIG[project.type].label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <StatusIcon status={project.status} />
                          <Badge className={`text-xs ${statusCfg.color}`}>{statusCfg.label}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-foreground/60">
                          {project.verificationMethod === "VCA" ? "Checkers" : "Certificadora"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-foreground/70">
                          R$ {(project.investedAmount / 1000).toFixed(0)}k
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-foreground/70">
                          {project.beneficiaries.toLocaleString("pt-BR")}
                        </span>
                      </TableCell>
                      <TableCell>
                        {project.blockchainTxId ? (
                          <div className="flex items-center gap-1 text-[#0a2f2f]">
                            <Lock className="h-3.5 w-3.5" />
                            <span className="text-xs font-mono">{project.blockchainTxId}</span>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        ) : (
                          <span className="text-xs text-foreground/30">--</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

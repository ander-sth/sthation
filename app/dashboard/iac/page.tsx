"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Send, MoreHorizontal, MapPin, FileCheck, Heart, Users, Target, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { IacStatus, STATUS_CONFIG, IAC_VALIDATION_RULES } from "@/lib/types/iac"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import useSWR from "swr"
import { mockIACs } from "@/lib/mock-data"

const SOCIAL_CATEGORIES = [
  { code: "ALIMENTACAO", name: "Alimentação e Segurança Alimentar", icon: "🍽️" },
  { code: "EDUCACAO", name: "Educação e Capacitação", icon: "📚" },
  { code: "SAUDE", name: "Saúde e Bem-estar", icon: "🏥" },
  { code: "MORADIA", name: "Moradia e Infraestrutura", icon: "🏠" },
  { code: "RENDA", name: "Geração de Renda", icon: "💼" },
  { code: "CULTURA", name: "Cultura e Esporte", icon: "🎭" },
  { code: "AMBIENTAL", name: "Educação Ambiental", icon: "🌱" },
  { code: "ASSISTENCIA", name: "Assistência Social", icon: "🤝" },
]

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function IACPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Buscar IACs do banco de dados
  const { data, error, isLoading, mutate } = useSWR(
    user ? `/api/iacs?institution_user_id=${user.id}` : null,
    fetcher
  )

  // Sempre mostra dados mockados + dados do banco se houver
  const dbIacs = data?.iacs || []
  const mockData = mockIACs.map(iac => ({
    ...iac,
    category: iac.tsbCategory,
    tsb_category_id: iac.tsbCategory,
    funding_goal: iac.budget,
    current_amount: 0, // Zerado conforme solicitado
    location_name: typeof iac.location === 'object' ? iac.location.name : iac.location,
    estimated_beneficiaries: iac.estimatedBeneficiaries || 200,
  }))
  const iacs = [...dbIacs, ...mockData]

  const filteredIACs = iacs.filter((iac: any) => {
    const matchesSearch =
      iac.title?.toLowerCase().includes(search.toLowerCase()) ||
      iac.description?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || iac.status === statusFilter || iac.status === IacStatus[statusFilter as keyof typeof IacStatus]
    const matchesCategory = categoryFilter === "all" || iac.category === categoryFilter || iac.tsb_category_id === categoryFilter || iac.tsbCategory === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleSubmitForVCA = (iacId: string, evidenceCount: number) => {
    if (evidenceCount < IAC_VALIDATION_RULES.MIN_EVIDENCES_TO_SUBMIT) {
      toast({
        title: "Evidências insuficientes",
        description: `Mínimo de ${IAC_VALIDATION_RULES.MIN_EVIDENCES_TO_SUBMIT} evidências requeridas para auditoria. Você tem ${evidenceCount}.`,
        variant: "destructive",
      })
      return
    }
    toast({
      title: "IAC Submetido",
      description: "Seu projeto foi enviado para validação VCA. Bloqueado para edições.",
    })
  }

  const stats = {
    total: iacs.length,
    captando: iacs.filter((i: any) => [IacStatus.DRAFT, IacStatus.EXECUTING, "DRAFT", "FUNDING", "EXECUTING"].includes(i.status)).length,
    emValidacao: iacs.filter((i: any) => [IacStatus.SUBMITTED, "SUBMITTED", "VCA"].includes(i.status)).length,
    validados: iacs.filter((i: any) => [IacStatus.VALIDATED, IacStatus.MINTED, "VALIDATED", "MINTED"].includes(i.status)).length,
    totalArrecadado: `R$ ${iacs.reduce((acc: number, i: any) => acc + (i.current_amount || i.budget || 0), 0).toLocaleString("pt-BR")}`,
    beneficiarios: iacs.reduce((acc: number, i: any) => acc + (i.estimated_beneficiaries || 0), 0).toLocaleString("pt-BR"),
  }

  // Nao bloqueia a renderizacao com loading - mostra mockados enquanto carrega

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Impact Action Cards</h1>
          <p className="text-foreground/60">Crie e gerencie seus projetos sociais para captação de doações</p>
        </div>
        {(user?.role === "INSTITUICAO_SOCIAL" || user?.role === "INSTITUICAO" || user?.role === "ADMIN") && (
          <Button asChild>
            <Link href="/dashboard/iac/new">
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Projeto
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Meus Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              Em Captação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">{stats.captando}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" />
              Em Validação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.emValidacao}</div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
              Total Arrecadado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.totalArrecadado}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Beneficiários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.beneficiarios}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
              <Input
                placeholder="Buscar projetos..."
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
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
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
                {SOCIAL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.code} value={cat.code}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIACs.map((iac: any) => {
              const statusConfig = STATUS_CONFIG[iac.status] || { label: iac.status, color: "bg-gray-500/10 text-gray-500" }
              const category = SOCIAL_CATEGORIES.find((c) => c.code === iac.category || c.code === iac.tsb_category_id) || SOCIAL_CATEGORIES[0]
              const canSubmit = iac.status === "DRAFT" || iac.status === "FUNDING" || iac.status === IacStatus.DRAFT || iac.status === IacStatus.EXECUTING
              const canEdit = iac.status === "DRAFT" || iac.status === IacStatus.DRAFT

              const fundingGoal = iac.funding_goal || iac.goal_amount || 50000
              const fundingRaised = iac.current_amount || 0
              const fundingProgress = fundingGoal > 0 ? (fundingRaised / fundingGoal) * 100 : 0
              const evidenceCount = iac.evidences?.length || 0
              const locationName = typeof iac.location === "object" ? iac.location?.name : (iac.location_name || iac.location || "")

              return (
                <div
                  key={iac.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <h3 className="font-semibold">{iac.title}</h3>
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      </div>
                      <p className="mb-3 text-sm text-foreground/60 line-clamp-2">{iac.description}</p>

                      <div className="mb-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground/60">Arrecadado</span>
                          <span className="font-medium">
                            R$ {fundingRaised.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} / R${" "}
                            {fundingGoal.toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <Progress value={fundingProgress} className="h-2" />
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap gap-4 text-xs text-foreground/60">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {locationName}
                        </span>
                        <span className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5">{category.name}</span>
                        <span className="flex items-center gap-1">
                          <FileCheck className="h-3 w-3" />
                          {evidenceCount} evidencia{evidenceCount !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {iac.estimated_beneficiaries || 0} beneficiarios
                        </span>
                      </div>

                      {/* Evidence warning */}
                      {canSubmit && evidenceCount < IAC_VALIDATION_RULES.MIN_EVIDENCES_TO_SUBMIT && (
                        <p className="mt-2 text-xs text-amber-500">
                          Necessario {IAC_VALIDATION_RULES.MIN_EVIDENCES_TO_SUBMIT - evidenceCount} evidencia(s)
                          adicional(is) para submeter ao VCA
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/iac/${iac.id}`}>
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
                        </Link>
                      </Button>
                      {canSubmit && evidenceCount >= IAC_VALIDATION_RULES.MIN_EVIDENCES_TO_SUBMIT && (
                        <Button size="sm" onClick={() => handleSubmitForVCA(iac.id, evidenceCount)}>
                          <Send className="mr-1 h-4 w-4" />
                          Submeter VCA
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEdit && <DropdownMenuItem>Editar</DropdownMenuItem>}
                          <DropdownMenuItem>Compartilhar</DropdownMenuItem>
                          <DropdownMenuItem>Ver Doadores</DropdownMenuItem>
                          <DropdownMenuItem>Ver Audit Log</DropdownMenuItem>
                          {iac.status === IacStatus.DRAFT && (
                            <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredIACs.length === 0 && (
              <div className="py-12 text-center">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-lg mb-1">Nenhum projeto encontrado com esses filtros</h3>
                <p className="text-muted-foreground mb-4">Tente ajustar os filtros ou crie um novo projeto</p>
                <Button asChild>
                  <Link href="/dashboard/iac/new">
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

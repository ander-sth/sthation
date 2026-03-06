"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  GitBranch,
  Heart,
  Leaf,
  Clock,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Hash,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Shield,
  Box,
  FileText,
  Users,
  DollarSign,
  ClipboardCheck,
  Award,
  Lock,
  Cpu,
  FlaskConical,
  Building2,
} from "lucide-react"

// ---------- TIPOS ----------

type TrailType = "SOCIAL" | "AMBIENTAL"

interface TrailEvent {
  id: string
  step: number
  label: string
  description: string
  timestamp: string
  actor: string
  dataHash: string
  icon: typeof Clock
  color: string
  details?: Record<string, string | number>
}

interface Trail {
  id: string
  type: TrailType
  projectTitle: string
  organization: string
  status: "REGISTRADO" | "EM_ANDAMENTO" | "AGUARDANDO_REGISTRO"
  events: TrailEvent[]
  polygon?: {
    txHash: string
    blockNumber: number
    gasUsed: number
    network: string
    explorerUrl: string
    registeredAt: string
  }
  finalHash: string
  documentUrl: string
}

// ---------- DADOS: Trilhas serao buscadas da API ----------
// Por enquanto, a lista esta vazia ate que projetos reais sejam registrados na Polygon

// ---------- HELPERS ----------

const allTrails: Trail[] = [] // Trilhas reais serao carregadas da API /api/pipeline-trails quando houver

const STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  REGISTRADO: { label: "Registrado na Polygon", badgeClass: "bg-violet-500/10 text-violet-600 border-violet-600/20" },
  EM_ANDAMENTO: { label: "Em andamento", badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  AGUARDANDO_REGISTRO: { label: "Aguardando registro", badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ---------- COMPONENTE ----------

export default function PipelineDashboardPage() {
  const [filter, setFilter] = useState<"ALL" | "SOCIAL" | "AMBIENTAL">("ALL")
  const [expandedTrail, setExpandedTrail] = useState<string | null>(null)

  const filtered = filter === "ALL" ? allTrails : allTrails.filter((t) => t.type === filter)
  const socialCount = allTrails.filter((t) => t.type === "SOCIAL").length
  const ambientalCount = allTrails.filter((t) => t.type === "AMBIENTAL").length
  const registeredCount = allTrails.filter((t) => t.status === "REGISTRADO").length

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3 sm:text-3xl">
            <GitBranch className="h-7 w-7 text-[#0a2f2f]" />
            Pipeline Polygon
          </h1>
          <p className="mt-1 text-foreground/60 text-sm sm:text-base">
            Trilha completa de lastro -- do cadastro ao registro imutavel na Polygon
          </p>
        </div>
      </div>

      {/* Explicacao */}
      <Card className="border-[#0a2f2f]/20 bg-[#0a2f2f]/5">
        <CardContent className="p-4">
          <p className="text-sm text-foreground/70 leading-relaxed">
            Cada projeto -- social ou ambiental -- gera uma trilha de dados encadeada por hashes. Todos os registros sao capturados desde a abertura ate o fechamento,
            gerando um <strong>documento completo</strong> e um <strong>hash final SHA-256</strong> que comprova o lastro do impacto.
            Esse hash e registrado na blockchain <strong>Polygon</strong>, tornando a trilha imutavel e auditavel publicamente.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#0a2f2f]/10 p-2">
                <GitBranch className="h-5 w-5 text-[#0a2f2f]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{allTrails.length}</p>
                <p className="text-xs text-foreground/60">Total Trilhas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rose-500/10 p-2">
                <Heart className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{socialCount}</p>
                <p className="text-xs text-foreground/60">Sociais</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <Leaf className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{ambientalCount}</p>
                <p className="text-xs text-foreground/60">Ambientais</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-500/10 p-2">
                <Box className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{registeredCount}</p>
                <p className="text-xs text-foreground/60">Na Polygon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["ALL", "SOCIAL", "AMBIENTAL"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "bg-[#0a2f2f] text-white hover:bg-[#0a2f2f]/90"
                : "border-border text-foreground/70 hover:bg-muted hover:text-foreground"
            }
          >
            {f === "ALL" && "Todas"}
            {f === "SOCIAL" && "Sociais"}
            {f === "AMBIENTAL" && "Ambientais"}
          </Button>
        ))}
      </div>

      {/* Trilhas Social - Fluxo explicativo */}
      {(filter === "ALL" || filter === "SOCIAL") && (
        <Card className="border-rose-500/20 bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-600" />
              <CardTitle className="text-base text-foreground">Trilha Social</CardTitle>
            </div>
            <CardDescription>
              Cadastro do projeto {'>'} Doacoes com dados dos doadores {'>'} Card completo (abertura ao fechamento) {'>'} Checkagem VCA {'>'} Score final {'>'} Hash + Documento {'>'} Registro Polygon
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {(filter === "ALL" || filter === "AMBIENTAL") && (
        <Card className="border-emerald-500/20 bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base text-foreground">Trilha Ambiental</CardTitle>
            </div>
            <CardDescription>
              Registros da empresa {'>'} Dados tecnicos IoT da operacao {'>'} Avaliacao da certificadora {'>'} Hash + Documento {'>'} Registro Polygon
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Trail List */}
      <div className="space-y-4">
        {filtered.map((trail) => {
          const isExpanded = expandedTrail === trail.id
          const statusCfg = STATUS_LABELS[trail.status]
          const lastEvent = trail.events[trail.events.length - 1]

          return (
            <Card key={trail.id} className="border-border bg-card overflow-hidden">
              {/* Trail Header */}
              <button
                onClick={() => setExpandedTrail(isExpanded ? null : trail.id)}
                className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className={`rounded-lg p-2 shrink-0 ${trail.type === "SOCIAL" ? "bg-rose-500/10" : "bg-emerald-500/10"}`}>
                  {trail.type === "SOCIAL" ? (
                    <Heart className="h-5 w-5 text-rose-600" />
                  ) : (
                    <Leaf className="h-5 w-5 text-emerald-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground truncate">{trail.projectTitle}</p>
                    <Badge variant="outline" className={`text-xs shrink-0 ${statusCfg.badgeClass}`}>
                      {statusCfg.label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{trail.organization}</span>
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {trail.events.length} registros
                    </span>
                    <span>{formatDate(lastEvent.timestamp)}</span>
                  </div>
                </div>

                {trail.polygon && (
                  <Badge className="bg-violet-500/10 text-violet-600 border-violet-600/20 text-xs shrink-0 hidden sm:flex">
                    <Box className="mr-1 h-3 w-3" /> Polygon
                  </Badge>
                )}

                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Expanded Timeline */}
              {isExpanded && (
                <div className="border-t border-border bg-muted/30 p-4 sm:p-6">
                  {/* Hash Chain Status */}
                  {trail.finalHash && (
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-emerald-700 font-medium">Cadeia de hashes integra</span>
                      </div>
                      <code className="text-xs text-muted-foreground font-mono break-all">
                        Hash final: {trail.finalHash.slice(0, 24)}...
                      </code>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="space-y-0">
                    {trail.events.map((event, idx) => {
                      const EventIcon = event.icon
                      return (
                        <div key={event.id} className="flex gap-3 sm:gap-4">
                          {/* Vertical connector */}
                          <div className="flex flex-col items-center">
                            <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-white ${event.color}`}>
                              <EventIcon className="h-4 w-4" />
                            </div>
                            {idx < trail.events.length - 1 && (
                              <div className="w-px flex-1 bg-border min-h-8" />
                            )}
                          </div>

                          {/* Event content */}
                          <div className="pb-6 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                Passo {event.step}: {event.label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{event.description}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              <span>{formatDate(event.timestamp)}</span>
                              <span className="flex items-center gap-1">
                                <ArrowRight className="h-3 w-3" />
                                {event.actor}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-muted-foreground/60 mt-1 truncate">
                              Hash: {event.dataHash.slice(0, 20)}...
                            </p>

                            {/* Details grid */}
                            {event.details && (
                              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                {Object.entries(event.details).map(([key, val]) => (
                                  <div key={key} className="rounded-lg bg-background border border-border p-2">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{key}</p>
                                    <p className="text-xs font-semibold text-foreground mt-0.5">{String(val)}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Polygon Record */}
                  {trail.polygon && (
                    <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
                      <p className="text-sm font-semibold text-violet-700 mb-3 flex items-center gap-2">
                        <Box className="h-4 w-4" />
                        Registro Imutavel na Polygon
                      </p>
                      <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                        <div>
                          <span className="text-muted-foreground">TX Hash: </span>
                          <code className="text-violet-600 break-all">{trail.polygon.txHash.slice(0, 30)}...</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bloco: </span>
                          <span className="text-foreground font-medium">{trail.polygon.blockNumber.toLocaleString("pt-BR")}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gas: </span>
                          <span className="text-foreground font-medium">{trail.polygon.gasUsed.toLocaleString("pt-BR")}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rede: </span>
                          <span className="text-foreground font-medium">{trail.polygon.network}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <a
                          href={trail.polygon.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium"
                        >
                          Ver no PolygonScan <ExternalLink className="h-3 w-3" />
                        </a>
                        {trail.documentUrl && (
                          <a
                            href={trail.documentUrl}
                            className="inline-flex items-center gap-1 text-xs text-[#0a2f2f] hover:text-[#0a2f2f]/70 font-medium"
                          >
                            Baixar documento completo <FileText className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Awaiting registration */}
                  {trail.status === "AGUARDANDO_REGISTRO" && trail.finalHash && (
                    <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                      <p className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Aguardando Registro na Polygon
                      </p>
                      <p className="text-xs text-muted-foreground">
                        O hash final e o documento da trilha ja foram gerados. O registro na blockchain Polygon sera feito em breve.
                      </p>
                    </div>
                  )}

                  {/* In progress */}
                  {trail.status === "EM_ANDAMENTO" && (
                    <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                      <p className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Trilha em Andamento
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Esta trilha ainda esta captando registros. O hash final e o documento serao gerados quando todos os passos forem concluidos.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Fluxo Resumido */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#0a2f2f]" />
            Como Funciona o Lastro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-rose-600 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Heart className="h-4 w-4" /> Trilha Social
              </p>
              <div className="space-y-2">
                {[
                  "1. Cadastro do projeto social na plataforma",
                  "2. Captacao de doacoes com registro de cada doador",
                  "3. Card completo: evidencias da abertura ao fechamento",
                  "4. Checkagem VCA: 10 Checkers avaliam independentemente",
                  "5. Score consolidado da validacao comunitaria",
                  "6. Hash SHA-256 encadeado + documento PDF completo",
                  "7. Registro imutavel na blockchain Polygon",
                ].map((step, i) => (
                  <p key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    {step}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-600 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Leaf className="h-4 w-4" /> Trilha Ambiental
              </p>
              <div className="space-y-2">
                {[
                  "1. Registros cadastrais da empresa ambiental",
                  "2. Dados tecnicos IoT: sensores, leituras, metricas",
                  "3. Avaliacao da certificadora com parecer tecnico",
                  "4. Hash SHA-256 encadeado + documento PDF completo",
                  "5. Registro imutavel na blockchain Polygon",
                ].map((step, i) => (
                  <p key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {step}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { use, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Leaf,
  MapPin,
  Calendar,
  FileCheck,
  Cpu,
  BarChart3,
  Download,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Loader2,
  ExternalLink,
  Building2,
  User,
  FileText,
  Image as ImageIcon,
  Activity,
  Thermometer,
  Droplets,
  Scale,
  Zap,
  Pencil,
  Lock,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Status config
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: "Rascunho", color: "bg-gray-500/10 text-gray-600 border-gray-300", icon: Clock },
  EM_ANDAMENTO: { label: "Em Andamento", color: "bg-blue-500/10 text-blue-600 border-blue-300", icon: Activity },
  COLLECTING: { label: "Coletando Dados", color: "bg-blue-500/10 text-blue-600 border-blue-300", icon: Activity },
  CONCLUIDO: { label: "Concluido", color: "bg-emerald-500/10 text-emerald-600 border-emerald-300", icon: CheckCircle2 },
  SUBMITTED: { label: "Aguardando Certificacao", color: "bg-amber-500/10 text-amber-600 border-amber-300", icon: AlertCircle },
  VALIDATED: { label: "Validado", color: "bg-emerald-500/10 text-emerald-600 border-emerald-300", icon: CheckCircle2 },
  CERTIFIED: { label: "Certificado", color: "bg-emerald-500/10 text-emerald-600 border-emerald-300", icon: CheckCircle2 },
  REJECTED: { label: "Rejeitado", color: "bg-red-500/10 text-red-600 border-red-300", icon: XCircle },
  INSCRIBED: { label: "Inscrito na Blockchain", color: "bg-[#0a2f2f]/10 text-[#0a2f2f] border-[#0a2f2f]/30", icon: Shield },
  MINTED: { label: "Token Mintado", color: "bg-[#0a2f2f]/10 text-[#0a2f2f] border-[#0a2f2f]/30", icon: Shield },
}

// Evidence type icons
const EVIDENCE_ICONS: Record<string, any> = {
  PHOTO: ImageIcon,
  VIDEO: Activity,
  DOCUMENT: FileText,
  SENSOR: Cpu,
}

export default function EnvironmentalProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Buscar dados do projeto
  const { data, isLoading, error, mutate } = useSWR(`/api/iac/${id}`, fetcher)

  // Função para solicitar certificação
  const handleRequestCertification = async () => {
    if (!confirm("Ao solicitar certificacao, o projeto sera bloqueado para edicao. Deseja continuar?")) {
      return
    }
    
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/iac/${id}/submit-certification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      
      if (res.ok) {
        alert("Certificacao solicitada com sucesso! O projeto agora aguarda analise de um certificador.")
        mutate() // Recarregar dados
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao solicitar certificacao")
      }
    } catch (err) {
      alert("Erro ao solicitar certificacao")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0a2f2f]" />
          <p className="mt-4 text-foreground/60">Carregando projeto...</p>
        </div>
      </div>
    )
  }

  if (error || !data?.iac) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">Projeto nao encontrado</h2>
          <p className="mt-2 text-foreground/60">O projeto solicitado nao existe ou voce nao tem permissao para visualiza-lo.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/environmental">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Projetos
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const project = data.iac
  const evidences = data.evidences || []
  const auditLogs = data.auditLogs || []
  const technicalReview = data.technicalReview
  const pipelineTrail = data.pipelineTrail
  const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.DRAFT
  const StatusIcon = statusCfg.icon

  // Calcular metricas
  const metrics = {
    inputKg: project.metrics?.inputKg || project.input_kg || 0,
    outputKg: project.metrics?.outputKg || project.output_kg || 0,
    co2eAvoided: project.metrics?.co2eAvoided || project.vca_score || 0,
    cyclesCompleted: project.metrics?.cyclesCompleted || 0,
    efficiency: project.metrics?.outputKg && project.metrics?.inputKg 
      ? ((project.metrics.outputKg / project.metrics.inputKg) * 100).toFixed(1)
      : 0,
  }

  // Pode solicitar certificação se estiver concluído ou em andamento (não pode se já enviou ou está certificado)
  const canSubmitForCertification = ["DRAFT", "COLLECTING", "EM_ANDAMENTO", "CONCLUIDO"].includes(project.status)
  // Pode editar se não estiver aguardando certificação, certificado ou na blockchain
  const canEdit = !["SUBMITTED", "VALIDATED", "CERTIFIED", "INSCRIBED", "MINTED"].includes(project.status)
  const isBlockchainRegistered = project.status === "INSCRIBED" || project.status === "MINTED" || project.polygon_tx_hash
  const isAwaitingCertification = project.status === "SUBMITTED"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/dashboard/environmental">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Projetos
          </Link>
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="h-6 w-6 text-[#0a2f2f]" />
              <h1 className="text-2xl font-bold sm:text-3xl">{project.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`${statusCfg.color} border`}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusCfg.label}
              </Badge>
              <span className="text-sm text-foreground/60 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {project.location_name || project.locationName}, {project.location_state || project.locationState}
              </span>
              <span className="text-sm text-foreground/60 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Criado em {new Date(project.created_at || project.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            {canEdit && (
              <Button variant="outline" asChild>
                <Link href={`/dashboard/environmental/${id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar Projeto
                </Link>
              </Button>
            )}
            {canSubmitForCertification && (
              <Button 
                className="bg-[#0a2f2f] hover:bg-[#0a2f2f]/90 text-white"
                onClick={handleRequestCertification}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Solicitar Certificacao
              </Button>
            )}
            {isAwaitingCertification && (
              <Button variant="outline" disabled className="gap-2">
                <Lock className="h-4 w-4" />
                Aguardando Certificacao
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              CO2e Evitado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{metrics.co2eAvoided.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-foreground/60">toneladas de CO2 equivalente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Entrada Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.inputKg.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-foreground/60">kg de residuos processados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Evidencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{evidences.length}</div>
            <p className="text-xs text-foreground/60">arquivos anexados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Sensores IoT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{project.iot_sensors || 0}</div>
            <p className="text-xs text-foreground/60">dispositivos conectados</p>
          </CardContent>
        </Card>
      </div>

      {/* Blockchain Status */}
      {isBlockchainRegistered && (
        <Card className="border-[#0a2f2f]/30 bg-[#0a2f2f]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#0a2f2f]/10 p-2">
                <Shield className="h-5 w-5 text-[#0a2f2f]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#0a2f2f]">Registrado na Polygon</h3>
                <p className="text-sm text-foreground/60">
                  Este projeto foi certificado e registrado na blockchain Polygon.
                </p>
              </div>
              {project.polygon_tx_hash && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://polygonscan.com/tx/${project.polygon_tx_hash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver na Blockchain
                  </a>
                </Button>
              )}
            </div>
            {project.polygon_tx_hash && (
              <div className="mt-3 p-2 bg-background rounded border">
                <p className="text-xs text-foreground/60">Transaction Hash</p>
                <code className="text-xs break-all">{project.polygon_tx_hash}</code>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visao Geral</TabsTrigger>
          <TabsTrigger value="evidences">Evidencias ({evidences.length})</TabsTrigger>
          <TabsTrigger value="certification">Certificacao</TabsTrigger>
          <TabsTrigger value="timeline">Historico</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Descricao do Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 whitespace-pre-wrap">
                  {project.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informacoes Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-foreground/40" />
                  <div>
                    <p className="text-sm text-foreground/60">Instituicao</p>
                    <p className="font-medium">{project.institution?.name || "Organa Solucoes Ambientais"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-foreground/40" />
                  <div>
                    <p className="text-sm text-foreground/60">Localizacao</p>
                    <p className="font-medium">
                      {project.location_name || project.locationName}, {project.location_city || project.locationCity}/{project.location_state || project.locationState}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Leaf className="h-5 w-5 text-foreground/40" />
                  <div>
                    <p className="text-sm text-foreground/60">Categoria</p>
                    <p className="font-medium">{project.category}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-foreground/40" />
                  <div>
                    <p className="text-sm text-foreground/60">Periodo de Medicao</p>
                    <p className="font-medium">
                      {project.measurement_start ? new Date(project.measurement_start).toLocaleDateString("pt-BR") : "N/A"} - 
                      {project.measurement_end ? new Date(project.measurement_end).toLocaleDateString("pt-BR") : "Em andamento"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Impact Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Metricas de Impacto
              </CardTitle>
              <CardDescription>
                Dados coletados durante o periodo de medicao do projeto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <Scale className="h-4 w-4" />
                    Residuos Processados
                  </div>
                  <p className="text-2xl font-bold">{metrics.inputKg.toLocaleString("pt-BR")} kg</p>
                  <Progress value={100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <Leaf className="h-4 w-4" />
                    CO2 Equivalente Evitado
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{metrics.co2eAvoided} tCO2e</p>
                  <p className="text-xs text-foreground/60">Fator de emissao: 1.5 kg CO2e/kg</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <Thermometer className="h-4 w-4" />
                    Temperatura Media
                  </div>
                  <p className="text-2xl font-bold">55-65°C</p>
                  <p className="text-xs text-foreground/60">Faixa ideal para compostagem</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <Droplets className="h-4 w-4" />
                    Umidade Media
                  </div>
                  <p className="text-2xl font-bold">50-60%</p>
                  <p className="text-xs text-foreground/60">Faixa otima mantida</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidences Tab */}
        <TabsContent value="evidences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evidencias Anexadas</CardTitle>
              <CardDescription>
                Fotos, documentos e dados de sensores que comprovam o impacto ambiental
              </CardDescription>
            </CardHeader>
            <CardContent>
              {evidences.length === 0 ? (
                <div className="text-center py-8">
                  <FileCheck className="mx-auto h-12 w-12 text-foreground/30 mb-4" />
                  <p className="text-foreground/60">Nenhuma evidencia anexada ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {evidences.map((evidence: any, index: number) => {
                    const EvidenceIcon = EVIDENCE_ICONS[evidence.type] || FileText
                    return (
                      <div key={evidence.id || index} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="rounded-lg bg-muted p-2">
                          <EvidenceIcon className="h-5 w-5 text-foreground/60" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{evidence.description}</p>
                          <p className="text-sm text-foreground/60">
                            {evidence.type} - {new Date(evidence.captured_at || evidence.capturedAt || evidence.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        {evidence.gps_lat && evidence.gps_lng && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="mr-1 h-3 w-3" />
                            GPS
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certification Tab */}
        <TabsContent value="certification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status da Certificacao</CardTitle>
              <CardDescription>
                Acompanhe o processo de certificacao tecnica do projeto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Certification Timeline */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-2 ${project.status !== "DRAFT" ? "bg-emerald-500/10" : "bg-muted"}`}>
                    <FileCheck className={`h-5 w-5 ${project.status !== "DRAFT" ? "text-emerald-600" : "text-foreground/40"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Projeto Submetido</p>
                    <p className="text-sm text-foreground/60">Dados e evidencias enviados para analise</p>
                  </div>
                  {project.status !== "DRAFT" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                </div>

                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-2 ${project.status === "CERTIFIED" || project.status === "INSCRIBED" || project.status === "MINTED" ? "bg-emerald-500/10" : project.status === "SUBMITTED" ? "bg-amber-500/10" : "bg-muted"}`}>
                    <User className={`h-5 w-5 ${project.status === "CERTIFIED" || project.status === "INSCRIBED" || project.status === "MINTED" ? "text-emerald-600" : project.status === "SUBMITTED" ? "text-amber-600" : "text-foreground/40"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Analise Tecnica</p>
                    <p className="text-sm text-foreground/60">
                      {technicalReview?.analyst_id 
                        ? `Analista: ${technicalReview.analyst_name || "Dr. Ricardo Mendes"}` 
                        : "Aguardando atribuicao de analista"}
                    </p>
                  </div>
                  {(project.status === "CERTIFIED" || project.status === "INSCRIBED" || project.status === "MINTED") && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                  {project.status === "SUBMITTED" && <Clock className="h-5 w-5 text-amber-600" />}
                </div>

                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-2 ${isBlockchainRegistered ? "bg-emerald-500/10" : "bg-muted"}`}>
                    <Shield className={`h-5 w-5 ${isBlockchainRegistered ? "text-emerald-600" : "text-foreground/40"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Registro na Blockchain</p>
                    <p className="text-sm text-foreground/60">
                      {isBlockchainRegistered 
                        ? "Impacto registrado na Polygon" 
                        : "Aguardando certificacao para registro"}
                    </p>
                  </div>
                  {isBlockchainRegistered && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                </div>
              </div>

              {/* Technical Review Details */}
              {technicalReview && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">Parecer Tecnico</h4>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-foreground/60" />
                        <span className="text-sm">
                          <strong>Analista:</strong> {technicalReview.analyst_name || "Dr. Ricardo Mendes"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-foreground/60" />
                        <span className="text-sm">
                          <strong>Metodologia:</strong> {technicalReview.methodology || "IPCC 2006 Guidelines"}
                        </span>
                      </div>
                      {technicalReview.technical_report && (
                        <div className="mt-2">
                          <p className="text-sm text-foreground/80">{technicalReview.technical_report}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historico de Atividades</CardTitle>
              <CardDescription>
                Todas as acoes realizadas neste projeto
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-foreground/30 mb-4" />
                  <p className="text-foreground/60">Nenhuma atividade registrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log: any, index: number) => (
                    <div key={log.id || index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="rounded-full bg-[#0a2f2f]/10 p-2">
                          <Activity className="h-4 w-4 text-[#0a2f2f]" />
                        </div>
                        {index < auditLogs.length - 1 && (
                          <div className="w-px flex-1 bg-border my-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{log.action?.replace(/_/g, " ")}</p>
                        <p className="text-sm text-foreground/60">
                          {new Date(log.created_at || log.createdAt).toLocaleString("pt-BR")}
                        </p>
                        {log.details && (
                          <p className="text-sm text-foreground/80 mt-1">
                            {typeof log.details === "string" 
                              ? JSON.parse(log.details)?.message || log.details
                              : log.details?.message}
                          </p>
                        )}
                      </div>
                    </div>
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

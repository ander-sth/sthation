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
  Leaf,
  MapPin,
  Calendar,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Building2,
  Download,
  Pencil,
  Lock,
  Thermometer,
  Droplets,
  Activity,
  BarChart3,
  Scale,
  Eye,
  Trash2,
  ExternalLink,
  Hash,
  Shield,
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
  const [activeTab, setActiveTab] = useState("overview")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // Buscar dados do projeto
  const { data, isLoading, error, mutate } = useSWR(`/api/iac/${id}`, fetcher)

  // Buscar propostas de certificação para este projeto
  const { data: proposalsData, mutate: mutateProposals } = useSWR(
    data?.iac ? `/api/certification/proposals?iacId=${id}` : null,
    fetcher
  )
  const proposals = proposalsData?.proposals || []
  const [acceptingProposal, setAcceptingProposal] = useState<string | null>(null)

  // Função para gerar PDF do certificado
  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true)
    try {
      // Importar jsPDF dinamicamente
      const { default: jsPDF } = await import("jspdf")
      
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      
      // Header
      doc.setFillColor(10, 47, 47) // #0a2f2f
      doc.rect(0, 0, pageWidth, 40, "F")
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("CERTIFICADO DE IMPACTO AMBIENTAL", pageWidth / 2, 20, { align: "center" })
      
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text("STHation - Plataforma de Certificacao Ambiental", pageWidth / 2, 30, { align: "center" })
      
      // Reset text color
      doc.setTextColor(0, 0, 0)
      
      // Project Info
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Dados do Projeto", 20, 55)
      
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      
      let yPos = 65
      const lineHeight = 7
      
      doc.text(`Titulo: ${project.title}`, 20, yPos)
      yPos += lineHeight
      doc.text(`Categoria: ${project.category || "Ambiental"}`, 20, yPos)
      yPos += lineHeight
      doc.text(`Localizacao: ${project.location_name || ""}, ${project.location_state || ""}`, 20, yPos)
      yPos += lineHeight
      doc.text(`Data de Criacao: ${new Date(project.created_at).toLocaleDateString("pt-BR")}`, 20, yPos)
      yPos += lineHeight * 2
      
      // Metrics
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Metricas de Impacto", 20, yPos)
      yPos += lineHeight + 3
      
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.text(`Residuos Processados: ${(project.waste_processed || 0).toLocaleString("pt-BR")} kg`, 20, yPos)
      yPos += lineHeight
      doc.text(`CO2 Equivalente Evitado: ${project.co2_equivalent || 0} tCO2e/ano`, 20, yPos)
      yPos += lineHeight
      doc.text(`Energia Gerada: ${project.energy_generated || 0} kWh`, 20, yPos)
      yPos += lineHeight
      doc.text(`Sensores IoT: ${project.sensors_count || 0} dispositivos`, 20, yPos)
      yPos += lineHeight * 2
      
      // Certification Info
      if (project.status === "CERTIFIED" || project.polygon_tx_hash) {
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text("Dados da Certificacao", 20, yPos)
        yPos += lineHeight + 3
        
        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
        doc.text(`Status: Certificado`, 20, yPos)
        yPos += lineHeight
        doc.text(`Score de Certificacao: ${project.certification_score || "-"}/100`, 20, yPos)
        yPos += lineHeight
        if (project.certified_at) {
          doc.text(`Data de Certificacao: ${new Date(project.certified_at).toLocaleDateString("pt-BR")}`, 20, yPos)
          yPos += lineHeight
        }
        yPos += lineHeight
        
        // Hash Blockchain
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text("Registro Blockchain", 20, yPos)
        yPos += lineHeight + 3
        
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        if (project.polygon_tx_hash) {
          doc.text("Hash da Transacao (Polygon):", 20, yPos)
          yPos += lineHeight
          doc.setFont("courier", "normal")
          doc.text(project.polygon_tx_hash, 20, yPos)
          yPos += lineHeight * 2
        }
        
        // QR Code placeholder text
        doc.setFont("helvetica", "italic")
        doc.setFontSize(9)
        doc.text("Este certificado pode ser verificado na blockchain Polygon.", 20, yPos)
        yPos += lineHeight
        doc.text(`ID do Projeto: ${project.id}`, 20, yPos)
      }
      
      // Footer
      doc.setFillColor(240, 240, 240)
      doc.rect(0, 270, pageWidth, 30, "F")
      
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(8)
      doc.text("Documento gerado automaticamente pela plataforma STHation", pageWidth / 2, 280, { align: "center" })
      doc.text(`Data de emissao: ${new Date().toLocaleDateString("pt-BR")} as ${new Date().toLocaleTimeString("pt-BR")}`, pageWidth / 2, 286, { align: "center" })
      
      // Save
      doc.save(`certificado-${project.title.toLowerCase().replace(/\s+/g, "-")}.pdf`)
      
    } catch (err) {
      console.error("Erro ao gerar PDF:", err)
      alert("Erro ao gerar PDF. Tente novamente.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Função para aceitar proposta de certificação
  const handleAcceptProposal = async (proposalId: string) => {
    if (!confirm("Ao aceitar esta proposta, as outras serao recusadas automaticamente. Deseja continuar?")) {
      return
    }
    
    setAcceptingProposal(proposalId)
    try {
      const res = await fetch(`/api/certification/proposals/${proposalId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      
      if (res.ok) {
        alert("Proposta aceita! O certificador sera notificado para iniciar a analise.")
        mutate()
        mutateProposals()
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao aceitar proposta")
      }
    } catch (err) {
      alert("Erro ao aceitar proposta")
    } finally {
      setAcceptingProposal(null)
    }
  }

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

  // Calcular metricas usando campos corretos do banco de dados
  const metrics = {
    inputKg: project.waste_processed || project.input_kg || 0,
    outputKg: project.output_kg || 0,
    co2eAvoided: project.co2_equivalent || project.vca_score || 0,
    energyGenerated: project.energy_generated || 0,
    sensorsCount: project.sensors_count || 0,
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
            <Button 
              variant="outline" 
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isGeneratingPdf ? "Gerando..." : "Exportar PDF"}
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
            {project.status === "CERTIFIED" && !project.polygon_tx_hash && canEdit && (
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={async () => {
                  setIsSubmitting(true)
                  try {
                    const res = await fetch("/api/blockchain/inscribe", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ projectId: project.id })
                    })
                    const data = await res.json()
                    if (res.ok) {
                      alert(`Inscrito na blockchain! Hash: ${data.txHash}`)
                      mutate()
                    } else {
                      alert(data.error || "Erro ao inscrever")
                    }
                  } catch (e) {
                    alert("Erro de conexao")
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Hash className="mr-2 h-4 w-4" />
                )}
                Inscrever na Blockchain
              </Button>
            )}
            {project.polygon_tx_hash && (
              <Button variant="outline" className="text-purple-600 border-purple-300" asChild>
                <Link href={`/verificar?txHash=${project.polygon_tx_hash}`} target="_blank">
                  <Shield className="mr-2 h-4 w-4" />
                  Verificar Certificado
                </Link>
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
            <div className="text-3xl font-bold">{metrics.sensorsCount}</div>
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
<TabsTrigger value="overview">Visao Geral</TabsTrigger>
                <TabsTrigger value="evidences">Evidencias ({evidences.length})</TabsTrigger>
                <TabsTrigger value="certification" className={proposals.length > 0 ? "relative" : ""}>
                  Certificacao
                  {proposals.filter((p: any) => p.status === "PENDING").length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {proposals.filter((p: any) => p.status === "PENDING").length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="timeline">Historico</TabsTrigger>
              </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Alerta de Propostas Pendentes */}
          {proposals.filter((p: any) => p.status === "PENDING").length > 0 && (
            <div className="p-4 rounded-lg bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-400 animate-pulse">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-300">
                      Voce tem {proposals.filter((p: any) => p.status === "PENDING").length} proposta(s) de certificacao!
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Clique na aba "Certificacao" para ver os valores e aceitar uma proposta.
                    </p>
                  </div>
                </div>
                <Button 
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => setActiveTab("certification")}
                >
                  Ver Propostas
                </Button>
              </div>
            </div>
          )}

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

              {/* Propostas de Certificação */}
              {(project.status === "SUBMITTED" || project.status === "VALIDATED" || project.status === "CERTIFIED") && proposals.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Propostas de Certificacao Recebidas ({proposals.length})
                    </h4>
                    <div className="space-y-3">
                      {proposals.map((proposal: any) => (
                        <div 
                          key={proposal.id} 
                          className={`p-4 rounded-lg border ${
                            proposal.status === "ACCEPTED" 
                              ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/20" 
                              : proposal.status === "REJECTED"
                              ? "bg-red-50 border-red-300 dark:bg-red-950/20 opacity-60"
                              : "bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-foreground/60" />
                                <span className="font-medium">{proposal.certifier_name}</span>
                                {proposal.certifier_institution_name && (
                                  <Badge variant="outline" className="text-xs">
                                    {proposal.certifier_institution_name}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-2xl font-bold text-emerald-600">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(proposal.proposed_value)}
                              </p>
                              {proposal.message && (
                                <div className="flex items-start gap-2 mt-2 text-sm text-foreground/70">
                                  <MessageSquare className="h-4 w-4 mt-0.5" />
                                  <p>{proposal.message}</p>
                                </div>
                              )}
                              <p className="text-xs text-foreground/50">
                                Enviado em {new Date(proposal.created_at).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <div>
                              {proposal.status === "PENDING" && (
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => handleAcceptProposal(proposal.id)}
                                  disabled={acceptingProposal === proposal.id}
                                >
                                  {acceptingProposal === proposal.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                  )}
                                  Aceitar
                                </Button>
                              )}
                              {proposal.status === "ACCEPTED" && (
                                <Badge className="bg-emerald-600">Aceita</Badge>
                              )}
                              {proposal.status === "REJECTED" && (
                                <Badge variant="outline" className="text-red-600">Recusada</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Proposta Aceita - Em Certificação */}
              {project.status === "VALIDATED" && proposals.some((p: any) => p.status === "ACCEPTED") && (
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-400">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300">Proposta aceita! Projeto em certificacao</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        O certificador foi notificado e ira analisar seu projeto para emitir o certificado e hash blockchain.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Aguardando Propostas */}
              {project.status === "SUBMITTED" && proposals.length === 0 && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-400">Aguardando propostas de certificadores</p>
                      <p className="text-sm text-amber-700 dark:text-amber-500">
                        Certificadores estao analisando seu projeto. Voce sera notificado quando receberem propostas.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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

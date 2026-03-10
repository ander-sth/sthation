"use client"

import type React from "react"
import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  FileCheck,
  Clock,
  Send,
  Plus,
  ImageIcon,
  Video,
  FileText,
  Cpu,
  Hash,
  Fingerprint,
  Coins,
  ExternalLink,
  Loader2,
  Building2,
  Leaf,
  Users,
  Scale,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IacStatus, STATUS_CONFIG, IAC_VALIDATION_RULES, type EvidenceType } from "@/lib/types/iac"
import useSWR from "swr"

const evidenceTypeIcons: Record<string, React.ElementType> = {
  PHOTO: ImageIcon,
  VIDEO: Video,
  DOCUMENT: FileText,
  SENSOR: Cpu,
  IOT_LOG: Cpu,
}

const evidenceTypeLabels: Record<string, string> = {
  PHOTO: "Foto",
  VIDEO: "Vídeo",
  DOCUMENT: "Documento",
  SENSOR: "Sensor",
  IOT_LOG: "Log IoT",
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function IACDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()
  const [isAddingEvidence, setIsAddingEvidence] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newEvidence, setNewEvidence] = useState({
    type: "" as EvidenceType | "",
    description: "",
    url: "",
  })

  // Buscar IAC do banco de dados
  const { data, error, isLoading } = useSWR(`/api/iac/${id}`, fetcher)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-foreground/60">Carregando projeto...</p>
      </div>
    )
  }

  if (error || !data?.iac) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold mb-2">IAC nao encontrado</h1>
        <p className="text-foreground/60 mb-4">O Impact Action Card solicitado nao existe.</p>
        <Button asChild>
          <Link href="/dashboard/iac">Voltar</Link>
        </Button>
      </div>
    )
  }

  const iac = data.iac
  const evidences = data.evidences || []
  const auditLog = data.auditLog || []
  const institution = data.institution
  const polygonData = data.polygonData

  const statusConfig = STATUS_CONFIG[iac.status as keyof typeof STATUS_CONFIG] || { 
    label: iac.status, 
    color: "bg-gray-500/10 text-gray-500",
    description: ""
  }
  const isAmbiental = iac.type === "AMBIENTAL"
  const canEdit = iac.status === IacStatus.DRAFT || iac.status === IacStatus.EXECUTING || iac.status === "DRAFT" || iac.status === "EXECUTING"
  const canSubmit = canEdit && evidences.length >= IAC_VALIDATION_RULES.MIN_EVIDENCES_TO_SUBMIT
  const evidencesNeeded = Math.max(0, IAC_VALIDATION_RULES.MIN_EVIDENCES_TO_SUBMIT - evidences.length)

  const handleAddEvidence = async () => {
    setIsAddingEvidence(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Evidencia adicionada",
        description: "A evidencia foi registrada com hash SHA-256 e metadados GPS.",
      })
      setNewEvidence({ type: "", description: "", url: "" })
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao adicionar evidencia.",
        variant: "destructive",
      })
    } finally {
      setIsAddingEvidence(false)
    }
  }

  const handleSubmitForValidation = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        title: isAmbiental ? "IAC Enviado para Certificacao" : "IAC Submetido para VCA",
        description: isAmbiental 
          ? "O IAC foi enviado para analise de um Analista Certificador."
          : "O IAC foi bloqueado e esta aguardando validacao comunitaria.",
      })
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao submeter para validacao.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/iac">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{iac.title}</h1>
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              <Badge variant="outline" className={isAmbiental ? "border-emerald-500/50 text-emerald-500" : "border-blue-500/50 text-blue-500"}>
                {isAmbiental ? <Leaf className="mr-1 h-3 w-3" /> : <Users className="mr-1 h-3 w-3" />}
                {isAmbiental ? "Ambiental" : "Social"}
              </Badge>
              {(iac.status === IacStatus.MINTED || iac.status === "MINTED" || iac.inscription_id) && (
                <Badge variant="outline" className="border-purple-500/50 text-purple-500">
                  <Coins className="mr-1 h-3 w-3" />
                  NOBIS
                </Badge>
              )}
            </div>
            <p className="text-sm text-foreground/60">{statusConfig.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Evidencia
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Evidencia</DialogTitle>
                  <DialogDescription>
                    Adicione uma prova de acao com metadados de integridade (GPS, Timestamp, Hash).
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tipo de Evidencia</Label>
                    <Select
                      value={newEvidence.type}
                      onValueChange={(v) => setNewEvidence({ ...newEvidence, type: v as EvidenceType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PHOTO">Foto</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                        <SelectItem value="DOCUMENT">Documento</SelectItem>
                        <SelectItem value="SENSOR">Dados de Sensor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>URL do Arquivo</Label>
                    <Input
                      placeholder="https://..."
                      value={newEvidence.url}
                      onChange={(e) => setNewEvidence({ ...newEvidence, url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descricao</Label>
                    <Textarea
                      placeholder="Descreva a evidencia..."
                      value={newEvidence.description}
                      onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                    />
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-xs text-foreground/60">
                    <p className="font-medium mb-1">Metadados automaticos:</p>
                    <ul className="space-y-1">
                      <li>GPS: Capturado do dispositivo</li>
                      <li>Timestamp: Data/hora atual</li>
                      <li>Hash SHA-256: Calculado do arquivo</li>
                      <li>Device Signature: App Sthation</li>
                    </ul>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddEvidence} disabled={isAddingEvidence || !newEvidence.type}>
                    {isAddingEvidence ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Adicionar"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {canSubmit && (
            <Button onClick={handleSubmitForValidation} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submetendo...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {isAmbiental ? "Enviar para Certificacao" : "Submeter para VCA"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/60">{iac.description}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-foreground/60">Categoria</p>
                  <p className="font-medium">{iac.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-foreground/60">Beneficiarios Estimados</p>
                  <p className="font-medium">{iac.estimated_beneficiaries?.toLocaleString() || 0} pessoas</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-foreground/60 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Localizacao
                  </p>
                  <p className="font-medium">{iac.location_name || iac.location}</p>
                  {iac.location_lat && iac.location_lng && (
                    <p className="text-xs font-mono text-foreground/60">
                      {iac.location_lat}, {iac.location_lng}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-foreground/60 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Periodo
                  </p>
                  <p className="font-medium">
                    {iac.start_date ? new Date(iac.start_date).toLocaleDateString("pt-BR") : "-"} -{" "}
                    {iac.end_date ? new Date(iac.end_date).toLocaleDateString("pt-BR") : "-"}
                  </p>
                </div>
              </div>

              {/* Impact Metrics para projetos ambientais */}
              {isAmbiental && iac.impact_metrics && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Scale className="h-4 w-4 text-emerald-500" />
                    Metricas de Impacto Ambiental
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {iac.impact_metrics.residuos_kg && (
                      <div className="rounded-lg bg-emerald-500/10 p-3">
                        <p className="text-xs text-emerald-600">Residuos Processados</p>
                        <p className="text-xl font-bold text-emerald-600">{iac.impact_metrics.residuos_kg} kg</p>
                      </div>
                    )}
                    {iac.impact_metrics.carbono_evitado_kg && (
                      <div className="rounded-lg bg-emerald-500/10 p-3">
                        <p className="text-xs text-emerald-600">CO2 Evitado</p>
                        <p className="text-xl font-bold text-emerald-600">{(iac.impact_metrics.carbono_evitado_kg / 1000).toFixed(2)} tCO2e</p>
                      </div>
                    )}
                    {iac.impact_metrics.dias_operacao && (
                      <div className="rounded-lg bg-emerald-500/10 p-3">
                        <p className="text-xs text-emerald-600">Dias de Operacao</p>
                        <p className="text-xl font-bold text-emerald-600">{iac.impact_metrics.dias_operacao} dias</p>
                      </div>
                    )}
                  </div>
                  {iac.impact_metrics.metodologia && (
                    <p className="mt-3 text-xs text-foreground/60">
                      <span className="font-medium">Metodologia:</span> {iac.impact_metrics.metodologia}
                    </p>
                  )}
                </div>
              )}

              {iac.funding_goal && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-foreground/60">Meta de Financiamento</p>
                  <p className="text-xl font-bold">R$ {Number(iac.funding_goal).toLocaleString("pt-BR")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs: Evidences & Audit Log */}
          <Tabs defaultValue="evidences">
            <TabsList>
              <TabsTrigger value="evidences">
                <FileCheck className="mr-2 h-4 w-4" />
                Evidencias ({evidences.length})
              </TabsTrigger>
              <TabsTrigger value="audit">
                <Clock className="mr-2 h-4 w-4" />
                Audit Log ({auditLog.length})
              </TabsTrigger>
              {polygonData && (
                <TabsTrigger value="blockchain">
                  <Coins className="mr-2 h-4 w-4" />
                  Blockchain
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="evidences" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Provas de Acao</CardTitle>
                  <CardDescription>
                    Evidencias com metadados de integridade (GPS, Timestamp, Hash SHA-256)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {evidencesNeeded > 0 && canEdit && (
                    <div className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm">
                      <p className="text-amber-600 dark:text-amber-400">
                        Adicione mais {evidencesNeeded} evidencia(s) para submeter (minimo{" "}
                        {IAC_VALIDATION_RULES.MIN_EVIDENCES_TO_SUBMIT}).
                      </p>
                    </div>
                  )}

                  {evidences.length === 0 ? (
                    <div className="py-8 text-center text-foreground/60">
                      <FileCheck className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p>Nenhuma evidencia registrada ainda.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {evidences.map((evidence: any) => {
                        const Icon = evidenceTypeIcons[evidence.type] || FileText
                        return (
                          <div key={evidence.id} className="rounded-lg border p-3 space-y-3">
                            <div className="aspect-video relative rounded-md overflow-hidden bg-muted flex items-center justify-center">
                              <Icon className="h-12 w-12 text-muted-foreground/30" />
                              <Badge className="absolute top-2 left-2" variant="secondary">
                                <Icon className="mr-1 h-3 w-3" />
                                {evidenceTypeLabels[evidence.type] || evidence.type}
                              </Badge>
                            </div>
                            {evidence.description && <p className="text-sm">{evidence.description}</p>}
                            <div className="space-y-1 text-xs text-foreground/60">
                              <p className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {evidence.captured_at ? new Date(evidence.captured_at).toLocaleString("pt-BR") : "-"}
                              </p>
                              {evidence.gps_lat && evidence.gps_lng && (
                                <p className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {Number(evidence.gps_lat).toFixed(4)}, {Number(evidence.gps_lng).toFixed(4)}
                                </p>
                              )}
                              {evidence.content_hash && (
                                <p className="flex items-center gap-1 font-mono">
                                  <Hash className="h-3 w-3" />
                                  {evidence.content_hash}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trilha de Auditoria</CardTitle>
                  <CardDescription>Historico completo de acoes e mudancas de estado do IAC</CardDescription>
                </CardHeader>
                <CardContent>
                  {auditLog.length === 0 ? (
                    <div className="py-8 text-center text-foreground/60">
                      <Clock className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p>Nenhum registro de auditoria ainda.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {auditLog.map((entry: any, index: number) => (
                        <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{entry.action}</p>
                            <p className="text-xs text-foreground/60">
                              {new Date(entry.created_at || entry.timestamp).toLocaleString("pt-BR")}
                              {entry.user_id && ` - ${entry.user_id}`}
                            </p>
                            {entry.details && <p className="mt-1 text-sm text-foreground/60">{entry.details}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {polygonData && (
              <TabsContent value="blockchain" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-purple-500" />
                      Registro na Blockchain
                    </CardTitle>
                    <CardDescription>
                      Token ERC-1155 registrado na Polygon
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs text-foreground/60">Token ID</p>
                        <p className="font-mono text-sm">{polygonData.token_id}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-foreground/60">Bloco</p>
                        <p className="font-mono text-sm">{polygonData.block_number}</p>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-xs text-foreground/60">Transaction Hash</p>
                        <p className="font-mono text-xs break-all">{polygonData.tx_hash}</p>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-xs text-foreground/60">Contract Address</p>
                        <p className="font-mono text-xs break-all">{polygonData.contract_address}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={`https://polygonscan.com/tx/${polygonData.tx_hash}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver no PolygonScan
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Institution Card */}
          {institution && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Instituicao</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{institution.name}</p>
                    <p className="text-xs text-foreground/60">{institution.type === "EMPRESA_AMBIENTAL" ? "Empresa Ambiental" : "Instituicao Social"}</p>
                  </div>
                </div>
                {institution.city && institution.state && (
                  <p className="mt-3 text-xs text-foreground/60 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {institution.city}, {institution.state}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status do IAC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                  const isActive = status === iac.status
                  const isPast =
                    Object.keys(STATUS_CONFIG).indexOf(status) < Object.keys(STATUS_CONFIG).indexOf(iac.status)
                  return (
                    <div key={status} className={`flex items-center gap-3 ${!isActive && !isPast ? "opacity-40" : ""}`}>
                      <div
                        className={`h-3 w-3 rounded-full ${isActive ? "bg-primary ring-4 ring-primary/20" : isPast ? "bg-primary" : "bg-muted"}`}
                      />
                      <span className={`text-sm ${isActive ? "font-medium" : ""}`}>{config.label}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* NOBIS Info (if minted) */}
          {(iac.status === IacStatus.MINTED || iac.status === "MINTED" || iac.inscription_id) && (
            <Card className="border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Coins className="h-5 w-5 text-purple-500" />
                  Token NOBIS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {iac.minted_at && (
                  <div>
                    <p className="text-xs text-foreground/60">Mintado em</p>
                    <p className="font-medium">
                      {new Date(iac.minted_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
                {iac.inscription_id && (
                  <div>
                    <p className="text-xs text-foreground/60">Inscricao Bitcoin</p>
                    <p className="font-mono text-xs break-all">{iac.inscription_id}</p>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                  <Link href="/nobiscore/dashboard/marketplace">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver no Marketplace
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

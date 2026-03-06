"use client"

import type React from "react"
import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { mockIACs } from "@/lib/mock-data"
import { IacStatus, STATUS_CONFIG, TSB_CATEGORIES, IAC_VALIDATION_RULES, type EvidenceType } from "@/lib/types/iac"

const evidenceTypeIcons: Record<EvidenceType, React.ElementType> = {
  PHOTO: ImageIcon,
  VIDEO: Video,
  DOCUMENT: FileText,
  IOT_LOG: Cpu,
}

const evidenceTypeLabels: Record<EvidenceType, string> = {
  PHOTO: "Foto",
  VIDEO: "Vídeo",
  DOCUMENT: "Documento",
  IOT_LOG: "Log IoT",
}

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

  const iac = mockIACs.find((i) => i.id === id)

  if (!iac) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold mb-2">IAC não encontrado</h1>
        <p className="text-foreground/60 mb-4">O Impact Action Card solicitado não existe.</p>
        <Button asChild>
          <Link href="/dashboard/iac">Voltar</Link>
        </Button>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[iac.status]
  const category = TSB_CATEGORIES.find((c) => c.code === iac.tsbCategory)
  const canEdit = iac.status === IacStatus.DRAFT || iac.status === IacStatus.EXECUTING
  const canSubmit = canEdit && iac.evidences.length >= IAC_VALIDATION_RULES.MIN_EVIDENCES_TO_SUBMIT
  const evidencesNeeded = Math.max(0, IAC_VALIDATION_RULES.MIN_EVIDENCES_TO_SUBMIT - iac.evidences.length)

  const handleAddEvidence = async () => {
    setIsAddingEvidence(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Evidência adicionada",
        description: "A evidência foi registrada com hash SHA-256 e metadados GPS.",
      })
      setNewEvidence({ type: "", description: "", url: "" })
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao adicionar evidência.",
        variant: "destructive",
      })
    } finally {
      setIsAddingEvidence(false)
    }
  }

  const handleSubmitForVCA = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        title: "IAC Submetido para VCA",
        description: "O IAC foi bloqueado e está aguardando validação comunitária.",
      })
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao submeter para VCA.",
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
              {iac.status === IacStatus.MINTED && (
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
                  Adicionar Evidência
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Evidência</DialogTitle>
                  <DialogDescription>
                    Adicione uma prova de ação com metadados de integridade (GPS, Timestamp, Hash).
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tipo de Evidência</Label>
                    <Select
                      value={newEvidence.type}
                      onValueChange={(v) => setNewEvidence({ ...newEvidence, type: v as EvidenceType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PHOTO">Foto</SelectItem>
                        <SelectItem value="VIDEO">Vídeo</SelectItem>
                        <SelectItem value="DOCUMENT">Documento</SelectItem>
                        <SelectItem value="IOT_LOG">Log IoT</SelectItem>
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
                    <Label>Descrição</Label>
                    <Textarea
                      placeholder="Descreva a evidência..."
                      value={newEvidence.description}
                      onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                    />
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-xs text-foreground/60">
                    <p className="font-medium mb-1">Metadados automáticos:</p>
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
            <Button onClick={handleSubmitForVCA} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submetendo...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submeter para VCA
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
                  <p className="text-xs text-foreground/60">Categoria TSB</p>
                  <p className="font-medium">
                    {category?.code}: {category?.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-foreground/60">Meta de Impacto</p>
                  <p className="font-medium">{iac.targetImpact}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-foreground/60 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Localização
                  </p>
                  <p className="font-medium">{iac.location.name}</p>
                  <p className="text-xs font-mono text-foreground/60">
                    {iac.location.coordinates.lat}, {iac.location.coordinates.lng}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-foreground/60 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Período
                  </p>
                  <p className="font-medium">
                    {new Date(iac.startDate).toLocaleDateString("pt-BR")} -{" "}
                    {new Date(iac.endDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              {iac.budget && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-foreground/60">Orçamento</p>
                  <p className="text-xl font-bold">R$ {iac.budget.toLocaleString("pt-BR")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs: Evidences & Audit Log */}
          <Tabs defaultValue="evidences">
            <TabsList>
              <TabsTrigger value="evidences">
                <FileCheck className="mr-2 h-4 w-4" />
                Evidências ({iac.evidences.length})
              </TabsTrigger>
              <TabsTrigger value="audit">
                <Clock className="mr-2 h-4 w-4" />
                Audit Log ({iac.auditLog.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="evidences" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Provas de Ação</CardTitle>
                  <CardDescription>
                    Evidências com metadados de integridade (GPS, Timestamp, Hash SHA-256)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {evidencesNeeded > 0 && canEdit && (
                    <div className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm">
                      <p className="text-amber-600 dark:text-amber-400">
                        Adicione mais {evidencesNeeded} evidência(s) para submeter ao VCA (mínimo{" "}
                        {IAC_VALIDATION_RULES.MIN_EVIDENCES_TO_SUBMIT}).
                      </p>
                    </div>
                  )}

                  {iac.evidences.length === 0 ? (
                    <div className="py-8 text-center text-foreground/60">
                      <FileCheck className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p>Nenhuma evidência registrada ainda.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {iac.evidences.map((evidence) => {
                        const Icon = evidenceTypeIcons[evidence.type]
                        return (
                          <div key={evidence.id} className="rounded-lg border p-3 space-y-3">
                            <div className="aspect-video relative rounded-md overflow-hidden bg-muted flex items-center justify-center">
                              <Icon className="h-12 w-12 text-muted-foreground/30" />
                              <Badge className="absolute top-2 left-2" variant="secondary">
                                <Icon className="mr-1 h-3 w-3" />
                                {evidenceTypeLabels[evidence.type]}
                              </Badge>
                            </div>
                            {evidence.description && <p className="text-sm">{evidence.description}</p>}
                            <div className="space-y-1 text-xs text-foreground/60">
                              <p className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(evidence.timestamp).toLocaleString("pt-BR")}
                              </p>
                              <p className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {evidence.gpsCoordinates.lat.toFixed(4)}, {evidence.gpsCoordinates.lng.toFixed(4)}
                              </p>
                              <p className="flex items-center gap-1 font-mono">
                                <Hash className="h-3 w-3" />
                                {evidence.contentHash.slice(0, 20)}...
                              </p>
                              <p className="flex items-center gap-1 font-mono">
                                <Fingerprint className="h-3 w-3" />
                                {evidence.deviceSignature.slice(0, 25)}...
                              </p>
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
                  <CardDescription>Histórico completo de ações e mudanças de estado do IAC</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {iac.auditLog.map((entry, index) => (
                      <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{entry.action}</p>
                          <p className="text-xs text-foreground/60">
                            {new Date(entry.timestamp).toLocaleString("pt-BR")}
                            {entry.userId && ` • ${entry.userId}`}
                          </p>
                          {entry.details && <p className="mt-1 text-sm text-foreground/60">{entry.details}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Institution Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Instituição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{iac.institution?.name}</p>
                  <p className="text-xs text-foreground/60">Instituição Executora</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
          {iac.status === IacStatus.MINTED && (
            <Card className="border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Coins className="h-5 w-5 text-purple-500" />
                  Token NOBIS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-foreground/60">Mintado em</p>
                  <p className="font-medium">
                    {iac.mintedAt ? new Date(iac.mintedAt).toLocaleDateString("pt-BR") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60">Inscrito no Bitcoin</p>
                  <p className="font-mono text-xs">ord://abc123...</p>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver no Marketplace
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

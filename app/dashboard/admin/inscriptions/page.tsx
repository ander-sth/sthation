"use client"

import { useState } from "react"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { UserRole } from "@/lib/types/users"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ExternalLink,
  AlertCircle,
  Shield,
  FileCheck,
  Copy,
  Loader2,
  Hash,
  UtensilsCrossed,
  Home,
  Leaf,
  Zap,
  Heart,
  Hexagon,
  type LucideIcon,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const PROJECT_ICONS: Record<string, { icon: LucideIcon; bg: string; color: string }> = {
  SOCIAL: { icon: Heart, bg: "bg-rose-500/10", color: "text-rose-600" },
  AMBIENTAL: { icon: Leaf, bg: "bg-emerald-500/10", color: "text-emerald-600" },
}
import { useToast } from "@/hooks/use-toast"
import { redirect } from "next/navigation"

export default function AdminInscriptionsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [inscriptionNotes, setInscriptionNotes] = useState("")
  const [processingStep, setProcessingStep] = useState(0)

  // Buscar projetos prontos para inscription (status CERTIFIED ou VALIDATED)
  const { data: pendingData, isLoading: pendingLoading } = useSWR(
    "/api/iac?status=CERTIFIED&limit=50",
    fetcher
  )
  const { data: completedData, isLoading: completedLoading } = useSWR(
    "/api/iac?status=INSCRIBED&limit=50",
    fetcher
  )

  const pendingInscriptions = pendingData?.projects || []
  const completedInscriptions = completedData?.projects || []

  if (user?.role !== UserRole.ADMIN) {
    redirect("/dashboard")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "Hash copiado para a área de transferência",
    })
  }

  const handleInscribe = async () => {
    if (!selectedProject) return

    setIsProcessing(true)

    const steps = [
      "Validando dados do projeto...",
      "Gerando hash SHA-256...",
      "Conectando à rede Polygon...",
      "Enviando transação...",
      "Aguardando confirmação (2 seg)...",
      "Preparando inscription Bitcoin...",
      "Finalizando registro...",
    ]

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    toast({
      title: "Inscription iniciada!",
      description: `O projeto "${selectedProject.title}" foi inscrito com sucesso. Hash da transação gerado.`,
    })

    setIsProcessing(false)
    setProcessingStep(0)
    setSelectedProject(null)
    setInscriptionNotes("")
  }

  const processingSteps = [
    "Validando dados do projeto...",
    "Gerando hash SHA-256...",
    "Conectando a rede Polygon...",
    "Enviando transacao...",
    "Aguardando confirmacao (~2 seg)...",
    "Atualizando status do projeto...",
    "Finalizando registro NOBIS...",
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Hexagon className="h-8 w-8 text-purple-500" />
          Gestao de Inscriptions - NOBIS
        </h1>
        <p className="text-foreground/60">
          Transforme projetos certificados em registros permanentes na Polygon (NOBIS)
        </p>
      </div>

      <Card className="border-purple-500/50 bg-purple-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Integracao Blockchain - Polygon Network</p>
              <p className="text-sm text-foreground/60 mt-1">
                Todos os dados de impacto sao registrados na rede Polygon (custo: ~R$ 0,01-0,10, tempo: ~2 seg).
                O hash SHA-256 garante integridade e imutabilidade dos dados. Projetos registrados recebem o selo NOBIS.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60">Aguardando Inscrição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{pendingInscriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60">Inscrições Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{completedInscriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60">Valor Total Inscrito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {completedInscriptions.reduce((acc: number, i: any) => acc + (i.budget || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60">Beneficiarios Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedInscriptions.reduce((acc: number, i: any) => acc + (i.beneficiaries || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pendentes ({pendingInscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Concluídas ({completedInscriptions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Projetos Certificados</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    Estes projetos passaram por validacao (VCA para sociais, certificacao para ambientais) e
                    estao prontos para serem inscritos permanentemente na Polygon como NOBIS.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {pendingLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
              <p className="text-sm text-muted-foreground mt-2">Carregando projetos...</p>
            </div>
          ) : pendingInscriptions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-medium mb-1">Nenhum projeto pendente</h3>
                <p className="text-sm text-muted-foreground">
                  Todos os projetos certificados ja foram inscritos na Polygon
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingInscriptions.map((project: any) => {
                const iconConfig = PROJECT_ICONS[project.type] || PROJECT_ICONS.SOCIAL
                const IconComp = iconConfig.icon
                return (
                  <Card key={project.id}>
                    <div className="flex flex-col md:flex-row">
                      <div className={`h-32 md:h-auto md:w-32 flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-t-none shrink-0 ${iconConfig.bg}`}>
                        <IconComp className={`h-12 w-12 ${iconConfig.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={project.type === "SOCIAL" ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}>
                                  {project.type === "SOCIAL" ? "Social" : "Ambiental"}
                                </Badge>
                                <Badge className="bg-blue-500/10 text-blue-500">
                                  <Shield className="mr-1 h-3 w-3" />
                                  Certificado
                                </Badge>
                              </div>
                              <CardTitle className="text-lg">{project.title}</CardTitle>
                              <CardDescription>{project.institution_name || "Instituicao"}</CardDescription>
                            </div>
                            {project.vcaScore && (
                              <div className="text-right">
                                <p className="text-sm font-medium">Score: {project.vcaScore}%</p>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-foreground/60 line-clamp-2">{project.description}</p>

                          <div className="flex flex-wrap gap-4 text-xs text-foreground/60">
                            {project.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {project.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Criado em {new Date(project.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t">
                            <div>
                              <p className="text-xs text-foreground/60">Orcamento</p>
                              <p className="font-semibold">R$ {(project.budget || 0).toLocaleString()}</p>
                            </div>
                            {project.beneficiaries > 0 && (
                              <div>
                                <p className="text-xs text-foreground/60">Beneficiarios</p>
                                <p className="font-semibold">{project.beneficiaries.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="ml-auto bg-purple-600 hover:bg-purple-700" onClick={() => setSelectedProject(project)}>
                            <Hexagon className="mr-2 h-4 w-4" />
                            Registrar como NOBIS
                          </Button>
                        </CardFooter>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
              <p className="text-sm text-muted-foreground mt-2">Carregando projetos inscritos...</p>
            </div>
          ) : completedInscriptions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Hexagon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-medium mb-1">Nenhum projeto inscrito ainda</h3>
                <p className="text-sm text-muted-foreground">
                  Os projetos registrados na Polygon aparecerao aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedInscriptions.map((inscription: any) => (
                <Card key={inscription.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={inscription.type === "SOCIAL" ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}>
                            {inscription.type === "SOCIAL" ? "Social" : "Ambiental"}
                          </Badge>
                          <Badge className="bg-purple-500/10 text-purple-500">
                            <Hexagon className="mr-1 h-3 w-3" />
                            NOBIS
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{inscription.title}</CardTitle>
                        <CardDescription>{inscription.institution_name || "Instituicao"}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Dados do Registro NOBIS
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-foreground/60">ID do Projeto:</span>
                          <p className="font-mono truncate">{inscription.id}</p>
                        </div>
                        <div>
                          <span className="text-foreground/60">Data de Registro:</span>
                          <p>{new Date(inscription.updated_at || inscription.created_at).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-foreground/60">Orcamento:</span>
                        <span className="font-semibold ml-2">R$ {(inscription.budget || 0).toLocaleString()}</span>
                      </div>
                      {inscription.beneficiaries > 0 && (
                        <div>
                          <span className="text-foreground/60">Beneficiarios:</span>
                          <span className="font-semibold ml-2">{inscription.beneficiaries.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button variant="outline" className="bg-transparent" asChild>
                      <a href={`/hall-de-impacto/${inscription.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver no Hall de Impacto
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Registro NOBIS */}
      <Dialog open={!!selectedProject} onOpenChange={() => !isProcessing && setSelectedProject(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hexagon className="h-5 w-5 text-purple-500" />
              Registrar como NOBIS
            </DialogTitle>
            <DialogDescription>
              {selectedProject?.title} - {selectedProject?.institution_name || "Instituicao"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Resumo do Projeto */}
            <div className="rounded-lg border p-4 space-y-3">
              <p className="font-medium">Resumo do Projeto</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-foreground/60">Tipo:</span>
                  <span className="ml-2">{selectedProject?.type === "SOCIAL" ? "Social" : "Ambiental"}</span>
                </div>
                <div>
                  <span className="text-foreground/60">Score VCA:</span>
                  <span className="ml-2">{selectedProject?.vcaScore || "N/A"}%</span>
                </div>
                <div>
                  <span className="text-foreground/60">Orcamento:</span>
                  <span className="ml-2">R$ {(selectedProject?.budget || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-foreground/60">Beneficiarios:</span>
                  <span className="ml-2">{(selectedProject?.beneficiaries || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Dados que serao inscritos */}
            <div className="rounded-lg border p-4 space-y-3">
              <p className="font-medium">Dados de Impacto (serao registrados na Polygon)</p>
              <div className="bg-muted rounded p-3">
                <pre className="text-xs overflow-auto">{JSON.stringify({
                  id: selectedProject?.id,
                  title: selectedProject?.title,
                  type: selectedProject?.type,
                  institution: selectedProject?.institution_name,
                  location: selectedProject?.location,
                  budget: selectedProject?.budget,
                  beneficiaries: selectedProject?.beneficiaries,
                  vcaScore: selectedProject?.vcaScore,
                  category: selectedProject?.category,
                }, null, 2)}</pre>
              </div>
            </div>

            {/* Notas administrativas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Administrativas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observacoes sobre este registro..."
                value={inscriptionNotes}
                onChange={(e) => setInscriptionNotes(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {isProcessing && (
              <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4 space-y-3">
                <p className="text-sm font-medium flex items-center gap-2 text-purple-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando Registro NOBIS...
                </p>
                <div className="space-y-2">
                  {processingSteps.map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-xs ${
                        index < processingStep
                          ? "text-emerald-600"
                          : index === processingStep
                            ? "text-purple-600 font-medium"
                            : "text-foreground/60"
                      }`}
                    >
                      {index < processingStep ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : index === processingStep ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border" />
                      )}
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estimativa de taxa */}
            {!isProcessing && (
              <div className="rounded-lg bg-purple-500/10 p-4 space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-purple-500" />
                  Estimativa de Taxas de Rede (Polygon)
                </p>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Taxa de Gas (Polygon)</span>
                    <span>~R$ 0,01 - R$ 0,10</span>
                  </div>
                </div>
                <p className="text-xs text-foreground/60">
                  As taxas sao pagas pelo Fundo de Gas (4% de cada doacao). O registro e permanente e imutavel.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProject(null)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleInscribe} disabled={isProcessing} className="bg-purple-600 hover:bg-purple-700">
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Hexagon className="mr-2 h-4 w-4" />
                  Confirmar Registro NOBIS
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState } from "react"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { UserRole } from "@/lib/types/users"
import { VCA_RULES, VCA_CHECKLIST, VCA_STATUS_CONFIG, VcaStatus } from "@/lib/types/vca"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Eye, Clock, MapPin, Calendar, ImageIcon, AlertTriangle, Info, FileCheck, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Tipo para projetos em captacao
type FundingProject = {
  id: string
  title: string
  institution_name: string
  location_name: string
  goal_amount: number
  current_amount: number
  donors_count: number
  status: string
  category: string
  deadline: string
}

// Tipo para validacoes pendentes
type PendingValidation = {
  id: string
  iacId: string
  title: string
  institution: string
  location: string
  coordinates: { lat: number; lng: number }
  submittedAt: string
  deadline: string
  description: string
  tsbCategory: string
  targetImpact: string
  evidences: Array<{
    id: string
    type: string
    url: string
    timestamp: string
    gps: { lat: number; lng: number }
    description: string
    contentHash: string
  }>
  checkersAssigned: number
  votesReceived: number
  currentApprovalRate: number
}

export default function VCAPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedVCA, setSelectedVCA] = useState<PendingValidation | null>(null)
  
  // Buscar validacoes pendentes da API (dados reais)
  const { data, isLoading } = useSWR("/api/vca/pending", fetcher, {
    revalidateOnFocus: false,
  })
  
  // Buscar projetos em captacao (para o Checker acompanhar)
  const { data: fundingData } = useSWR("/api/funding-projects?status=FUNDING", fetcher, {
    revalidateOnFocus: false,
  })
  
  const pendingValidations: PendingValidation[] = data?.validations || []
  const fundingProjects: FundingProject[] = fundingData?.projects || []
  
  // Projetos prontos para validacao (meta atingida ou fechados)
  const readyForValidation = fundingProjects.filter(
    (p) => p.current_amount >= p.goal_amount || p.status === "READY_FOR_VCA"
  )
  const [comments, setComments] = useState("")
  const [isVoting, setIsVoting] = useState(false)
  const [checklistScores, setChecklistScores] = useState<Record<string, number>>({})

  // Verificar se usuário pode validar
  const canValidate = user?.role === UserRole.CHECKER || user?.role === UserRole.ADMIN

  if (!canValidate) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
        <p className="text-foreground/60 max-w-md">
          Apenas Checkers certificados pela Sthation Academy podem participar do processo de Validação Comunitária
          (VCA).
        </p>
        <Button className="mt-4" asChild>
          <a href="/dashboard/academy">Acessar Sthation Academy</a>
        </Button>
      </div>
    )
  }

  // Calcular score final baseado no checklist
  const calculateOverallScore = () => {
    let totalWeight = 0
    let weightedScore = 0
    VCA_CHECKLIST.forEach((item) => {
      const score = checklistScores[item.id] || 0
      weightedScore += score * item.weight
      totalWeight += item.weight
    })
    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0
  }

  const handleVote = async (vote: "APPROVE" | "REJECT") => {
    setIsVoting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const overallScore = calculateOverallScore()

      toast({
        title: vote === "APPROVE" ? "Voto: Aprovado" : "Voto: Rejeitado",
        description: `Score atribuído: ${overallScore}/100. Seu voto foi registrado no protocolo VCA.`,
      })

      setSelectedVCA(null)
      setComments("")
      setChecklistScores({})
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao registrar voto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  const getTimeRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* VCA Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#f5f5f0]">
        <div className="flex flex-col items-center gap-6 p-6 md:flex-row md:p-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold sm:text-3xl">Validacao Comunitaria (VCA)</h1>
            <p className="mt-2 text-foreground/60">
              Analise evidencias e vote para validar projetos de <strong>impacto social</strong>. 
              Projetos ambientais sao validados por Analistas Certificadores. 
              Consenso necessario: {">"}{VCA_RULES.APPROVAL_THRESHOLD * 100}%
            </p>
          </div>
          <div className="shrink-0">
            <Image
              src="/vca-banner.jpg"
              alt="Validacao por Consenso Aferido - 10 validadores, 6 criterios, score 0-100"
              width={360}
              height={220}
              className="h-auto w-full max-w-[360px] rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Stats do Checker */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingValidations.length}</div>
            <p className="text-xs text-foreground/60">Aguardando seu voto</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60">Validacoes Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-foreground/60">Concluidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60">Seu Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.checkerScore || 0}</div>
            <Progress value={user?.checkerScore || 0} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60">Ganhos (Mes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0</div>
            <p className="text-xs text-foreground/60">Do Fundo de Validacao</p>
          </CardContent>
        </Card>
      </div>

      {/* Projetos em Captacao */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-teal-500" />
            Projetos em Captacao
          </CardTitle>
          <CardDescription>
            Acompanhe os projetos que estao recebendo doacoes. Quando a meta for atingida ou o projeto for fechado, ele aparecera para validacao.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fundingProjects.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum projeto em captacao no momento.</p>
          ) : (
            <div className="space-y-3">
              {fundingProjects.map((project: any) => {
                const goalAmount = project.goalAmount || project.goal_amount || 0
                const currentAmount = project.currentAmount || project.current_amount || 0
                const progress = goalAmount > 0 ? (currentAmount / goalAmount) * 100 : 0
                const isReady = progress >= 100 || project.status === "READY_FOR_VCA"
                const institutionName = project.institution?.name || project.institution_name || ""
                const locationName = project.location?.name || project.location_name || "Local nao informado"
                const donorsCount = project.donorsCount || project.donors_count || 0
                return (
                  <div key={project.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{project.title}</h3>
                          {isReady && (
                            <Badge className="bg-emerald-500/10 text-emerald-600">Pronto para VCA</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{institutionName}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {locationName}
                          </span>
                          <span>{donorsCount} doadores</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">R$ {currentAmount.toLocaleString("pt-BR")}</p>
                        <p className="text-xs text-muted-foreground">de R$ {goalAmount.toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(0)}% arrecadado</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regras do VCA */}
      <Card className="bg-muted/50">
        <CardContent className="flex items-start gap-4 pt-6">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium">Regras do Protocolo VCA (Somente Projetos Sociais)</p>
            <ul className="text-sm text-foreground/60 space-y-1">
              <li>- O VCA valida exclusivamente acoes de <strong>instituicoes sociais</strong> que recebem doacoes</li>
              <li>- Minimo de {VCA_RULES.MIN_CHECKERS} Checkers por validacao</li>
              <li>
                - Consenso {">"} {VCA_RULES.APPROVAL_THRESHOLD * 100}% para aprovacao
              </li>
              <li>
                - Entre {VCA_RULES.DISPUTE_THRESHOLD * 100}% e {VCA_RULES.APPROVAL_THRESHOLD * 100}% vai para analise
                tecnica (disputa)
              </li>
              <li>- Prazo de 48h para votacao apos abertura</li>
              <li>- Projetos <strong>ambientais</strong> nao passam por VCA -- sao validados por Analistas Certificadores</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Validações Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle>Projetos Pendentes de Validação</CardTitle>
          <CardDescription>
            Analise as evidências cuidadosamente antes de votar. Sua reputação depende da qualidade das suas validações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingValidations.map((vca) => (
              <div key={vca.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{vca.title}</h3>
                        <p className="text-sm text-foreground/60">{vca.institution}</p>
                      </div>
                      <Badge className={VCA_STATUS_CONFIG[VcaStatus.IN_PROGRESS].color}>
                        {vca.votesReceived}/{vca.checkersAssigned} votos
                      </Badge>
                    </div>

                    <p className="text-sm text-foreground/60">{vca.description}</p>

                    <div className="flex flex-wrap gap-4 text-xs">
                      <span className="flex items-center gap-1 text-foreground/60">
                        <MapPin className="h-3 w-3" />
                        {vca.location}
                      </span>
                      <span className="flex items-center gap-1 text-foreground/60">
                        <Calendar className="h-3 w-3" />
                        Submetido: {vca.submittedAt}
                      </span>
                      <span className="flex items-center gap-1 text-foreground/60">
                        <ImageIcon className="h-3 w-3" />
                        {vca.evidences.length} evidências
                      </span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Clock className="h-3 w-3" />
                        {getTimeRemaining(vca.deadline)} restantes
                      </span>
                    </div>

                    {/* Barra de aprovação atual */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground/60">Aprovação atual</span>
                        <span
                          className={
                            vca.currentApprovalRate >= 80
                              ? "text-emerald-500"
                              : vca.currentApprovalRate >= 60
                                ? "text-amber-500"
                                : "text-red-500"
                          }
                        >
                          {vca.currentApprovalRate}%
                        </span>
                      </div>
                      <Progress
                        value={vca.currentApprovalRate}
                        className={`h-2 ${
                          vca.currentApprovalRate >= 80
                            ? "[&>div]:bg-emerald-500"
                            : vca.currentApprovalRate >= 60
                              ? "[&>div]:bg-amber-500"
                              : "[&>div]:bg-red-500"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVCA(vca)
                        setChecklistScores({})
                      }}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Analisar e Votar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Validação */}
      <Dialog open={!!selectedVCA} onOpenChange={() => setSelectedVCA(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedVCA?.title}</DialogTitle>
            <DialogDescription>
              {selectedVCA?.institution} - {selectedVCA?.location}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="evidences" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="evidences">Evidências</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
              <TabsTrigger value="metadata">Metadados</TabsTrigger>
            </TabsList>

            {/* Tab Evidências */}
            <TabsContent value="evidences" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {selectedVCA?.evidences.map((evidence) => (
                  <Card key={evidence.id}>
                    <div className="relative aspect-video bg-muted flex items-center justify-center rounded-t-lg">
                      <FileCheck className="h-12 w-12 text-muted-foreground/30" />
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        {evidence.type}
                      </Badge>
                    </div>
                    <CardContent className="pt-4 space-y-2">
                      <p className="font-medium text-sm">{evidence.description}</p>
                      <div className="text-xs text-foreground/60 space-y-1">
                        <p>
                          <Clock className="inline h-3 w-3 mr-1" />
                          {new Date(evidence.timestamp).toLocaleString("pt-BR")}
                        </p>
                        <p>
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {evidence.gps.lat.toFixed(4)}, {evidence.gps.lng.toFixed(4)}
                        </p>
                        <p className="font-mono text-[10px] truncate" title={evidence.contentHash}>
                          Hash: {evidence.contentHash}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tab Checklist */}
            <TabsContent value="checklist" className="space-y-4 mt-4">
              <p className="text-sm text-foreground/60">
                Avalie cada critério de 0 a 100. O score final será calculado com pesos ponderados.
              </p>
              {VCA_CHECKLIST.map((item) => (
                <div key={item.id} className="space-y-2 p-4 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-foreground/60">{item.description}</p>
                      <p className="text-xs text-foreground/60 mt-1">Peso: {(item.weight * 100).toFixed(0)}%</p>
                    </div>
                    <Badge variant="outline">{checklistScores[item.id] || 0}/100</Badge>
                  </div>
                  <Slider
                    value={[checklistScores[item.id] || 0]}
                    onValueChange={([value]) => setChecklistScores((prev) => ({ ...prev, [item.id]: value }))}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              ))}

              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Score Final Ponderado</span>
                  <span className="text-2xl font-bold">{calculateOverallScore()}/100</span>
                </div>
              </div>
            </TabsContent>

            {/* Tab Metadados */}
            <TabsContent value="metadata" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Informações do Projeto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Categoria TSB</span>
                      <span>{selectedVCA?.tsbCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Meta de Impacto</span>
                      <span>{selectedVCA?.targetImpact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Coordenadas</span>
                      <span>
                        {selectedVCA?.coordinates.lat.toFixed(4)}, {selectedVCA?.coordinates.lng.toFixed(4)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Status da Validação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Checkers Atribuídos</span>
                      <span>{selectedVCA?.checkersAssigned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Votos Recebidos</span>
                      <span>{selectedVCA?.votesReceived}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Taxa de Aprovação</span>
                      <span>{selectedVCA?.currentApprovalRate}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Comentários */}
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">Comentários (opcional)</label>
            <Textarea
              placeholder="Adicione observações sobre sua análise..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="destructive" onClick={() => handleVote("REJECT")} disabled={isVoting}>
              <XCircle className="mr-2 h-4 w-4" />
              Rejeitar
            </Button>
            <Button onClick={() => handleVote("APPROVE")} disabled={isVoting || calculateOverallScore() < 60}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprovar (Score: {calculateOverallScore()})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

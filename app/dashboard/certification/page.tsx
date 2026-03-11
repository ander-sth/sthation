"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Leaf,
  MapPin,
  Calendar,
  Building2,
  FileCheck,
  Loader2,
  Eye,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  Search,
  Filter,
  Award,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function CertificationPage() {
  const { user } = useAuth()
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showProposalDialog, setShowProposalDialog] = useState(false)
  const [proposalValue, setProposalValue] = useState("")
  const [proposalMessage, setProposalMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Buscar projetos aguardando certificação (para enviar proposta)
  const { data, isLoading, mutate } = useSWR("/api/certification/pending-projects", fetcher)

  // Buscar projetos onde minha proposta foi aceita (para analisar e certificar)
  const { data: myProjectsData, isLoading: loadingMyProjects } = useSWR(
    user?.id ? `/api/certification/my-projects?certifierId=${user.id}` : null,
    fetcher
  )

  const projects = data?.projects || []
  const myProjects = myProjectsData?.projects || []

  // Filtrar projetos
  const filteredProjects = projects.filter((p: any) =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.institution_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Enviar proposta de certificação
  const handleSubmitProposal = async () => {
    if (!selectedProject || !proposalValue) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/certification/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          iacId: selectedProject.id,
          proposedValue: parseFloat(proposalValue),
          message: proposalMessage,
          certifierId: user?.id,
          certifierInstitutionId: user?.institutionId,
        }),
      })

      if (res.ok) {
        alert("Proposta enviada com sucesso!")
        setShowProposalDialog(false)
        setProposalValue("")
        setProposalMessage("")
        setSelectedProject(null)
        mutate()
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao enviar proposta")
      }
    } catch (err) {
      alert("Erro ao enviar proposta")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: string) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      TRATAMENTO_RESIDUOS: "Tratamento de Residuos",
      ENERGIA_RENOVAVEL: "Energia Renovavel",
      REFLORESTAMENTO: "Reflorestamento",
      CONSERVACAO_AGUA: "Conservacao de Agua",
      AGRICULTURA_SUSTENTAVEL: "Agricultura Sustentavel",
      MOBILIDADE_VERDE: "Mobilidade Verde",
    }
    return categories[category] || category
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projetos para Certificacao</h1>
          <p className="text-muted-foreground">
            Analise projetos ambientais e envie propostas de certificacao
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-2">
          <Clock className="h-4 w-4" />
          {filteredProjects.length} projeto(s) aguardando
        </Badge>
      </div>

      {/* Projetos para Analisar (proposta aceita) */}
      {myProjects.length > 0 && (
        <Card className="border-2 border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg">Projetos para Analisar e Certificar</CardTitle>
            </div>
            <CardDescription>
              Sua proposta foi aceita! Analise as evidencias e emita o certificado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myProjects.map((project: any) => (
                <div 
                  key={project.id} 
                  className="flex items-center justify-between p-4 bg-white dark:bg-background rounded-lg border"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold">{project.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {project.institution_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {project.location_name}, {project.location_state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-emerald-600 text-white">
                        Valor: {formatCurrency(project.proposed_value)}
                      </Badge>
                      {project.status === "VALIDATED" && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Aguardando Analise
                        </Badge>
                      )}
                      {project.status === "CERTIFIED" && (
                        <Badge className="bg-emerald-600">Certificado</Badge>
                      )}
                    </div>
                  </div>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href={`/dashboard/certification/${project.id}/analyze`}>
                      {project.status === "VALIDATED" ? (
                        <>
                          <Award className="mr-2 h-4 w-4" />
                          Analisar e Certificar
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Certificado
                        </>
                      )}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Busca */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por titulo ou instituicao..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Projetos */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-lg mb-1">Nenhum projeto aguardando certificacao</h3>
            <p className="text-sm text-muted-foreground">
              Quando empresas ambientais solicitarem certificacao, os projetos aparecerão aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project: any) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-300">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Aguardando Certificacao
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-2 line-clamp-2">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{project.institution_name || "Instituicao nao informada"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location_name}, {project.location_state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Leaf className="h-4 w-4" />
                    <span>{getCategoryLabel(project.category)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Enviado em {formatDate(project.submitted_at)}</span>
                  </div>
                </div>

                {/* Métricas */}
                {(project.waste_processed > 0 || project.energy_generated > 0) && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    {project.waste_processed > 0 && (
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="text-xs text-muted-foreground">Residuos</p>
                        <p className="font-semibold text-emerald-600">{project.waste_processed} kg</p>
                      </div>
                    )}
                    {project.energy_generated > 0 && (
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="text-xs text-muted-foreground">Energia</p>
                        <p className="font-semibold text-emerald-600">{project.energy_generated} kWh</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Propostas já enviadas */}
                {project.my_proposal && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Voce ja enviou uma proposta</span>
                    </div>
                    <p className="text-sm text-emerald-600 mt-1">
                      Valor: {formatCurrency(project.my_proposal.proposed_value)}
                    </p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/environmental/${project.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </Link>
                  </Button>
                  {!project.my_proposal && (
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        setSelectedProject(project)
                        setShowProposalDialog(true)
                      }}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Propor Valor
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Proposta */}
      <Dialog open={showProposalDialog} onOpenChange={setShowProposalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Proposta de Certificacao</DialogTitle>
            <DialogDescription>
              Defina o valor que voce cobrara para certificar este projeto ambiental
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium">{selectedProject.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedProject.institution_name} - {selectedProject.location_name}, {selectedProject.location_state}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposal-value">Valor da Certificacao (R$)</Label>
                <Input
                  id="proposal-value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 1500.00"
                  value={proposalValue}
                  onChange={(e) => setProposalValue(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposal-message">Mensagem (opcional)</Label>
                <Textarea
                  id="proposal-message"
                  placeholder="Descreva o que esta incluso na certificacao, prazo estimado, etc."
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProposalDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitProposal}
              disabled={isSubmitting || !proposalValue}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Enviar Proposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

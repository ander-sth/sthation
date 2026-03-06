"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  ArrowLeft,
  Landmark,
  Users,
  Leaf,
  Upload,
  ShieldCheck,
  Award,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { GovProjectType, GOV_PROJECT_TYPE_CONFIG, GOV_PLAN_DEFAULT } from "@/lib/types/gov"

const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
]

export default function NewGovProjectPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectType, setProjectType] = useState<string>("")

  const projectsUsed = 8
  const projectsRemaining = GOV_PLAN_DEFAULT.maxProjects - projectsUsed

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simula envio (sera substituido pela API)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    router.push("/dashboard/gov")
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4 text-foreground/60 hover:text-[#0a2f2f] hover:bg-muted"
        >
          <Link href="/dashboard/gov">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel Gov
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Inscrever Novo Projeto</h1>
        <p className="text-foreground/60">
          Cadastre um projeto de acao social ou ambiental para verificacao.
        </p>
      </div>

      {/* Plano info */}
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Landmark className="h-5 w-5 text-[#0a2f2f]" />
            <div>
              <p className="text-sm font-medium text-foreground">Plano Ativo: {GOV_PLAN_DEFAULT.name}</p>
              <p className="text-xs text-foreground/60">
                {projectsUsed} de {GOV_PLAN_DEFAULT.maxProjects} projetos utilizados
              </p>
            </div>
          </div>
          <Badge className={projectsRemaining > 10 ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20"}>
            {projectsRemaining} restantes
          </Badge>
        </CardContent>
      </Card>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Tipo do projeto */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Tipo do Projeto</CardTitle>
              <CardDescription className="text-foreground/60">
                Selecione o tipo de acao. Isso define quem fara a verificacao.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setProjectType(GovProjectType.SOCIAL)}
                  className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                    projectType === GovProjectType.SOCIAL
                      ? "border-[#0a2f2f] bg-[#0a2f2f]/5"
                      : "border-border bg-card hover:border-[#0a2f2f]/40"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0a2f2f]/10">
                    <Users className="h-5 w-5 text-[#0a2f2f]" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Acao Social</div>
                    <p className="text-xs text-foreground/60">Educacao, saude, assistencia social, cultura</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-[#0a2f2f]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verificado por Checkers (VCA)
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectType(GovProjectType.AMBIENTAL)}
                  className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                    projectType === GovProjectType.AMBIENTAL
                      ? "border-[#0a2f2f] bg-[#0a2f2f]/5"
                      : "border-border bg-card hover:border-[#0a2f2f]/40"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0a2f2f]/10">
                    <Leaf className="h-5 w-5 text-[#0a2f2f]" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Acao Ambiental</div>
                    <p className="text-xs text-foreground/60">Sustentabilidade, preservacao, reducao de carbono</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-[#0a2f2f]">
                      <Award className="h-3.5 w-3.5" />
                      Verificado por Certificadoras
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Dados do projeto */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Dados do Projeto</CardTitle>
              <CardDescription className="text-foreground/60">
                Informacoes basicas sobre o projeto a ser verificado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground/80">Titulo do Projeto</Label>
                <Input
                  id="title"
                  placeholder="Ex: Programa Alimenta Cidadao"
                  required
                  className="bg-muted border-border text-foreground placeholder:text-foreground/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground/80">Descricao</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o projeto, seus objetivos e as acoes realizadas..."
                  rows={4}
                  required
                  className="bg-muted border-border text-foreground placeholder:text-foreground/40"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="municipality" className="text-foreground/80">Municipio</Label>
                  <Input
                    id="municipality"
                    placeholder="Ex: Sao Paulo"
                    required
                    className="bg-muted border-border text-foreground placeholder:text-foreground/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-foreground/80">Estado</Label>
                  <Select required>
                    <SelectTrigger className="bg-muted border-border text-foreground">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-foreground/80">Orgao Responsavel</Label>
                <Input
                  id="department"
                  placeholder="Ex: Secretaria de Assistencia Social"
                  required
                  className="bg-muted border-border text-foreground placeholder:text-foreground/40"
                />
              </div>
            </CardContent>
          </Card>

          {/* Impacto e valores */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Impacto e Valores</CardTitle>
              <CardDescription className="text-foreground/60">
                Dados quantitativos do projeto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="impactGoal" className="text-foreground/80">Meta de Impacto</Label>
                <Input
                  id="impactGoal"
                  placeholder="Ex: Distribuir 50.000 refeicoes para familias em situacao de vulnerabilidade"
                  required
                  className="bg-muted border-border text-foreground placeholder:text-foreground/40"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="investedAmount" className="text-foreground/80">Valor Investido (R$)</Label>
                  <Input
                    id="investedAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    required
                    className="bg-muted border-border text-foreground placeholder:text-foreground/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beneficiaries" className="text-foreground/80">Beneficiarios</Label>
                  <Input
                    id="beneficiaries"
                    type="number"
                    min="1"
                    placeholder="0"
                    required
                    className="bg-muted border-border text-foreground placeholder:text-foreground/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period" className="text-foreground/80">Periodo de Execucao</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      required
                      className="bg-muted border-border text-foreground"
                    />
                    <Input
                      type="date"
                      required
                      className="bg-muted border-border text-foreground"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidencias */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Evidencias</CardTitle>
              <CardDescription className="text-foreground/60">
                Anexe fotos, documentos e relatorios que comprovem a execucao do projeto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload de fotos */}
              <div className="space-y-2">
                <Label className="text-foreground/80">Fotos do Projeto</Label>
                <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted p-8 transition-colors hover:border-[#0a2f2f]/40">
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 h-8 w-8 text-foreground/30" />
                    <p className="text-sm text-foreground/60">Arraste fotos aqui ou clique para selecionar</p>
                    <p className="text-xs text-foreground/30">PNG, JPG ate 10MB cada (maximo 10 fotos)</p>
                  </div>
                </div>
              </div>

              {/* Upload de documentos */}
              <div className="space-y-2">
                <Label className="text-foreground/80">Documentos e Relatorios</Label>
                <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted p-8 transition-colors hover:border-[#0a2f2f]/40">
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 h-8 w-8 text-foreground/30" />
                    <p className="text-sm text-foreground/60">Arraste documentos aqui ou clique para selecionar</p>
                    <p className="text-xs text-foreground/30">PDF, DOC ate 20MB cada (maximo 5 arquivos)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info sobre verificacao */}
          {projectType && (
            <Card className="border-[#0a2f2f]/20 bg-[#0a2f2f]/5">
              <CardContent className="flex items-start gap-4 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#0a2f2f]" />
                <div>
                  <p className="font-medium text-foreground">
                    {projectType === GovProjectType.SOCIAL
                      ? "Este projeto sera verificado por Checkers (VCA)"
                      : "Este projeto sera verificado por Certificadoras"}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {projectType === GovProjectType.SOCIAL
                      ? "10 Checkers independentes verificarao as evidencias atraves do sistema de Validacao por Consenso Aberto. O processo leva em media 7 dias."
                      : "Um Analista Certificador especializado analisara os dados tecnicos e emitira um parecer. O processo leva em media 14 dias."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              asChild
              className="border-border text-foreground hover:bg-muted"
            >
              <Link href="/dashboard/gov">Cancelar</Link>
            </Button>
            <Button
              type="submit"
              disabled={!projectType || isSubmitting}
              className="flex-1 bg-[#0a2f2f] hover:bg-[#0a2f2f]/90 text-white font-bold rounded-full"
            >
              {isSubmitting ? (
                <>Inscrevendo...</>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Inscrever Projeto
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

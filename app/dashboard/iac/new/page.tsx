"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  Info,
  Heart,
  Users,
  DollarSign,
  CheckCircle,
  FileCheck,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { IAC_VALIDATION_RULES } from "@/lib/types/iac"

const SOCIAL_CATEGORIES = [
  {
    code: "ALIMENTACAO",
    name: "Alimentação e Segurança Alimentar",
    icon: "🍽️",
    description: "Combate à fome, cozinhas comunitárias, hortas",
  },
  {
    code: "EDUCACAO",
    name: "Educação e Capacitação",
    icon: "📚",
    description: "Cursos, alfabetização, material escolar",
  },
  { code: "SAUDE", name: "Saúde e Bem-estar", icon: "🏥", description: "Atendimento médico, campanhas de vacinação" },
  {
    code: "MORADIA",
    name: "Moradia e Infraestrutura",
    icon: "🏠",
    description: "Construção, reformas, saneamento básico",
  },
  { code: "RENDA", name: "Geração de Renda", icon: "💼", description: "Capacitação profissional, microcrédito" },
  { code: "CULTURA", name: "Cultura e Esporte", icon: "🎭", description: "Atividades culturais, esportivas, lazer" },
  {
    code: "AMBIENTAL",
    name: "Educação Ambiental",
    icon: "🌱",
    description: "Conscientização, reciclagem, hortas comunitárias",
  },
  { code: "ASSISTENCIA", name: "Assistência Social", icon: "🤝", description: "Acolhimento, apoio a vulneráveis" },
]

export default function NewIACPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    locationName: "",
    locationState: "",
    targetBeneficiaries: "",
    fundingGoal: "",
    startDate: "",
    endDate: "",
    objectives: "",
    methodology: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.category) {
        throw new Error("Selecione uma categoria")
      }

      // Buscar a instituicao do usuario logado
      const instRes = await fetch(`/api/institutions/by-user?user_id=${localStorage.getItem("user_id") || ""}`)
      const instData = await instRes.json()
      
      if (!instData.institution) {
        throw new Error("Voce precisa ter uma instituicao cadastrada para criar projetos")
      }

      // Criar IAC no banco
      const res = await fetch("/api/iacs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          institutionId: instData.institution.id
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Falha ao criar projeto")
      }

      toast({
        title: "Projeto Criado!",
        description: `Seu Impact Action Card foi cadastrado. Agora adicione evidencias e publique para comecar a receber doacoes.`,
      })
      router.push("/dashboard/iac")
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao criar projeto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCategory = SOCIAL_CATEGORIES.find((c) => c.code === formData.category)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/iac">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Criar Novo Projeto</h1>
          <p className="text-foreground/60">Cadastre um projeto social para captar doações e gerar impacto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Informações do Projeto
                </CardTitle>
                <CardDescription>Descreva seu projeto social para atrair doadores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nome do Projeto *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Cozinha Solidária - Alimentando Famílias"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição do Projeto *</Label>
                  <Textarea
                    id="description"
                    placeholder="Conte a história do projeto, o problema que resolve e como as doações serão utilizadas..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categoria do Projeto *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área de atuação" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.code} value={cat.code}>
                          <div className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory && (
                    <p className="text-xs text-foreground/60 mt-1">
                      <Info className="inline h-3 w-3 mr-1" />
                      {selectedCategory.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectives">Objetivos *</Label>
                  <Textarea
                    id="objectives"
                    placeholder="Liste os objetivos específicos do projeto..."
                    rows={3}
                    value={formData.objectives}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="methodology">Metodologia de Execução *</Label>
                  <Textarea
                    id="methodology"
                    placeholder="Como o projeto será executado? Quais ações serão realizadas?"
                    rows={3}
                    value={formData.methodology}
                    onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  Localização
                </CardTitle>
                <CardDescription>Onde o projeto será executado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="locationName">Cidade/Comunidade *</Label>
                    <Input
                      id="locationName"
                      placeholder="Ex: Comunidade da Maré"
                      value={formData.locationName}
                      onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locationState">Estado *</Label>
                    <Select
                      value={formData.locationState}
                      onValueChange={(value) => setFormData({ ...formData, locationState: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "AC",
                          "AL",
                          "AP",
                          "AM",
                          "BA",
                          "CE",
                          "DF",
                          "ES",
                          "GO",
                          "MA",
                          "MT",
                          "MS",
                          "MG",
                          "PA",
                          "PB",
                          "PR",
                          "PE",
                          "PI",
                          "RJ",
                          "RN",
                          "RS",
                          "RO",
                          "RR",
                          "SC",
                          "SP",
                          "SE",
                          "TO",
                        ].map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  Meta de Captação
                </CardTitle>
                <CardDescription>Defina quanto precisa arrecadar e quantas pessoas serão beneficiadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fundingGoal">Meta de Arrecadação (R$) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
                      <Input
                        id="fundingGoal"
                        type="number"
                        placeholder="50000"
                        className="pl-9"
                        value={formData.fundingGoal}
                        onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetBeneficiaries">Beneficiários Estimados *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
                      <Input
                        id="targetBeneficiaries"
                        type="number"
                        placeholder="500"
                        className="pl-9"
                        value={formData.targetBeneficiaries}
                        onChange={(e) => setFormData({ ...formData, targetBeneficiaries: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
                      <Input
                        id="startDate"
                        type="date"
                        className="pl-9"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Término *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
                      <Input
                        id="endDate"
                        type="date"
                        className="pl-9"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <p className="text-sm font-medium">Distribuição das Doações:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Sua Instituição:</span>
                      <span className="font-medium text-emerald-600">80%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Plataforma:</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Validação VCA:</span>
                      <span className="font-medium">5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Cashback Doador:</span>
                      <span className="font-medium">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ciclo do Projeto</CardTitle>
                <CardDescription>Como funciona o processo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-500/10 text-gray-500 text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Criar Projeto</p>
                      <p className="text-xs text-foreground/60">Preencha as informações</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Captar Doações</p>
                      <p className="text-xs text-foreground/60">Receba contribuições</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Executar Ações</p>
                      <p className="text-xs text-foreground/60">
                        Registre evidências (min. {IAC_VALIDATION_RULES.MIN_EVIDENCES_TO_SUBMIT})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Validação VCA</p>
                      <p className="text-xs text-foreground/60">Checkers verificam</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                      5
                    </div>
                    <div>
                      <p className="font-medium">Impacto Validado</p>
                      <p className="text-xs text-foreground/60">Gera ativos NOBIS</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <FileCheck className="mr-2 h-4 w-4" />
                      Criar Projeto
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/dashboard/iac">Cancelar</Link>
                </Button>
                <p className="text-xs text-center text-foreground/60">
                  Após criar, você poderá publicar para começar a receber doações.
                </p>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-blue-600 text-sm">Dicas para Sucesso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-foreground/60">
                <p className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-0.5 text-blue-500 shrink-0" />
                  Use fotos reais da comunidade
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-0.5 text-blue-500 shrink-0" />
                  Seja específico nos objetivos
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-0.5 text-blue-500 shrink-0" />
                  Explique como o dinheiro será usado
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-0.5 text-blue-500 shrink-0" />
                  Compartilhe nas redes sociais
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

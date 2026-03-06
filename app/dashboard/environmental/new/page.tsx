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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  Info,
  Leaf,
  Factory,
  Cpu,
  FileText,
  CheckCircle,
  Shield,
  Bitcoin,
  Zap,
  Droplets,
  Wind,
  Recycle,
  TreePine,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

// Categorias de projetos ambientais
const ENVIRONMENTAL_CATEGORIES = [
  {
    code: "ENERGIA_RENOVAVEL",
    name: "Energia Renovavel",
    icon: Zap,
    description: "Solar, eolica, biomassa, biogas",
    metrics: ["kWh gerados", "tCO2e evitadas"],
  },
  {
    code: "TRATAMENTO_RESIDUOS",
    name: "Tratamento de Residuos",
    icon: Recycle,
    description: "Reciclagem, compostagem, incineracao controlada",
    metrics: ["Toneladas processadas", "tCO2e evitadas"],
  },
  {
    code: "REFLORESTAMENTO",
    name: "Reflorestamento e Conservacao",
    icon: TreePine,
    description: "Plantio, recuperacao de areas, conservacao",
    metrics: ["Hectares", "Arvores plantadas", "tCO2e sequestradas"],
  },
  {
    code: "AGUA",
    name: "Gestao de Agua",
    icon: Droplets,
    description: "Tratamento, reuso, captacao",
    metrics: ["Litros tratados", "Economia de agua"],
  },
  {
    code: "EFICIENCIA_ENERGETICA",
    name: "Eficiencia Energetica",
    icon: Factory,
    description: "Reducao de consumo, otimizacao industrial",
    metrics: ["kWh economizados", "tCO2e evitadas"],
  },
  {
    code: "CAPTURA_CARBONO",
    name: "Captura de Carbono",
    icon: Wind,
    description: "Tecnologias de captura e armazenamento",
    metrics: ["tCO2 capturadas"],
  },
]

// Status do projeto
const PROJECT_STATUS_OPTIONS = [
  { value: "EM_ANDAMENTO", label: "Em Andamento", description: "Projeto em execucao com coleta de dados" },
  { value: "CONCLUIDO", label: "Concluido", description: "Projeto finalizado aguardando certificacao" },
]

// Tipo de coleta de dados
const DATA_COLLECTION_TYPES = [
  { 
    value: "IOT", 
    label: "Sensores IoT", 
    icon: Cpu,
    description: "Coleta automatica via sensores conectados" 
  },
  { 
    value: "MANUAL", 
    label: "Entrada Manual", 
    icon: FileText,
    description: "Registro manual com documentacao comprobatoria" 
  },
  { 
    value: "HIBRIDO", 
    label: "Hibrido", 
    icon: Factory,
    description: "Combinacao de sensores e registros manuais" 
  },
]

export default function NewEnvironmentalProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Informacoes basicas
    title: "",
    description: "",
    category: "",
    projectStatus: "EM_ANDAMENTO",
    dataCollectionType: "MANUAL",
    
    // Localizacao
    locationName: "",
    locationState: "",
    coordinates: "",
    
    // Datas
    startDate: "",
    endDate: "",
    
    // Metricas ambientais
    estimatedCO2: "",
    measurementUnit: "tCO2e",
    energyGenerated: "",
    wasteProcessed: "",
    areaSize: "",
    
    // Metodologia e documentacao
    methodology: "",
    certificationStandard: "",
    existingCertifications: "",
    
    // Dados IoT (se aplicavel)
    sensorsCount: "",
    sensorTypes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validacoes
      if (!formData.category) {
        throw new Error("Selecione uma categoria")
      }
      if (!formData.title || !formData.description) {
        throw new Error("Preencha todas as informacoes obrigatorias")
      }

      // Buscar a instituicao/empresa do usuario logado
      const instRes = await fetch(`/api/institutions/by-user?user_id=${user?.id || ""}`)
      const instData = await instRes.json()
      
      if (!instData.institution) {
        throw new Error("Voce precisa ter uma empresa cadastrada para criar projetos")
      }

      // Criar projeto ambiental no banco
      const res = await fetch("/api/environmental-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: "AMBIENTAL",
          institutionId: instData.institution.id,
          userId: user?.id,
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Falha ao criar projeto")
      }

      toast({
        title: "Projeto Ambiental Criado!",
        description: "Seu projeto foi cadastrado. Adicione evidencias e submeta para certificacao.",
      })
      router.push("/dashboard/environmental")
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

  const selectedCategory = ENVIRONMENTAL_CATEGORIES.find((c) => c.code === formData.category)
  const SelectedCategoryIcon = selectedCategory?.icon || Leaf

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/environmental">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Cadastrar Projeto Ambiental</h1>
          <p className="text-foreground/60">Registre um projeto de impacto ambiental para certificacao e inscricao na blockchain</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div 
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === s 
                  ? "bg-emerald-500 text-white" 
                  : step > s 
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? <CheckCircle className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`w-16 h-0.5 ${step > s ? "bg-emerald-500" : "bg-muted"}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-8 text-sm text-muted-foreground">
        <span className={step === 1 ? "text-emerald-600 font-medium" : ""}>Informacoes</span>
        <span className={step === 2 ? "text-emerald-600 font-medium" : ""}>Metricas</span>
        <span className={step === 3 ? "text-emerald-600 font-medium" : ""}>Documentacao</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Informacoes Basicas */}
            {step === 1 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-emerald-500" />
                      Informacoes do Projeto
                    </CardTitle>
                    <CardDescription>Descreva seu projeto ambiental</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Nome do Projeto *</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Usina Solar Fazenda Verde"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descricao do Projeto *</Label>
                      <Textarea
                        id="description"
                        placeholder="Descreva o projeto, tecnologia utilizada, capacidade e impacto ambiental esperado..."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Categoria do Projeto *</Label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {ENVIRONMENTAL_CATEGORIES.map((cat) => {
                          const IconComp = cat.icon
                          return (
                            <div
                              key={cat.code}
                              className={`cursor-pointer rounded-lg border p-4 transition-all hover:border-emerald-400 ${
                                formData.category === cat.code 
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" 
                                  : "border-border"
                              }`}
                              onClick={() => setFormData({ ...formData, category: cat.code })}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`rounded-full p-2 ${
                                  formData.category === cat.code 
                                    ? "bg-emerald-500 text-white" 
                                    : "bg-muted"
                                }`}>
                                  <IconComp className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium">{cat.name}</p>
                                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Status do Projeto *</Label>
                      <RadioGroup
                        value={formData.projectStatus}
                        onValueChange={(value) => setFormData({ ...formData, projectStatus: value })}
                        className="grid gap-3 sm:grid-cols-2"
                      >
                        {PROJECT_STATUS_OPTIONS.map((status) => (
                          <div key={status.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={status.value} id={status.value} />
                            <Label htmlFor={status.value} className="cursor-pointer">
                              <span className="font-medium">{status.label}</span>
                              <p className="text-xs text-muted-foreground">{status.description}</p>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Coleta de Dados *</Label>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {DATA_COLLECTION_TYPES.map((type) => {
                          const IconComp = type.icon
                          return (
                            <div
                              key={type.value}
                              className={`cursor-pointer rounded-lg border p-4 text-center transition-all hover:border-emerald-400 ${
                                formData.dataCollectionType === type.value 
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" 
                                  : "border-border"
                              }`}
                              onClick={() => setFormData({ ...formData, dataCollectionType: type.value })}
                            >
                              <IconComp className={`h-6 w-6 mx-auto mb-2 ${
                                formData.dataCollectionType === type.value ? "text-emerald-500" : "text-muted-foreground"
                              }`} />
                              <p className="font-medium text-sm">{type.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      Localizacao do Projeto
                    </CardTitle>
                    <CardDescription>Onde o projeto esta sendo executado</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="locationName">Cidade/Local *</Label>
                        <Input
                          id="locationName"
                          placeholder="Ex: Fazenda Verde, Uberlandia"
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
                            {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                              <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coordinates">Coordenadas GPS (opcional)</Label>
                      <Input
                        id="coordinates"
                        placeholder="Ex: -23.5505, -46.6333"
                        value={formData.coordinates}
                        onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Coordenadas ajudam na verificacao por satelite</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Data de Inicio *</Label>
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
                        <Label htmlFor="endDate">Data de Termino (ou prevista)</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
                          <Input
                            id="endDate"
                            type="date"
                            className="pl-9"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setStep(2)}>
                    Proximo: Metricas
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Button>
                </div>
              </>
            )}

            {/* Step 2: Metricas Ambientais */}
            {step === 2 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SelectedCategoryIcon className="h-5 w-5 text-emerald-500" />
                      Metricas de Impacto Ambiental
                    </CardTitle>
                    <CardDescription>
                      {selectedCategory 
                        ? `Metricas para ${selectedCategory.name}: ${selectedCategory.metrics.join(", ")}` 
                        : "Quantifique o impacto ambiental do projeto"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="estimatedCO2">Reducao/Captura de CO2 Estimada *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="estimatedCO2"
                            type="number"
                            placeholder="1000"
                            value={formData.estimatedCO2}
                            onChange={(e) => setFormData({ ...formData, estimatedCO2: e.target.value })}
                            required
                          />
                          <Select
                            value={formData.measurementUnit}
                            onValueChange={(value) => setFormData({ ...formData, measurementUnit: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tCO2e">tCO2e</SelectItem>
                              <SelectItem value="kgCO2e">kgCO2e</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {(formData.category === "ENERGIA_RENOVAVEL" || formData.category === "EFICIENCIA_ENERGETICA") && (
                        <div className="space-y-2">
                          <Label htmlFor="energyGenerated">Energia Gerada/Economizada</Label>
                          <div className="relative">
                            <Zap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
                            <Input
                              id="energyGenerated"
                              type="number"
                              placeholder="MWh por ano"
                              className="pl-9"
                              value={formData.energyGenerated}
                              onChange={(e) => setFormData({ ...formData, energyGenerated: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {formData.category === "TRATAMENTO_RESIDUOS" && (
                        <div className="space-y-2">
                          <Label htmlFor="wasteProcessed">Residuos Processados</Label>
                          <div className="relative">
                            <Recycle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
                            <Input
                              id="wasteProcessed"
                              type="number"
                              placeholder="Toneladas por ano"
                              className="pl-9"
                              value={formData.wasteProcessed}
                              onChange={(e) => setFormData({ ...formData, wasteProcessed: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {(formData.category === "REFLORESTAMENTO" || formData.category === "CAPTURA_CARBONO") && (
                        <div className="space-y-2">
                          <Label htmlFor="areaSize">Area do Projeto</Label>
                          <div className="relative">
                            <TreePine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
                            <Input
                              id="areaSize"
                              type="number"
                              placeholder="Hectares"
                              className="pl-9"
                              value={formData.areaSize}
                              onChange={(e) => setFormData({ ...formData, areaSize: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {formData.dataCollectionType !== "MANUAL" && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 p-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-5 w-5 text-emerald-600" />
                          <h4 className="font-medium text-emerald-800 dark:text-emerald-400">Configuracao IoT</h4>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="sensorsCount">Quantidade de Sensores</Label>
                            <Input
                              id="sensorsCount"
                              type="number"
                              placeholder="Ex: 5"
                              value={formData.sensorsCount}
                              onChange={(e) => setFormData({ ...formData, sensorsCount: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sensorTypes">Tipos de Sensores</Label>
                            <Input
                              id="sensorTypes"
                              placeholder="Ex: Temperatura, Fluxo, Energia"
                              value={formData.sensorTypes}
                              onChange={(e) => setFormData({ ...formData, sensorTypes: e.target.value })}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                          <Info className="inline h-3 w-3 mr-1" />
                          Apos criar o projeto, voce podera configurar a integracao com seus sensores IoT
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button type="button" onClick={() => setStep(3)}>
                    Proximo: Documentacao
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Metodologia e Documentacao */}
            {step === 3 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Metodologia e Certificacao
                    </CardTitle>
                    <CardDescription>Documentacao tecnica para validacao por certificadores</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="methodology">Metodologia Utilizada *</Label>
                      <Textarea
                        id="methodology"
                        placeholder="Descreva a metodologia de medicao e calculo de impacto ambiental utilizada..."
                        rows={4}
                        value={formData.methodology}
                        onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Padrao de Certificacao (opcional)</Label>
                      <Select
                        value={formData.certificationStandard}
                        onValueChange={(value) => setFormData({ ...formData, certificationStandard: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um padrao reconhecido" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VCS">Verified Carbon Standard (VCS)</SelectItem>
                          <SelectItem value="GOLD_STANDARD">Gold Standard</SelectItem>
                          <SelectItem value="CDM">Clean Development Mechanism (CDM)</SelectItem>
                          <SelectItem value="ACR">American Carbon Registry (ACR)</SelectItem>
                          <SelectItem value="CAR">Climate Action Reserve (CAR)</SelectItem>
                          <SelectItem value="ISO14064">ISO 14064</SelectItem>
                          <SelectItem value="OUTRO">Outro / Metodologia Propria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="existingCertifications">Certificacoes Existentes</Label>
                      <Textarea
                        id="existingCertifications"
                        placeholder="Liste certificacoes ou auditorias ja realizadas neste projeto..."
                        rows={2}
                        value={formData.existingCertifications}
                        onChange={(e) => setFormData({ ...formData, existingCertifications: e.target.value })}
                      />
                    </div>

                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 p-4">
                      <h4 className="font-medium text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4" />
                        Documentos Necessarios
                      </h4>
                      <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                        <li>Relatorios tecnicos de medicao</li>
                        <li>Fotos e videos do projeto</li>
                        <li>Dados de sensores ou planilhas de medicao</li>
                        <li>Licencas ambientais (se aplicavel)</li>
                        <li>Laudos de auditoria (se houver)</li>
                      </ul>
                      <p className="text-xs text-amber-600 mt-2">
                        Voce podera adicionar documentos apos criar o projeto
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Leaf className="mr-2 h-4 w-4" />
                        Criar Projeto Ambiental
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Sidebar - Trilha do Projeto Ambiental */}
          <div className="space-y-6">
            <Card className="border-emerald-200">
              <CardHeader className="bg-emerald-50 dark:bg-emerald-950/20">
                <CardTitle className="text-emerald-800 dark:text-emerald-400">Trilha de Certificacao Ambiental</CardTitle>
                <CardDescription>Fluxo de validacao para projetos ambientais</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Cadastro do Projeto</p>
                      <p className="text-xs text-foreground/60">Informacoes, metricas e metodologia</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Coleta de Dados</p>
                      <p className="text-xs text-foreground/60">IoT automatico ou entrada manual</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Submissao para Certificacao</p>
                      <p className="text-xs text-foreground/60">Envio de evidencias e documentos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white text-xs font-bold">
                      <Shield className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-medium">Analise por Certificadores</p>
                      <p className="text-xs text-foreground/60">Validacao tecnica especializada</p>
                      <Badge variant="outline" className="mt-1 text-xs border-purple-300 text-purple-600">
                        Analistas Certificadores
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                      <Bitcoin className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-medium">Inscricao Blockchain</p>
                      <p className="text-xs text-foreground/60">Registro na Polygon Network</p>
                      <Badge variant="outline" className="mt-1 text-xs border-amber-300 text-amber-600">
                        Certificado Imutavel
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-800 dark:text-emerald-400 text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Diferenca do Projeto Social
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Sem necessidade de doacoes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Validacao por certificadores tecnicos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Integracao com sensores IoT</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Creditos de carbono tokenizados</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

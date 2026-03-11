"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
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
  Upload,
  X,
  Image as ImageIcon,
  File,
  Save,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

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

export default function EditEnvironmentalProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    projectStatus: "EM_ANDAMENTO",
    dataCollectionType: "MANUAL",
    locationName: "",
    locationState: "",
    coordinates: "",
    startDate: "",
    endDate: "",
    estimatedCO2: "",
    measurementUnit: "tCO2e",
    energyGenerated: "",
    wasteProcessed: "",
    areaSize: "",
    methodology: "",
    certificationStandard: "",
    existingCertifications: "",
    sensorsCount: "",
    sensorTypes: "",
  })

  // Buscar dados do projeto
  const { data, isLoading: loadingProject, error } = useSWR(`/api/iac/${id}`, fetcher)

  // Preencher formulário com dados do projeto
  useEffect(() => {
    if (data?.iac) {
      const project = data.iac
      setFormData({
        title: project.title || "",
        description: project.description || "",
        category: project.category || "",
        projectStatus: project.project_status || "EM_ANDAMENTO",
        dataCollectionType: project.data_collection_type || "MANUAL",
        locationName: project.location_name || "",
        locationState: project.location_state || "",
        coordinates: project.coordinates || "",
        startDate: project.start_date ? project.start_date.split("T")[0] : "",
        endDate: project.end_date ? project.end_date.split("T")[0] : "",
        estimatedCO2: project.carbon_credits?.toString() || "",
        measurementUnit: project.measurement_unit || "tCO2e",
        energyGenerated: project.energy_generated?.toString() || "",
        wasteProcessed: project.waste_processed?.toString() || "",
        areaSize: project.area_size?.toString() || "",
        methodology: project.methodology || "",
        certificationStandard: project.certification_standard || "",
        existingCertifications: project.existing_certifications || "",
        sensorsCount: project.sensors_count?.toString() || "",
        sensorTypes: project.sensor_types || "",
      })
    }
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.category) {
        throw new Error("Selecione uma categoria")
      }
      if (!formData.title || !formData.description) {
        throw new Error("Preencha todas as informacoes obrigatorias")
      }

      const res = await fetch(`/api/iac/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          project_status: formData.projectStatus,
          status: formData.projectStatus === "CONCLUIDO" ? "CONCLUIDO" : data?.iac?.status,
          data_collection_type: formData.dataCollectionType,
          location_name: formData.locationName,
          location_state: formData.locationState,
          coordinates: formData.coordinates,
          measurement_unit: formData.measurementUnit,
          energy_generated: parseFloat(formData.energyGenerated) || 0,
          waste_processed: parseFloat(formData.wasteProcessed) || 0,
          area_size: parseFloat(formData.areaSize) || 0,
          certification_standard: formData.certificationStandard,
          existing_certifications: formData.existingCertifications,
          sensors_count: parseInt(formData.sensorsCount) || 0,
          sensor_types: formData.sensorTypes,
        })
      })

      const responseData = await res.json()
      
      if (!res.ok) {
        throw new Error(responseData.error || "Falha ao atualizar projeto")
      }

      toast({
        title: "Projeto Atualizado!",
        description: "As alteracoes foram salvas com sucesso.",
      })
      router.push(`/dashboard/environmental/${id}`)
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao atualizar projeto.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCategory = ENVIRONMENTAL_CATEGORIES.find((c) => c.code === formData.category)
  const SelectedCategoryIcon = selectedCategory?.icon || Leaf

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setEvidenceFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error || !data?.iac) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erro ao carregar projeto</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/environmental">Voltar</Link>
        </Button>
      </div>
    )
  }

  // Verificar se pode editar
  if (["SUBMITTED", "VALIDATED", "CERTIFIED", "INSCRIBED", "MINTED"].includes(data.iac.status)) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Projeto Bloqueado para Edicao</h2>
        <p className="text-muted-foreground mb-4">
          Este projeto ja foi enviado para certificacao e nao pode mais ser editado.
        </p>
        <Button asChild>
          <Link href={`/dashboard/environmental/${id}`}>Ver Projeto</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/environmental/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Editar Projeto Ambiental</h1>
          <p className="text-foreground/60">Atualize as informacoes do projeto</p>
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
                    <CardDescription>Atualize as informacoes do projeto</CardDescription>
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
                        placeholder="Descreva o projeto..."
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
                        ? `Metricas para ${selectedCategory.name}` 
                        : "Quantifique o impacto ambiental do projeto"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="estimatedCO2">Reducao/Captura de CO2 *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="estimatedCO2"
                            type="number"
                            placeholder="1000"
                            value={formData.estimatedCO2}
                            onChange={(e) => setFormData({ ...formData, estimatedCO2: e.target.value })}
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
                          <Label htmlFor="energyGenerated">Energia Gerada/Economizada (MWh/ano)</Label>
                          <Input
                            id="energyGenerated"
                            type="number"
                            placeholder="MWh por ano"
                            value={formData.energyGenerated}
                            onChange={(e) => setFormData({ ...formData, energyGenerated: e.target.value })}
                          />
                        </div>
                      )}

                      {formData.category === "TRATAMENTO_RESIDUOS" && (
                        <div className="space-y-2">
                          <Label htmlFor="wasteProcessed">Residuos Processados (ton/ano)</Label>
                          <Input
                            id="wasteProcessed"
                            type="number"
                            placeholder="Toneladas por ano"
                            value={formData.wasteProcessed}
                            onChange={(e) => setFormData({ ...formData, wasteProcessed: e.target.value })}
                          />
                        </div>
                      )}

                      {(formData.category === "REFLORESTAMENTO" || formData.category === "CAPTURA_CARBONO") && (
                        <div className="space-y-2">
                          <Label htmlFor="areaSize">Area do Projeto (hectares)</Label>
                          <Input
                            id="areaSize"
                            type="number"
                            placeholder="Hectares"
                            value={formData.areaSize}
                            onChange={(e) => setFormData({ ...formData, areaSize: e.target.value })}
                          />
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
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="methodology">Metodologia Utilizada</Label>
                      <Textarea
                        id="methodology"
                        placeholder="Descreva a metodologia..."
                        rows={4}
                        value={formData.methodology}
                        onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Padrao de Certificacao (opcional)</Label>
                      <Select
                        value={formData.certificationStandard}
                        onValueChange={(value) => setFormData({ ...formData, certificationStandard: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um padrao" />
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
                        placeholder="Liste certificacoes ja realizadas..."
                        rows={2}
                        value={formData.existingCertifications}
                        onChange={(e) => setFormData({ ...formData, existingCertifications: e.target.value })}
                      />
                    </div>

                    {/* Upload de Evidências */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Adicionar Evidencias
                      </Label>
                      
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-emerald-500/50 transition-colors">
                        <input
                          type="file"
                          id="evidence-upload"
                          multiple
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <label htmlFor="evidence-upload" className="cursor-pointer">
                          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                          <p className="font-medium">Clique para selecionar arquivos</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Fotos, PDFs, planilhas
                          </p>
                        </label>
                      </div>

                      {evidenceFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">{evidenceFiles.length} arquivo(s) selecionado(s)</p>
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {evidenceFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-muted/50 rounded-lg p-2 text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  {getFileIcon(file)}
                                  <span className="truncate">{file.name}</span>
                                  <span className="text-muted-foreground text-xs">({formatFileSize(file.size)})</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="h-6 w-6 p-0 text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alteracoes
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-amber-800 dark:text-amber-400 text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Editando Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-amber-700 dark:text-amber-400">
                <p>
                  Apos finalizar as edicoes, voce pode solicitar certificacao na pagina do projeto.
                  Uma vez enviado para certificacao, o projeto nao podera mais ser editado.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

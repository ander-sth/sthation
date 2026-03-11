"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Leaf,
  MapPin,
  Calendar,
  Building2,
  FileCheck,
  Loader2,
  CheckCircle2,
  Award,
  Shield,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Zap,
  Recycle,
  ThumbsUp,
  ThumbsDown,
  Scale,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AnalyzeCertificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [co2Score, setCo2Score] = useState<number>(0)
  const [methodologyScore, setMethodologyScore] = useState<number>(85)
  const [evidenceScore, setEvidenceScore] = useState<number>(80)
  const [technicalNotes, setTechnicalNotes] = useState("")
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  // Buscar dados do projeto
  const { data, isLoading, error } = useSWR(`/api/iac/${id}`, fetcher)

  const project = data?.iac
  const evidences = data?.evidences || []

  // Checklist de validação
  const validationChecklist = [
    { id: "data_consistency", label: "Dados consistentes e coerentes" },
    { id: "evidence_valid", label: "Evidencias comprovam os dados informados" },
    { id: "methodology_correct", label: "Metodologia de calculo correta" },
    { id: "location_verified", label: "Localizacao verificada" },
    { id: "period_valid", label: "Periodo de medicao valido" },
    { id: "institution_verified", label: "Instituicao verificada" },
  ]

  const allChecked = validationChecklist.every((item) => checkedItems[item.id])

  // Calcular score total
  const calculateTotalScore = () => {
    const weights = { methodology: 0.3, evidence: 0.3, checklist: 0.4 }
    const checklistScore = (Object.values(checkedItems).filter(Boolean).length / validationChecklist.length) * 100
    return Math.round(
      methodologyScore * weights.methodology +
      evidenceScore * weights.evidence +
      checklistScore * weights.checklist
    )
  }

  // Calcular CO2 evitado baseado nos dados do projeto
  const calculateCO2Avoided = () => {
    if (!project) return 0
    // Fator de emissão para compostagem: ~1.5 kg CO2e/kg resíduo evitado vs aterro
    const emissionFactor = 1.5
    const wasteKg = project.waste_processed || 0
    return (wasteKg * emissionFactor) / 1000 // Converter para toneladas
  }

  const handleCertify = async () => {
    if (!allChecked) {
      alert("Voce precisa verificar todos os itens do checklist antes de certificar.")
      return
    }

    if (!confirm("Ao certificar este projeto, um hash sera gerado e registrado na blockchain. Deseja continuar?")) {
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/certification/${id}/certify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certifierId: user?.id,
          co2Avoided: co2Score || calculateCO2Avoided(),
          methodologyScore,
          evidenceScore,
          totalScore: calculateTotalScore(),
          technicalNotes,
          checklist: checkedItems,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Projeto certificado com sucesso!\n\nHash gerado: ${data.hash}\n\nO certificado esta disponivel para a empresa ambiental.`)
        router.push("/dashboard/certification")
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao certificar projeto")
      }
    } catch (err) {
      alert("Erro ao certificar projeto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: string) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("pt-BR")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Projeto nao encontrado</h2>
        <Button asChild>
          <Link href="/dashboard/certification">Voltar</Link>
        </Button>
      </div>
    )
  }

  const calculatedCO2 = calculateCO2Avoided()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/certification">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">Analise tecnica e certificacao</p>
        </div>
        <Badge className="bg-amber-500 text-white">Aguardando Certificacao</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna Principal - Dados do Projeto */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informacoes do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{project.description}</p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.institution_name || "Instituicao"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.location_name}, {project.location_state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Enviado em {formatDate(project.submitted_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Impacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Metricas de Impacto Ambiental
              </CardTitle>
              <CardDescription>
                Dados informados pela empresa e calculo de CO2 evitado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {project.waste_processed > 0 && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-center">
                    <Recycle className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
                    <p className="text-2xl font-bold text-emerald-600">{project.waste_processed} kg</p>
                    <p className="text-sm text-muted-foreground">Residuos Processados</p>
                  </div>
                )}
                {project.energy_generated > 0 && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-center">
                    <Zap className="h-8 w-8 mx-auto text-amber-600 mb-2" />
                    <p className="text-2xl font-bold text-amber-600">{project.energy_generated} kWh</p>
                    <p className="text-sm text-muted-foreground">Energia Gerada</p>
                  </div>
                )}
                <div className="p-4 bg-[#0a2f2f]/10 rounded-lg text-center">
                  <Leaf className="h-8 w-8 mx-auto text-[#0a2f2f] mb-2" />
                  <p className="text-2xl font-bold text-[#0a2f2f]">{calculatedCO2.toFixed(2)} tCO2e</p>
                  <p className="text-sm text-muted-foreground">CO2 Equivalente Evitado</p>
                  <p className="text-xs text-muted-foreground mt-1">Fator: 1.5 kg CO2e/kg</p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Input para ajuste do CO2 */}
              <div className="space-y-2">
                <Label>Ajustar CO2 Evitado (tCO2e/ano)</Label>
                <p className="text-xs text-muted-foreground">
                  Balanco liquido da ACV considerando sequestro de carbono e emissoes evitadas
                </p>
                <Input
                  type="number"
                  step="0.01"
                  value={co2Score || calculatedCO2.toFixed(2)}
                  onChange={(e) => setCo2Score(parseFloat(e.target.value))}
                  className="max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Evidências */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Evidencias ({evidences.length})
              </CardTitle>
              <CardDescription>
                Documentos e fotos anexados pela empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {evidences.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma evidencia anexada</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {evidences.map((evidence: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="font-medium">{evidence.title || `Evidencia ${index + 1}`}</p>
                      <p className="text-sm text-muted-foreground">{evidence.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral - Avaliação */}
        <div className="space-y-6">
          {/* Checklist de Validação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Checklist de Validacao
              </CardTitle>
              <CardDescription>
                Verifique cada item antes de certificar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {validationChecklist.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <Checkbox
                    id={item.id}
                    checked={checkedItems[item.id] || false}
                    onCheckedChange={(checked) =>
                      setCheckedItems((prev) => ({ ...prev, [item.id]: !!checked }))
                    }
                  />
                  <Label htmlFor={item.id} className="text-sm cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              ))}

              <div className="pt-3 border-t mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Itens verificados:</span>
                  <span className={`font-bold ${allChecked ? "text-emerald-600" : "text-amber-600"}`}>
                    {Object.values(checkedItems).filter(Boolean).length} / {validationChecklist.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Avaliacao Tecnica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Metodologia</Label>
                  <span className="font-bold">{methodologyScore}%</span>
                </div>
                <Slider
                  value={[methodologyScore]}
                  onValueChange={(v) => setMethodologyScore(v[0])}
                  max={100}
                  step={5}
                  className="py-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Qualidade das Evidencias</Label>
                  <span className="font-bold">{evidenceScore}%</span>
                </div>
                <Slider
                  value={[evidenceScore]}
                  onValueChange={(v) => setEvidenceScore(v[0])}
                  max={100}
                  step={5}
                  className="py-2"
                />
              </div>

              <Separator />

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Score Total</p>
                <p className={`text-3xl font-bold ${calculateTotalScore() >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
                  {calculateTotalScore()}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notas Técnicas */}
          <Card>
            <CardHeader>
              <CardTitle>Parecer Tecnico</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Adicione observacoes tecnicas sobre a analise realizada..."
                value={technicalNotes}
                onChange={(e) => setTechnicalNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Botão de Certificar */}
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
            onClick={handleCertify}
            disabled={isSubmitting || !allChecked}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Certificando...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Certificar e Gerar Hash
              </>
            )}
          </Button>

          {!allChecked && (
            <p className="text-xs text-center text-amber-600">
              Complete o checklist de validacao para habilitar a certificacao
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

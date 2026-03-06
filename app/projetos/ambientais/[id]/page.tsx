"use client"

import { useParams } from "next/navigation"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  ArrowLeft,
  Calendar,
  Target,
  Building2,
  Shield,
  CheckCircle2,
  Leaf,
  TreePine,
  Award,
  FileText,
  Camera,
  Cpu,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { mockIACs } from "@/lib/mock-data"
import { STATUS_CONFIG, TSB_CATEGORIES } from "@/lib/types/iac"

export default function ProjetoAmbientalDetailPage() {
  const params = useParams()
  const project = mockIACs.find((p) => p.id === params.id)

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-[#071f1f]">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-white">Projeto nao encontrado</h1>
            <Button asChild className="bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold">
              <Link href="/projetos">Voltar aos Projetos</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[project.status]
  const tsbInfo = TSB_CATEGORIES.find((t) => t.code === project.tsbCategory)

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case "PHOTO":
        return <Camera className="h-4 w-4" />
      case "VIDEO":
        return <Camera className="h-4 w-4" />
      case "DOCUMENT":
        return <FileText className="h-4 w-4" />
      case "IOT_LOG":
        return <Cpu className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-[#071f1f]">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Button variant="ghost" size="sm" asChild className="mb-6 text-white/60 hover:text-emerald-400 hover:bg-white/5">
            <Link href="/projetos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Projetos
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Coluna principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header card */}
              <div className="overflow-hidden rounded-xl border border-emerald-400/20 bg-white/5 backdrop-blur-sm">
                <div className="relative h-64 md:h-80 bg-gradient-to-br from-emerald-900/50 to-[#071f1f] flex items-center justify-center">
                  <TreePine className="h-24 w-24 text-emerald-400/20" />
                  <Badge className={`absolute right-4 top-4 ${statusConfig.color}`}>{statusConfig.label}</Badge>
                  <Badge className="absolute left-4 top-4 bg-emerald-500/80 text-white border-0">
                    <Leaf className="mr-1 h-3 w-3" />
                    Ambiental
                  </Badge>
                </div>
                <div className="p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-emerald-400/30 text-emerald-400">
                      {project.tsbCategory} - {tsbInfo?.name}
                    </Badge>
                  </div>
                  <h1 className="mb-2 text-2xl font-bold md:text-3xl text-white">{project.title}</h1>
                  <p className="flex items-center gap-2 text-white/60">
                    <MapPin className="h-4 w-4" />
                    {project.location.name}
                  </p>
                </div>
              </div>

              {/* Alert: nao recebe doacoes */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-400 text-sm">Este projeto nao recebe doacoes</p>
                  <p className="text-white/60 text-sm mt-1">
                    Projetos ambientais sao financiados pela empresa responsavel e validados por Analistas Certificadores,
                    diferente dos projetos sociais que recebem doacoes publicas.
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="about" className="rounded-xl border border-emerald-400/20 bg-white/5 backdrop-blur-sm">
                <TabsList className="w-full justify-start rounded-b-none border-b border-emerald-400/10 bg-white/5 p-0">
                  <TabsTrigger value="about" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-400">
                    Sobre
                  </TabsTrigger>
                  <TabsTrigger value="evidences" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-400">
                    Evidencias ({project.evidences.length})
                  </TabsTrigger>
                  <TabsTrigger value="validation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-400">
                    Validacao
                  </TabsTrigger>
                  <TabsTrigger value="institution" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-400">
                    Empresa
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Descricao do Projeto</h3>
                  <p className="mb-6 text-white/60">{project.description}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Impacto Alvo</p>
                        <p className="text-sm text-white/50">{project.targetImpact}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Periodo</p>
                        <p className="text-sm text-white/50">
                          {new Date(project.startDate).toLocaleDateString("pt-BR")} {" - "}
                          {new Date(project.endDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {project.budget && (
                    <div className="mt-6 rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Orcamento Total</span>
                        <span className="text-xl font-bold text-emerald-400">
                          R$ {project.budget.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mt-1">Financiado pela empresa, sem doacoes externas</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="evidences" className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Evidencias Registradas</h3>
                  <p className="mb-6 text-sm text-white/50">
                    Evidencias coletadas via App Sthation com GPS, timestamp e hash de integridade.
                  </p>

                  <div className="space-y-3">
                    {project.evidences.map((ev) => (
                      <div key={ev.id} className="rounded-lg border border-emerald-400/20 bg-white/5 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                            {getEvidenceIcon(ev.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs border-emerald-400/30 text-emerald-400">
                                {ev.type}
                              </Badge>
                              <span className="text-xs text-white/40">
                                {new Date(ev.timestamp).toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <p className="text-sm text-white/70">{ev.description}</p>
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/40">
                              <span>GPS: {ev.gpsCoordinates.lat.toFixed(4)}, {ev.gpsCoordinates.lng.toFixed(4)}</span>
                              <span className="font-mono">{ev.contentHash.substring(0, 20)}...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {project.evidences.length === 0 && (
                    <div className="py-12 text-center">
                      <Camera className="mx-auto mb-3 h-10 w-10 text-white/20" />
                      <p className="text-white/40">Nenhuma evidencia registrada ainda</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="validation" className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Processo de Validacao</h3>
                  <p className="mb-6 text-sm text-white/50">
                    Projetos ambientais sao validados exclusivamente por Analistas Certificadores habilitados.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-emerald-400">Analista Certificador</p>
                          <p className="text-sm text-white/50 mt-1">
                            Diferente dos projetos sociais (VCA com Checkers), projetos ambientais passam
                            por validacao tecnica de Analistas Certificadores com expertise em meio ambiente.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Audit log */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-white/70">Historico</h4>
                      {project.auditLog.map((log, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm">
                          <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                          <div>
                            <p className="text-white/80">{log.action}</p>
                            <p className="text-xs text-white/40">
                              {new Date(log.timestamp).toLocaleString("pt-BR")}
                              {log.details && ` - ${log.details}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="institution" className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5">
                      <Building2 className="h-8 w-8 text-white/50" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{project.institution?.name}</h3>
                      <p className="text-sm text-white/50">
                        Empresa/organizacao responsavel pelo projeto ambiental
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Cadastro verificado na plataforma</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Financiamento proprio (sem doacoes)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Sujeito a auditoria por Analistas Certificadores</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status card */}
              <Card className="border-emerald-400/20 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-emerald-400" />
                    Status do Projeto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-white/5 p-4 text-center">
                    <Badge className={`text-sm ${statusConfig.color}`}>{statusConfig.label}</Badge>
                    <p className="text-xs text-white/50 mt-2">{statusConfig.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="rounded-lg bg-white/5 p-3">
                      <FileText className="mx-auto mb-1 h-5 w-5 text-white/50" />
                      <p className="text-lg font-bold text-white">{project.evidences.length}</p>
                      <p className="text-xs text-white/50">Evidencias</p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-3">
                      <Calendar className="mx-auto mb-1 h-5 w-5 text-white/50" />
                      <p className="text-lg font-bold text-white">
                        {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))}
                      </p>
                      <p className="text-xs text-white/50">Dias de projeto</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Validation info */}
              <Card className="border-emerald-400/20 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-base">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    Validacao Ambiental
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg bg-emerald-400/5 border border-emerald-400/20 p-3">
                    <p className="text-xs text-white/50 mb-1">Validado por</p>
                    <p className="text-sm font-medium text-emerald-400">Analistas Certificadores</p>
                  </div>
                  <div className="rounded-lg bg-amber-400/5 border border-amber-400/20 p-3">
                    <p className="text-xs text-white/50 mb-1">Diferenca do fluxo social</p>
                    <p className="text-xs text-white/60">
                      Sem doacoes, sem Checkers VCA. Apenas certificadoras validam o impacto ambiental.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* TSB Category */}
              <Card className="border-emerald-400/20 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-base">
                    <TreePine className="h-5 w-5 text-emerald-400" />
                    Taxonomia TSB
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-white/5 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{project.tsbCategory}</p>
                    <p className="text-sm text-white/60 mt-1">{tsbInfo?.name}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

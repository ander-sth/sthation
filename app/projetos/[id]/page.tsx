"use client"

import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MapPin,
  Users,
  Heart,
  ArrowLeft,
  Calendar,
  Target,
  Building2,
  Shield,
  Clock,
  CheckCircle2,
  Info,
  ExternalLink,
  Copy,
  Loader2,
  UtensilsCrossed,
  GraduationCap,
  Home,
  Briefcase,
  Stethoscope,
  HandHeart,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { mockFundingProjects } from "@/lib/mock-data"
import { FundingStatus, FUNDING_STATUS_CONFIG } from "@/lib/types/funding"
import { calculatePaymentSplit, getExplorerLink, registerDonationOnBlockchain } from "@/lib/blockchain/service"
import { SPLIT_PERCENTAGES } from "@/lib/blockchain/types"
import { useToast } from "@/hooks/use-toast"

const SOCIAL_CATEGORY_ICONS: Record<string, { icon: typeof Heart; bg: string; color: string }> = {
  "Alimentacao": { icon: UtensilsCrossed, bg: "bg-amber-500/20", color: "text-amber-400" },
  "Alimentacao e Seguranca Alimentar": { icon: UtensilsCrossed, bg: "bg-amber-500/20", color: "text-amber-400" },
  "Educacao": { icon: GraduationCap, bg: "bg-blue-500/20", color: "text-blue-400" },
  "Assistencia Social": { icon: Home, bg: "bg-rose-500/20", color: "text-rose-400" },
  "Capacitacao": { icon: Briefcase, bg: "bg-purple-500/20", color: "text-purple-400" },
  "Saude": { icon: Stethoscope, bg: "bg-emerald-500/20", color: "text-emerald-400" },
}

export default function ProjetoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [donationAmount, setDonationAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [blockchainData, setBlockchainData] = useState<{
    dataHash: string
    txHash: string
    blockNumber: number
  } | null>(null)

  const project = mockFundingProjects.find((p) => p.id === params.id)

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Projeto não encontrado</h1>
            <Button asChild>
              <Link href="/projetos">Voltar aos Projetos</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const progressPercent = Math.round((project.currentAmount / project.costModel.metaTotal) * 100)
  const statusConfig = FUNDING_STATUS_CONFIG[project.status]
  const daysLeft = project.deadline
    ? Math.max(0, Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const donationValue = Number.parseFloat(donationAmount) || 0
  const split = calculatePaymentSplit(donationValue)

  const handleDonate = async () => {
    if (donationValue < 10) {
      toast({
        title: "Valor mínimo",
        description: "O valor mínimo de doação é R$ 10,00",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const donationId = `don_${Date.now()}`
      const donorId = `user_${Math.random().toString(36).substr(2, 9)}`

      const result = await registerDonationOnBlockchain(
        donationId,
        donorId,
        donationValue * 100, // Converter para centavos
        project.id,
      )

      setBlockchainData({
        dataHash: result.dataHash,
        txHash: result.txHash!,
        blockNumber: result.blockNumber!,
      })

      setShowConfirmation(true)
      setDonationAmount("")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua doação. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "Hash copiado para a área de transferência",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-[#071f1f]">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Button variant="ghost" size="sm" asChild className="mb-6 text-white/60 hover:text-teal-400 hover:bg-white/5">
            <Link href="/projetos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Projetos
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Coluna principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Imagem e título */}
              <div className="overflow-hidden rounded-xl border border-teal-400/20 bg-white/5 backdrop-blur-sm">
                <div className="relative">
                  {(() => {
                    const cat = SOCIAL_CATEGORY_ICONS[project.category] || { icon: HandHeart, bg: "bg-teal-500/20", color: "text-teal-400" }
                    const IconComp = cat.icon
                    return (
                      <div className={`h-64 w-full flex items-center justify-center md:h-80 ${cat.bg}`}>
                        <IconComp className={`h-24 w-24 ${cat.color}`} />
                      </div>
                    )
                  })()}
                  <Badge className={`absolute right-4 top-4 ${statusConfig.color}`}>{statusConfig.label}</Badge>
                </div>
                <div className="p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-teal-400/30 text-teal-400">{project.category}</Badge>
                    <Badge className="bg-teal-400/20 text-teal-400 border-0">{project.tsbCategory}</Badge>
                  </div>
                  <h1 className="mb-2 text-2xl font-bold md:text-3xl text-white">{project.title}</h1>
                  <p className="flex items-center gap-2 text-white/60">
                    <MapPin className="h-4 w-4" />
                    {project.location.name}, {project.location.state}
                  </p>
                </div>
              </div>

              {/* Tabs de informação */}
              <Tabs defaultValue="about" className="rounded-xl border border-teal-400/20 bg-white/5 backdrop-blur-sm">
                <TabsList className="w-full justify-start rounded-b-none border-b border-white/10 bg-white/5 p-0">
                  <TabsTrigger
                    value="about"
                    className="rounded-none border-b-2 border-transparent text-white/60 data-[state=active]:border-teal-400 data-[state=active]:text-white"
                  >
                    Sobre
                  </TabsTrigger>
                  <TabsTrigger
                    value="transparency"
                    className="rounded-none border-b-2 border-transparent text-white/60 data-[state=active]:border-teal-400 data-[state=active]:text-white"
                  >
                    Transparencia
                  </TabsTrigger>
                  <TabsTrigger
                    value="blockchain"
                    className="rounded-none border-b-2 border-transparent text-white/60 data-[state=active]:border-teal-400 data-[state=active]:text-white"
                  >
                    Blockchain
                  </TabsTrigger>
                  <TabsTrigger
                    value="institution"
                    className="rounded-none border-b-2 border-transparent text-white/60 data-[state=active]:border-teal-400 data-[state=active]:text-white"
                  >
                    Instituicao
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Descricao do Projeto</h3>
                  <p className="mb-6 text-white/70">{project.description}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/10 text-teal-400">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Beneficiarios</p>
                        <p className="text-sm text-white/70">
                          {project.estimatedBeneficiaries.toLocaleString("pt-BR")} pessoas/animais
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/10 text-teal-400">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Prazo</p>
                        <p className="text-sm text-white/70">
                          {project.deadline ? new Date(project.deadline).toLocaleDateString("pt-BR") : "Continuo"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="transparency" className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Modelo de Custos</h3>
                  <p className="mb-6 text-sm text-white/70">
                    Transparencia total na aplicacao dos recursos conforme metodologia STHATION.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium text-white">CDP - Custo Direto do Projeto</span>
                        <span className="font-bold text-white">R$ {project.costModel.cdp.toLocaleString("pt-BR")}</span>
                      </div>
                      <p className="text-xs text-white/60">
                        Recursos aplicados diretamente na execucao do projeto
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium text-white">PCO - Parcela Custo Operacional</span>
                        <span className="font-bold text-white">R$ {project.costModel.pco.toLocaleString("pt-BR")}</span>
                      </div>
                      <p className="text-xs text-white/60">
                        FRI de {(project.costModel.fri * 100).toFixed(0)}% sobre COM de R${" "}
                        {project.costModel.com.toLocaleString("pt-BR")}
                      </p>
                    </div>

                    <Separator />

                    <div className="rounded-lg border border-teal-400/50 bg-teal-400/10 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Meta Total</span>
                        <span className="text-xl font-bold text-teal-400">
                          R$ {project.costModel.metaTotal.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="blockchain" className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-white">Registro em Blockchain</h3>
                  <p className="mb-6 text-sm text-white/70">
                    Todas as doacoes sao registradas na rede Polygon para garantir transparencia e imutabilidade.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-lg border bg-emerald-500/10 border-emerald-500/30 p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-emerald-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-emerald-400">Rede Polygon (MATIC)</p>
                          <p className="text-sm text-white/70 mt-1">
                            Usamos Polygon para registrar doacoes com custo ultra-baixo (R$ 0,01 - R$ 0,10) e alta
                            velocidade (2 segundos).
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/60">Custo por transacao</p>
                        <p className="text-lg font-bold text-white">R$ 0,01 - R$ 0,10</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/60">Tempo de confirmacao</p>
                        <p className="text-lg font-bold text-white">~2 segundos</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <p className="font-medium text-white mb-2">Como funciona:</p>
                      <ol className="text-sm text-white/70 space-y-2 list-decimal list-inside">
                        <li>Sua doacao e validada e salva no banco de dados</li>
                        <li>Um hash SHA-256 unico e gerado com os dados da doacao</li>
                        <li>O hash e registrado no smart contract na rede Polygon</li>
                        <li>Voce recebe o comprovante com link para verificar no Polygonscan</li>
                      </ol>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="institution" className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-teal-400/10">
                      <Building2 className="h-8 w-8 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Instituicao Parceira</h3>
                      <p className="text-sm text-white/70">
                        Instituicao verificada e habilitada na plataforma STHATION
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Documentacao verificada</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Historico de projetos concluidos</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Prestacao de contas auditavel</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Doação */}
            <div className="space-y-6">
              {/* Card de progresso */}
              <Card className="border-teal-400/20 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Progresso da Captação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-end justify-between">
                      <span className="text-3xl font-bold text-primary">
                        R$ {project.currentAmount.toLocaleString("pt-BR")}
                      </span>
                      <span className="text-sm text-white/50">
                        de R$ {project.costModel.metaTotal.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                    <p className="mt-1 text-right text-sm font-medium text-primary">{progressPercent}%</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="rounded-lg bg-white/5 p-3">
                      <Users className="mx-auto mb-1 h-5 w-5 text-white/50" />
                      <p className="text-lg font-bold">{project.donorsCount}</p>
                      <p className="text-xs text-white/50">Doadores</p>
                    </div>
                    {daysLeft !== null && (
                      <div className="rounded-lg bg-white/5 p-3">
                        <Clock className="mx-auto mb-1 h-5 w-5 text-white/50" />
                        <p className="text-lg font-bold">{daysLeft}</p>
                        <p className="text-xs text-white/50">Dias restantes</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card de doação */}
              {project.status === FundingStatus.FUNDING && (
                <Card className="border-teal-400/40 bg-white/5 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Heart className="h-5 w-5 text-teal-400" />
                      Fazer Doação
                    </CardTitle>
                    <CardDescription className="text-white/60">Escolha o valor que deseja doar para este projeto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Valores sugeridos */}
                    <div className="grid grid-cols-3 gap-2">
                      {[25, 50, 100].map((value) => (
                        <Button
                          key={value}
                          variant={donationAmount === value.toString() ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDonationAmount(value.toString())}
                        >
                          R$ {value}
                        </Button>
                      ))}
                    </div>

                    {/* Input customizado */}
                    <div className="space-y-2">
                      <Label htmlFor="amount">Outro valor</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">R$</span>
                        <Input
                          id="amount"
                          type="number"
                          min="10"
                          step="0.01"
                          placeholder="0,00"
                          className="pl-10"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                        />
                      </div>
                    </div>

                    {donationValue >= 10 && (
                      <div className="rounded-lg bg-white/5 p-4 space-y-2">
                        <p className="text-xs font-medium text-white/50 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Distribuição da sua doação:
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Instituição ({(SPLIT_PERCENTAGES.institution * 100).toFixed(0)}%)</span>
                            <span className="font-medium">R$ {split.institution.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-white/50">
                            <span>Checkers ({(SPLIT_PERCENTAGES.checkers * 100).toFixed(0)}%)</span>
                            <span>R$ {split.checkers.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-white/50">
                            <span>Certificadores ({(SPLIT_PERCENTAGES.certifiers * 100).toFixed(0)}%)</span>
                            <span>R$ {split.certifiers.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-white/50">
                            <span>Fundo Gas Inscription ({(SPLIT_PERCENTAGES.gasInscription * 100).toFixed(0)}%)</span>
                            <span>R$ {split.gasInscription.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-white/50">
                            <span>STHATION ({(SPLIT_PERCENTAGES.sthation * 100).toFixed(0)}%)</span>
                            <span>R$ {split.sthation.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold rounded-full glow-teal"
                      size="lg"
                      onClick={handleDonate}
                      disabled={donationValue < 10 || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Heart className="mr-2 h-4 w-4" />
                          Doar R$ {donationValue > 0 ? donationValue.toFixed(2) : "0,00"}
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs text-white/50">
                      Pagamento seguro com registro em blockchain.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Card de segurança */}
              <Card className="border-teal-400/20 bg-white/5 backdrop-blur-sm">
                <CardContent className="flex items-start gap-3 p-4">
                  <Shield className="h-5 w-5 text-teal-400" />
                  <div>
                    <p className="font-medium text-sm text-white">Doação Protegida</p>
                    <p className="text-xs text-white/60">
                      Sua doação é rastreável na rede Polygon e o impacto será validado por checkers independentes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
              Doação Confirmada!
            </DialogTitle>
            <DialogDescription>Sua doação foi processada e registrada no blockchain com sucesso.</DialogDescription>
          </DialogHeader>

          {blockchainData && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-3">
                <p className="text-sm font-medium text-emerald-800">Comprovante Blockchain</p>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-emerald-700">Hash dos Dados (SHA-256)</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-white p-1 rounded flex-1 truncate text-gray-800 border border-emerald-200">{blockchainData.dataHash}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-emerald-700 hover:text-emerald-800"
                        onClick={() => copyToClipboard(blockchainData.dataHash)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-emerald-700">Hash da Transacao</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-white p-1 rounded flex-1 truncate text-gray-800 border border-emerald-200">{blockchainData.txHash}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-emerald-700 hover:text-emerald-800"
                        onClick={() => copyToClipboard(blockchainData.txHash)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-emerald-700">Bloco</p>
                    <code className="text-xs bg-white p-1 rounded text-gray-800 border border-emerald-200">#{blockchainData.blockNumber.toLocaleString()}</code>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full bg-transparent" asChild>
                <a href={getExplorerLink(blockchainData.txHash)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver no Polygonscan
                </a>
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowConfirmation(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

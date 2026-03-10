"use client"

import { useState } from "react"
import { 
  Flame, 
  ArrowRight, 
  Check, 
  Loader2, 
  Hexagon,
  Bitcoin,
  Shield,
  Sparkles,
  Copy,
  ExternalLink,
  AlertCircle,
  Heart,
  Leaf,
  RefreshCw
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import useSWR, { mutate } from "swr"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then(res => res.json())

type BridgeStep = "select" | "confirm" | "burning" | "generating" | "minting" | "complete"

const steps = [
  { id: "burning", label: "Queimando Tokens", description: "Destruindo tokens na Polygon" },
  { id: "generating", label: "Gerando Prova", description: "Criando atestação criptográfica" },
  { id: "minting", label: "Mintando Inscription", description: "Registrando no Bitcoin" },
]

export default function TheBridgePage() {
  const { toast } = useToast()
  const [selectedIacId, setSelectedIacId] = useState<string>("")
  const [step, setStep] = useState<BridgeStep>("select")
  const [currentProcessStep, setCurrentProcessStep] = useState(0)
  const [bridgeResult, setBridgeResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Buscar IACs elegíveis (registrados na Polygon mas ainda não inscritos no Bitcoin)
  const { data: assetsData, isLoading: assetsLoading } = useSWR("/api/nobiscore/assets", fetcher)
  
  // Buscar fila de bridge pendente
  const { data: queueData } = useSWR("/api/bridge/process?status=PENDING", fetcher)
  
  // Buscar estatísticas do bridge
  const { data: statsData } = useSWR("/api/bridge/status", fetcher)

  const eligibleIacs = assetsData?.eligibleForBridge || []
  const pendingQueue = queueData?.queue || []
  const selectedIac = eligibleIacs.find((iac: any) => iac.id === selectedIacId)

  const handleStartBridge = async () => {
    if (!selectedIacId) return
    
    setIsProcessing(true)
    setStep("burning")
    setCurrentProcessStep(0)
    
    try {
      // Primeiro: verificar se IAC já está na fila ou se precisa ser adicionado
      const statusRes = await fetch(`/api/bridge/status?iacId=${selectedIacId}`)
      const statusData = await statusRes.json()
      
      let queueId = statusData?.details?.bridge?.queueId

      // Se não está na fila, adicionar primeiro pagando gas
      if (!queueId) {
        const mintRes = await fetch("/api/bridge/mint-polygon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ iacId: selectedIacId, payGasFee: true })
        })
        const mintData = await mintRes.json()
        
        if (!mintRes.ok) {
          throw new Error(mintData.error || "Erro ao mintar na Polygon")
        }
        
        // Buscar o queueId criado
        const newStatusRes = await fetch(`/api/bridge/status?iacId=${selectedIacId}`)
        const newStatusData = await newStatusRes.json()
        queueId = newStatusData?.details?.bridge?.queueId
      }

      if (!queueId) {
        // Buscar da fila
        const queueRes = await fetch("/api/bridge/process?status=PENDING")
        const queueList = await queueRes.json()
        const queueItem = queueList?.queue?.find((q: any) => q.iac_id === selectedIacId)
        queueId = queueItem?.id
      }

      if (!queueId) {
        throw new Error("Não foi possível adicionar à fila de bridge")
      }

      // FASE 1: Burning (já iniciado)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setCurrentProcessStep(1)
      setStep("generating")
      
      // FASE 2: Generating proof
      await new Promise(resolve => setTimeout(resolve, 1500))
      setCurrentProcessStep(2)
      setStep("minting")

      // FASE 3: Processar o bridge completo (burn + inscription)
      const processRes = await fetch("/api/bridge/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueId })
      })
      const processData = await processRes.json()

      if (!processRes.ok) {
        throw new Error(processData.error || "Erro ao processar bridge")
      }

      setBridgeResult(processData.data)
      setStep("complete")
      
      // Atualizar dados
      mutate("/api/nobiscore/assets")
      mutate("/api/bridge/status")

      toast({
        title: "Bridge concluído!",
        description: "Sua inscription foi criada com sucesso no Bitcoin",
      })

    } catch (error: any) {
      console.error("[BRIDGE] Erro:", error)
      toast({
        title: "Erro no bridge",
        description: error.message || "Erro ao processar bridge",
        variant: "destructive"
      })
      setStep("select")
    } finally {
      setIsProcessing(false)
    }
  }

  const resetBridge = () => {
    setStep("select")
    setSelectedIacId("")
    setCurrentProcessStep(0)
    setBridgeResult(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">The Bridge</h1>
          <p className="text-neutral-400 mt-2">
            Transforme seus IACs validados na Polygon em Inscriptions permanentes no Bitcoin
          </p>
        </div>
        {statsData?.stats && (
          <div className="text-right hidden md:block">
            <p className="text-sm text-neutral-500">Bridges completados</p>
            <p className="text-2xl font-bold text-white">{statsData.stats.completed_bridges || 0}</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <p className="text-neutral-500 text-xs">Tokens na Polygon</p>
            <p className="text-xl font-bold text-purple-400">{statsData?.stats?.total_polygon_tokens || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <p className="text-neutral-500 text-xs">Na Fila</p>
            <p className="text-xl font-bold text-yellow-400">{statsData?.stats?.pending_bridges || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <p className="text-neutral-500 text-xs">Em Processamento</p>
            <p className="text-xl font-bold text-blue-400">
              {(statsData?.stats?.burning || 0) + (statsData?.stats?.inscribing || 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <p className="text-neutral-500 text-xs">Inscriptions Ativas</p>
            <p className="text-xl font-bold text-orange-400">{statsData?.stats?.active_nobis_tokens || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Bridge Interface */}
      <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
        <CardContent className="p-0">
          {/* Progress Steps Header */}
          {(step === "burning" || step === "generating" || step === "minting" || step === "complete") && (
            <div className="bg-neutral-950 border-b border-neutral-800 p-6">
              <div className="flex items-center justify-between">
                {steps.map((s, index) => (
                  <div key={s.id} className="flex items-center">
                    <div className="flex items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                        currentProcessStep > index 
                          ? "bg-green-500 border-green-500" 
                          : currentProcessStep === index 
                            ? "border-white bg-white/10" 
                            : "border-neutral-700 bg-neutral-900"
                      )}>
                        {currentProcessStep > index ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : currentProcessStep === index ? (
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <span className="text-neutral-500 font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="ml-3 hidden md:block">
                        <p className={cn(
                          "text-sm font-medium",
                          currentProcessStep >= index ? "text-white" : "text-neutral-500"
                        )}>
                          {s.label}
                        </p>
                        <p className="text-xs text-neutral-500">{s.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "w-12 md:w-24 h-0.5 mx-4",
                        currentProcessStep > index ? "bg-green-500" : "bg-neutral-800"
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Step 1: Select IAC */}
            {step === "select" && (
              <div className="space-y-8">
                {assetsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
                  </div>
                ) : eligibleIacs.length === 0 ? (
                  <div className="text-center py-12">
                    <Hexagon className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-medium">Nenhum IAC elegível</h3>
                    <p className="text-neutral-500 mt-2 max-w-md mx-auto">
                      Para fazer bridge, você precisa ter IACs validados e registrados na Polygon. 
                      IACs são registrados automaticamente após aprovação na Sthation.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-6 border-neutral-700"
                      onClick={() => mutate("/api/nobiscore/assets")}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Atualizar Lista
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Source Chain */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Hexagon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Origem</p>
                          <p className="text-xs text-neutral-500">Polygon Network</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-neutral-400">Selecione o IAC para Bridge</Label>
                        <Select value={selectedIacId} onValueChange={setSelectedIacId}>
                          <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white h-14">
                            <SelectValue placeholder="Escolha um IAC validado" />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-800 border-neutral-700">
                            {eligibleIacs.map((iac: any) => (
                              <SelectItem 
                                key={iac.id} 
                                value={iac.id}
                                className="text-white focus:bg-neutral-700 focus:text-white"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                    iac.type === "SOCIAL" 
                                      ? "bg-pink-500/20" 
                                      : "bg-green-500/20"
                                  )}>
                                    {iac.type === "SOCIAL" ? (
                                      <Heart className="w-4 h-4 text-pink-400" />
                                    ) : (
                                      <Leaf className="w-4 h-4 text-green-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium line-clamp-1">{iac.title}</p>
                                    <p className="text-xs text-neutral-400">
                                      {iac.institution_name || iac.category}
                                    </p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedIac && (
                        <Card className="bg-neutral-800/50 border-neutral-700">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-neutral-400">Tipo</span>
                              <Badge className={cn(
                                "text-xs",
                                selectedIac.type === "SOCIAL" 
                                  ? "bg-pink-500/20 text-pink-400 border-pink-500/30" 
                                  : "bg-green-500/20 text-green-400 border-green-500/30"
                              )}>
                                {selectedIac.type}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-neutral-400">Instituição</span>
                              <span className="text-white">{selectedIac.institution_name || "N/A"}</span>
                            </div>
                            {selectedIac.estimated_beneficiaries && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-400">Beneficiários</span>
                                <span className="text-white">{selectedIac.estimated_beneficiaries.toLocaleString()}</span>
                              </div>
                            )}
                            {selectedIac.polygon_tx_hash && (
                              <div className="flex items-center justify-between text-sm pt-2 border-t border-neutral-700">
                                <span className="text-neutral-400">Polygon TX</span>
                                <a 
                                  href={`https://polygonscan.com/tx/${selectedIac.polygon_tx_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                                >
                                  <code className="text-xs font-mono">
                                    {selectedIac.polygon_tx_hash?.slice(0, 10)}...
                                  </code>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex items-center justify-center">
                      <div className="p-4 bg-neutral-800 rounded-full">
                        <ArrowRight className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Destination Chain */}
                    <div className="space-y-4 md:-ml-16">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <Bitcoin className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Destino</p>
                          <p className="text-xs text-neutral-500">Bitcoin Ordinals</p>
                        </div>
                      </div>

                      <Card className="bg-neutral-800/50 border-neutral-700">
                        <CardContent className="p-4">
                          <p className="text-neutral-400 text-sm mb-3">Você receberá:</p>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">NOBIS Impact Inscription</p>
                              <p className="text-xs text-neutral-500">
                                {selectedIac 
                                  ? `${selectedIac.type} - ${selectedIac.title?.slice(0, 30)}...` 
                                  : "Selecione um IAC acima"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex items-start gap-2 p-3 bg-neutral-800/30 rounded-lg border border-neutral-800">
                        <Shield className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-neutral-400">
                          Seus dados de impacto serão permanentemente registrados no Bitcoin com prova criptográfica de autenticidade.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {eligibleIacs.length > 0 && (
                  <Button 
                    onClick={handleStartBridge}
                    disabled={!selectedIacId || isProcessing}
                    className="w-full h-14 bg-white text-black hover:bg-neutral-200 font-medium text-base"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Flame className="w-5 h-5 mr-2" />
                    )}
                    Transformar em Inscription
                  </Button>
                )}
              </div>
            )}

            {/* Processing Steps */}
            {(step === "burning" || step === "generating" || step === "minting") && (
              <div className="text-center py-12">
                <div className="relative inline-flex">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center animate-pulse">
                    <Flame className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -inset-4 border-2 border-orange-500/30 rounded-3xl animate-ping" />
                </div>
                <h2 className="text-2xl font-bold text-white mt-8">
                  {step === "burning" && "Queimando Token na Polygon..."}
                  {step === "generating" && "Gerando Prova Criptográfica..."}
                  {step === "minting" && "Mintando Inscription no Bitcoin..."}
                </h2>
                <p className="text-neutral-400 mt-2">
                  {step === "burning" && "Registrando burn do IAC na Polygon"}
                  {step === "generating" && "Criando atestação dos dados de impacto"}
                  {step === "minting" && "Inscrevendo dados permanentemente no Bitcoin"}
                </p>
                <div className="flex items-center justify-center gap-2 mt-6 text-neutral-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Não feche esta janela</span>
                </div>
              </div>
            )}

            {/* Complete */}
            {step === "complete" && bridgeResult && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mt-6">Inscription Criada!</h2>
                <p className="text-neutral-400 mt-2">
                  Seu impacto foi permanentemente registrado no Bitcoin
                </p>

                {/* Result Card */}
                <Card className="bg-neutral-800/50 border-neutral-700 mt-8 max-w-md mx-auto">
                  <CardContent className="p-6">
                    <div className="w-full aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center mb-4 border border-neutral-700">
                      <div className="text-center px-4">
                        <Sparkles className="w-16 h-16 text-orange-400 mx-auto" />
                        <p className="text-white font-medium mt-4 line-clamp-2">
                          {selectedIac?.title}
                        </p>
                        <Badge className={cn(
                          "mt-2",
                          selectedIac?.type === "SOCIAL" 
                            ? "bg-pink-500/20 text-pink-400" 
                            : "bg-green-500/20 text-green-400"
                        )}>
                          {selectedIac?.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg">
                        <span className="text-neutral-400 text-sm">Inscription ID</span>
                        <div className="flex items-center gap-2">
                          <code className="text-orange-400 text-sm font-mono">
                            {bridgeResult.bitcoin?.inscriptionId?.slice(0, 12)}...
                          </code>
                          <button 
                            className="text-neutral-500 hover:text-white"
                            onClick={() => navigator.clipboard.writeText(bridgeResult.bitcoin?.inscriptionId)}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg">
                        <span className="text-neutral-400 text-sm">Ordinal ID</span>
                        <span className="text-white text-sm">{bridgeResult.bitcoin?.ordinalId}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg">
                        <span className="text-neutral-400 text-sm">Polygon Burn TX</span>
                        <a 
                          href={`https://polygonscan.com/tx/${bridgeResult.polygon?.burnTx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                        >
                          <code className="text-xs font-mono">
                            {bridgeResult.polygon?.burnTx?.slice(0, 10)}...
                          </code>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3 justify-center mt-8">
                  <Button 
                    variant="outline" 
                    onClick={resetBridge}
                    className="border-neutral-700 text-white hover:bg-neutral-800"
                  >
                    Novo Bridge
                  </Button>
                  <a 
                    href={bridgeResult.bitcoin?.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                      Ver no Ordinals
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Queue */}
      {pendingQueue.length > 0 && step === "select" && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <h3 className="text-white font-medium mb-4">Bridges Pendentes</h3>
            <div className="space-y-3">
              {pendingQueue.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      item.type === "SOCIAL" ? "bg-pink-500/20" : "bg-green-500/20"
                    )}>
                      {item.type === "SOCIAL" ? (
                        <Heart className="w-4 h-4 text-pink-400" />
                      ) : (
                        <Leaf className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{item.title}</p>
                      <p className="text-neutral-500 text-xs">{item.institution_name}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

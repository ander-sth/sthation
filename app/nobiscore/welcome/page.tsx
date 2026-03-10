"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Wallet, 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe,
  Check,
  Loader2,
  ExternalLink,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Tipos de carteiras suportadas
const evmWallets = [
  { id: "metamask", name: "MetaMask", icon: "/icons/metamask.svg", popular: true },
  { id: "walletconnect", name: "WalletConnect", icon: "/icons/walletconnect.svg", popular: true },
  { id: "coinbase", name: "Coinbase Wallet", icon: "/icons/coinbase.svg", popular: false },
  { id: "rabby", name: "Rabby", icon: "/icons/rabby.svg", popular: false },
]

const btcWallets = [
  { id: "xverse", name: "Xverse", icon: "/icons/xverse.svg", popular: true },
  { id: "unisat", name: "Unisat", icon: "/icons/unisat.svg", popular: true },
  { id: "leather", name: "Leather (Hiro)", icon: "/icons/leather.svg", popular: false },
  { id: "okx", name: "OKX Wallet", icon: "/icons/okx.svg", popular: false },
]

interface WalletState {
  evm: { connected: boolean; address: string | null; wallet: string | null }
  btc: { connected: boolean; address: string | null; wallet: string | null }
}

function truncateAddress(address: string, chars = 6) {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export default function NobisCoreWelcomePage() {
  const router = useRouter()
  const [step, setStep] = useState<"intro" | "connect" | "ready">("intro")
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)
  const [showAllEvm, setShowAllEvm] = useState(false)
  const [showAllBtc, setShowAllBtc] = useState(false)
  
  const [wallets, setWallets] = useState<WalletState>({
    evm: { connected: false, address: null, wallet: null },
    btc: { connected: false, address: null, wallet: null },
  })

  // Simular conexão de carteira EVM
  const connectEvmWallet = async (walletId: string) => {
    setConnectingWallet(walletId)
    
    // Simular delay de conexão
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Em produção: usar ethers.js ou wagmi para conexão real
    const mockAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    
    setWallets(prev => ({
      ...prev,
      evm: { connected: true, address: mockAddress, wallet: walletId }
    }))
    setConnectingWallet(null)
    
    // Se ambas conectadas, ir para ready
    if (wallets.btc.connected) {
      setStep("ready")
    }
  }

  // Simular conexão de carteira BTC
  const connectBtcWallet = async (walletId: string) => {
    setConnectingWallet(walletId)
    
    // Simular delay de conexão
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Em produção: usar sats-connect ou similar
    const mockAddress = "bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297"
    
    setWallets(prev => ({
      ...prev,
      btc: { connected: true, address: mockAddress, wallet: walletId }
    }))
    setConnectingWallet(null)
    
    // Se ambas conectadas, ir para ready
    if (wallets.evm.connected) {
      setStep("ready")
    }
  }

  // Entrar no NobisCore
  const enterNobisCore = () => {
    // Salvar estado das carteiras no localStorage
    localStorage.setItem("nobiscore_wallets", JSON.stringify(wallets))
    router.push("/nobiscore")
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-black font-bold text-lg">N</span>
          </div>
          <div>
            <span className="font-semibold text-xl tracking-tight">NobisCore</span>
            <span className="text-xs text-neutral-500 block">by Sthation</span>
          </div>
        </Link>

        <Link 
          href="/"
          className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
        >
          Voltar para Sthation
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6">
        
        {/* Step: Intro */}
        {step === "intro" && (
          <div className="max-w-2xl text-center space-y-8 animate-in fade-in duration-500">
            {/* Logo grande */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white to-neutral-300 flex items-center justify-center shadow-2xl shadow-white/10">
                <span className="text-black font-bold text-5xl">N</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Transforme Impacto em
              <span className="block mt-2 bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
                Bitcoin Inscriptions
              </span>
            </h1>

            <p className="text-lg text-neutral-400 max-w-xl mx-auto leading-relaxed">
              A ponte entre tokens de impacto social e ambiental na Polygon para 
              registros imutáveis no Bitcoin via Ordinals.
            </p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                <Shield className="w-8 h-8 text-white mb-3" />
                <h3 className="font-medium mb-1">Imutável</h3>
                <p className="text-xs text-neutral-500">Registrado para sempre no Bitcoin</p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                <Zap className="w-8 h-8 text-white mb-3" />
                <h3 className="font-medium mb-1">Eficiente</h3>
                <p className="text-xs text-neutral-500">Bridge otimizado e seguro</p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                <Globe className="w-8 h-8 text-white mb-3" />
                <h3 className="font-medium mb-1">Global</h3>
                <p className="text-xs text-neutral-500">Marketplace internacional</p>
              </div>
            </div>

            <Button 
              onClick={() => setStep("connect")}
              size="lg"
              className="mt-8 bg-white text-black hover:bg-neutral-200 rounded-full px-8 py-6 text-lg font-semibold transition-all hover:scale-105"
            >
              Conectar Carteiras
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Step: Connect Wallets */}
        {step === "connect" && (
          <div className="w-full max-w-4xl animate-in fade-in duration-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Conecte suas carteiras</h2>
              <p className="text-neutral-400">
                Você precisa de uma carteira EVM (Polygon) e uma carteira Bitcoin (Ordinals)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* EVM Wallet */}
              <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Carteira EVM</h3>
                      <p className="text-xs text-neutral-500">Polygon Network</p>
                    </div>
                  </div>
                  {wallets.evm.connected && (
                    <div className="flex items-center gap-2 text-green-400">
                      <Check className="w-5 h-5" />
                      <span className="text-sm">Conectada</span>
                    </div>
                  )}
                </div>

                {wallets.evm.connected ? (
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Endereço</p>
                        <code className="text-sm font-mono text-purple-300">
                          {truncateAddress(wallets.evm.address!)}
                        </code>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                        {wallets.evm.wallet}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(showAllEvm ? evmWallets : evmWallets.filter(w => w.popular)).map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={() => connectEvmWallet(wallet.id)}
                        disabled={connectingWallet !== null}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                          "border-neutral-700 hover:border-purple-500/50 hover:bg-purple-500/5",
                          connectingWallet === wallet.id && "border-purple-500 bg-purple-500/10"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                            <span className="text-lg font-bold">{wallet.name[0]}</span>
                          </div>
                          <span className="font-medium">{wallet.name}</span>
                        </div>
                        {connectingWallet === wallet.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                        ) : (
                          <ArrowRight className="w-5 h-5 text-neutral-500" />
                        )}
                      </button>
                    ))}
                    {!showAllEvm && (
                      <button 
                        onClick={() => setShowAllEvm(true)}
                        className="w-full flex items-center justify-center gap-2 p-3 text-sm text-neutral-500 hover:text-white transition-colors"
                      >
                        Mais carteiras
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* BTC Wallet */}
              <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <span className="text-2xl">₿</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Carteira Bitcoin</h3>
                      <p className="text-xs text-neutral-500">Ordinals / Inscriptions</p>
                    </div>
                  </div>
                  {wallets.btc.connected && (
                    <div className="flex items-center gap-2 text-green-400">
                      <Check className="w-5 h-5" />
                      <span className="text-sm">Conectada</span>
                    </div>
                  )}
                </div>

                {wallets.btc.connected ? (
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Endereço</p>
                        <code className="text-sm font-mono text-orange-300">
                          {truncateAddress(wallets.btc.address!)}
                        </code>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs">
                        {wallets.btc.wallet}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(showAllBtc ? btcWallets : btcWallets.filter(w => w.popular)).map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={() => connectBtcWallet(wallet.id)}
                        disabled={connectingWallet !== null}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                          "border-neutral-700 hover:border-orange-500/50 hover:bg-orange-500/5",
                          connectingWallet === wallet.id && "border-orange-500 bg-orange-500/10"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                            <span className="text-lg font-bold">{wallet.name[0]}</span>
                          </div>
                          <span className="font-medium">{wallet.name}</span>
                        </div>
                        {connectingWallet === wallet.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
                        ) : (
                          <ArrowRight className="w-5 h-5 text-neutral-500" />
                        )}
                      </button>
                    ))}
                    {!showAllBtc && (
                      <button 
                        onClick={() => setShowAllBtc(true)}
                        className="w-full flex items-center justify-center gap-2 p-3 text-sm text-neutral-500 hover:text-white transition-colors"
                      >
                        Mais carteiras
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Continue Button */}
            {wallets.evm.connected && wallets.btc.connected && (
              <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button 
                  onClick={() => setStep("ready")}
                  size="lg"
                  className="bg-white text-black hover:bg-neutral-200 rounded-full px-8 py-6 text-lg font-semibold"
                >
                  Continuar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Skip - connect only one */}
            {(wallets.evm.connected || wallets.btc.connected) && !(wallets.evm.connected && wallets.btc.connected) && (
              <div className="mt-8 text-center">
                <button 
                  onClick={() => setStep("ready")}
                  className="text-sm text-neutral-500 hover:text-white transition-colors"
                >
                  Continuar com apenas uma carteira
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step: Ready */}
        {step === "ready" && (
          <div className="max-w-xl text-center space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-10 h-10 text-green-400" />
              </div>
            </div>

            <h2 className="text-3xl font-bold">Tudo pronto!</h2>
            <p className="text-neutral-400">
              Suas carteiras estão conectadas. Você pode acessar o NobisCore e começar a 
              transformar seus tokens de impacto em Bitcoin Inscriptions.
            </p>

            {/* Connected wallets summary */}
            <div className="flex justify-center gap-4">
              {wallets.evm.connected && (
                <div className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-sm text-purple-300">EVM Conectada</span>
                </div>
              )}
              {wallets.btc.connected && (
                <div className="px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-sm text-orange-300">BTC Conectada</span>
                </div>
              )}
            </div>

            <Button 
              onClick={enterNobisCore}
              size="lg"
              className="bg-white text-black hover:bg-neutral-200 rounded-full px-10 py-6 text-lg font-semibold transition-all hover:scale-105"
            >
              Entrar no NobisCore
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-sm text-neutral-600">
        <p>NobisCore by Sthation - Impacto imutável no Bitcoin</p>
      </footer>
    </div>
  )
}

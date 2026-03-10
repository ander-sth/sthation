"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Zap, 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Wallet,
  Bitcoin,
  Hexagon,
  ExternalLink,
  AlertCircle
} from "lucide-react"

// Tipos de carteiras
const evmWallets = [
  { id: "metamask", name: "MetaMask", icon: "🦊", popular: true },
  { id: "walletconnect", name: "WalletConnect", icon: "🔗", popular: true },
  { id: "coinbase", name: "Coinbase Wallet", icon: "💰", popular: false },
  { id: "rabby", name: "Rabby", icon: "🐰", popular: false },
]

const btcWallets = [
  { id: "xverse", name: "Xverse", icon: "✖️", popular: true },
  { id: "unisat", name: "Unisat", icon: "🟧", popular: true },
  { id: "leather", name: "Leather (Hiro)", icon: "🟤", popular: false },
  { id: "okx", name: "OKX Wallet", icon: "⭕", popular: false },
]

export default function NobisCoreConnect() {
  const router = useRouter()
  const [evmConnected, setEvmConnected] = useState(false)
  const [btcConnected, setBtcConnected] = useState(false)
  const [evmAddress, setEvmAddress] = useState("")
  const [btcAddress, setBtcAddress] = useState("")
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const connectEvm = async (walletId: string) => {
    setConnecting(walletId)
    setError(null)
    
    try {
      // Verificar se MetaMask está instalado
      if (walletId === "metamask" && typeof window !== "undefined") {
        const ethereum = (window as any).ethereum
        if (!ethereum) {
          setError("MetaMask não encontrado. Por favor, instale a extensão.")
          setConnecting(null)
          return
        }

        const accounts = await ethereum.request({ method: "eth_requestAccounts" })
        if (accounts && accounts.length > 0) {
          setEvmAddress(accounts[0])
          setEvmConnected(true)
          
          // Salvar no localStorage
          localStorage.setItem("nobiscore_evm_address", accounts[0])
        }
      } else {
        // Simular conexão para outras carteiras (em produção, usar SDK real)
        await new Promise(resolve => setTimeout(resolve, 1500))
        const mockAddress = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
        setEvmAddress(mockAddress)
        setEvmConnected(true)
        localStorage.setItem("nobiscore_evm_address", mockAddress)
      }
    } catch (err: any) {
      setError(err.message || "Erro ao conectar carteira EVM")
    }
    setConnecting(null)
  }

  const connectBtc = async (walletId: string) => {
    setConnecting(walletId)
    setError(null)

    try {
      if (walletId === "xverse" && typeof window !== "undefined") {
        // Verificar se Xverse está instalado
        const xverse = (window as any).XverseProviders?.BitcoinProvider
        if (xverse) {
          // Em produção, usar a API real do Xverse
          const response = await xverse.request("getAccounts", null)
          if (response?.result?.length > 0) {
            const addr = response.result[0].address
            setBtcAddress(addr)
            setBtcConnected(true)
            localStorage.setItem("nobiscore_btc_address", addr)
            setConnecting(null)
            return
          }
        }
      }

      if (walletId === "unisat" && typeof window !== "undefined") {
        const unisat = (window as any).unisat
        if (unisat) {
          const accounts = await unisat.requestAccounts()
          if (accounts && accounts.length > 0) {
            setBtcAddress(accounts[0])
            setBtcConnected(true)
            localStorage.setItem("nobiscore_btc_address", accounts[0])
            setConnecting(null)
            return
          }
        }
      }

      // Simular conexão para demo
      await new Promise(resolve => setTimeout(resolve, 1500))
      const mockAddress = `bc1q${Math.random().toString(36).slice(2, 10)}...${Math.random().toString(36).slice(2, 6)}`
      setBtcAddress(mockAddress)
      setBtcConnected(true)
      localStorage.setItem("nobiscore_btc_address", mockAddress)
    } catch (err: any) {
      setError(err.message || "Erro ao conectar carteira Bitcoin")
    }
    setConnecting(null)
  }

  const enterDashboard = () => {
    // Salvar estado de conexão
    localStorage.setItem("nobiscore_connected", "true")
    router.push("/nobiscore/dashboard")
  }

  const bothConnected = evmConnected && btcConnected

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/nobiscore" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">NobisCore</span>
          </Link>

          <Link href="/nobiscore">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Conecte suas Carteiras</h1>
            <p className="text-white/60 max-w-xl mx-auto">
              Para usar o NobisCore, você precisa conectar uma carteira EVM (para Polygon) 
              e uma carteira Bitcoin (para receber inscriptions).
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* EVM Wallet */}
            <div className={`p-6 rounded-2xl border ${evmConnected ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/10"}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${evmConnected ? "bg-purple-500" : "bg-purple-500/20"}`}>
                  <Hexagon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Carteira EVM</h2>
                  <p className="text-sm text-white/40">Polygon Network</p>
                </div>
                {evmConnected && <CheckCircle2 className="h-6 w-6 text-green-400 ml-auto" />}
              </div>

              {evmConnected ? (
                <div className="p-4 rounded-xl bg-black/30">
                  <p className="text-sm text-white/40 mb-1">Endereço conectado</p>
                  <code className="text-sm font-mono text-purple-400">{evmAddress}</code>
                </div>
              ) : (
                <div className="space-y-3">
                  {evmWallets.map(wallet => (
                    <button
                      key={wallet.id}
                      onClick={() => connectEvm(wallet.id)}
                      disabled={connecting !== null}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors disabled:opacity-50"
                    >
                      <span className="text-2xl">{wallet.icon}</span>
                      <span className="font-medium">{wallet.name}</span>
                      {wallet.popular && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Popular</span>
                      )}
                      {connecting === wallet.id && (
                        <span className="ml-auto text-xs text-white/40">Conectando...</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BTC Wallet */}
            <div className={`p-6 rounded-2xl border ${btcConnected ? "bg-orange-500/10 border-orange-500/30" : "bg-white/5 border-white/10"}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${btcConnected ? "bg-orange-500" : "bg-orange-500/20"}`}>
                  <Bitcoin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Carteira Bitcoin</h2>
                  <p className="text-sm text-white/40">Ordinals / Inscriptions</p>
                </div>
                {btcConnected && <CheckCircle2 className="h-6 w-6 text-green-400 ml-auto" />}
              </div>

              {btcConnected ? (
                <div className="p-4 rounded-xl bg-black/30">
                  <p className="text-sm text-white/40 mb-1">Endereço conectado</p>
                  <code className="text-sm font-mono text-orange-400">{btcAddress}</code>
                </div>
              ) : (
                <div className="space-y-3">
                  {btcWallets.map(wallet => (
                    <button
                      key={wallet.id}
                      onClick={() => connectBtc(wallet.id)}
                      disabled={connecting !== null}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors disabled:opacity-50"
                    >
                      <span className="text-2xl">{wallet.icon}</span>
                      <span className="font-medium">{wallet.name}</span>
                      {wallet.popular && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">Popular</span>
                      )}
                      {connecting === wallet.id && (
                        <span className="ml-auto text-xs text-white/40">Conectando...</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enter Dashboard Button */}
          <div className="mt-12 text-center">
            {bothConnected ? (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Ambas as carteiras conectadas</span>
                </div>
                <div>
                  <Button 
                    size="lg"
                    onClick={enterDashboard}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-full px-10 h-14 text-lg"
                  >
                    Entrar no Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-white/40">
                Conecte ambas as carteiras para acessar o dashboard
              </p>
            )}
          </div>

          {/* Help Links */}
          <div className="mt-16 p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="font-semibold mb-4">Precisa de ajuda?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ExternalLink className="h-4 w-4" />
                Instalar MetaMask
              </a>
              <a href="https://www.xverse.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ExternalLink className="h-4 w-4" />
                Instalar Xverse
              </a>
              <a href="https://unisat.io" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ExternalLink className="h-4 w-4" />
                Instalar Unisat
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

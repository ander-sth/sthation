"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Wallet, 
  Flame, 
  Store, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  LogOut,
  Zap,
  Link2,
  AlertCircle,
  X,
  User,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const navigation = [
  { name: "Dashboard", href: "/nobiscore/dashboard", icon: LayoutDashboard },
  { name: "My Assets", href: "/nobiscore/dashboard/assets", icon: Wallet },
  { name: "The Bridge", href: "/nobiscore/dashboard/bridge", icon: Flame },
  { name: "Marketplace", href: "/nobiscore/dashboard/marketplace", icon: Store },
  { name: "Settings", href: "/nobiscore/dashboard/settings", icon: Settings },
]

const evmWallets = [
  { name: "MetaMask", id: "metamask", icon: "🦊" },
  { name: "WalletConnect", id: "walletconnect", icon: "🔗", disabled: true },
  { name: "Coinbase Wallet", id: "coinbase", icon: "💠", disabled: true },
]

const btcWallets = [
  { name: "Unisat", id: "unisat", icon: "🟠" },
  { name: "Xverse", id: "xverse", icon: "⚡" },
  { name: "Leather", id: "leather", icon: "🔶", disabled: true },
]

function truncateAddress(address: string, chars = 4) {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

function WalletBadge({ 
  type, 
  address, 
  label,
  onConnect
}: { 
  type: "evm" | "btc"
  address: string | null
  label: string
  onConnect: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!address) {
    return (
      <button
        onClick={onConnect}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-xs"
      >
        <Link2 className="w-3 h-3" />
        Conectar {label}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className="font-mono text-xs border px-2 py-1 border-white/20 text-white/80 bg-white/5"
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {label}
        </span>
      </Badge>
      <code className="text-xs text-white/40 font-mono hidden sm:block">
        {truncateAddress(address)}
      </code>
      <button 
        onClick={copyAddress}
        className="text-white/40 hover:text-white transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  )
}

export default function NobisCoreDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [evmAddress, setEvmAddress] = useState<string | null>(null)
  const [btcAddress, setBtcAddress] = useState<string | null>(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [walletType, setWalletType] = useState<"evm" | "btc">("evm")
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("nobiscore_token")
      const userData = localStorage.getItem("nobiscore_user")

      if (!token || !userData) {
        window.location.href = "/nobiscore/login"
        return
      }

      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (e) {
        localStorage.removeItem("nobiscore_token")
        localStorage.removeItem("nobiscore_user")
        window.location.href = "/nobiscore/login"
        return
      }

      // Carregar carteiras conectadas
      const evm = localStorage.getItem("nobiscore_evm_address")
      const btc = localStorage.getItem("nobiscore_btc_address")
      setEvmAddress(evm)
      setBtcAddress(btc)
      setIsLoading(false)
    }

    checkAuth()

    // Listener para mudanças de conta MetaMask
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          localStorage.removeItem("nobiscore_evm_address")
          setEvmAddress(null)
        } else if (accounts[0] !== evmAddress) {
          localStorage.setItem("nobiscore_evm_address", accounts[0])
          setEvmAddress(accounts[0])
        }
      }

      ;(window as any).ethereum.on("accountsChanged", handleAccountsChanged)
      
      return () => {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [evmAddress])

  const handleLogout = () => {
    localStorage.removeItem("nobiscore_token")
    localStorage.removeItem("nobiscore_user")
    localStorage.removeItem("nobiscore_evm_address")
    localStorage.removeItem("nobiscore_btc_address")
    router.push("/nobiscore")
  }

  const handleConnectWallet = (type: "evm" | "btc") => {
    setWalletType(type)
    setShowWalletModal(true)
  }

  const connectMetaMask = async () => {
    setConnecting("metamask")
    try {
      // Verificar se está no mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )

      if (typeof window !== "undefined" && (window as any).ethereum) {
        // MetaMask disponível
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })

        if (accounts && accounts[0]) {
          // Tentar mudar para Polygon
          try {
            await (window as any).ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x89" }], // Polygon Mainnet
            })
          } catch (switchError: any) {
            // Se a rede não existe, adicionar
            if (switchError.code === 4902) {
              await (window as any).ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x89",
                    chainName: "Polygon Mainnet",
                    nativeCurrency: {
                      name: "MATIC",
                      symbol: "MATIC",
                      decimals: 18,
                    },
                    rpcUrls: ["https://polygon-rpc.com/"],
                    blockExplorerUrls: ["https://polygonscan.com/"],
                  },
                ],
              })
            }
          }

          localStorage.setItem("nobiscore_evm_address", accounts[0])
          setEvmAddress(accounts[0])
          setShowWalletModal(false)
        }
      } else if (isMobile) {
        // Mobile sem MetaMask - abrir deep link
        const currentUrl = encodeURIComponent(window.location.href)
        const metamaskAppDeepLink = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`
        window.location.href = metamaskAppDeepLink
      } else {
        // Desktop sem MetaMask
        window.open("https://metamask.io/download/", "_blank")
      }
    } catch (error: any) {
      console.error("Erro ao conectar MetaMask:", error)
      alert(error?.message || "Erro ao conectar carteira. Tente novamente.")
    } finally {
      setConnecting(null)
    }
  }

  const connectBtcWallet = async (walletId: "unisat" | "xverse") => {
    setConnecting(walletId)
    try {
      if (walletId === "unisat") {
        if (typeof window !== "undefined" && (window as any).unisat) {
          const accounts = await (window as any).unisat.requestAccounts()
          if (accounts && accounts[0]) {
            localStorage.setItem("nobiscore_btc_address", accounts[0])
            localStorage.setItem("nobiscore_btc_wallet", "unisat")
            setBtcAddress(accounts[0])
            setShowWalletModal(false)
          }
        } else {
          window.open("https://unisat.io/download", "_blank")
        }
      } else if (walletId === "xverse") {
        if (typeof window !== "undefined" && (window as any).XverseProviders) {
          const response = await (window as any).XverseProviders.request("getAccounts", {
            purposes: ["ordinals", "payment"],
          })
          if (response?.result?.[0]?.address) {
            localStorage.setItem("nobiscore_btc_address", response.result[0].address)
            localStorage.setItem("nobiscore_btc_wallet", "xverse")
            setBtcAddress(response.result[0].address)
            setShowWalletModal(false)
          }
        } else {
          window.open("https://www.xverse.app/download", "_blank")
        }
      }
    } catch (error: any) {
      console.error("Erro ao conectar Bitcoin wallet:", error)
      alert(error?.message || "Erro ao conectar carteira Bitcoin. Tente novamente.")
    } finally {
      setConnecting(null)
    }
  }

  const handleWalletSelect = async (walletId: string) => {
    if (walletType === "evm") {
      if (walletId === "metamask") {
        await connectMetaMask()
      }
    } else {
      if (walletId === "unisat" || walletId === "xverse") {
        await connectBtcWallet(walletId)
      }
    }
  }

  const handleDisconnectWallet = (type: "evm" | "btc") => {
    if (type === "evm") {
      localStorage.removeItem("nobiscore_evm_address")
      setEvmAddress(null)
    } else {
      localStorage.removeItem("nobiscore_btc_address")
      localStorage.removeItem("nobiscore_btc_wallet")
      setBtcAddress(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-neutral-950 border-r border-white/10 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn(
            "flex items-center h-16 border-b border-white/10 px-4",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <Link href="/nobiscore" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <Zap className="w-4 h-4 text-black" />
                </div>
                <div>
                  <span className="font-semibold tracking-tight">NobisCore</span>
                  <span className="text-[10px] text-white/40 block -mt-0.5">by Sthation</span>
                </div>
              </Link>
            )}
            {collapsed && (
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <Zap className="w-4 h-4 text-black" />
              </div>
            )}
          </div>

          {/* User Info */}
          {!collapsed && user && (
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            <TooltipProvider>
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/nobiscore/dashboard" && pathname?.startsWith(item.href))
                
                return (
                  <Tooltip key={item.name} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                          isActive 
                            ? "bg-white text-black" 
                            : "text-white/60 hover:text-white hover:bg-white/10",
                          collapsed && "justify-center px-0"
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>{item.name}</span>}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="bg-neutral-800 text-white border-white/10">
                        {item.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                )
              })}
            </TooltipProvider>
          </nav>

          {/* Carteiras conectadas */}
          {!collapsed && (
            <div className="p-3 border-t border-white/10 space-y-2">
              <p className="text-xs text-white/40 px-3 uppercase tracking-wider">Carteiras</p>
              
              {/* EVM Wallet */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", evmAddress ? "bg-green-400" : "bg-white/20")} />
                  <span className="text-xs text-white/60">Polygon</span>
                </div>
                {evmAddress ? (
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] text-white/40">{truncateAddress(evmAddress)}</code>
                    <button 
                      onClick={() => handleDisconnectWallet("evm")}
                      className="text-xs text-white/40 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleConnectWallet("evm")}
                    className="text-xs text-white/60 hover:text-white"
                  >
                    Conectar
                  </button>
                )}
              </div>

              {/* BTC Wallet */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", btcAddress ? "bg-green-400" : "bg-white/20")} />
                  <span className="text-xs text-white/60">Bitcoin</span>
                </div>
                {btcAddress ? (
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] text-white/40">{truncateAddress(btcAddress)}</code>
                    <button 
                      onClick={() => handleDisconnectWallet("btc")}
                      className="text-xs text-white/40 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleConnectWallet("btc")}
                    className="text-xs text-white/60 hover:text-white"
                  >
                    Conectar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="p-3 border-t border-white/10 space-y-2">
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors",
                collapsed && "justify-center"
              )}
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="text-sm">Sair</span>}
            </button>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {!collapsed && <span className="text-sm">Recolher</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300",
        collapsed ? "ml-16" : "ml-64"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-2">
              <Link href="/nobiscore" className="text-white/40 text-sm hover:text-white transition-colors">
                NobisCore
              </Link>
              <span className="text-white/20">/</span>
              <span className="text-white text-sm font-medium">
                {navigation.find(n => n.href === pathname || (n.href !== "/nobiscore/dashboard" && pathname?.startsWith(n.href)))?.name || "Dashboard"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <WalletBadge 
                type="evm"
                address={evmAddress}
                label="Polygon"
                onConnect={() => handleConnectWallet("evm")}
              />

              <div className="h-6 w-px bg-white/10" />

              <WalletBadge 
                type="btc"
                address={btcAddress}
                label="Bitcoin"
                onConnect={() => handleConnectWallet("btc")}
              />

              <Link href="/" target="_blank">
                <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Warning if wallets not connected */}
        {(!evmAddress || !btcAddress) && (
          <div className="mx-6 mt-4 p-4 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-white/60 shrink-0" />
            <p className="text-sm text-white/60">
              {!evmAddress && !btcAddress 
                ? "Conecte suas carteiras Polygon e Bitcoin para usar todas as funcionalidades."
                : !evmAddress 
                  ? "Conecte sua carteira Polygon para visualizar seus tokens de impacto."
                  : "Conecte sua carteira Bitcoin para receber inscriptions."
              }
            </p>
            <button 
              onClick={() => handleConnectWallet(evmAddress ? "btc" : "evm")}
              className="ml-auto text-sm text-white hover:underline"
            >
              Conectar
            </button>
          </div>
        )}

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Wallet Connection Modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="bg-neutral-950 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              Conectar Carteira {walletType === "evm" ? "Polygon (EVM)" : "Bitcoin"}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {walletType === "evm" 
                ? "Conecte sua carteira EVM para interagir com tokens na Polygon"
                : "Conecte sua carteira Bitcoin para receber Ordinals Inscriptions"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4">
            {(walletType === "evm" ? evmWallets : btcWallets).map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.id)}
                disabled={wallet.disabled || connecting === wallet.id}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-lg border border-white/10 transition-colors",
                  wallet.disabled 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:bg-white/5 hover:border-white/20"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                  {wallet.icon}
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium">{wallet.name}</span>
                  {wallet.disabled && (
                    <span className="text-xs text-white/40 block">Em breve</span>
                  )}
                </div>
                {connecting === wallet.id && (
                  <Loader2 className="w-5 h-5 animate-spin text-white/60" />
                )}
              </button>
            ))}
          </div>

          <p className="text-xs text-white/40 text-center mt-4">
            {walletType === "evm" 
              ? "Não tem MetaMask? Baixe em metamask.io"
              : "Não tem uma carteira Bitcoin? Baixe Unisat ou Xverse"
            }
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}

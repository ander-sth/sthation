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
  Zap
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

const navigation = [
  { name: "Dashboard", href: "/nobiscore/dashboard", icon: LayoutDashboard },
  { name: "My Assets", href: "/nobiscore/dashboard/assets", icon: Wallet },
  { name: "The Bridge", href: "/nobiscore/dashboard/bridge", icon: Flame },
  { name: "Marketplace", href: "/nobiscore/dashboard/marketplace", icon: Store },
  { name: "Settings", href: "/nobiscore/dashboard/settings", icon: Settings },
]

function truncateAddress(address: string, chars = 4) {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

function WalletBadge({ 
  type, 
  address, 
  label
}: { 
  type: "evm" | "btc"
  address: string
  label: string
}) {
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={cn(
          "font-mono text-xs border px-2 py-1",
          type === "evm" 
            ? "border-purple-500/50 text-purple-400 bg-purple-500/10" 
            : "border-orange-500/50 text-orange-400 bg-orange-500/10"
        )}
      >
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${type === "evm" ? "bg-purple-500" : "bg-orange-500"} animate-pulse`} />
          {label}
        </span>
      </Badge>
      <code className="text-xs text-neutral-400 font-mono hidden sm:block">
        {truncateAddress(address)}
      </code>
      <button 
        onClick={copyAddress}
        className="text-neutral-500 hover:text-white transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
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
  const [evmAddress, setEvmAddress] = useState<string | null>(null)
  const [btcAddress, setBtcAddress] = useState<string | null>(null)

  useEffect(() => {
    // Verificar se usuário está conectado
    const connected = localStorage.getItem("nobiscore_connected")
    const evm = localStorage.getItem("nobiscore_evm_address")
    const btc = localStorage.getItem("nobiscore_btc_address")

    if (!connected || !evm || !btc) {
      router.push("/nobiscore/connect")
      return
    }

    setEvmAddress(evm)
    setBtcAddress(btc)
  }, [router])

  const handleDisconnect = () => {
    localStorage.removeItem("nobiscore_connected")
    localStorage.removeItem("nobiscore_evm_address")
    localStorage.removeItem("nobiscore_btc_address")
    router.push("/nobiscore")
  }

  if (!evmAddress || !btcAddress) {
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
          "fixed left-0 top-0 z-40 h-screen bg-neutral-950 border-r border-neutral-800 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn(
            "flex items-center h-16 border-b border-neutral-800 px-4",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <Link href="/nobiscore" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-semibold tracking-tight">NobisCore</span>
                  <span className="text-[10px] text-neutral-500 block -mt-0.5">by Sthation</span>
                </div>
              </Link>
            )}
            {collapsed && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

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
                            : "text-neutral-400 hover:text-white hover:bg-neutral-800",
                          collapsed && "justify-center px-0"
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>{item.name}</span>}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="bg-neutral-800 text-white border-neutral-700">
                        {item.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                )
              })}
            </TooltipProvider>
          </nav>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-neutral-800 space-y-2">
            {/* Disconnect */}
            <button
              onClick={handleDisconnect}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors",
                collapsed && "justify-center"
              )}
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="text-sm">Desconectar</span>}
            </button>

            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
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
        <header className="sticky top-0 z-30 h-16 bg-black/80 backdrop-blur-xl border-b border-neutral-800">
          <div className="flex items-center justify-between h-full px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <Link href="/nobiscore" className="text-neutral-500 text-sm hover:text-white transition-colors">
                NobisCore
              </Link>
              <span className="text-neutral-600">/</span>
              <span className="text-white text-sm font-medium">
                {navigation.find(n => n.href === pathname || (n.href !== "/nobiscore/dashboard" && pathname?.startsWith(n.href)))?.name || "Dashboard"}
              </span>
            </div>

            {/* Wallet Status */}
            <div className="flex items-center gap-6">
              <WalletBadge 
                type="evm"
                address={evmAddress}
                label="Polygon"
              />

              <div className="h-6 w-px bg-neutral-800" />

              <WalletBadge 
                type="btc"
                address={btcAddress}
                label="Bitcoin"
              />

              <Link href="/" target="_blank">
                <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Check
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

// Simulated wallet state
interface WalletState {
  evm: { connected: boolean; address: string | null; chain: string }
  btc: { connected: boolean; address: string | null; type: string }
}

const navigation = [
  { name: "Dashboard", href: "/nobiscore", icon: LayoutDashboard },
  { name: "My Assets", href: "/nobiscore/assets", icon: Wallet },
  { name: "The Bridge", href: "/nobiscore/bridge", icon: Flame },
  { name: "Marketplace", href: "/nobiscore/marketplace", icon: Store },
  { name: "Settings", href: "/nobiscore/settings", icon: Settings },
]

function truncateAddress(address: string, chars = 4) {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

function WalletButton({ 
  type, 
  connected, 
  address, 
  label,
  onConnect 
}: { 
  type: "evm" | "btc"
  connected: boolean
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

  if (!connected) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onConnect}
        className="border-neutral-700 bg-transparent hover:bg-neutral-800 text-neutral-300 hover:text-white font-mono text-xs"
      >
        Connect {type === "evm" ? "EVM" : "BTC"}
      </Button>
    )
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
        {type === "evm" ? (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            {label}
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            {label}
          </span>
        )}
      </Badge>
      <code className="text-xs text-neutral-400 font-mono">
        {address && truncateAddress(address)}
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

export default function NobisCoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [wallets, setWallets] = useState<WalletState>({
    evm: { connected: false, address: null, chain: "Polygon" },
    btc: { connected: false, address: null, type: "Ordinals" },
  })

  const connectEVM = () => {
    // Simulated connection
    setWallets(prev => ({
      ...prev,
      evm: { connected: true, address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", chain: "Polygon" }
    }))
  }

  const connectBTC = () => {
    // Simulated connection
    setWallets(prev => ({
      ...prev,
      btc: { connected: true, address: "bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297", type: "Ordinals" }
    }))
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
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <span className="text-black font-bold text-sm">N</span>
                </div>
                <div>
                  <span className="font-semibold tracking-tight">NobisCore</span>
                  <span className="text-[10px] text-neutral-500 block -mt-0.5">by Sthation</span>
                </div>
              </Link>
            )}
            {collapsed && (
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black font-bold text-sm">N</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            <TooltipProvider>
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/nobiscore" && pathname?.startsWith(item.href))
                
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

          {/* Collapse toggle */}
          <div className="p-3 border-t border-neutral-800">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {!collapsed && <span className="text-sm">Collapse</span>}
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
            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 text-sm">NobisCore</span>
              <span className="text-neutral-600">/</span>
              <span className="text-white text-sm font-medium">
                {navigation.find(n => n.href === pathname || (n.href !== "/nobiscore" && pathname?.startsWith(n.href)))?.name || "Dashboard"}
              </span>
            </div>

            {/* Wallet Connect Area */}
            <div className="flex items-center gap-6">
              {/* EVM Wallet */}
              <WalletButton 
                type="evm"
                connected={wallets.evm.connected}
                address={wallets.evm.address}
                label={wallets.evm.chain}
                onConnect={connectEVM}
              />

              {/* Divider */}
              <div className="h-6 w-px bg-neutral-800" />

              {/* BTC Wallet */}
              <WalletButton 
                type="btc"
                connected={wallets.btc.connected}
                address={wallets.btc.address}
                label={wallets.btc.type}
                onConnect={connectBTC}
              />

              {/* External Link */}
              <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white">
                <ExternalLink className="w-4 h-4" />
              </Button>
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

"use client"

import { useState } from "react"
import { 
  User, 
  Wallet, 
  Bell, 
  Shield, 
  Hexagon,
  Bitcoin,
  ExternalLink,
  Check,
  Copy,
  LogOut,
  ChevronRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Mock wallet data
const wallets = {
  evm: {
    connected: true,
    address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    chain: "Polygon",
    balance: "1,234.56 MATIC"
  },
  btc: {
    connected: true,
    address: "bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297",
    type: "Ordinals",
    balance: "0.0847 BTC"
  }
}

function WalletCard({ 
  type, 
  wallet, 
  onDisconnect 
}: { 
  type: "evm" | "btc"
  wallet: typeof wallets.evm | typeof wallets.btc
  onDisconnect: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className={cn(
      "bg-neutral-900 border-neutral-800",
      wallet.connected && "border-l-2",
      type === "evm" ? "border-l-purple-500" : "border-l-orange-500"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              type === "evm" ? "bg-purple-500/10" : "bg-orange-500/10"
            )}>
              {type === "evm" ? (
                <Hexagon className="w-6 h-6 text-purple-400" />
              ) : (
                <Bitcoin className="w-6 h-6 text-orange-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-medium">
                  {type === "evm" ? "EVM Wallet" : "Bitcoin Wallet"}
                </p>
                {wallet.connected && (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-neutral-500 text-sm">
                {type === "evm" ? (wallet as typeof wallets.evm).chain : (wallet as typeof wallets.btc).type}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onDisconnect}
            className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {wallet.connected && (
          <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 text-sm">Address</span>
              <div className="flex items-center gap-2">
                <code className="text-neutral-300 text-sm font-mono">
                  {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                </code>
                <button onClick={copyAddress} className="text-neutral-500 hover:text-white">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button className="text-neutral-500 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 text-sm">Balance</span>
              <span className="text-white font-medium">{wallet.balance}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SettingItem({ 
  icon: Icon, 
  title, 
  description, 
  children 
}: { 
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-neutral-400" />
        </div>
        <div>
          <p className="text-white font-medium">{title}</p>
          <p className="text-neutral-500 text-sm">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    bridgeComplete: true,
    marketplaceSales: true,
    priceAlerts: false,
    newsletter: false,
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-neutral-400 mt-2">
          Manage your wallet connections and preferences
        </p>
      </div>

      {/* Wallets Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Connected Wallets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WalletCard 
            type="evm" 
            wallet={wallets.evm} 
            onDisconnect={() => {}} 
          />
          <WalletCard 
            type="btc" 
            wallet={wallets.btc} 
            onDisconnect={() => {}} 
          />
        </div>
      </div>

      {/* Notifications */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription className="text-neutral-500">
            Configure how you want to receive updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <SettingItem
            icon={Hexagon}
            title="Bridge Complete"
            description="Get notified when your assets are bridged"
          >
            <Switch 
              checked={notifications.bridgeComplete}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, bridgeComplete: checked }))}
            />
          </SettingItem>
          <Separator className="bg-neutral-800" />
          <SettingItem
            icon={Bitcoin}
            title="Marketplace Sales"
            description="Notifications for sales and purchases"
          >
            <Switch 
              checked={notifications.marketplaceSales}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketplaceSales: checked }))}
            />
          </SettingItem>
          <Separator className="bg-neutral-800" />
          <SettingItem
            icon={Bell}
            title="Price Alerts"
            description="Get alerts when prices change significantly"
          >
            <Switch 
              checked={notifications.priceAlerts}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, priceAlerts: checked }))}
            />
          </SettingItem>
          <Separator className="bg-neutral-800" />
          <SettingItem
            icon={User}
            title="Newsletter"
            description="Weekly updates about NobisCore"
          >
            <Switch 
              checked={notifications.newsletter}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newsletter: checked }))}
            />
          </SettingItem>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription className="text-neutral-500">
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <button className="w-full flex items-center justify-between py-4 hover:bg-neutral-800/50 -mx-6 px-6 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Transaction Signing</p>
                <p className="text-neutral-500 text-sm">Always confirm transactions before signing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/10 text-green-400 border-0">Enabled</Badge>
              <ChevronRight className="w-5 h-5 text-neutral-500" />
            </div>
          </button>
          <Separator className="bg-neutral-800" />
          <button className="w-full flex items-center justify-between py-4 hover:bg-neutral-800/50 -mx-6 px-6 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Connected Apps</p>
                <p className="text-neutral-500 text-sm">Manage third-party app connections</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-sm">3 apps</span>
              <ChevronRight className="w-5 h-5 text-neutral-500" />
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-neutral-900 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-400">Danger Zone</CardTitle>
          <CardDescription className="text-neutral-500">
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Disconnect All Wallets</p>
              <p className="text-neutral-500 text-sm">This will sign you out of NobisCore</p>
            </div>
            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
              Disconnect All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

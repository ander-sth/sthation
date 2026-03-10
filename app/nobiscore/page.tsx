"use client"

import { useState } from "react"
import { 
  Flame, 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Hexagon,
  Bitcoin,
  Activity,
  Clock
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Mock data for demonstration
const mockStats = {
  totalAssets: 12,
  totalValue: "2.847",
  pendingBridges: 3,
  completedInscriptions: 9,
  recentActivity: [
    { id: 1, type: "bridge", status: "completed", asset: "500kg Plastic Recycled", time: "2h ago", txHash: "0x1234...abcd" },
    { id: 2, type: "mint", status: "pending", asset: "1 Ton Organic Waste", time: "4h ago", txHash: "bc1p...9rus" },
    { id: 3, type: "sale", status: "completed", asset: "Carbon Credit #0042", time: "1d ago", amount: "0.015 BTC" },
  ],
  impactTokens: [
    { id: 1, name: "Plastic Recycled", amount: "2.5 Tons", chain: "Polygon", value: "$1,250" },
    { id: 2, name: "Organic Waste", amount: "1.8 Tons", chain: "Polygon", value: "$890" },
    { id: 3, name: "E-Waste Processed", amount: "320 kg", chain: "Polygon", value: "$640" },
  ]
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend 
}: { 
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  trend?: "up" | "down"
}) {
  return (
    <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-500 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              {trend && (
                trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )
              )}
              <span className={`text-xs ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-neutral-500"}`}>
                {subtitle}
              </span>
            </div>
          </div>
          <div className="p-3 bg-neutral-800 rounded-xl">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ 
  type, 
  status, 
  asset, 
  time, 
  txHash, 
  amount 
}: { 
  type: string
  status: string
  asset: string
  time: string
  txHash?: string
  amount?: string
}) {
  const getIcon = () => {
    switch (type) {
      case "bridge": return <Flame className="w-4 h-4" />
      case "mint": return <Hexagon className="w-4 h-4" />
      case "sale": return <Bitcoin className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-400 border-green-500/20"
      case "pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "failed": return "bg-red-500/10 text-red-400 border-red-500/20"
      default: return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
    }
  }

  return (
    <div className="flex items-center justify-between py-4 border-b border-neutral-800 last:border-0">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-neutral-800 rounded-lg">
          {getIcon()}
        </div>
        <div>
          <p className="text-white font-medium text-sm">{asset}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="text-xs text-neutral-500 font-mono">{txHash || amount}</code>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getStatusColor()}`}>
              {status}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-neutral-500">
        <Clock className="w-3 h-3" />
        <span className="text-xs">{time}</span>
      </div>
    </div>
  )
}

export default function NobisCoreDashboard() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 border border-neutral-800 p-8">
        <div className="relative z-10">
          <Badge variant="outline" className="border-neutral-700 text-neutral-400 mb-4">
            Waste-to-Value Protocol
          </Badge>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Transform Impact into
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-neutral-500">
              Permanent Value
            </span>
          </h1>
          <p className="text-neutral-400 mt-4 max-w-lg">
            Bridge your verified environmental impact tokens from Polygon to Bitcoin Ordinals. 
            Create immutable, tradeable Inscriptions backed by real-world impact data.
          </p>
          <div className="flex gap-3 mt-6">
            <Link href="/nobiscore/bridge">
              <Button className="bg-white text-black hover:bg-neutral-200 font-medium">
                <Flame className="w-4 h-4 mr-2" />
                Start Bridging
              </Button>
            </Link>
            <Link href="/nobiscore/marketplace">
              <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
          <div className="absolute right-10 top-10 w-32 h-32 border border-white/20 rounded-full" />
          <div className="absolute right-20 top-20 w-48 h-48 border border-white/10 rounded-full" />
          <div className="absolute right-5 top-5 w-64 h-64 border border-white/5 rounded-full" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Assets" 
          value={mockStats.totalAssets.toString()} 
          subtitle="Polygon tokens"
          icon={Wallet}
        />
        <StatCard 
          title="Portfolio Value" 
          value={`$${mockStats.totalValue}`} 
          subtitle="+12.5% this month"
          icon={TrendingUp}
          trend="up"
        />
        <StatCard 
          title="Pending Bridges" 
          value={mockStats.pendingBridges.toString()} 
          subtitle="In progress"
          icon={Flame}
        />
        <StatCard 
          title="Inscriptions" 
          value={mockStats.completedInscriptions.toString()} 
          subtitle="On Bitcoin"
          icon={Bitcoin}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Impact Tokens */}
        <Card className="lg:col-span-2 bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Impact Tokens (Polygon)</CardTitle>
            <CardDescription className="text-neutral-500">
              Your verified environmental impact assets ready for transformation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockStats.impactTokens.map((token) => (
                <div 
                  key={token.id}
                  className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
                      <Hexagon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{token.name}</p>
                      <p className="text-neutral-500 text-sm">{token.amount}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{token.value}</p>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs mt-1">
                      {token.chain}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/nobiscore/assets">
              <Button variant="ghost" className="w-full mt-4 text-neutral-400 hover:text-white hover:bg-neutral-800">
                View All Assets
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-neutral-500">
              Your latest transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {mockStats.recentActivity.map((activity) => (
                <ActivityItem key={activity.id} {...activity} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

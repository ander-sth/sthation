"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Hexagon, 
  ArrowUpRight,
  TrendingUp,
  Filter,
  ExternalLink,
  Flame,
  Clock,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Mock assets data
const polygonAssets = [
  { 
    id: "1", 
    name: "Plastic Recycled", 
    symbol: "PLST",
    amount: "2.5", 
    unit: "Tons", 
    value: "$1,250",
    change: "+5.2%",
    contractAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    tokenId: "1001",
    verified: true,
    bridgeable: true,
  },
  { 
    id: "2", 
    name: "Organic Waste", 
    symbol: "ORGW",
    amount: "1.8", 
    unit: "Tons", 
    value: "$890",
    change: "+2.1%",
    contractAddress: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    tokenId: "1002",
    verified: true,
    bridgeable: true,
  },
  { 
    id: "3", 
    name: "E-Waste Processed", 
    symbol: "EWST",
    amount: "320", 
    unit: "kg", 
    value: "$640",
    change: "-1.3%",
    contractAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    tokenId: "1003",
    verified: true,
    bridgeable: true,
  },
  { 
    id: "4", 
    name: "Carbon Offset", 
    symbol: "CO2E",
    amount: "5.2", 
    unit: "tCO2e", 
    value: "$2,340",
    change: "+8.7%",
    contractAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    tokenId: "1004",
    verified: true,
    bridgeable: true,
  },
  { 
    id: "5", 
    name: "Water Purification", 
    symbol: "H2O",
    amount: "50,000", 
    unit: "liters", 
    value: "$280",
    change: "+0.5%",
    contractAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    tokenId: "1005",
    verified: false,
    bridgeable: false,
  },
]

const pendingBridges = [
  {
    id: "1",
    asset: "Plastic Recycled",
    amount: "0.5 Tons",
    status: "minting",
    step: 3,
    totalSteps: 3,
    startedAt: "2 hours ago",
    txHash: "0x1234...abcd",
  },
  {
    id: "2",
    asset: "Organic Waste",
    amount: "0.3 Tons",
    status: "generating",
    step: 2,
    totalSteps: 3,
    startedAt: "4 hours ago",
    txHash: "0x5678...efgh",
  },
]

const bridgeHistory = [
  {
    id: "1",
    asset: "Carbon Offset",
    amount: "1.0 tCO2e",
    inscriptionId: "#67482890",
    completedAt: "Jan 14, 2024",
    ordinalId: "bc1p5d7...3297",
  },
  {
    id: "2",
    asset: "E-Waste Processed",
    amount: "150 kg",
    inscriptionId: "#67482756",
    completedAt: "Jan 12, 2024",
    ordinalId: "bc1p8x3...9z0a",
  },
  {
    id: "3",
    asset: "Plastic Recycled",
    amount: "1.0 Tons",
    inscriptionId: "#67482501",
    completedAt: "Jan 10, 2024",
    ordinalId: "bc1p2a3...4e5f",
  },
]

function AssetCard({ asset }: { asset: typeof polygonAssets[0] }) {
  return (
    <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
              <Hexagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-medium">{asset.name}</p>
                {asset.verified && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className="text-neutral-500 text-sm font-mono">{asset.symbol}</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              asset.change.startsWith("+") 
                ? "border-green-500/30 text-green-400" 
                : "border-red-500/30 text-red-400"
            )}
          >
            {asset.change}
          </Badge>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-800">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{asset.amount}</p>
              <p className="text-neutral-500 text-sm">{asset.unit}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{asset.value}</p>
              <p className="text-neutral-500 text-xs">Est. value</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {asset.bridgeable ? (
            <Link href="/nobiscore/bridge" className="flex-1">
              <Button 
                size="sm" 
                className="w-full bg-white text-black hover:bg-neutral-200"
              >
                <Flame className="w-4 h-4 mr-1" />
                Bridge
              </Button>
            </Link>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 border-neutral-700 text-neutral-400"
              disabled
            >
              Pending Verification
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            className="border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PendingBridgeCard({ bridge }: { bridge: typeof pendingBridges[0] }) {
  const progress = (bridge.step / bridge.totalSteps) * 100

  return (
    <Card className="bg-neutral-800/50 border-neutral-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-medium">{bridge.asset}</p>
            <p className="text-neutral-400 text-sm">{bridge.amount}</p>
          </div>
          <Badge 
            variant="outline" 
            className="border-yellow-500/30 text-yellow-400 capitalize"
          >
            {bridge.status}
          </Badge>
        </div>
        
        {/* Progress bar */}
        <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
          <span>Step {bridge.step} of {bridge.totalSteps}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {bridge.startedAt}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AssetsPage() {
  const totalValue = polygonAssets.reduce((sum, asset) => {
    const value = parseFloat(asset.value.replace(/[$,]/g, ""))
    return sum + value
  }, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Assets</h1>
          <p className="text-neutral-400 mt-2">
            Your verified impact tokens on Polygon network
          </p>
        </div>
        <Link href="/nobiscore/bridge">
          <Button className="bg-white text-black hover:bg-neutral-200">
            <Flame className="w-4 h-4 mr-2" />
            Bridge Assets
          </Button>
        </Link>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Portfolio Value</p>
              <p className="text-4xl font-bold text-white mt-1">
                ${totalValue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+12.5% this month</span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-neutral-400 text-sm">Assets</p>
                <p className="text-2xl font-bold text-white">{polygonAssets.length}</p>
              </div>
              <div className="text-right">
                <p className="text-neutral-400 text-sm">Bridgeable</p>
                <p className="text-2xl font-bold text-white">
                  {polygonAssets.filter(a => a.bridgeable).length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="assets" className="space-y-6">
        <TabsList className="bg-neutral-900 border border-neutral-800 p-1">
          <TabsTrigger 
            value="assets" 
            className="data-[state=active]:bg-white data-[state=active]:text-black"
          >
            Polygon Assets
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="data-[state=active]:bg-white data-[state=active]:text-black"
          >
            Pending Bridges
            {pendingBridges.length > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-black text-xs">
                {pendingBridges.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="data-[state=active]:bg-white data-[state=active]:text-black"
          >
            Bridge History
          </TabsTrigger>
        </TabsList>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {polygonAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingBridges.length > 0 ? (
            <div className="space-y-3">
              {pendingBridges.map((bridge) => (
                <PendingBridgeCard key={bridge.id} bridge={bridge} />
              ))}
            </div>
          ) : (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8 text-neutral-600" />
                </div>
                <p className="text-white font-medium">No pending bridges</p>
                <p className="text-neutral-500 text-sm mt-1">
                  Start a new bridge to transform your assets
                </p>
                <Link href="/nobiscore/bridge">
                  <Button className="mt-4 bg-white text-black hover:bg-neutral-200">
                    Start Bridge
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Completed Bridges</CardTitle>
              <CardDescription className="text-neutral-500">
                Your successfully bridged assets now live on Bitcoin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {bridgeHistory.map((item, index) => (
                  <div 
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between py-4",
                      index !== bridgeHistory.length - 1 && "border-b border-neutral-800"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.asset}</p>
                        <p className="text-neutral-500 text-sm">{item.amount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-orange-500/30 text-orange-400 font-mono">
                          {item.inscriptionId}
                        </Badge>
                        <button className="text-neutral-500 hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-neutral-500 text-xs mt-1">{item.completedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

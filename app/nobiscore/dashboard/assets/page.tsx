"use client"

import Link from "next/link"
import { 
  Hexagon, 
  TrendingUp,
  ExternalLink,
  Flame,
  Clock,
  CheckCircle2,
  Heart,
  Leaf,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

function AssetCard({ asset }: { asset: any }) {
  const isSocial = asset.type === "SOCIAL"
  
  return (
    <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isSocial 
                ? "bg-gradient-to-br from-pink-600 to-pink-800" 
                : "bg-gradient-to-br from-green-600 to-green-800"
            )}>
              {isSocial ? (
                <Heart className="w-6 h-6 text-white" />
              ) : (
                <Leaf className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-medium line-clamp-1">{asset.title}</p>
                {asset.vca_score && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className="text-neutral-500 text-sm">{asset.institution_name || asset.category}</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              isSocial 
                ? "border-pink-500/30 text-pink-400" 
                : "border-green-500/30 text-green-400"
            )}
          >
            {asset.type}
          </Badge>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-800">
          <div className="flex items-end justify-between">
            <div>
              {asset.vca_score && (
                <>
                  <p className="text-2xl font-bold text-white">{asset.vca_score}</p>
                  <p className="text-neutral-500 text-sm">VCA Score</p>
                </>
              )}
              {!asset.vca_score && asset.estimated_beneficiaries && (
                <>
                  <p className="text-2xl font-bold text-white">{asset.estimated_beneficiaries.toLocaleString()}</p>
                  <p className="text-neutral-500 text-sm">Beneficiários</p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-white font-medium text-sm">{asset.location_state || "Brasil"}</p>
              <p className="text-neutral-500 text-xs">{asset.location_name || ""}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {asset.polygon_tx_hash && !asset.inscription_id ? (
            <Link href="/nobiscore/dashboard/bridge" className="flex-1">
              <Button 
                size="sm" 
                className="w-full bg-white text-black hover:bg-neutral-200"
              >
                <Flame className="w-4 h-4 mr-1" />
                Bridge
              </Button>
            </Link>
          ) : asset.inscription_id ? (
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 border-green-700 text-green-400"
              disabled
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Inscrito
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 border-neutral-700 text-neutral-400"
              disabled
            >
              Aguardando Polygon
            </Button>
          )}
          {asset.polygon_tx_hash && (
            <Button 
              size="sm" 
              variant="outline" 
              className="border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800"
              asChild
            >
              <a 
                href={`https://polygonscan.com/tx/${asset.polygon_tx_hash}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TokenCard({ token }: { token: any }) {
  const isSocial = token.type === "SOCIAL"
  
  return (
    <div className={cn(
      "flex items-center justify-between py-4 border-b border-neutral-800 last:border-0"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isSocial 
            ? "bg-pink-500/10" 
            : "bg-green-500/10"
        )}>
          {isSocial ? (
            <Heart className="w-5 h-5 text-pink-500" />
          ) : (
            <Leaf className="w-5 h-5 text-green-500" />
          )}
        </div>
        <div>
          <p className="text-white font-medium line-clamp-1">{token.title}</p>
          <p className="text-neutral-500 text-sm">{token.institution_name || token.category}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-orange-500/30 text-orange-400 font-mono text-xs">
            {token.inscription_id?.slice(0, 12)}...
          </Badge>
          {token.inscription_id && (
            <a 
              href={`https://ordinals.com/inscription/${token.inscription_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-white"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        <p className="text-neutral-500 text-xs mt-1">
          {token.minted_at ? new Date(token.minted_at).toLocaleDateString("pt-BR") : ""}
        </p>
      </div>
    </div>
  )
}

export default function AssetsPage() {
  const { data, isLoading } = useSWR("/api/nobiscore/assets", fetcher)
  
  const tokens = data?.tokens || []
  const eligibleForBridge = data?.eligibleForBridge || []
  const stats = data?.stats || {}

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Meus Assets</h1>
          <p className="text-neutral-400 mt-2">
            Seus tokens de impacto verificados na Polygon e Bitcoin
          </p>
        </div>
        <Link href="/nobiscore/dashboard/bridge">
          <Button className="bg-white text-black hover:bg-neutral-200">
            <Flame className="w-4 h-4 mr-2" />
            Bridge Assets
          </Button>
        </Link>
      </div>

      {/* Summary Card - Dados Reais */}
      <Card className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total de Impactos Registrados</p>
              <p className="text-4xl font-bold text-white mt-1">
                {isLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  stats.total_on_polygon || 0
                )}
              </p>
              <div className="flex items-center gap-1 mt-2 text-neutral-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Na Polygon</span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-neutral-400 text-sm">Inscriptions</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? "..." : stats.total_inscriptions || 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-neutral-400 text-sm">Sociais</p>
                <p className="text-2xl font-bold text-pink-400">
                  {isLoading ? "..." : stats.social_inscriptions || 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-neutral-400 text-sm">Ambientais</p>
                <p className="text-2xl font-bold text-green-400">
                  {isLoading ? "..." : stats.environmental_inscriptions || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="eligible" className="space-y-6">
        <TabsList className="bg-neutral-900 border border-neutral-800 p-1">
          <TabsTrigger 
            value="eligible" 
            className="data-[state=active]:bg-white data-[state=active]:text-black"
          >
            Elegíveis para Bridge
            {eligibleForBridge.length > 0 && (
              <Badge className="ml-2 bg-purple-500 text-white text-xs">
                {eligibleForBridge.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="inscriptions" 
            className="data-[state=active]:bg-white data-[state=active]:text-black"
          >
            Meus NOBIS Tokens
            {tokens.length > 0 && (
              <Badge className="ml-2 bg-orange-500 text-black text-xs">
                {tokens.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Eligible for Bridge Tab */}
        <TabsContent value="eligible" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
            </div>
          ) : eligibleForBridge.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eligibleForBridge.map((asset: any) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Hexagon className="w-8 h-8 text-neutral-600" />
                </div>
                <p className="text-white font-medium">Nenhum IAC elegível para bridge</p>
                <p className="text-neutral-500 text-sm mt-1">
                  IACs precisam ser validados e registrados na Polygon primeiro
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* NOBIS Tokens Tab */}
        <TabsContent value="inscriptions" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
            </div>
          ) : tokens.length > 0 ? (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">NOBIS Tokens (Bitcoin Inscriptions)</CardTitle>
                <CardDescription className="text-neutral-500">
                  Seus impactos transformados em Ordinals permanentes no Bitcoin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {tokens.map((token: any) => (
                    <TokenCard key={token.id} token={token} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8 text-neutral-600" />
                </div>
                <p className="text-white font-medium">Nenhum NOBIS Token ainda</p>
                <p className="text-neutral-500 text-sm mt-1">
                  Faça bridge dos seus IACs validados para criar Inscriptions no Bitcoin
                </p>
                <Link href="/nobiscore/dashboard/bridge">
                  <Button className="mt-4 bg-white text-black hover:bg-neutral-200">
                    Iniciar Bridge
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

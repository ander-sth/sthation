"use client"

import { 
  Flame, 
  TrendingUp, 
  Wallet, 
  ArrowUpRight,
  Bitcoin,
  Activity,
  Clock,
  Leaf,
  Heart,
  Loader2,
  Hexagon
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  loading = false
}: { 
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  trend?: "up" | "down"
  loading?: boolean
}) {
  return (
    <Card className="bg-white border-black/10 hover:border-black/20 transition-colors shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-black/60 text-sm font-medium">{title}</p>
            {loading ? (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="w-5 h-5 animate-spin text-black/40" />
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-black mt-1 tracking-tight">{value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {trend && (
                    trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                    )
                  )}
                  <span className={`text-xs ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-black/50"}`}>
                    {subtitle}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="p-3 bg-black/5 rounded-xl">
            <Icon className="w-5 h-5 text-black" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ 
  title,
  type, 
  status, 
  inscriptionId, 
  polygonTxHash,
  time
}: { 
  title: string
  type: string
  status: string
  inscriptionId?: string
  polygonTxHash?: string
  time: string
}) {
  const getIcon = () => {
    switch (type) {
      case "SOCIAL": return <Heart className="w-4 h-4 text-pink-400" />
      case "AMBIENTAL": return <Leaf className="w-4 h-4 text-green-400" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "MINTED": 
      case "COMPLETED": 
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "VALIDATED": 
      case "REGISTERED": 
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "PENDING":
      case "IN_VCA":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      default: return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
    }
  }

  const displayHash = inscriptionId 
    ? `${inscriptionId.slice(0, 8)}...${inscriptionId.slice(-6)}`
    : polygonTxHash 
      ? `${polygonTxHash.slice(0, 8)}...${polygonTxHash.slice(-4)}`
      : "Aguardando..."

  return (
    <div className="flex items-center justify-between py-4 border-b border-black/10 last:border-0">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-black/5 rounded-lg">
          {getIcon()}
        </div>
        <div>
          <p className="text-black font-medium text-sm line-clamp-1">{title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="text-xs text-black/50 font-mono">{displayHash}</code>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getStatusColor()}`}>
              {status}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-black/50">
        <Clock className="w-3 h-3" />
        <span className="text-xs">{time}</span>
      </div>
    </div>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}m atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`
  return date.toLocaleDateString("pt-BR")
}

export default function NobisCoreDashboard() {
  const { data: stats, isLoading: loadingStats } = useSWR("/api/nobiscore/stats", fetcher)
  const { data: assets } = useSWR("/api/nobiscore/assets", fetcher)

  const recentActivity = stats?.recentActivity || []
  const eligibleTokens = assets?.eligibleForBridge || []

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black via-black to-gray-900 border border-black/10 p-8">
        <div className="relative z-10">
          <Badge variant="outline" className="border-white/30 text-white/80 mb-4">
            Waste-to-Value Protocol
          </Badge>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Transform Impact into
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
              Permanent Value
            </span>
          </h1>
          <p className="text-white/60 mt-4 max-w-lg">
            Bridge your verified environmental impact tokens from Polygon to Bitcoin Ordinals. 
            Create immutable, tradeable Inscriptions backed by real-world impact data.
          </p>
          <div className="flex gap-3 mt-6">
            <Link href="/nobiscore/dashboard/bridge">
              <Button className="bg-white text-black hover:bg-gray-100 font-medium">
                <Flame className="w-4 h-4 mr-2" />
                Start Bridging
              </Button>
            </Link>
            <Link href="/nobiscore/dashboard/marketplace">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
          <div className="absolute right-10 top-10 w-32 h-32 border border-white/20 rounded-full" />
          <div className="absolute right-20 top-20 w-48 h-48 border border-white/10 rounded-full" />
          <div className="absolute right-5 top-5 w-64 h-64 border border-white/5 rounded-full" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total na Polygon" 
          value={stats?.totalOnPolygon?.toString() || "0"} 
          subtitle="IACs registrados"
          icon={Wallet}
          loading={loadingStats}
        />
        <StatCard 
          title="Inscriptions Bitcoin" 
          value={stats?.totalInscriptions?.toString() || "0"} 
          subtitle="Ordinals mintados"
          icon={Bitcoin}
          loading={loadingStats}
        />
        <StatCard 
          title="Impacto Social" 
          value={stats?.socialCount?.toString() || "0"} 
          subtitle={`${stats?.totalBeneficiaries?.toLocaleString() || 0} beneficiários`}
          icon={Heart}
          loading={loadingStats}
        />
        <StatCard 
          title="Impacto Ambiental" 
          value={stats?.environmentalCount?.toString() || "0"} 
          subtitle="Projetos validados"
          icon={Leaf}
          loading={loadingStats}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Impact Tokens */}
        <Card className="lg:col-span-2 bg-white border-black/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-black">IACs Elegíveis para Bridge</CardTitle>
            <CardDescription className="text-black/50">
              Impactos validados na Polygon prontos para transformação em Ordinals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eligibleTokens.length === 0 ? (
              <div className="text-center py-8">
                <Hexagon className="w-12 h-12 text-black/20 mx-auto mb-3" />
                <p className="text-black/50">Nenhum IAC elegível para bridge no momento</p>
                <p className="text-black/40 text-sm mt-1">
                  IACs precisam ser validados e registrados na Polygon primeiro
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {eligibleTokens.slice(0, 5).map((iac: any) => (
                  <div 
                    key={iac.id}
                    className="flex items-center justify-between p-4 bg-black/5 rounded-xl border border-black/10 hover:border-black/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        iac.type === 'SOCIAL' 
                          ? 'bg-gradient-to-br from-pink-500 to-pink-700' 
                          : 'bg-gradient-to-br from-green-500 to-green-700'
                      }`}>
                        {iac.type === 'SOCIAL' ? (
                          <Heart className="w-6 h-6 text-white" />
                        ) : (
                          <Leaf className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-black font-medium line-clamp-1">{iac.title}</p>
                        <p className="text-black/50 text-sm">{iac.institution_name || iac.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {iac.vca_score && (
                        <p className="text-black font-medium">Score {iac.vca_score}</p>
                      )}
                      <Badge variant="outline" className="border-purple-500/30 text-purple-600 text-xs mt-1">
                        Polygon
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/nobiscore/dashboard/assets">
              <Button variant="ghost" className="w-full mt-4 text-black/60 hover:text-black hover:bg-black/5">
                Ver Todos os Assets
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white border-black/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-black">Atividade Recente</CardTitle>
            <CardDescription className="text-black/50">
              Últimos registros na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-10 h-10 text-black/20 mx-auto mb-3" />
                <p className="text-black/50 text-sm">Nenhuma atividade recente</p>
              </div>
            ) : (
              <div className="space-y-0">
                {recentActivity.slice(0, 5).map((activity: any) => (
                  <ActivityItem 
                    key={activity.id} 
                    title={activity.title}
                    type={activity.type}
                    status={activity.status}
                    inscriptionId={activity.inscription_id}
                    polygonTxHash={activity.polygon_tx_hash}
                    time={formatTimeAgo(activity.minted_at || activity.validated_at || activity.created_at)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

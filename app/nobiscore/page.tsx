"use client"

import { 
  Flame, 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Hexagon,
  Bitcoin,
  Activity,
  Clock,
  Leaf,
  Heart,
  Loader2
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
    <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-500 text-sm font-medium">{title}</p>
            {loading ? (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
              </div>
            ) : (
              <>
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
              </>
            )}
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
  title,
  type, 
  status, 
  inscriptionId, 
  polygonTxHash,
  time,
  category
}: { 
  title: string
  type: string
  status: string
  inscriptionId?: string
  polygonTxHash?: string
  time: string
  category?: string
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
    <div className="flex items-center justify-between py-4 border-b border-neutral-800 last:border-0">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-neutral-800 rounded-lg">
          {getIcon()}
        </div>
        <div>
          <p className="text-white font-medium text-sm line-clamp-1">{title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="text-xs text-neutral-500 font-mono">{displayHash}</code>
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
  const pipelineTrails = stats?.pipelineTrails || []
  const eligibleTokens = assets?.eligibleForBridge || []

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

      {/* Stats Grid - Dados Reais */}
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
        {/* Impact Tokens - Elegíveis para Bridge */}
        <Card className="lg:col-span-2 bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">IACs Elegíveis para Bridge</CardTitle>
            <CardDescription className="text-neutral-500">
              Impactos validados na Polygon prontos para transformação em Ordinals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eligibleTokens.length === 0 ? (
              <div className="text-center py-8">
                <Hexagon className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                <p className="text-neutral-500">Nenhum IAC elegível para bridge no momento</p>
                <p className="text-neutral-600 text-sm mt-1">
                  IACs precisam ser validados e registrados na Polygon primeiro
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {eligibleTokens.slice(0, 5).map((iac: any) => (
                  <div 
                    key={iac.id}
                    className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        iac.type === 'SOCIAL' 
                          ? 'bg-gradient-to-br from-pink-600 to-pink-800' 
                          : 'bg-gradient-to-br from-green-600 to-green-800'
                      }`}>
                        {iac.type === 'SOCIAL' ? (
                          <Heart className="w-6 h-6 text-white" />
                        ) : (
                          <Leaf className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium line-clamp-1">{iac.title}</p>
                        <p className="text-neutral-500 text-sm">{iac.institution_name || iac.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {iac.vca_score && (
                        <p className="text-white font-medium">Score {iac.vca_score}</p>
                      )}
                      <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs mt-1">
                        Polygon
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/nobiscore/assets">
              <Button variant="ghost" className="w-full mt-4 text-neutral-400 hover:text-white hover:bg-neutral-800">
                Ver Todos os Assets
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity - Dados Reais */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Atividade Recente</CardTitle>
            <CardDescription className="text-neutral-500">
              Últimos registros na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">Nenhuma atividade recente</p>
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
                    category={activity.category}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Trails */}
      {pipelineTrails.length > 0 && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Pipeline de Processamento</CardTitle>
            <CardDescription className="text-neutral-500">
              Trilhas de registro e validação em andamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left text-neutral-500 text-xs font-medium py-3 px-4">Trail ID</th>
                    <th className="text-left text-neutral-500 text-xs font-medium py-3 px-4">Tipo</th>
                    <th className="text-left text-neutral-500 text-xs font-medium py-3 px-4">Estágio</th>
                    <th className="text-left text-neutral-500 text-xs font-medium py-3 px-4">Status</th>
                    <th className="text-left text-neutral-500 text-xs font-medium py-3 px-4">Polygon</th>
                  </tr>
                </thead>
                <tbody>
                  {pipelineTrails.map((trail: any) => (
                    <tr key={trail.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                      <td className="py-3 px-4">
                        <code className="text-xs text-neutral-400 font-mono">
                          {trail.trail_id?.slice(0, 12)}...
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={
                          trail.type === 'SOCIAL' 
                            ? "border-pink-500/30 text-pink-400" 
                            : "border-green-500/30 text-green-400"
                        }>
                          {trail.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-neutral-400 text-sm">{trail.current_stage}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={
                          trail.status === 'COMPLETED' 
                            ? "border-green-500/30 text-green-400"
                            : "border-yellow-500/30 text-yellow-400"
                        }>
                          {trail.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {trail.polygon_registered ? (
                          <span className="text-green-400 text-xs">Registrado</span>
                        ) : (
                          <span className="text-neutral-500 text-xs">Pendente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from "swr"
import {
  Trophy,
  Medal,
  Star,
  TrendingUp,
  Users,
  CheckCircle2,
  Award,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const levelConfig: Record<string, { color: string; label: string; icon: typeof Trophy }> = {
  GOLD: { color: "bg-amber-500 text-white", label: "Ouro", icon: Trophy },
  SILVER: { color: "bg-gray-400 text-white", label: "Prata", icon: Medal },
  BRONZE: { color: "bg-amber-700 text-white", label: "Bronze", icon: Award },
}

export default function CheckerRankingPage() {
  const { data, isLoading } = useSWR("/api/checkers/ranking?limit=50", fetcher)

  const ranking = data?.ranking || []
  const stats = data?.stats || { total_checkers: 0, avg_reputation: 50, total_validations: 0 }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-7 w-7 text-amber-500" />
          Ranking de Checkers
        </h1>
        <p className="text-muted-foreground">
          Os melhores validadores da comunidade STHation
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_checkers}</p>
                <p className="text-sm text-muted-foreground">Checkers Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-emerald-100 p-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_validations}</p>
                <p className="text-sm text-muted-foreground">Validacoes Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-100 p-3">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.avg_reputation)}</p>
                <p className="text-sm text-muted-foreground">Reputacao Media</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Podium - Top 3 */}
      {ranking.length >= 3 && (
        <Card className="bg-gradient-to-b from-amber-50 to-white">
          <CardHeader>
            <CardTitle>Podium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center gap-4 pb-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <Avatar className="h-16 w-16 border-4 border-gray-400">
                  <AvatarFallback className="bg-gray-100 text-lg">
                    {ranking[1]?.name?.charAt(0) || "2"}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-2 text-center">
                  <p className="font-semibold">{ranking[1]?.name}</p>
                  <Badge className="bg-gray-400 mt-1">
                    <Medal className="mr-1 h-3 w-3" />
                    {ranking[1]?.reputation_score}
                  </Badge>
                </div>
                <div className="mt-2 h-20 w-24 bg-gray-200 rounded-t-lg flex items-center justify-center text-2xl font-bold text-gray-500">
                  2
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 border-4 border-amber-500">
                  <AvatarFallback className="bg-amber-100 text-xl">
                    {ranking[0]?.name?.charAt(0) || "1"}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-2 text-center">
                  <p className="font-semibold text-lg">{ranking[0]?.name}</p>
                  <Badge className="bg-amber-500 mt-1">
                    <Trophy className="mr-1 h-3 w-3" />
                    {ranking[0]?.reputation_score}
                  </Badge>
                </div>
                <div className="mt-2 h-28 w-24 bg-amber-200 rounded-t-lg flex items-center justify-center text-3xl font-bold text-amber-600">
                  1
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <Avatar className="h-14 w-14 border-4 border-amber-700">
                  <AvatarFallback className="bg-amber-50 text-base">
                    {ranking[2]?.name?.charAt(0) || "3"}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-2 text-center">
                  <p className="font-semibold">{ranking[2]?.name}</p>
                  <Badge className="bg-amber-700 mt-1">
                    <Award className="mr-1 h-3 w-3" />
                    {ranking[2]?.reputation_score}
                  </Badge>
                </div>
                <div className="mt-2 h-16 w-24 bg-amber-100 rounded-t-lg flex items-center justify-center text-xl font-bold text-amber-700">
                  3
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Completo</CardTitle>
          <CardDescription>Todos os checkers ordenados por reputacao</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ranking.map((checker: any, index: number) => {
              const level = levelConfig[checker.level] || levelConfig.BRONZE
              const LevelIcon = level.icon

              return (
                <div
                  key={checker.id}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                    index < 3 ? "bg-amber-50/50" : "hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      index === 0
                        ? "bg-amber-500 text-white"
                        : index === 1
                        ? "bg-gray-400 text-white"
                        : index === 2
                        ? "bg-amber-700 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{checker.name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{checker.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{checker.total_validations} validacoes</span>
                      <span>Precisao: {checker.accuracy_score?.toFixed(1)}%</span>
                    </div>
                  </div>

                  <Badge className={level.color}>
                    <LevelIcon className="mr-1 h-3 w-3" />
                    {level.label}
                  </Badge>

                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="font-bold">{checker.reputation_score}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      R$ {checker.rewards_earned?.toLocaleString("pt-BR") || 0}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

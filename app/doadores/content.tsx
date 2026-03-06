"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Medal,
  Crown,
  Heart,
  Flame,
  Star,
  Sparkles,
  Award,
  Gem,
  Globe,
  HeartHandshake,
  Utensils,
  GraduationCap,
  Home,
  HandHeart,
  PawPrint,
  Palette,
  User,
  ChevronRight,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  Timer,
  Rocket,
  Shield,
  Hexagon,
  Activity,
  ArrowUp,
  Gift,
  Lock,
} from "lucide-react"
import { mockDonorRankings, mockCategoryRankings, donorStats } from "@/lib/mock-donors"
import { getDonorTier, DONOR_TIERS, calculateImpactScore } from "@/lib/types/donor-ranking"

// ========== IMPACT MULTIPLIER SYSTEM ==========
// Multiplicadores que aumentam score baseado em comportamentos virtuosos
function getMultipliers(donor: (typeof mockDonorRankings)[0]) {
  const multipliers: { name: string; value: number; icon: React.ReactNode; description: string; active: boolean }[] = [
    {
      name: "Sequencia Ativa",
      value: Math.min(donor.currentStreak * 0.05, 0.5),
      icon: <Flame className="h-4 w-4" />,
      description: `${donor.currentStreak} meses consecutivos (+${Math.min(donor.currentStreak * 5, 50)}%)`,
      active: donor.currentStreak >= 3,
    },
    {
      name: "Diversidade",
      value: Math.min(donor.categoryDonations.length * 0.08, 0.4),
      icon: <Globe className="h-4 w-4" />,
      description: `${donor.categoryDonations.length} categorias (+${Math.min(donor.categoryDonations.length * 8, 40)}%)`,
      active: donor.categoryDonations.length >= 3,
    },
    {
      name: "Frequencia",
      value: donor.donationsCount >= 50 ? 0.3 : donor.donationsCount >= 20 ? 0.15 : 0,
      icon: <Zap className="h-4 w-4" />,
      description: `${donor.donationsCount} doacoes (+${donor.donationsCount >= 50 ? 30 : donor.donationsCount >= 20 ? 15 : 0}%)`,
      active: donor.donationsCount >= 20,
    },
    {
      name: "Veterano",
      value:
        new Date().getFullYear() - donor.memberSince.getFullYear() >= 2
          ? 0.2
          : new Date().getFullYear() - donor.memberSince.getFullYear() >= 1
            ? 0.1
            : 0,
      icon: <Shield className="h-4 w-4" />,
      description: `Membro desde ${donor.memberSince.getFullYear()}`,
      active: new Date().getFullYear() - donor.memberSince.getFullYear() >= 1,
    },
  ]
  return multipliers
}

function getTotalMultiplier(donor: (typeof mockDonorRankings)[0]) {
  const multipliers = getMultipliers(donor)
  return 1 + multipliers.reduce((sum, m) => sum + (m.active ? m.value : 0), 0)
}

function getAmplifiedScore(donor: (typeof mockDonorRankings)[0]) {
  return Math.floor(donor.impactScore * getTotalMultiplier(donor))
}

// ========== IMPACT DNA COLORS ==========
// Cada categoria gera uma cor unica, resultando em um "DNA" visual unico por doador
const CATEGORY_COLORS: Record<string, string> = {
  "Alimentacao": "#f59e0b",
  "Educacao": "#3b82f6",
  "Saude": "#ef4444",
  "Moradia": "#f97316",
  "Assistencia Social": "#a855f7",
  "Protecao Animal": "#22c55e",
  "Cultura": "#ec4899",
  "Esporte": "#06b6d4",
}

// ========== SEASONAL CHALLENGES ==========
const SEASONAL_CHALLENGES = [
  {
    id: "s1",
    title: "Desafio Verao Solidario",
    description: "Doe para 3 projetos de alimentacao ate marco",
    icon: <Target className="h-5 w-5" />,
    progress: 67,
    reward: "Badge Exclusivo + 500 pts bonus",
    endsAt: "2026-03-20",
    participants: 342,
    category: "Alimentacao",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "s2",
    title: "Missao Educacao 2026",
    description: "R$ 500+ em projetos educacionais neste trimestre",
    icon: <GraduationCap className="h-5 w-5" />,
    progress: 45,
    reward: "Titulo 'Educador do Trimestre' + 800 pts",
    endsAt: "2026-03-31",
    participants: 189,
    category: "Educacao",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "s3",
    title: "Streak de Fevereiro",
    description: "Faca uma doacao todo dia por 7 dias consecutivos",
    icon: <Flame className="h-5 w-5" />,
    progress: 28,
    reward: "Multiplicador 2x por 30 dias + 1.000 pts",
    endsAt: "2026-02-28",
    participants: 76,
    category: "Todas",
    color: "from-rose-500 to-pink-500",
  },
  {
    id: "s4",
    title: "Explorador de Categorias",
    description: "Doe em 5 categorias diferentes neste mes",
    icon: <Globe className="h-5 w-5" />,
    progress: 60,
    reward: "Badge 'Explorador' + 600 pts bonus",
    endsAt: "2026-02-28",
    participants: 128,
    category: "Diversificado",
    color: "from-teal-500 to-cyan-500",
  },
]

// ========== LIVE PULSE FEED ==========
const PULSE_EVENTS = [
  { donor: "Maria S.", action: "doou R$ 500", project: "Cozinha Comunitaria", ago: "2 min" },
  { donor: "Anonimo", action: "doou R$ 1.200", project: "Escola Rural Saber", ago: "5 min" },
  { donor: "Carlos M.", action: "atingiu Ouro", project: "", ago: "8 min" },
  { donor: "Ana P.", action: "doou R$ 300", project: "Abrigo Lar Feliz", ago: "12 min" },
  { donor: "Fundacao Esperanca", action: "doou R$ 5.000", project: "Capacitacao Jovem", ago: "15 min" },
  { donor: "Roberto A.", action: "completou streak de 7 meses", project: "", ago: "18 min" },
  { donor: "Tech4Good", action: "doou R$ 2.500", project: "Escola Digital", ago: "22 min" },
  { donor: "Patricia F.", action: "desbloqueou badge Diversificado", project: "", ago: "25 min" },
]

const iconMap: Record<string, React.ElementType> = {
  Sparkles, Heart, HeartHandshake, Globe, Flame, Award, Gem, Crown,
  Utensils, GraduationCap, Home, HandHeart, PawPrint, Palette, Trophy, Zap,
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value)
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />
  return <span className="text-sm font-bold text-white/40">#{rank}</span>
}

function getTierStyle(tier: string) {
  switch (tier) {
    case "diamond": return { bg: "bg-cyan-400/20", border: "border-cyan-400/40", text: "text-cyan-400", glow: "shadow-cyan-400/20" }
    case "platinum": return { bg: "bg-slate-300/20", border: "border-slate-300/40", text: "text-slate-300", glow: "shadow-slate-300/20" }
    case "gold": return { bg: "bg-yellow-400/20", border: "border-yellow-400/40", text: "text-yellow-400", glow: "shadow-yellow-400/20" }
    case "silver": return { bg: "bg-slate-400/20", border: "border-slate-400/40", text: "text-slate-400", glow: "shadow-slate-400/20" }
    default: return { bg: "bg-amber-700/20", border: "border-amber-700/40", text: "text-amber-600", glow: "shadow-amber-700/20" }
  }
}

// ========== IMPACT DNA COMPONENT ==========
function ImpactDNA({ donor, size = "md" }: { donor: (typeof mockDonorRankings)[0]; size?: "sm" | "md" | "lg" }) {
  const total = donor.categoryDonations.reduce((s, c) => s + c.totalDonated, 0) || 1
  const segments = donor.categoryDonations.map((cat) => ({
    category: cat.category,
    percentage: (cat.totalDonated / total) * 100,
    color: CATEGORY_COLORS[cat.category] || "#2dd4bf",
  }))

  const dimension = size === "lg" ? 120 : size === "md" ? 80 : 56
  const strokeWidth = size === "lg" ? 10 : size === "md" ? 8 : 6
  const radius = (dimension - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let offset = 0

  return (
    <div className="relative" style={{ width: dimension, height: dimension }}>
      <svg width={dimension} height={dimension} className="-rotate-90">
        <circle cx={dimension / 2} cy={dimension / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const dashLength = (seg.percentage / 100) * circumference
          const gapLength = circumference - dashLength
          const currentOffset = offset
          offset += dashLength
          return (
            <circle
              key={i}
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${gapLength}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
              style={{ filter: `drop-shadow(0 0 4px ${seg.color}40)` }}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className={`font-black ${size === "lg" ? "text-lg" : size === "md" ? "text-xs" : "text-[10px]"} text-white`}>
            {segments.length}
          </span>
          {size !== "sm" && (
            <span className={`block ${size === "lg" ? "text-xs" : "text-[8px]"} text-white/40`}>areas</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ========== PROGRESS RING (to next tier) ==========
function TierProgressRing({ donor }: { donor: (typeof mockDonorRankings)[0] }) {
  const amplified = getAmplifiedScore(donor)
  const currentTier = getDonorTier(amplified)
  const tierIndex = DONOR_TIERS.findIndex((t) => t.tier === currentTier.tier)
  const nextTier = DONOR_TIERS[tierIndex + 1]

  if (!nextTier) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Gem className="h-4 w-4 text-cyan-400" />
        <span className="text-cyan-400 font-semibold">Nivel Maximo</span>
      </div>
    )
  }

  const progressInTier = amplified - currentTier.minScore
  const tierRange = nextTier.minScore - currentTier.minScore
  const percent = Math.min((progressInTier / tierRange) * 100, 100)
  const remaining = nextTier.minScore - amplified

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/40">Proximo: {nextTier.label}</span>
        <span className="text-teal-400 font-semibold">{remaining.toLocaleString()} pts</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-300 transition-all duration-1000"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

// ========== LIVE PULSE ==========
function LivePulse() {
  const [visibleIndex, setVisibleIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((i) => (i + 1) % PULSE_EVENTS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const event = PULSE_EVENTS[visibleIndex]

  return (
    <div className="flex items-center gap-3 text-sm h-6 overflow-hidden">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
      </div>
      <span className="text-white/60 transition-all duration-500">
        <strong className="text-white">{event.donor}</strong> {event.action}
        {event.project && <> em <strong className="text-teal-400">{event.project}</strong></>}
        <span className="text-white/30 ml-2">{event.ago}</span>
      </span>
    </div>
  )
}

// ========== MAIN COMPONENT ==========
export function DoadoresContent() {
  const [selectedDonor, setSelectedDonor] = useState<string | null>(null)

  // Sort by amplified score (com multiplicadores)
  const rankedDonors = useMemo(() => {
    return [...mockDonorRankings]
      .map((d) => ({ ...d, amplifiedScore: getAmplifiedScore(d), multiplier: getTotalMultiplier(d) }))
      .sort((a, b) => b.amplifiedScore - a.amplifiedScore)
  }, [])

  const top3 = rankedDonors.slice(0, 3)
  const rest = rankedDonors.slice(3)

  return (
    <div className="flex min-h-screen flex-col bg-[#071f1f]">
      <Header />

      <main className="flex-1">
        {/* ===== HERO + LIVE PULSE ===== */}
        <section className="relative overflow-hidden bg-[#0a2f2f] py-20">
          <div className="absolute inset-0 mesh-pattern-dark" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />

          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4 bg-teal-400/20 text-teal-400 border-teal-400/30">
                <Activity className="mr-1 h-3 w-3" />
                Ranking Ao Vivo
              </Badge>
              <h1 className="mb-4 text-4xl font-black tracking-tight md:text-5xl text-white uppercase">
                Indice de <span className="text-teal-400">Impacto Social</span>
              </h1>
              <p className="mb-6 text-lg text-white/60">
                Ranking dinamico com multiplicadores. Quanto mais consistente, diversificado e engajado voce for, maior seu Indice de Impacto (IIS).
              </p>

              {/* Live Pulse */}
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-white/5 px-5 py-2.5 backdrop-blur-sm">
                <LivePulse />
              </div>
            </div>

            {/* Stats with multiplier highlight */}
            <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-5">
              {[
                { value: formatCurrency(donorStats.totalDonated), label: "Total Doado", icon: <Heart className="h-5 w-5" /> },
                { value: donorStats.totalDonors.toLocaleString(), label: "Doadores", icon: <User className="h-5 w-5" /> },
                { value: donorStats.totalDonations.toLocaleString(), label: "Doacoes", icon: <Gift className="h-5 w-5" /> },
                { value: `${donorStats.totalProjectsSupported}`, label: "Projetos", icon: <Target className="h-5 w-5" /> },
                { value: `${SEASONAL_CHALLENGES.length}`, label: "Desafios Ativos", icon: <Rocket className="h-5 w-5" /> },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 backdrop-blur-sm rounded-xl border border-teal-400/20 p-4 text-center">
                  <div className="text-teal-400 mx-auto mb-1">{stat.icon}</div>
                  <div className="text-xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PODIUM WITH IMPACT DNA ===== */}
        <section className="py-12 bg-[#071f1f]">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-black text-white mb-1">Top IIS - Indice de Impacto Social</h2>
              <p className="text-white/40 text-sm">Score base x Multiplicadores = IIS final</p>
            </div>

            <div className="mx-auto flex max-w-5xl flex-col items-end justify-center gap-6 md:flex-row md:items-end">
              {/* 2nd */}
              {top3[1] && (() => {
                const tier = getDonorTier(top3[1].amplifiedScore)
                const style = getTierStyle(tier.tier)
                return (
                  <div className="order-2 w-full md:order-1 md:w-1/3">
                    <Card className={`relative border ${style.border} bg-white/5 backdrop-blur-sm shadow-lg ${style.glow}`}>
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400 text-white">
                          <Medal className="h-4 w-4" />
                        </div>
                      </div>
                      <CardContent className="p-5 pt-8 text-center">
                        <div className="mx-auto mb-3">
                          <ImpactDNA donor={top3[1]} size="md" />
                        </div>
                        <h3 className="mb-1 font-bold text-white">{top3[1].name}</h3>
                        <Badge className={`${style.bg} ${style.text} border-0 text-xs`}>{tier.label}</Badge>
                        <div className="mt-3 text-2xl font-black text-teal-400">
                          {top3[1].amplifiedScore.toLocaleString()}
                          <span className="text-xs text-white/40 ml-1">IIS</span>
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-teal-400/10 px-2 py-0.5 text-xs text-teal-400">
                          <Zap className="h-3 w-3" />
                          x{top3[1].multiplier.toFixed(2)}
                        </div>
                        <div className="text-xs text-white/40 mt-1">{formatCurrency(top3[1].totalDonated)}</div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })()}

              {/* 1st */}
              {top3[0] && (() => {
                const tier = getDonorTier(top3[0].amplifiedScore)
                const style = getTierStyle(tier.tier)
                return (
                  <div className="order-1 w-full md:order-2 md:w-1/3">
                    <Card className={`relative border ${style.border} bg-white/5 backdrop-blur-sm md:-mt-8 shadow-xl ${style.glow}`}>
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg">
                          <Crown className="h-5 w-5" />
                        </div>
                      </div>
                      <CardContent className="p-6 pt-10 text-center">
                        <div className="mx-auto mb-3">
                          <ImpactDNA donor={top3[0]} size="lg" />
                        </div>
                        <h3 className="mb-1 text-lg font-black text-white">{top3[0].name}</h3>
                        <Badge className={`${style.bg} ${style.text} border-0`}>{tier.label}</Badge>
                        <div className="mt-3 text-3xl font-black text-teal-400">
                          {top3[0].amplifiedScore.toLocaleString()}
                          <span className="text-sm text-white/40 ml-1">IIS</span>
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-teal-400/10 px-2.5 py-1 text-xs text-teal-400 font-semibold">
                          <Zap className="h-3 w-3" />
                          Multiplicador x{top3[0].multiplier.toFixed(2)}
                        </div>
                        <div className="text-sm text-white/40 mt-1">{formatCurrency(top3[0].totalDonated)}</div>
                        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-white/30">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {top3[0].currentStreak} meses seguidos
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })()}

              {/* 3rd */}
              {top3[2] && (() => {
                const tier = getDonorTier(top3[2].amplifiedScore)
                const style = getTierStyle(tier.tier)
                return (
                  <div className="order-3 w-full md:w-1/3">
                    <Card className={`relative border ${style.border} bg-white/5 backdrop-blur-sm shadow-lg ${style.glow}`}>
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-700 text-white">
                          <Medal className="h-4 w-4" />
                        </div>
                      </div>
                      <CardContent className="p-5 pt-8 text-center">
                        <div className="mx-auto mb-3">
                          <ImpactDNA donor={top3[2]} size="md" />
                        </div>
                        <h3 className="mb-1 font-bold text-white">{top3[2].name}</h3>
                        <Badge className={`${style.bg} ${style.text} border-0 text-xs`}>{tier.label}</Badge>
                        <div className="mt-3 text-2xl font-black text-teal-400">
                          {top3[2].amplifiedScore.toLocaleString()}
                          <span className="text-xs text-white/40 ml-1">IIS</span>
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-teal-400/10 px-2 py-0.5 text-xs text-teal-400">
                          <Zap className="h-3 w-3" />
                          x{top3[2].multiplier.toFixed(2)}
                        </div>
                        <div className="text-xs text-white/40 mt-1">{formatCurrency(top3[2].totalDonated)}</div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })()}
            </div>
          </div>
        </section>

        {/* ===== TABS: RANKING / DESAFIOS / MULTIPLICADORES / CATEGORIAS ===== */}
        <section className="border-t border-teal-400/10 bg-[#0a2f2f] py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="ranking" className="mx-auto max-w-6xl">
              <TabsList className="mb-8 grid w-full grid-cols-4">
                <TabsTrigger value="ranking">Ranking IIS</TabsTrigger>
                <TabsTrigger value="challenges">Desafios</TabsTrigger>
                <TabsTrigger value="multipliers">Multiplicadores</TabsTrigger>
                <TabsTrigger value="categories">Categorias</TabsTrigger>
              </TabsList>

              {/* ===== TAB: RANKING IIS ===== */}
              <TabsContent value="ranking">
                <div className="space-y-3">
                  {rankedDonors.map((donor, index) => {
                    const tier = getDonorTier(donor.amplifiedScore)
                    const style = getTierStyle(tier.tier)
                    const isExpanded = selectedDonor === donor.id
                    const multipliers = getMultipliers(donor)
                    const activeMultipliers = multipliers.filter((m) => m.active)

                    return (
                      <div key={donor.id}>
                        <button
                          onClick={() => setSelectedDonor(isExpanded ? null : donor.id)}
                          className={`w-full flex items-center gap-4 rounded-xl border p-4 transition-all text-left ${
                            isExpanded
                              ? `${style.border} bg-white/10 shadow-lg ${style.glow}`
                              : "border-teal-400/10 bg-white/5 hover:bg-white/8 hover:border-teal-400/20"
                          }`}
                        >
                          <div className="flex h-10 w-10 items-center justify-center shrink-0">{getRankIcon(index + 1)}</div>

                          <ImpactDNA donor={donor} size="sm" />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white truncate">{donor.name}</span>
                              <Badge className={`${style.bg} ${style.text} border-0 text-[10px] px-1.5 py-0`}>{tier.label}</Badge>
                              {activeMultipliers.length > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-teal-400 bg-teal-400/10 rounded-full px-1.5 py-0">
                                  <Zap className="h-2.5 w-2.5" />
                                  x{donor.multiplier.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                              <span>{donor.donationsCount} doacoes</span>
                              <span>{donor.projectsSupported} projetos</span>
                              {donor.currentStreak >= 3 && (
                                <span className="flex items-center gap-0.5 text-orange-400">
                                  <Flame className="h-3 w-3" />
                                  {donor.currentStreak}m
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-lg font-black text-teal-400">{donor.amplifiedScore.toLocaleString()}</div>
                            <div className="text-[10px] text-white/30">
                              base: {donor.impactScore.toLocaleString()}
                            </div>
                          </div>
                        </button>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="mt-2 rounded-xl border border-teal-400/10 bg-white/5 p-5 space-y-5 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid gap-4 md:grid-cols-3">
                              {/* Impact DNA Grande */}
                              <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5">
                                <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Impact DNA</span>
                                <ImpactDNA donor={donor} size="lg" />
                                <div className="flex flex-wrap justify-center gap-1.5">
                                  {donor.categoryDonations.map((cat) => (
                                    <span
                                      key={cat.category}
                                      className="text-[10px] px-2 py-0.5 rounded-full"
                                      style={{
                                        backgroundColor: `${CATEGORY_COLORS[cat.category] || "#2dd4bf"}15`,
                                        color: CATEGORY_COLORS[cat.category] || "#2dd4bf",
                                      }}
                                    >
                                      {cat.category}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Multiplicadores Ativos */}
                              <div className="p-4 rounded-xl bg-white/5 space-y-3">
                                <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Multiplicadores</span>
                                {multipliers.map((m) => (
                                  <div key={m.name} className={`flex items-center gap-3 text-sm ${m.active ? "text-white" : "text-white/20"}`}>
                                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${m.active ? "bg-teal-400/20 text-teal-400" : "bg-white/5"}`}>
                                      {m.active ? m.icon : <Lock className="h-3 w-3" />}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-semibold text-xs">{m.name}</div>
                                      <div className="text-[10px] text-white/40">{m.description}</div>
                                    </div>
                                    {m.active && (
                                      <span className="text-xs font-bold text-teal-400">+{Math.round(m.value * 100)}%</span>
                                    )}
                                  </div>
                                ))}
                                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                                  <span className="text-xs text-white/40">Multiplicador Total</span>
                                  <span className="font-black text-teal-400">x{donor.multiplier.toFixed(2)}</span>
                                </div>
                              </div>

                              {/* Progresso para proximo tier */}
                              <div className="p-4 rounded-xl bg-white/5 space-y-3">
                                <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Progresso</span>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-white">{donor.amplifiedScore.toLocaleString()}</span>
                                    <span className="text-xs text-white/40">IIS</span>
                                  </div>
                                  <div className="text-xs text-white/40 space-y-1">
                                    <div className="flex justify-between">
                                      <span>Score base</span>
                                      <span className="text-white/60">{donor.impactScore.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Bonus multiplicador</span>
                                      <span className="text-teal-400">+{(donor.amplifiedScore - donor.impactScore).toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <TierProgressRing donor={donor} />
                                  <div className="flex items-center gap-2 mt-3">
                                    <Calendar className="h-3 w-3 text-white/30" />
                                    <span className="text-[10px] text-white/30">
                                      Membro desde {donor.memberSince.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Badges */}
                            <div>
                              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Conquistas ({donor.badges.length})</span>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {donor.badges.map((badge) => {
                                  const IconComp = iconMap[badge.icon] || Star
                                  return (
                                    <div
                                      key={badge.id}
                                      className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1.5"
                                      title={badge.description}
                                    >
                                      <IconComp className="h-3.5 w-3.5 text-teal-400" />
                                      <span className="text-xs text-white/70">{badge.name}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              {/* ===== TAB: DESAFIOS SAZONAIS ===== */}
              <TabsContent value="challenges">
                <div className="mb-6">
                  <h3 className="text-xl font-black text-white mb-1">Desafios Ativos</h3>
                  <p className="text-sm text-white/40">Complete desafios para ganhar pontos bonus, badges exclusivos e multiplicadores temporarios.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {SEASONAL_CHALLENGES.map((challenge) => {
                    const daysLeft = Math.max(0, Math.ceil((new Date(challenge.endsAt).getTime() - Date.now()) / 86400000))
                    return (
                      <Card key={challenge.id} className="border-teal-400/20 bg-white/5 backdrop-blur-sm overflow-hidden">
                        <div className={`h-1.5 bg-gradient-to-r ${challenge.color}`} />
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${challenge.color} text-white`}>
                                {challenge.icon}
                              </div>
                              <div>
                                <h4 className="font-bold text-white">{challenge.title}</h4>
                                <p className="text-xs text-white/40">{challenge.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-white/40 shrink-0">
                              <Timer className="h-3 w-3" />
                              {daysLeft}d
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-white/40">Progresso</span>
                              <span className="text-white font-semibold">{challenge.progress}%</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${challenge.color} transition-all duration-1000`}
                                style={{ width: `${challenge.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Reward */}
                          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                            <Gift className="h-4 w-4 text-amber-400 shrink-0" />
                            <span className="text-xs text-white/60">{challenge.reward}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-white/30">
                            <span>{challenge.participants} participantes</span>
                            <Badge variant="outline" className="text-[10px] border-white/10">
                              {challenge.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Upcoming */}
                <div className="mt-8 rounded-xl border border-dashed border-teal-400/20 p-6 text-center">
                  <Rocket className="h-8 w-8 text-teal-400/30 mx-auto mb-3" />
                  <h4 className="font-bold text-white/60 mb-1">Novos desafios em breve</h4>
                  <p className="text-sm text-white/30">Desafios de marco incluirao missoes em equipe e recompensas multiplicadas.</p>
                </div>
              </TabsContent>

              {/* ===== TAB: MULTIPLICADORES ===== */}
              <TabsContent value="multipliers">
                <div className="mb-6">
                  <h3 className="text-xl font-black text-white mb-1">Sistema de Multiplicadores</h3>
                  <p className="text-sm text-white/40">
                    Seu IIS (Indice de Impacto Social) e calculado assim: <strong className="text-teal-400">Score Base x Multiplicadores = IIS Final</strong>
                  </p>
                </div>

                {/* Formula visual */}
                <Card className="border-teal-400/30 bg-white/5 mb-8">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center gap-4 flex-wrap text-center">
                      <div className="space-y-1">
                        <div className="text-sm text-white/40">Score Base</div>
                        <div className="text-2xl font-black text-white">R$ / 10</div>
                        <div className="text-[10px] text-white/30">+ 5pts/doacao + 20pts/mes streak</div>
                      </div>
                      <div className="text-3xl text-teal-400 font-black">x</div>
                      <div className="space-y-1">
                        <div className="text-sm text-white/40">Multiplicador</div>
                        <div className="text-2xl font-black text-teal-400">1.00 ~ 2.40</div>
                        <div className="text-[10px] text-white/30">soma dos bonus ativos</div>
                      </div>
                      <div className="text-3xl text-white/20 font-black">=</div>
                      <div className="space-y-1">
                        <div className="text-sm text-white/40">IIS Final</div>
                        <div className="text-2xl font-black text-amber-400">Ranking</div>
                        <div className="text-[10px] text-white/30">posicao no ranking</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Multiplier cards */}
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      name: "Sequencia Ativa",
                      icon: <Flame className="h-6 w-6" />,
                      max: "+50%",
                      description: "Doe todos os meses sem falhar. Cada mes consecutivo adiciona +5% ao multiplicador (max +50%).",
                      levels: ["3 meses: +15%", "6 meses: +30%", "10+ meses: +50%"],
                      color: "from-orange-500 to-red-500",
                    },
                    {
                      name: "Diversidade de Categorias",
                      icon: <Globe className="h-6 w-6" />,
                      max: "+40%",
                      description: "Doe em categorias diferentes. Cada categoria adiciona +8% ao multiplicador (max +40%).",
                      levels: ["3 categorias: +24%", "4 categorias: +32%", "5+ categorias: +40%"],
                      color: "from-teal-500 to-cyan-500",
                    },
                    {
                      name: "Frequencia de Doacoes",
                      icon: <Zap className="h-6 w-6" />,
                      max: "+30%",
                      description: "Quanto mais doacoes voce fizer, maior o bonus por engajamento.",
                      levels: ["20+ doacoes: +15%", "50+ doacoes: +30%"],
                      color: "from-blue-500 to-indigo-500",
                    },
                    {
                      name: "Veterano da Plataforma",
                      icon: <Shield className="h-6 w-6" />,
                      max: "+20%",
                      description: "Membros mais antigos recebem bonus de lealdade.",
                      levels: ["1+ ano: +10%", "2+ anos: +20%"],
                      color: "from-purple-500 to-pink-500",
                    },
                  ].map((mult) => (
                    <Card key={mult.name} className="border-teal-400/20 bg-white/5 overflow-hidden">
                      <div className={`h-1 bg-gradient-to-r ${mult.color}`} />
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${mult.color} text-white`}>
                              {mult.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-white">{mult.name}</h4>
                              <p className="text-xs text-white/40">{mult.description}</p>
                            </div>
                          </div>
                          <Badge className="bg-teal-400/10 text-teal-400 border-0 font-black text-sm">{mult.max}</Badge>
                        </div>

                        <div className="space-y-1.5 pl-14">
                          {mult.levels.map((level) => (
                            <div key={level} className="flex items-center gap-2 text-xs text-white/50">
                              <ArrowUp className="h-3 w-3 text-teal-400" />
                              {level}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Multiplicador maximo */}
                <div className="mt-6 rounded-xl bg-gradient-to-r from-teal-400/10 to-cyan-400/10 border border-teal-400/30 p-6 text-center">
                  <Hexagon className="h-8 w-8 text-teal-400 mx-auto mb-2" />
                  <div className="text-3xl font-black text-teal-400 mb-1">x2.40 Maximo</div>
                  <p className="text-sm text-white/50">
                    Um doador com 10+ meses de streak, 5+ categorias, 50+ doacoes e 2+ anos na plataforma atinge o multiplicador maximo, mais que dobrando seu score base.
                  </p>
                </div>
              </TabsContent>

              {/* ===== TAB: CATEGORIAS ===== */}
              <TabsContent value="categories">
                <div className="mb-6">
                  <h3 className="text-xl font-black text-white mb-1">Ranking por Categoria</h3>
                  <p className="text-sm text-white/40">Top doadores em cada area de impacto social.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {mockCategoryRankings.map((category) => {
                    const IconComponent = iconMap[category.icon] || Heart
                    return (
                      <Card key={category.category} className="overflow-hidden border-teal-400/20 bg-white/5 backdrop-blur-sm">
                        <CardHeader className={`${category.color} text-white py-4`}>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <IconComponent className="h-5 w-5" />
                            {category.category}
                          </CardTitle>
                          <div className="flex items-center justify-between text-sm text-white/80">
                            <span>{formatCurrency(category.totalDonated)}</span>
                            <span>{category.donorsCount} doadores</span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {category.topDonors.slice(0, 5).map((donor) => (
                              <div key={donor.id} className="flex items-center gap-3">
                                <div className="flex h-6 w-6 items-center justify-center">{getRankIcon(donor.rank)}</div>
                                <div className="flex-1">
                                  <span className="font-medium text-white text-sm">{donor.isAnonymous ? "Anonimo" : donor.name}</span>
                                </div>
                                <span className="font-bold text-teal-400 text-sm">{formatCurrency(donor.totalDonated)}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="relative bg-[#071f1f] py-16 overflow-hidden">
          <div className="absolute inset-0 mesh-pattern-dark" />
          <div className="container relative mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-white mb-4">
              Construa Seu <span className="text-teal-400">Indice de Impacto</span>
            </h2>
            <p className="text-white/50 mb-8 max-w-2xl mx-auto">
              Cada doacao e rastreavel, validada por Checkers e registrada na blockchain. Seu impacto e real, mensuravel e imutavel.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold rounded-full glow-teal">
                <Link href="/projetos">
                  Comecar a Doar
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-teal-400/30 text-teal-400 hover:bg-teal-400/10 rounded-full bg-transparent">
                <Link href="/register">
                  Criar Conta
                  <ArrowUp className="ml-2 h-4 w-4 rotate-45" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

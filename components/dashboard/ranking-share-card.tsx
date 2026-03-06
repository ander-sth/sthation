"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Share2, Download, Instagram, Trophy, Heart, Star, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface DonorStats {
  name: string
  rank: number
  totalDonated: number
  impactScore: number
  donationsCount: number
  projectsSupported: number
  topCategory?: string
  topCategoryRank?: number
  currentStreak: number
  level: "bronze" | "silver" | "gold" | "platinum" | "diamond"
}

interface RankingShareCardProps {
  donor: DonorStats
  collapsed?: boolean
}

const levelColors = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-slate-400 to-slate-600",
  gold: "from-yellow-400 to-amber-500",
  platinum: "from-cyan-300 to-blue-500",
  diamond: "from-violet-400 via-purple-500 to-pink-500",
}

const levelLabels = {
  bronze: "Bronze",
  silver: "Prata",
  gold: "Ouro",
  platinum: "Platina",
  diamond: "Diamante",
}

export function RankingShareCard({ donor, collapsed = false }: RankingShareCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleDownload = async () => {
    if (!cardRef.current) return

    setIsGenerating(true)

    try {
      // Usando html2canvas dinamicamente
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      })

      const link = document.createElement("a")
      link.download = `sthation-ranking-${donor.name.toLowerCase().replace(/\s+/g, "-")}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Erro ao gerar imagem:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShareInstagram = async () => {
    // No mobile, tenta abrir o Instagram diretamente
    if (navigator.share) {
      try {
        if (!cardRef.current) return

        setIsGenerating(true)
        const html2canvas = (await import("html2canvas")).default
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          backgroundColor: null,
          useCORS: true,
        })

        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "sthation-ranking.png", { type: "image/png" })
            await navigator.share({
              files: [file],
              title: "Meu Ranking STHATION",
              text: "Confira meu impacto social na STHATION!",
            })
          }
          setIsGenerating(false)
        })
      } catch (error) {
        console.error("Erro ao compartilhar:", error)
        setIsGenerating(false)
        // Fallback para download
        handleDownload()
      }
    } else {
      // Desktop: apenas baixa a imagem
      handleDownload()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full gap-2 border-[#0a2f2f]/20 bg-gradient-to-r from-[#0a2f2f]/5 to-teal-500/5 text-[#0a2f2f] hover:from-[#0a2f2f]/10 hover:to-teal-500/10",
            collapsed && "justify-center px-2",
          )}
        >
          <Share2 className="h-4 w-4" />
          {!collapsed && <span>Compartilhar Ranking</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhe seu Impacto</DialogTitle>
          <DialogDescription>Baixe ou compartilhe seu card de ranking no Instagram Stories</DialogDescription>
        </DialogHeader>

        {/* Card para Stories (9:16 aspect ratio) */}
        <div className="flex justify-center py-4">
          <div
            ref={cardRef}
            className={cn(
              "relative w-[270px] h-[480px] rounded-3xl overflow-hidden",
              "bg-gradient-to-br",
              levelColors[donor.level],
            )}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-20 right-5 w-40 h-40 rounded-full bg-white blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-between p-6 text-white">
              {/* Header */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-widest opacity-80">
                  <Star className="h-3 w-3" />
                  <span>STHATION</span>
                  <Star className="h-3 w-3" />
                </div>
                <p className="mt-1 text-sm opacity-70">Ranking de Impacto 2025</p>
              </div>

              {/* Main Stats */}
              <div className="flex flex-col items-center gap-4">
                {/* Rank Badge */}
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/30">
                      <span className="text-4xl font-bold">#{donor.rank}</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-0.5 text-xs font-bold text-gray-800">
                    {levelLabels[donor.level]}
                  </div>
                </div>

                {/* Name */}
                <div className="text-center">
                  <p className="text-xl font-bold">{donor.name}</p>
                  <p className="text-sm opacity-70">Doador de Impacto</p>
                </div>

                {/* Impact Score */}
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                  <Trophy className="h-5 w-5" />
                  <span className="text-2xl font-bold">{donor.impactScore.toLocaleString("pt-BR")}</span>
                  <span className="text-xs opacity-70">pts</span>
                </div>

                {/* Stats Grid */}
                <div className="grid w-full grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/15 p-3 text-center backdrop-blur-sm">
                    <p className="text-lg font-bold">{formatCurrency(donor.totalDonated)}</p>
                    <p className="text-xs opacity-70">Doado</p>
                  </div>
                  <div className="rounded-xl bg-white/15 p-3 text-center backdrop-blur-sm">
                    <p className="text-lg font-bold">{donor.projectsSupported}</p>
                    <p className="text-xs opacity-70">Projetos</p>
                  </div>
                  <div className="rounded-xl bg-white/15 p-3 text-center backdrop-blur-sm">
                    <Heart className="mx-auto h-4 w-4 mb-1" />
                    <p className="text-lg font-bold">{donor.donationsCount}</p>
                    <p className="text-xs opacity-70">Doações</p>
                  </div>
                  <div className="rounded-xl bg-white/15 p-3 text-center backdrop-blur-sm">
                    <Flame className="mx-auto h-4 w-4 mb-1" />
                    <p className="text-lg font-bold">{donor.currentStreak}</p>
                    <p className="text-xs opacity-70">Meses seguidos</p>
                  </div>
                </div>

                {/* Top Category */}
                {donor.topCategory && (
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wide opacity-60">Destaque em</p>
                    <p className="font-semibold">{donor.topCategory}</p>
                    {donor.topCategoryRank && (
                      <p className="text-xs opacity-70">#{donor.topCategoryRank} na categoria</p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center">
                <p className="text-xs opacity-60">sthation.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2 bg-transparent"
            onClick={handleDownload}
            disabled={isGenerating}
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Gerando..." : "Baixar Imagem"}
          </Button>
          <Button
            className="flex-1 gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
            onClick={handleShareInstagram}
            disabled={isGenerating}
          >
            <Instagram className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Baixe a imagem e compartilhe nos seus Stories do Instagram
        </p>
      </DialogContent>
    </Dialog>
  )
}

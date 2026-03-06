"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, Vote, Coins, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalProjects: number
    pendingValidations: number
    mintedNobis: number
    totalValue: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total de Projetos",
      value: stats.totalProjects,
      icon: FolderKanban,
      description: "IACs registrados",
      color: "text-primary",
    },
    {
      title: "Validações Pendentes",
      value: stats.pendingValidations,
      icon: Vote,
      description: "Aguardando VCA",
      color: "text-amber-500",
    },
    {
      title: "NOBIS Emitidos",
      value: stats.mintedNobis,
      icon: Coins,
      description: "Ativos tokenizados",
      color: "text-emerald-500",
    },
    {
      title: "Valor Total",
      value: `R$ ${stats.totalValue.toLocaleString("pt-BR")}`,
      icon: TrendingUp,
      description: "Volume negociado",
      color: "text-blue-500",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

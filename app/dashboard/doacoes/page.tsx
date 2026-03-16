"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Receipt, Download, ExternalLink, Loader2, Calendar, Building2 } from "lucide-react"
import useSWR from "swr"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then(res => res.json())

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function DoacoesPage() {
  const { user } = useAuth()

  const { data, isLoading } = useSWR(
    user?.id ? `/api/donations?donorId=${user.id}` : null,
    fetcher
  )

  const donations = data?.donations || []
  const totalDonated = donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minhas Doacoes</h1>
        <p className="text-muted-foreground">Historico de todas as suas contribuicoes</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Doado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalDonated * 100)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Doacoes Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Impacto Social</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0a2f2f]">
              {donations.length} projeto{donations.length !== 1 ? "s" : ""} apoiado{donations.length !== 1 ? "s" : ""}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de doações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Historico de Doacoes
          </CardTitle>
          <CardDescription>
            Todas as suas contribuicoes para projetos de impacto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma doacao ainda</h3>
              <p className="text-muted-foreground mb-4">
                Comece a fazer a diferenca apoiando projetos de impacto social e ambiental.
              </p>
              <Button asChild>
                <Link href="/explorar">Explorar Projetos</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation: any) => (
                <div 
                  key={donation.id} 
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{donation.project_title || "Projeto"}</span>
                      <Badge 
                        variant={donation.status === "confirmed" ? "default" : "secondary"}
                        className={donation.status === "confirmed" ? "bg-emerald-600" : ""}
                      >
                        {donation.status === "confirmed" ? "Confirmada" : donation.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(donation.createdAt || donation.created_at)}
                      </span>
                      {donation.paymentMethod && (
                        <span className="flex items-center gap-1">
                          <Receipt className="h-3 w-3" />
                          {donation.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">
                        {formatCurrency((donation.amount || 0) * 100)}
                      </div>
                      {donation.txHash && (
                        <a 
                          href={`https://polygonscan.com/tx/${donation.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          Ver na blockchain
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

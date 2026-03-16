"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Heart, Download, ArrowRight, Share2, Loader2 } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"

export default function DoacaoSucessoPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [donation, setDonation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Dispara confetti na montagem
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [])

  useEffect(() => {
    if (sessionId) {
      // Buscar detalhes da doação
      fetch(`/api/donations/session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setDonation(data.donation)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Fiz uma doacao no STHATION!",
        text: `Acabei de contribuir para um projeto de impacto social. Junte-se a mim!`,
        url: window.location.origin,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Doacao Confirmada!</CardTitle>
          <CardDescription>
            Obrigado por fazer a diferenca. Sua contribuicao ajudara a transformar vidas.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : donation ? (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor doado</span>
                <span className="font-bold text-emerald-600 text-lg">
                  {formatCurrency(donation.amount_total || 0)}
                </span>
              </div>
              {donation.iac_title && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projeto</span>
                  <span className="font-medium">{donation.iac_title}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID da transacao</span>
                <span className="font-mono text-xs">{donation.id?.slice(0, 8)}...</span>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 rounded-lg p-4">
              <Heart className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-emerald-800">
                Sua doacao foi processada com sucesso!
              </p>
            </div>
          )}

          {/* Distribuição da doação */}
          <div className="text-left">
            <h4 className="font-medium mb-2 text-sm">Como sua doacao sera utilizada:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Instituicao beneficiada</span>
                <span className="text-emerald-600 font-medium">80%</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Manutencao da plataforma</span>
                <span>16%</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Recompensa Checkers</span>
                <span>4%</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={handleShare} variant="outline" className="w-full">
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
            
            <Button asChild className="w-full bg-[#0a2f2f] hover:bg-[#0a2f2f]/90">
              <Link href="/explorar">
                Explorar mais projetos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/dashboard/doacoes">
                Ver minhas doacoes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

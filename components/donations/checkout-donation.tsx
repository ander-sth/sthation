"use client"

import { useState, useCallback } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js"
import { createDonationCheckout } from "@/app/actions/donations"
import { calculateSplit, formatBRL, DONATION_AMOUNTS } from "@/lib/donation-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Heart, Building2, Hexagon, Fuel, ArrowRight, Loader2, Info } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutDonationProps {
  projectId: string
  projectName: string
  institutionId: string
  institutionName: string
  stripeAccountId?: string
  donorId?: string
  donorEmail?: string
}

export function CheckoutDonation({
  projectId,
  projectName,
  institutionId,
  institutionName,
  stripeAccountId,
  donorId,
  donorEmail,
}: CheckoutDonationProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const amount = selectedAmount || (customAmount ? parseInt(customAmount) * 100 : 0)
  const split = amount > 0 ? calculateSplit(amount) : null

  const fetchClientSecret = useCallback(async () => {
    if (!amount) throw new Error("Selecione um valor")

    const result = await createDonationCheckout({
      amountInCents: amount,
      projectId,
      projectName,
      institutionId,
      institutionName,
      stripeAccountId,
      donorId,
      donorEmail,
      returnUrl: `${window.location.origin}/dashboard/donate/success?session_id={CHECKOUT_SESSION_ID}`,
    })

    return result.clientSecret!
  }, [amount, projectId, projectName, institutionId, institutionName, stripeAccountId, donorId, donorEmail])

  const handleContinue = () => {
    if (amount >= 500) { // Minimo R$ 5,00
      setIsLoading(true)
      setShowCheckout(true)
    }
  }

  if (showCheckout) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Finalizar Doacao
          </CardTitle>
          <CardDescription>
            {formatBRL(amount)} para {projectName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selecao de valor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Escolha o valor da doacao
          </CardTitle>
          <CardDescription>
            Doar para: <span className="font-medium">{projectName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Valores pre-definidos */}
          <div className="grid grid-cols-3 gap-2">
            {DONATION_AMOUNTS.map((option) => (
              <Button
                key={option.id}
                variant={selectedAmount === option.amountInCents ? "default" : "outline"}
                className={selectedAmount === option.amountInCents ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                onClick={() => {
                  setSelectedAmount(option.amountInCents)
                  setCustomAmount("")
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Valor customizado */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Ou digite outro valor</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input
                id="custom-amount"
                type="number"
                placeholder="0,00"
                className="pl-10"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(null)
                }}
                min={5}
              />
            </div>
            <p className="text-xs text-muted-foreground">Valor minimo: R$ 5,00</p>
          </div>
        </CardContent>
      </Card>

      {/* Distribuicao do valor (split) */}
      {split && amount >= 500 && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-emerald-600" />
              Como sua doacao sera distribuida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{institutionName}</span>
                <Badge variant="secondary" className="text-xs">80%</Badge>
              </div>
              <span className="font-semibold text-emerald-600">{formatBRL(split.institution)}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Hexagon className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Plataforma STHATION</span>
                <Badge variant="secondary" className="text-xs">16%</Badge>
              </div>
              <span className="font-medium">{formatBRL(split.platform)}</span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Fundo de Gas (Blockchain)</span>
                <Badge variant="secondary" className="text-xs">4%</Badge>
              </div>
              <span className="font-medium">{formatBRL(split.gasFund)}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="font-medium">Total da doacao</span>
              <span className="text-lg font-bold text-emerald-600">{formatBRL(split.total)}</span>
            </div>

            {!stripeAccountId && (
              <p className="text-xs text-amber-600 bg-amber-500/10 p-2 rounded mt-2">
                Esta instituicao ainda nao conectou sua conta bancaria. O valor sera transferido manualmente apos a confirmacao.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botao de continuar */}
      <Button
        size="lg"
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={amount < 500 || isLoading}
        onClick={handleContinue}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando...
          </>
        ) : (
          <>
            Continuar para pagamento
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
}

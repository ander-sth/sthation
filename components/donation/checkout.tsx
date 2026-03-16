"use client"

import { useCallback, useState } from "react"
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startDonationCheckout, recordDonation } from "@/app/actions/stripe"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/donation-products"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface DonationCheckoutProps {
  donationOptionId?: string
  customAmount?: number
  iacId: string
  iacTitle: string
  institutionId: string
  institutionName: string
  donorId?: string
  donorEmail?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function DonationCheckout({
  donationOptionId,
  customAmount,
  iacId,
  iacTitle,
  institutionId,
  institutionName,
  donorId,
  donorEmail,
  onSuccess,
  onCancel,
}: DonationCheckoutProps) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [split, setSplit] = useState<{ institution: number; sthation: number; checkers: number } | null>(null)

  const fetchClientSecret = useCallback(async () => {
    const result = await startDonationCheckout({
      donationOptionId,
      customAmount,
      iacId,
      iacTitle,
      institutionId,
      institutionName,
      donorId,
      donorEmail,
    })
    setSessionId(result.sessionId)
    setSplit(result.split)
    return result.clientSecret!
  }, [donationOptionId, customAmount, iacId, iacTitle, institutionId, institutionName, donorId, donorEmail])

  const handleComplete = useCallback(async () => {
    if (sessionId) {
      try {
        await recordDonation(sessionId)
        setIsCompleted(true)
        onSuccess?.()
      } catch (error) {
        console.error("Erro ao registrar doação:", error)
      }
    }
  }, [sessionId, onSuccess])

  if (isCompleted) {
    return (
      <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-600" />
            <div>
              <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400">
                Doação realizada com sucesso!
              </h3>
              <p className="mt-2 text-emerald-700 dark:text-emerald-500">
                Obrigado por contribuir com {iacTitle}
              </p>
              {split && (
                <div className="mt-4 text-sm text-foreground/70">
                  <p>Distribuição da sua doação:</p>
                  <ul className="mt-2 space-y-1">
                    <li>{formatCurrency(split.institution)} para {institutionName}</li>
                    <li>{formatCurrency(split.sthation)} para manutenção da plataforma</li>
                    <li>{formatCurrency(split.checkers)} para validadores comunitários</li>
                  </ul>
                </div>
              )}
            </div>
            {onCancel && (
              <Button onClick={onCancel} variant="outline" className="mt-4">
                Voltar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          fetchClientSecret,
          onComplete: handleComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Heart, 
  ArrowLeft, 
  Loader2, 
  Building2, 
  MapPin, 
  Target,
  Users,
  Leaf,
  Info,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { DONATION_OPTIONS, formatCurrency, calculateSplit } from "@/lib/donation-products"
import { DonationCheckout } from "@/components/donation/checkout"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DoarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)

  const { data, isLoading, error } = useSWR(`/api/iac/${id}`, fetcher)
  const project = data?.project

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a2f2f]" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg text-foreground/70">Projeto não encontrado</p>
        <Button asChild>
          <Link href="/explorar">Voltar para explorar</Link>
        </Button>
      </div>
    )
  }

  const institution = project.institution || { name: project.institution_name, id: project.institution_id }
  const totalRaised = project.total_raised || 0
  const goal = project.funding_goal || 10000000 // R$ 100.000 default
  const progress = Math.min((totalRaised / goal) * 100, 100)
  const donationsCount = project.donations_count || 0

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    // Permitir apenas números
    const numericValue = value.replace(/\D/g, "")
    setCustomAmount(numericValue)
    setSelectedOption(null)
  }

  const getAmountInCents = () => {
    if (selectedOption) {
      const option = DONATION_OPTIONS.find((o) => o.id === selectedOption)
      return option?.priceInCents || 0
    }
    if (customAmount) {
      return parseInt(customAmount) * 100
    }
    return 0
  }

  const canProceed = getAmountInCents() >= 500 // Mínimo R$ 5,00
  const split = canProceed ? calculateSplit(getAmountInCents()) : null

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <Button
            variant="ghost"
            onClick={() => setShowCheckout(false)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                Finalizar Doação
              </CardTitle>
              <CardDescription>
                Você está doando {formatCurrency(getAmountInCents())} para {project.title}
              </CardDescription>
            </CardHeader>
          </Card>

          <DonationCheckout
            donationOptionId={selectedOption || undefined}
            customAmount={selectedOption ? undefined : getAmountInCents()}
            iacId={project.id}
            iacTitle={project.title}
            institutionId={institution.id}
            institutionName={institution.name}
            donorId={user?.id}
            donorEmail={user?.email}
            onSuccess={() => {
              // Aguardar um pouco e redirecionar
              setTimeout(() => {
                router.push(`/explorar/${project.id}?donated=true`)
              }, 3000)
            }}
            onCancel={() => setShowCheckout(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <Button
          variant="ghost"
          asChild
          className="mb-6"
        >
          <Link href={`/explorar/${project.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao projeto
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info do projeto */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
                    <Leaf className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {institution.name}
                    </CardDescription>
                    {project.location_name && (
                      <p className="mt-1 text-sm text-foreground/60 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.location_name}, {project.location_state}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground/70">Arrecadado</span>
                    <span className="font-semibold">{formatCurrency(totalRaised)}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-foreground/60">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {donationsCount} doações
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Meta: {formatCurrency(goal)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opções de doação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Escolha o valor da doação
                </CardTitle>
                <CardDescription>
                  Selecione uma opção ou digite um valor personalizado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Opções pré-definidas */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {DONATION_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`rounded-lg border-2 p-4 text-center transition-all ${
                        selectedOption === option.id
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-border hover:border-emerald-300"
                      }`}
                    >
                      <p className="text-lg font-bold">{option.priceBRL}</p>
                    </button>
                  ))}
                </div>

                <Separator />

                {/* Valor personalizado */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Ou digite outro valor (mínimo R$ 5,00)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">
                      R$
                    </span>
                    <Input
                      type="text"
                      placeholder="0,00"
                      value={customAmount ? (parseInt(customAmount) / 1).toLocaleString("pt-BR") : ""}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className={`pl-10 ${customAmount ? "border-emerald-500" : ""}`}
                    />
                  </div>
                </div>

                {/* Botão continuar */}
                <Button
                  onClick={() => setShowCheckout(true)}
                  disabled={!canProceed}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Continuar com {canProceed ? formatCurrency(getAmountInCents()) : "doação"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Split info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Como sua doação é distribuída
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Instituição</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                    80%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Plataforma STHation</span>
                  <Badge variant="outline">16%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Validadores (Checkers)</span>
                  <Badge variant="outline">4%</Badge>
                </div>

                {split && (
                  <>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">Para esta doação:</p>
                      <p className="text-emerald-600">{formatCurrency(split.institution)} → {institution.name}</p>
                      <p className="text-foreground/70">{formatCurrency(split.sthation)} → STHation</p>
                      <p className="text-foreground/70">{formatCurrency(split.checkers)} → Checkers</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Segurança */}
            <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
                    <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-400">Pagamento seguro</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-500">
                      Processado pelo Stripe com criptografia de ponta a ponta.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

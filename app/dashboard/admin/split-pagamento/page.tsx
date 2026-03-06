"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Building2, Users, Award, Fuel, Building, Calculator, PieChart, Save, RotateCcw, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SplitConfig {
  instituicao: number
  plataforma: number
  gasFund: number
}

const DEFAULT_SPLIT: SplitConfig = {
  instituicao: 80,
  plataforma: 16,
  gasFund: 4,
}

const SPLIT_ITEMS = [
  {
    key: "instituicao" as keyof SplitConfig,
    label: "Instituicao de Impacto",
    description: "Valor destinado a instituicao executora do projeto social. Vai direto para a conta Stripe Connect da instituicao.",
    icon: Building2,
    color: "bg-emerald-500",
    textColor: "text-emerald-600",
  },
  {
    key: "plataforma" as keyof SplitConfig,
    label: "Plataforma STHATION",
    description: "Custos administrativos, operacionais, desenvolvimento da plataforma e servicos de terceiros.",
    icon: Building,
    color: "bg-slate-500",
    textColor: "text-slate-600",
  },
  {
    key: "gasFund" as keyof SplitConfig,
    label: "Fundo de Gas (Blockchain)",
    description: "Reserva para taxas de registro na Polygon (NOBIS). Garante que os dados de impacto sejam imutaveis.",
    icon: Fuel,
    color: "bg-purple-500",
    textColor: "text-purple-600",
  },
]

export default function SplitPagamentoPage() {
  const [donationAmount, setDonationAmount] = useState<number>(1000)
  const [split, setSplit] = useState<SplitConfig>(DEFAULT_SPLIT)
  const [isEditing, setIsEditing] = useState(false)

  const totalPercentage = Object.values(split).reduce((a, b) => a + b, 0)
  const isValid = totalPercentage === 100

  const calculateValue = (percentage: number) => {
    return (donationAmount * percentage) / 100
  }

  const handleSplitChange = (key: keyof SplitConfig, value: number) => {
    setSplit((prev) => ({ ...prev, [key]: value }))
  }

  const resetToDefault = () => {
    setSplit(DEFAULT_SPLIT)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Split de Pagamento</h1>
          <p className="text-foreground/60">Configure e simule a distribuição dos valores das doações</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Simulador */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Simulador de Doação
              </CardTitle>
              <CardDescription>Insira um valor de doação para ver como será distribuído</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="donation">Valor da Doação</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">R$</span>
                  <Input
                    id="donation"
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                    className="pl-10 text-2xl font-bold h-14"
                    min={0}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Distribuição dos Valores</h3>
                {SPLIT_ITEMS.map((item) => {
                  const value = calculateValue(split[item.key])
                  return (
                    <div key={item.key} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${item.color} text-foreground`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-foreground/60">{split[item.key]}%</p>
                        </div>
                      </div>
                      <p className={`text-lg font-bold ${item.textColor}`}>{formatCurrency(value)}</p>
                    </div>
                  )
                })}
              </div>

              <Separator />

              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <p className="font-semibold">Total</p>
                <p className="text-2xl font-bold">{formatCurrency(donationAmount)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Configuração do Split */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Configuração do Split
                  </CardTitle>
                  <CardDescription>Ajuste as porcentagens de distribuição</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {!isValid && <Badge variant="destructive">Total: {totalPercentage}% (deve ser 100%)</Badge>}
                  {isValid && <Badge variant="default">Válido</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {SPLIT_ITEMS.map((item) => (
                <div key={item.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`rounded p-1.5 ${item.color} text-foreground`}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <Label className="font-medium">{item.label}</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5 text-foreground/60" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{item.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={split[item.key]}
                        onChange={(e) => handleSplitChange(item.key, Number(e.target.value))}
                        className="w-20 text-center"
                        min={0}
                        max={100}
                        disabled={!isEditing}
                      />
                      <span className="text-foreground/60">%</span>
                    </div>
                  </div>
                  <Slider
                    value={[split[item.key]]}
                    onValueChange={([value]) => handleSplitChange(item.key, value)}
                    max={100}
                    step={1}
                    disabled={!isEditing}
                    className="cursor-pointer"
                  />
                </div>
              ))}

              <Separator />

              {/* Gráfico Visual */}
              <div className="space-y-2">
                <Label>Visualização</Label>
                <div className="flex h-8 overflow-hidden rounded-full">
                  {SPLIT_ITEMS.map((item) => (
                    <div
                      key={item.key}
                      className={`${item.color} transition-all duration-300`}
                      style={{ width: `${split[item.key]}%` }}
                      title={`${item.label}: ${split[item.key]}%`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SPLIT_ITEMS.map((item) => (
                    <div key={item.key} className="flex items-center gap-1 text-xs">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-foreground/60">
                        {item.label}: {split[item.key]}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={() => setIsEditing(false)} disabled={!isValid} className="flex-1">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configuração
                    </Button>
                    <Button variant="outline" onClick={resetToDefault}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restaurar Padrão
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="flex-1">
                    Editar Configuração
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Exemplos */}
        <Card>
          <CardHeader>
            <CardTitle>Exemplos de Distribuição</CardTitle>
            <CardDescription>
              Veja como diferentes valores de doação são distribuídos com a configuração atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Doação</th>
                    {SPLIT_ITEMS.map((item) => (
                      <th key={item.key} className="px-4 py-3 text-right font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <div className={`rounded p-1 ${item.color} text-foreground`}>
                            <item.icon className="h-3 w-3" />
                          </div>
                          <span className="hidden sm:inline">{item.label}</span>
                          <span className="sm:hidden">{split[item.key]}%</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[100, 500, 1000, 5000, 10000, 50000].map((amount) => (
                    <tr key={amount} className="border-b last:border-0">
                      <td className="px-4 py-3 font-semibold">{formatCurrency(amount)}</td>
                      {SPLIT_ITEMS.map((item) => (
                        <td key={item.key} className={`px-4 py-3 text-right ${item.textColor}`}>
                          {formatCurrency((amount * split[item.key]) / 100)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Informações */}
        <Card>
          <CardHeader>
            <CardTitle>Informacoes sobre o Split</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg p-2 bg-emerald-500 text-foreground">
                  <Building2 className="h-4 w-4" />
                </div>
                <h4 className="font-semibold">Instituicao (80%)</h4>
              </div>
              <p className="text-sm text-foreground/60">
                A maior parte da doacao vai diretamente para a instituicao de impacto social executar o projeto.
                Via Stripe Connect, o valor e transferido automaticamente.
              </p>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg p-2 bg-slate-500 text-foreground">
                  <Building className="h-4 w-4" />
                </div>
                <h4 className="font-semibold">Plataforma STHATION (16%)</h4>
              </div>
              <p className="text-sm text-foreground/60">
                Custeia a operacao administrativa da plataforma, infraestrutura tecnologica, suporte, desenvolvimento
                e servicos de terceiros.
              </p>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg p-2 bg-purple-500 text-foreground">
                  <Fuel className="h-4 w-4" />
                </div>
                <h4 className="font-semibold">Fundo de Gas (4%)</h4>
              </div>
              <p className="text-sm text-foreground/60">
                Reserva para pagar as taxas de registro na Polygon (NOBIS). Garante imutabilidade e
                rastreabilidade dos dados de impacto.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stripe Connect Info */}
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Integracao Stripe Connect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground/60">
              O sistema utiliza Stripe Connect para processar pagamentos com split automatico. 
              Quando uma doacao e realizada:
            </p>
            <ol className="text-sm text-foreground/60 space-y-2 list-decimal list-inside">
              <li>O doador paga via cartao de credito no Stripe Checkout</li>
              <li>80% e transferido automaticamente para a conta Stripe da instituicao</li>
              <li>16% fica na conta da plataforma STHATION</li>
              <li>4% e reservado no Fundo de Gas para custos blockchain</li>
            </ol>
            <p className="text-sm text-foreground/60">
              Instituicoes precisam completar o onboarding do Stripe Connect para receber pagamentos.
              O admin pode verificar o status de cada instituicao na pagina de aprovacoes.
            </p>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}

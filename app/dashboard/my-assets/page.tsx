"use client"

import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bitcoin,
  Wallet,
  ExternalLink,
  Leaf,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  UtensilsCrossed,
  GraduationCap,
  Home,
  Briefcase,
  Stethoscope,
  HandHeart,
  Loader2,
  type LucideIcon,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const CATEGORY_ICONS: Record<string, { icon: LucideIcon; bg: string; color: string }> = {
  "Alimentacao": { icon: UtensilsCrossed, bg: "bg-amber-500/10", color: "text-amber-600" },
  "Educacao": { icon: GraduationCap, bg: "bg-blue-500/10", color: "text-blue-600" },
  "Assistencia Social": { icon: Home, bg: "bg-rose-500/10", color: "text-rose-600" },
  "Capacitacao": { icon: Briefcase, bg: "bg-purple-500/10", color: "text-purple-600" },
  "Saude": { icon: Stethoscope, bg: "bg-emerald-500/10", color: "text-emerald-600" },
}

export default function MyAssetsPage() {
  const { user } = useAuth()

  // Buscar ativos do usuario da API (dados reais)
  const { data, isLoading } = useSWR("/api/nobis/my-assets", fetcher, { revalidateOnFocus: false })
  const userAssets = data?.assets || []

  const awaitingInscription = userAssets.filter((a: any) => a.stage === "AWAITING_INSCRIPTION")
  const inscribed = userAssets.filter((a: any) => a.stage === "INSCRIBED")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Leaf className="h-8 w-8 text-emerald-500" />
          Meus Ativos de Impacto
        </h1>
        <p className="text-foreground/60">
          Acompanhe seus ativos de impacto e seu status no processo de certificacao
        </p>
      </div>

      {userAssets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Leaf className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 font-semibold">Nenhum ativo ainda</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Voce ainda nao possui ativos de impacto. Doe para projetos validados para adquirir Nobis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground/60">Total de Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userAssets.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground/60">Custo Total de Geracao</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {userAssets.reduce((acc: number, a: any) => acc + (a.investmentCost || 0), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground/60">CO2 Compensado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userAssets.reduce((acc: number, a: any) => acc + (a.carbonCredits || 0), 0)} tCO2</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground/60">Inscritos no Bitcoin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500">{inscribed.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="awaiting" className="space-y-4">
            <TabsList>
              <TabsTrigger value="awaiting" className="gap-2">
                <Clock className="h-4 w-4" />
                Aguardando Inscricao ({awaitingInscription.length})
              </TabsTrigger>
              <TabsTrigger value="inscribed" className="gap-2">
                <Bitcoin className="h-4 w-4" />
                Inscritos ({inscribed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="awaiting" className="space-y-4">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Aguardando Processamento</p>
                      <p className="text-sm text-foreground/60 mt-1">
                        Estes ativos foram certificados e estao aguardando a transformacao em Inscription pelo administrador
                        da plataforma. Voce sera notificado quando o processo for concluido.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {awaitingInscription.map((asset: any) => {
                  const cat = CATEGORY_ICONS[asset.category] || { icon: HandHeart, bg: "bg-teal-500/10", color: "text-teal-600" }
                  const IconComp = cat.icon
                  return (
                    <Card key={asset.id}>
                      <div className={`h-40 w-full flex items-center justify-center rounded-t-lg ${cat.bg}`}>
                        <IconComp className={`h-16 w-16 ${cat.color}`} />
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{asset.title}</CardTitle>
                            <CardDescription>{asset.institution}</CardDescription>
                          </div>
                          <Badge className="bg-amber-500/10 text-amber-500">
                            <Clock className="mr-1 h-3 w-3" />
                            Aguardando
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-foreground/60">{asset.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-foreground/60">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {asset.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Leaf className="h-3 w-3" />
                            {asset.carbonCredits} tCO2
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {asset.acquisitionDate}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-foreground/60">Custo de geracao</span>
                          <span className="font-semibold">R$ {(asset.investmentCost || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground/60">Score de validacao</span>
                          <span className="font-semibold text-emerald-600">{asset.validationScore}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="inscribed" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {inscribed.map((asset: any) => {
                  const cat = CATEGORY_ICONS[asset.category] || { icon: HandHeart, bg: "bg-teal-500/10", color: "text-teal-600" }
                  const IconComp = cat.icon
                  return (
                    <Card key={asset.id}>
                      <div className={`h-40 w-full flex items-center justify-center rounded-t-lg ${cat.bg}`}>
                        <IconComp className={`h-16 w-16 ${cat.color}`} />
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{asset.title}</CardTitle>
                            <CardDescription>{asset.institution}</CardDescription>
                          </div>
                          <Badge className="bg-amber-500/10 text-amber-500">
                            <Bitcoin className="mr-1 h-3 w-3" />
                            Inscrito
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-foreground/60">{asset.description}</p>
                        <div className="rounded-lg bg-muted p-3 space-y-2">
                          <p className="text-xs font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Registrado no Bitcoin
                          </p>
                          <div className="text-xs text-foreground/60 space-y-1">
                            <p className="font-mono truncate" title={asset.inscriptionId || ""}>
                              ID: {asset.inscriptionId}
                            </p>
                            <p className="font-mono truncate" title={asset.inscriptionTxId || ""}>
                              TX: {asset.inscriptionTxId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-foreground/60">Custo de geracao</span>
                          <span className="font-semibold">R$ {(asset.investmentCost || 0).toLocaleString()}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="gap-2">
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver no Explorer
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <Wallet className="mr-2 h-4 w-4" />
                          Detalhes
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

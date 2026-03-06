"use client"

import { useState } from "react"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Heart,
  MapPin,
  Calendar,
  Users,
  Building2,
  Search,
  Filter,
  CheckCircle,
  Info,
  UtensilsCrossed,
  GraduationCap,
  Home,
  Briefcase,
  Leaf,
  Loader2,
  HandHeart,
  type LucideIcon,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DONATION_SPLIT } from "@/lib/donation-config"
import { PixDonationModal } from "@/components/pix-donation-modal"
import { CheckoutDonation } from "@/components/donations/checkout-donation"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Mapeamento de categorias para icones
const CATEGORY_ICONS: Record<string, { icon: LucideIcon; bg: string; color: string }> = {
  "Alimentacao": { icon: UtensilsCrossed, bg: "bg-amber-500/10", color: "text-amber-500" },
  "Alimentacao e Seguranca Alimentar": { icon: UtensilsCrossed, bg: "bg-amber-500/10", color: "text-amber-500" },
  "Educacao": { icon: GraduationCap, bg: "bg-blue-500/10", color: "text-blue-500" },
  "Educacao e Capacitacao": { icon: GraduationCap, bg: "bg-blue-500/10", color: "text-blue-500" },
  "Assistencia Social": { icon: Home, bg: "bg-rose-500/10", color: "text-rose-500" },
  "Moradia": { icon: Home, bg: "bg-rose-500/10", color: "text-rose-500" },
  "Capacitacao": { icon: Briefcase, bg: "bg-purple-500/10", color: "text-purple-500" },
}

const categories = [
  "Todos",
  "Alimentacao",
  "Educacao",
  "Assistencia Social",
  "Capacitacao",
  "Saude",
]

export default function DonatePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Todos")
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [donationAmount, setDonationAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPixModal, setShowPixModal] = useState(false)
  const [showStripeCheckout, setShowStripeCheckout] = useState(false)

  // Buscar projetos da API (dados reais do banco)
  const { data, isLoading } = useSWR("/api/funding-projects?status=FUNDING&limit=50", fetcher, {
    revalidateOnFocus: false,
  })

  // Usar apenas dados reais da API
  const projects = data?.projects || []

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "Todos" || p.category === category
    return matchesSearch && matchesCategory
  })

  const handleDonate = async () => {
    if (!selectedProject || !donationAmount) return

    setIsProcessing(true)
    // Simular processamento
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Doação realizada com sucesso!",
      description: `Você doou R$ ${donationAmount} para ${selectedProject.title}. Obrigado por fazer a diferença!`,
    })

    setIsProcessing(false)
    setSelectedProject(null)
    setDonationAmount("")
  }

  const calculateSplit = (amount: number) => {
    return {
      institution: amount * DONATION_SPLIT.INSTITUTION,
      platform: amount * DONATION_SPLIT.PLATFORM,
      gasFund: amount * DONATION_SPLIT.GAS_FUND,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Doar para Projetos</h1>
        <p className="text-foreground/60">
          Apoie projetos de impacto verificados e acompanhe cada centavo investido
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
          <Input
            placeholder="Buscar projetos..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid de Projetos */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredProjects.map((project: any) => {
          // Compatibilidade com API e mock data
          const raised = project.raised ?? project.current_amount ?? 0
          const goal = project.goal ?? project.goal_amount ?? 0
          const donors = project.donors ?? project.donors_count ?? 0
          const daysLeft = project.daysLeft ?? (project.end_date ? Math.max(0, Math.ceil((new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0)
          // location pode ser string ou objeto {name, state}
          const locationRaw = project.location
          const location = typeof locationRaw === "object" && locationRaw?.name 
            ? `${locationRaw.name}, ${locationRaw.state || ""}`
            : (typeof locationRaw === "string" ? locationRaw : `${project.location_name || ""}, ${project.location_state || ""}`)
          // institution pode ser string (mock) ou objeto {id, name, verified} (API)
          const institutionRaw = project.institution ?? project.institution_name
          const institution = typeof institutionRaw === "object" && institutionRaw?.name ? institutionRaw.name : (typeof institutionRaw === "string" ? institutionRaw : "")
          const catIcon = CATEGORY_ICONS[project.category] || { icon: HandHeart, bg: "bg-teal-500/10", color: "text-teal-500" }
          const IconComp = project.icon ?? catIcon.icon
          const iconBg = project.iconBg ?? catIcon.bg
          const iconColor = project.iconColor ?? catIcon.color

          return (
            <Card key={project.id} className="overflow-hidden">
              <div className={`h-48 w-full flex items-center justify-center ${iconBg}`}>
                <IconComp className={`h-16 w-16 ${iconColor}`} />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Building2 className="h-3 w-3" />
                      {institution}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{project.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground/60 line-clamp-2">{project.description}</p>

                {/* Progresso */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">R$ {raised.toLocaleString("pt-BR")}</span>
                    <span className="text-foreground/60">de R$ {goal.toLocaleString("pt-BR")}</span>
                  </div>
                  <Progress value={goal > 0 ? (raised / goal) * 100 : 0} className="h-2" />
                </div>

                {/* Metricas */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-muted p-2">
                    <Users className="mx-auto mb-1 h-4 w-4 text-foreground/60" />
                    <p className="font-medium">{donors}</p>
                    <p className="text-foreground/60">doadores</p>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <Calendar className="mx-auto mb-1 h-4 w-4 text-foreground/60" />
                    <p className="font-medium">{daysLeft}</p>
                    <p className="text-foreground/60">dias</p>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <Heart className="mx-auto mb-1 h-4 w-4 text-foreground/60" />
                    <p className="font-medium">{project.beneficiaries ?? 0}</p>
                    <p className="text-foreground/60">benef.</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-foreground/60">
                  <MapPin className="h-3 w-3" />
                  {location}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setSelectedProject(project)}>
                  <Heart className="mr-2 h-4 w-4" />
                  Doar para este projeto
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Modal de Doação */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Doar para {selectedProject?.title}</DialogTitle>
            <DialogDescription>
              {typeof selectedProject?.institution === "object" && selectedProject?.institution?.name
                ? selectedProject.institution.name
                : (selectedProject?.institution ?? selectedProject?.institution_name ?? "")}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="amount" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="amount">Valor</TabsTrigger>
              <TabsTrigger value="transparency">Transparência</TabsTrigger>
            </TabsList>

            <TabsContent value="amount" className="space-y-4 mt-4">
              {/* Valores sugeridos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[50, 100, 250, 500].map((value) => (
                  <Button
                    key={value}
                    variant={donationAmount === String(value) ? "default" : "outline"}
                    onClick={() => setDonationAmount(String(value))}
                  >
                    R$ {value}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-amount">Ou digite um valor</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">R$</span>
                  <Input
                    id="custom-amount"
                    type="number"
                    className="pl-10"
                    placeholder="0,00"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Split de pagamento */}
              {donationAmount && Number(donationAmount) > 0 && (
                <div className="rounded-lg border p-4 space-y-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Distribuição da sua doação
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Instituicao (80%)</span>
                      <span className="font-medium text-emerald-600">
                        R$ {calculateSplit(Number(donationAmount)).institution.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Plataforma STHATION (16%)</span>
                      <span>R$ {calculateSplit(Number(donationAmount)).platform.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Fundo de Gas Blockchain (4%)</span>
                      <span>R$ {calculateSplit(Number(donationAmount)).gasFund.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transparency" className="space-y-4 mt-4">
              <div className="rounded-lg border p-4 space-y-3">
                <p className="font-medium">Modelo de Custos Transparente</p>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const goal = selectedProject?.goal ?? selectedProject?.goalAmount ?? selectedProject?.goal_amount ?? 0
                    const cdp = Math.round(goal * 0.80) // 80% custo direto
                    const pco = Math.round(goal * 0.15) // 15% operacional
                    const fri = 0.05 // 5% rateio
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-foreground/60">Custo Direto do Projeto (CDP)</span>
                          <span>R$ {cdp.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/60">Parcela Custo Operacional (PCO)</span>
                          <span>R$ {pco.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/60">Fator de Rateio (FRI)</span>
                          <span>{(fri * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-medium">Meta Total</span>
                          <span className="font-medium">R$ {goal.toLocaleString()}</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">O que acontece apos a doacao?</p>
                <ol className="text-xs text-foreground/60 space-y-1 list-decimal list-inside">
                  <li>80% vai direto para a instituicao executar o projeto</li>
                  <li>16% para a plataforma STHATION (manutencao e desenvolvimento)</li>
                  <li>4% para o Fundo de Gas (custos blockchain Polygon)</li>
                  <li>A instituicao coleta evidencias (fotos, GPS, documentos)</li>
                  <li>Checkers validam as evidencias via VCA</li>
                  <li>Se aprovado, o projeto e inscrito na Polygon como NOBIS</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4 flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setSelectedProject(null)}>
              Cancelar
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowPixModal(true)} 
              disabled={!donationAmount || Number(donationAmount) <= 0 || isProcessing}
            >
              Pagar via PIX
            </Button>
            <Button 
              onClick={() => setShowStripeCheckout(true)} 
              disabled={!donationAmount || Number(donationAmount) <= 0 || isProcessing}
            >
              {isProcessing ? (
                "Processando..."
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Pagar com Cartao
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal PIX */}
      {selectedProject && (
        <PixDonationModal
          open={showPixModal}
          onOpenChange={setShowPixModal}
          project={{
            title: selectedProject.title,
            institution: {
              name: typeof selectedProject.institution === "object" 
                ? selectedProject.institution.name 
                : selectedProject.institution || selectedProject.institution_name || "",
              pixKey: selectedProject.institution?.pixKey,
              pixKeyType: selectedProject.institution?.pixKeyType,
              pixHolderName: selectedProject.institution?.pixHolderName,
            },
          }}
          amount={Number(donationAmount) || 0}
          onConfirmDonation={handleDonate}
        />
      )}

      {/* Modal Stripe Checkout */}
      {selectedProject && (
        <CheckoutDonation
          open={showStripeCheckout}
          onOpenChange={setShowStripeCheckout}
          projectId={selectedProject.id}
          projectTitle={selectedProject.title}
          institutionId={selectedProject.institution_id || selectedProject.institution?.id}
          institutionName={
            typeof selectedProject.institution === "object" 
              ? selectedProject.institution.name 
              : selectedProject.institution || selectedProject.institution_name || ""
          }
          amountInCents={Math.round((Number(donationAmount) || 0) * 100)}
          donorId={user?.id}
          donorEmail={user?.email}
          donorName={user?.name}
        />
      )}
    </div>
  )
}

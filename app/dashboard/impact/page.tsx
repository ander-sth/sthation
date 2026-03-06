"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DollarSign, FileCheck, Leaf, Users, TrendingUp, MapPin, Award, Bitcoin, Globe, Loader2, Landmark, Heart, Home, Factory, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { UserRole } from "@/lib/types/users"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Projetos reais da Prefeitura de Joinville
const JOINVILLE_GOV_PROJECTS = [
  {
    id: "joinville-saf",
    title: "Servico de Acolhimento Familiar - Familias Acolhedoras",
    code: "SAS.UPE.SAF",
    type: "SOCIAL",
    category: "Assistencia Social",
    status: "VERIFICADO",
    description: "Programa de acolhimento temporario em ambiente familiar para criancas e adolescentes.",
    location: "Joinville, SC",
    invested: 850000,
    beneficiaries: 127,
    impactScore: 92,
  },
  {
    id: "joinville-cavr",
    title: "Casa Abrigo Viva Rosa",
    code: "SAS.UPE.CAVR",
    type: "SOCIAL",
    category: "Assistencia Social",
    status: "VERIFICADO",
    description: "Acolhimento institucional para mulheres em situacao de violencia domestica.",
    location: "Joinville, SC",
    invested: 1200000,
    beneficiaries: 89,
    impactScore: 95,
  },
  {
    id: "joinville-ure",
    title: "Unidade de Recuperacao Energetica (URE)",
    code: "SEMA.URE",
    type: "AMBIENTAL",
    category: "Energia Renovavel",
    status: "INSCRITO_BLOCKCHAIN",
    description: "Usina que transforma residuos solidos urbanos em energia eletrica.",
    location: "Joinville, SC",
    invested: 45000000,
    carbonCredits: 12500,
    energyGenerated: 28000,
    impactScore: 98,
  },
]

export default function ImpactDashboardPage() {
  const { user } = useAuth()
  const isPrefeitura = user?.role === UserRole.PREFEITURA

  // Buscar dados reais da API
  const { data: fundingData, isLoading: fundingLoading } = useSWR("/api/funding-projects?limit=50", fetcher)
  const { data: iacData, isLoading: iacLoading } = useSWR("/api/iac?limit=50", fetcher)
  const { data: institutionsData } = useSWR("/api/institutions?limit=50", fetcher)

  const fundingProjects = fundingData?.projects || []
  const iacs = iacData?.projects || []
  const institutions = institutionsData?.institutions || []
  
  // Se for Prefeitura, usar dados especificos
  if (isPrefeitura) {
    return <PrefeituraImpactDashboard projects={JOINVILLE_GOV_PROJECTS} />
  }

  // Calcular metricas reais
  const platformMetrics = {
    totalRaised: fundingProjects.reduce((sum: number, p: any) => sum + (p.current_amount || p.currentAmount || 0), 0),
    projectsFunded: fundingProjects.filter((p: any) => p.status === "COMPLETED" || p.status === "FUNDED").length,
    projectsActive: fundingProjects.filter((p: any) => p.status === "FUNDING").length,
    nobisGenerated: 0,
    nobisTransacted: 0,
    totalBeneficiaries: iacs.reduce((sum: number, p: any) => sum + (p.estimated_beneficiaries || p.estimatedBeneficiaries || 0), 0),
    carbonCreditsValidated: iacs.filter((p: any) => p.type === "AMBIENTAL").reduce((sum: number, p: any) => sum + (p.vca_score || 0), 0),
    checkersCertified: 0,
    institutionsVerified: institutions.filter((i: any) => i.status === "APPROVED" || i.is_verified).length,
  }

  // Calcular breakdown por categoria
  const categoryMap: Record<string, { count: number; amount: number }> = {}
  fundingProjects.forEach((p: any) => {
    const cat = p.category || p.iac?.category || "Outros"
    if (!categoryMap[cat]) categoryMap[cat] = { count: 0, amount: 0 }
    categoryMap[cat].count++
    categoryMap[cat].amount += p.current_amount || p.currentAmount || 0
  })

  const totalAmount = Object.values(categoryMap).reduce((sum, c) => sum + c.amount, 0) || 1
  const colors = ["bg-emerald-500", "bg-amber-500", "bg-blue-500", "bg-purple-500", "bg-teal-600", "bg-gray-500"]
  const categoryBreakdown = Object.entries(categoryMap).map(([name, data], i) => ({
    name,
    value: Math.round((data.count / (fundingProjects.length || 1)) * 100),
    amount: data.amount,
    color: colors[i % colors.length],
  }))

  // Projetos recentes
  const recentProjects = fundingProjects.slice(0, 3).map((p: any) => {
    // location pode ser string ou objeto {name, state}
    const locationRaw = p.iac?.location_name || p.location || p.location_name || ""
    const location = typeof locationRaw === "object" && locationRaw?.name 
      ? `${locationRaw.name}, ${locationRaw.state || ""}`
      : (typeof locationRaw === "string" ? locationRaw : "")
    
    return {
      title: p.title,
      institution: p.institution?.name || p.institution_name || "",
      location,
      raised: p.current_amount || p.currentAmount || 0,
      goal: p.goal_amount || p.goalAmount || 0,
      status: p.status === "FUNDING" ? "funding" : "funded",
    }
  })

  const isLoading = fundingLoading || iacLoading
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          Dashboard Público de Impacto
        </h1>
        <p className="text-foreground/60">Métricas agregadas em tempo real da plataforma Sthation</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Arrecadado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              R$ {(platformMetrics.totalRaised / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-foreground/60 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              +18% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Projetos Financiados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{platformMetrics.projectsFunded}</div>
            <p className="text-xs text-foreground/60">{platformMetrics.projectsActive} em execução</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Bitcoin className="h-4 w-4" />
              NOBIS Gerados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{platformMetrics.nobisGenerated}</div>
            <p className="text-xs text-foreground/60">{platformMetrics.nobisTransacted} transacionados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Beneficiários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {(platformMetrics.totalBeneficiaries / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-foreground/60">pessoas impactadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Créditos de Carbono Validados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformMetrics.carbonCreditsValidated.toLocaleString()} tCO2</div>
            <p className="text-xs text-foreground/60">Equivalente a remover 2.700 carros das ruas por ano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Checkers Certificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformMetrics.checkersCertified}</div>
            <p className="text-xs text-foreground/60">Validadores ativos na rede VCA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Instituições Verificadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformMetrics.institutionsVerified}</div>
            <p className="text-xs text-foreground/60">ONGs, cooperativas e empresas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
            <CardDescription>Breakdown dos fundos por área de impacto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-foreground/60">
                    R$ {(category.amount / 1000).toFixed(0)}K ({category.value}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${category.color} transition-all`} style={{ width: `${category.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Projetos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos em Destaque</CardTitle>
            <CardDescription>Últimos projetos na plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.map((project, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-foreground/60">{project.institution}</p>
                  </div>
                  <Badge variant={project.status === "funded" ? "default" : "secondary"}>
                    {project.status === "funded" ? "Financiado" : "Em captação"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-foreground/60">
                  <MapPin className="h-3 w-3" />
                  {project.location}
                </div>
                <div className="space-y-1">
                  <Progress value={(project.raised / project.goal) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-foreground/60">
                    <span>R$ {project.raised.toLocaleString()}</span>
                    <span>Meta: R$ {project.goal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Rodapé com links */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <p className="text-sm text-foreground/60">
              Todos os dados são públicos e verificáveis. Cada ativo NOBIS pode ser inscrito permanentemente no Bitcoin.
            </p>
            <div className="flex gap-4 mt-2">
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" />
                Transparency Hall
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Bitcoin className="h-3 w-3" />
                Ledger Público
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Dashboard especifico para Prefeitura
function PrefeituraImpactDashboard({ projects }: { projects: typeof JOINVILLE_GOV_PROJECTS }) {
  const socialProjects = projects.filter(p => p.type === "SOCIAL")
  const ambientalProjects = projects.filter(p => p.type === "AMBIENTAL")
  
  const totalInvested = projects.reduce((sum, p) => sum + p.invested, 0)
  const totalBeneficiaries = socialProjects.reduce((sum, p) => sum + (p.beneficiaries || 0), 0)
  const totalCarbonCredits = ambientalProjects.reduce((sum, p) => sum + (p.carbonCredits || 0), 0)
  const verifiedProjects = projects.filter(p => p.status === "VERIFICADO" || p.status === "INSCRITO_BLOCKCHAIN").length
  const blockchainProjects = projects.filter(p => p.status === "INSCRITO_BLOCKCHAIN").length

  // Categorias
  const categoryMap: Record<string, { count: number; amount: number }> = {}
  projects.forEach(p => {
    if (!categoryMap[p.category]) categoryMap[p.category] = { count: 0, amount: 0 }
    categoryMap[p.category].count++
    categoryMap[p.category].amount += p.invested
  })
  
  const colors = ["bg-teal-500", "bg-emerald-500", "bg-blue-500"]
  const categoryBreakdown = Object.entries(categoryMap).map(([name, data], i) => ({
    name,
    count: data.count,
    amount: data.amount,
    percentage: Math.round((data.amount / totalInvested) * 100),
    color: colors[i % colors.length],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Landmark className="h-8 w-8 text-teal-600" />
          Dashboard de Impacto - Prefeitura de Joinville
        </h1>
        <p className="text-foreground/60">Metricas de projetos sociais e ambientais com recursos publicos</p>
      </div>

      {/* Metricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border-teal-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Investido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">
              R$ {(totalInvested / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-foreground/60 mt-1">
              Recursos publicos aplicados
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Beneficiarios Diretos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-600">{totalBeneficiaries}</div>
            <p className="text-xs text-foreground/60">pessoas atendidas</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Creditos de Carbono
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{totalCarbonCredits.toLocaleString()}</div>
            <p className="text-xs text-foreground/60">tCO2 evitadas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Projetos Verificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{verifiedProjects}/{projects.length}</div>
            <p className="text-xs text-foreground/60">{blockchainProjects} na blockchain</p>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              Projetos Sociais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{socialProjects.length}</div>
            <p className="text-xs text-foreground/60">Assistencia social e acolhimento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Factory className="h-4 w-4 text-emerald-500" />
              Projetos Ambientais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ambientalProjects.length}</div>
            <p className="text-xs text-foreground/60">Energia renovavel e sustentabilidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/60 flex items-center gap-2">
              <Bitcoin className="h-4 w-4 text-amber-500" />
              Registros Blockchain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockchainProjects}</div>
            <p className="text-xs text-foreground/60">Inscricoes na Polygon</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribuicao por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuicao por Categoria</CardTitle>
            <CardDescription>Recursos aplicados por area de atuacao</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-foreground/60">
                    R$ {(category.amount / 1000000).toFixed(1)}M ({category.percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${category.color} transition-all`} style={{ width: `${category.percentage}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Projetos da Prefeitura */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos Inscritos</CardTitle>
            <CardDescription>Projetos verificados e registrados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-foreground/60">{project.code}</p>
                  </div>
                  <Badge className={
                    project.status === "INSCRITO_BLOCKCHAIN" 
                      ? "bg-amber-500 text-white" 
                      : project.status === "VERIFICADO"
                      ? "bg-emerald-500 text-white"
                      : "bg-blue-500 text-white"
                  }>
                    {project.status === "INSCRITO_BLOCKCHAIN" ? "Blockchain" : 
                     project.status === "VERIFICADO" ? "Verificado" : project.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-foreground/60">
                  <MapPin className="h-3 w-3" />
                  {project.location}
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-foreground/60">
                    Investido: <strong className="text-teal-600">R$ {(project.invested / 1000000).toFixed(2)}M</strong>
                  </span>
                  <span className="text-foreground/60">
                    {project.type === "SOCIAL" 
                      ? `${project.beneficiaries} beneficiarios`
                      : `${project.carbonCredits?.toLocaleString()} tCO2`
                    }
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Rodape */}
      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <p className="text-sm text-foreground/60">
              Todos os projetos sao verificados por checkers independentes e podem ser registrados na blockchain para transparencia total.
            </p>
            <div className="flex gap-4 mt-2">
              <Badge variant="outline" className="gap-1 border-teal-300">
                <Landmark className="h-3 w-3" />
                Sthation Gov
              </Badge>
              <Badge variant="outline" className="gap-1 border-teal-300">
                <Bitcoin className="h-3 w-3" />
                Polygon Network
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

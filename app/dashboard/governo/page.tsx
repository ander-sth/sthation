"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useApiData } from "@/hooks/use-api-data"
import {
  Building2,
  MapPin,
  Users,
  Leaf,
  TrendingUp,
  FileCheck,
  BarChart3,
  Download,
  Search,
  Filter,
  Calendar,
  Award,
  TreePine,
  Recycle,
  Zap,
} from "lucide-react"
import Link from "next/link"

interface RegionStats {
  totalProjects: number
  certifiedProjects: number
  totalCO2Avoided: number
  totalWasteProcessed: number
  totalDonations: number
  totalInstitutions: number
  projectsByCategory: Record<string, number>
}

interface Project {
  id: string
  title: string
  category: string
  status: string
  location_city: string
  location_state: string
  co2_equivalent: number
  waste_processed: number
  institution_name: string
  created_at: string
}

export default function GovernoDashboardPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Buscar estatisticas da regiao (cidade/estado da prefeitura)
  const { data: statsData } = useApiData<{ stats: RegionStats }>(
    `/api/gov/stats?city=${user?.city || ""}&state=${user?.state || ""}`,
    { stats: { totalProjects: 0, certifiedProjects: 0, totalCO2Avoided: 0, totalWasteProcessed: 0, totalDonations: 0, totalInstitutions: 0, projectsByCategory: {} } }
  )

  // Buscar projetos da regiao
  const { data: projectsData } = useApiData<{ projects: Project[] }>(
    `/api/gov/projects?city=${user?.city || ""}&state=${user?.state || ""}`,
    { projects: [] }
  )

  const stats = statsData?.stats || { totalProjects: 0, certifiedProjects: 0, totalCO2Avoided: 0, totalWasteProcessed: 0, totalDonations: 0, totalInstitutions: 0, projectsByCategory: {} }
  const projects = projectsData?.projects || []

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.institution_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { key: "COMPOSTAGEM", label: "Compostagem", icon: Recycle },
    { key: "ENERGIA_SOLAR", label: "Energia Solar", icon: Zap },
    { key: "REFLORESTAMENTO", label: "Reflorestamento", icon: TreePine },
    { key: "RECICLAGEM", label: "Reciclagem", icon: Recycle },
  ]

  const formatNumber = (n: number) => n.toLocaleString("pt-BR")
  const formatCurrency = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n / 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Painel da Prefeitura
          </h1>
          <p className="text-foreground/60 flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4" />
            {user?.city || "Sua Cidade"}, {user?.state || "UF"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatorio
          </Button>
          <Button className="bg-[#0a2f2f] hover:bg-[#0a3f3f]">
            <FileCheck className="mr-2 h-4 w-4" />
            Solicitar On-Demand
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projetos na Regiao</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalProjects)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.certifiedProjects} certificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CO2 Evitado</CardTitle>
            <Leaf className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatNumber(stats.totalCO2Avoided)} tCO2e</div>
            <p className="text-xs text-muted-foreground">Total da regiao</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Residuos Processados</CardTitle>
            <Recycle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalWasteProcessed)} kg</div>
            <p className="text-xs text-muted-foreground">Desviados de aterros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Instituicoes Parceiras</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalInstitutions)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalDonations)} arrecadados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="metrics">Metricas</TabsTrigger>
          <TabsTrigger value="institutions">Instituicoes</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.key}
                  variant={selectedCategory === cat.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  <cat.icon className="mr-1 h-3 w-3" />
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Projects List */}
          <div className="grid gap-4">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <FileCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold">Nenhum projeto encontrado</h3>
                  <p className="text-muted-foreground">
                    Nao ha projetos ambientais registrados na sua regiao ainda.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{project.title}</h3>
                          <Badge variant={project.status === "CERTIFIED" ? "default" : "secondary"}>
                            {project.status === "CERTIFIED" ? "Certificado" : project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{project.institution_name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {project.location_city}, {project.location_state}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-lg font-bold text-emerald-600">{project.co2_equivalent || 0}</p>
                          <p className="text-xs text-muted-foreground">tCO2e</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{formatNumber(project.waste_processed || 0)}</p>
                          <p className="text-xs text-muted-foreground">kg</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/transparency/${project.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Projetos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((cat) => {
                    const count = stats.projectsByCategory?.[cat.key] || 0
                    const percentage = stats.totalProjects > 0 ? (count / stats.totalProjects) * 100 : 0
                    return (
                      <div key={cat.key} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <cat.icon className="h-4 w-4" />
                            {cat.label}
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Impacto Ambiental
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                    <div>
                      <p className="text-sm text-muted-foreground">Equivalente a</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatNumber(Math.round(stats.totalCO2Avoided * 45))}
                      </p>
                      <p className="text-sm text-muted-foreground">arvores plantadas</p>
                    </div>
                    <TreePine className="h-12 w-12 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <div>
                      <p className="text-sm text-muted-foreground">Residuos desviados</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatNumber(Math.round(stats.totalWasteProcessed / 1000))}
                      </p>
                      <p className="text-sm text-muted-foreground">toneladas</p>
                    </div>
                    <Recycle className="h-12 w-12 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="institutions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instituicoes Parceiras</CardTitle>
              <CardDescription>
                Organizacoes com projetos ambientais na sua regiao
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Lista de instituicoes sera carregada aqui
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

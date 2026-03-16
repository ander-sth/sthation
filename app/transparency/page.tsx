"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Leaf,
  MapPin,
  Building2,
  Award,
  ExternalLink,
  Search,
  Filter,
  TrendingUp,
  Users,
  Globe,
  CheckCircle2,
  Shield,
  Loader2,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function TransparencyHallPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stateFilter, setStateFilter] = useState("all")

  // Buscar projetos certificados
  const { data, isLoading } = useSWR("/api/transparency", fetcher)
  const projects = data?.projects || []
  const stats = data?.stats || {}

  // Filtrar projetos
  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.institution_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter
    const matchesState = stateFilter === "all" || project.location_state === stateFilter
    return matchesSearch && matchesCategory && matchesState
  })

  // Estados únicos
  const states = [...new Set(projects.map((p: any) => p.location_state).filter(Boolean))]
  const categories = [...new Set(projects.map((p: any) => p.category).filter(Boolean))]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center rounded-md bg-[#0a2f2f] px-2 py-1">
              <Image src="/sthation-logo.png" alt="STHATION" width={120} height={30} className="h-6 w-auto" />
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Cadastrar</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-12 md:py-20">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge className="bg-emerald-600/10 text-emerald-600 border-emerald-200">
            <Shield className="w-3 h-3 mr-1" />
            Transparencia Total
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Transparency Hall
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore todos os projetos certificados na plataforma STHation. 
            Cada projeto possui verificacao blockchain e metricas de impacto auditaveis.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-600">{stats.totalProjects || 0}</div>
              <p className="text-sm text-muted-foreground">Projetos Certificados</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-600">{stats.totalCO2?.toLocaleString("pt-BR") || 0}</div>
              <p className="text-sm text-muted-foreground">tCO2e Evitados</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-600">{stats.totalInstitutions || 0}</div>
              <p className="text-sm text-muted-foreground">Instituicoes</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.totalDonated || 0)}</div>
              <p className="text-sm text-muted-foreground">Total Arrecadado</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Filters */}
      <section className="container pb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por projeto ou instituicao..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {categories.map((cat: string) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Estados</SelectItem>
              {states.map((state: string) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="container pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project: any) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 relative">
                  {project.cover_image ? (
                    <Image
                      src={project.cover_image}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Leaf className="h-16 w-16 text-emerald-600/40" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge className="bg-emerald-600 text-white">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Certificado
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Building2 className="h-3 w-3" />
                        {project.institution_name}
                      </CardDescription>
                    </div>
                    {project.certification_score && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                        Score: {project.certification_score}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {project.location_name}, {project.location_state}
                    </span>
                  </div>
                  
                  {/* Métricas */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">CO2 Evitado</p>
                      <p className="font-semibold text-emerald-600">
                        {project.co2_equivalent || 0} tCO2e
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Residuos</p>
                      <p className="font-semibold">
                        {(project.waste_processed || 0).toLocaleString("pt-BR")} kg
                      </p>
                    </div>
                  </div>

                  {/* Hash Blockchain */}
                  {project.polygon_tx_hash && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Hash Blockchain</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                        {project.polygon_tx_hash}
                      </code>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/transparency/${project.id}`}>
                        Ver Detalhes
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <Link href={`/doar/${project.id}`}>
                        Doar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>STHation - Plataforma de Certificacao de Impacto Ambiental</p>
          <p className="mt-1">Todos os projetos sao verificados e auditaveis na blockchain Polygon</p>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Leaf,
  Shield,
  ExternalLink,
  Search,
  Award,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  TreePine,
  Droplets,
  Recycle,
  MapPin,
  Calendar,
  Building2,
  Hash,
  Zap,
  Bitcoin,
  Download,
} from "lucide-react"

interface CertifiedProject {
  id: string
  title: string
  description: string
  category: string
  type: string
  status: string
  location_name: string
  location_state: string
  co2_equivalent: number
  waste_processed: number
  certificate_hash: string
  polygon_tx_hash: string | null
  certified_at: string
  institution_name: string
  institution_verified: boolean
  institution_logo: string | null
  cover_image: string | null
  certificate_score: number
}

export default function NobisCoreHallPage() {
  const [projects, setProjects] = useState<CertifiedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCO2: 0,
    totalWaste: 0,
    totalInstitutions: 0,
  })

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/nobiscore/projects")
        if (res.ok) {
          const data = await res.json()
          setProjects(data.projects || [])
          setStats(data.stats || stats)
        }
      } catch (error) {
        console.error("Erro ao carregar projetos:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.institution_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.location_name?.toLowerCase().includes(search.toLowerCase())
  )

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "REFLORESTAMENTO":
        return <TreePine className="h-5 w-5" />
      case "CONSERVACAO_AGUA":
        return <Droplets className="h-5 w-5" />
      case "RESIDUOS":
      case "COMPOSTAGEM":
        return <Recycle className="h-5 w-5" />
      default:
        return <Leaf className="h-5 w-5" />
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      REFLORESTAMENTO: "Reflorestamento",
      CONSERVACAO_AGUA: "Conservacao de Agua",
      RESIDUOS: "Gestao de Residuos",
      COMPOSTAGEM: "Compostagem",
      ENERGIA_RENOVAVEL: "Energia Renovavel",
      BIODIVERSIDADE: "Biodiversidade",
    }
    return labels[category] || category
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/nobiscore" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-black flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold tracking-tight">NobisCore</span>
              </div>
            </Link>
            <span className="text-black/30">/</span>
            <span className="font-medium">Hall de Projetos</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/nobiscore">
              <Button variant="ghost" className="text-black/60 hover:text-black hover:bg-black/5">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-6 border-b border-black/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 mb-6">
              <Shield className="h-4 w-4 text-black/60" />
              <span className="text-sm text-black/60">Projetos Certificados e Verificados</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Hall de Projetos
            </h1>
            
            <p className="text-lg text-black/60 max-w-2xl mx-auto">
              Projetos de impacto ambiental e social certificados pela STHATION, 
              com dados verificaveis e registrados em blockchain.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-black/5 border border-black/10">
              <div className="text-3xl font-bold">{stats.totalProjects}</div>
              <div className="text-sm text-black/40 mt-1">Projetos Certificados</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-black/5 border border-black/10">
              <div className="text-3xl font-bold">
                {stats.totalCO2?.toLocaleString("pt-BR")}
              </div>
              <div className="text-sm text-black/40 mt-1">kg CO2 Evitado</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-black/5 border border-black/10">
              <div className="text-3xl font-bold">
                {stats.totalWaste?.toLocaleString("pt-BR")}
              </div>
              <div className="text-sm text-black/40 mt-1">kg Residuos Processados</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-black/5 border border-black/10">
              <div className="text-3xl font-bold">{stats.totalInstitutions}</div>
              <div className="text-sm text-black/40 mt-1">Instituicoes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-6 px-6 border-b border-black/10 bg-black/[0.02]">
        <div className="container mx-auto max-w-6xl">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
            <Input
              placeholder="Buscar projeto, instituicao ou local..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border-black/10 focus:border-black/30"
            />
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-black/5 border border-black/10 rounded-2xl h-[420px] animate-pulse" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <Leaf className="h-16 w-16 text-black/20 mx-auto mb-4" />
              <h3 className="text-xl text-black/60 mb-2">Nenhum projeto encontrado</h3>
              <p className="text-black/40">Tente uma busca diferente ou volte mais tarde.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-white border-black/10 overflow-hidden group hover:border-black/30 hover:shadow-xl transition-all duration-300"
                >
                  {/* Project Image */}
                  <div className="relative h-48 bg-black/5 overflow-hidden">
                    {project.cover_image ? (
                      <Image
                        src={project.cover_image}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/5 to-black/10">
                        <div className="text-black/20 scale-150">
                          {getCategoryIcon(project.category)}
                        </div>
                      </div>
                    )}
                    
                    {/* Certificate Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-black text-white">
                        <Award className="mr-1 h-3 w-3" />
                        Score {project.certificate_score || 85}
                      </Badge>
                    </div>
                    
                    {/* Blockchain Badge */}
                    {project.polygon_tx_hash && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="outline" className="bg-white/90 border-black/20 text-black">
                          <Bitcoin className="mr-1 h-3 w-3" />
                          Blockchain
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    {/* Category */}
                    <div className="flex items-center gap-2 text-black/50 text-sm mb-3">
                      {getCategoryIcon(project.category)}
                      <span>{getCategoryLabel(project.category)}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-black mb-2 line-clamp-2 group-hover:text-black/80">
                      {project.title}
                    </h3>

                    {/* Institution */}
                    <div className="flex items-center gap-2 text-black/60 text-sm mb-4">
                      <Building2 className="h-4 w-4" />
                      <span className="line-clamp-1">{project.institution_name}</span>
                      {project.institution_verified && (
                        <CheckCircle2 className="h-4 w-4 text-black" />
                      )}
                    </div>

                    {/* Location & Date */}
                    <div className="flex items-center gap-4 text-black/40 text-xs mb-4">
                      {project.location_name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {project.location_name}{project.location_state ? `, ${project.location_state}` : ''}
                        </div>
                      )}
                      {project.certified_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(project.certified_at).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </div>

                    {/* Impact Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-black/5 rounded-lg p-3">
                        <div className="text-lg font-bold text-black">
                          {(project.co2_equivalent || 0).toLocaleString("pt-BR")}
                        </div>
                        <div className="text-xs text-black/40">kg CO2 evitado</div>
                      </div>
                      <div className="bg-black/5 rounded-lg p-3">
                        <div className="text-lg font-bold text-black">
                          {(project.waste_processed || 0).toLocaleString("pt-BR")}
                        </div>
                        <div className="text-xs text-black/40">kg processados</div>
                      </div>
                    </div>

                    {/* Certificate Hash */}
                    {project.certificate_hash && (
                      <div className="flex items-center gap-2 text-xs text-black/50 bg-black/5 rounded-lg p-2 mb-4">
                        <Hash className="h-3 w-3 flex-shrink-0" />
                        <span className="font-mono truncate">{project.certificate_hash}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        asChild
                        className="flex-1 bg-black hover:bg-black/90 text-white"
                      >
                        <Link href={`/transparency/${project.id}`}>
                          Ver Certificado
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      {project.polygon_tx_hash && (
                        <Button
                          asChild
                          variant="outline"
                          className="border-black/20 text-black hover:bg-black/5"
                        >
                          <Link
                            href={`https://polygonscan.com/tx/${project.polygon_tx_hash}`}
                            target="_blank"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-black/[0.02] border-t border-black/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Sua instituicao tem projetos de impacto?
          </h2>
          <p className="text-black/60 mb-8 text-lg">
            Cadastre-se na plataforma STHATION e tenha seus projetos certificados e registrados na blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-black hover:bg-black/90 text-white rounded-full px-8">
              <Link href="/cadastro">
                Cadastrar Instituicao
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-black/20 rounded-full px-8">
              <Link href="/verificar">
                Verificar Certificado
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-black/10">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-black/40 text-sm">
            <Zap className="h-4 w-4" />
            <span>NobisCore by STHATION - Infraestrutura da Verdade</span>
          </div>
          <div className="text-black/30 text-sm">
            2024 STHATION. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}

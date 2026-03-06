"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Landmark,
  Search,
  ExternalLink,
  CheckCircle2,
  MapPin,
  Users,
  Leaf,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react"
import {
  GovProjectType,
  GovProjectStatus,
  GOV_STATUS_CONFIG,
  GOV_PROJECT_TYPE_CONFIG,
} from "@/lib/types/gov"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
]

export default function GovHallPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [stateFilter, setStateFilter] = useState<string>("all")

  // Buscar projetos Gov da API (dados reais)
  const { data, isLoading } = useSWR("/api/gov/projects?limit=50", fetcher, { revalidateOnFocus: false })
  const govProjects = data?.projects || []

  const filtered = govProjects.filter((p: any) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.municipality || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = typeFilter === "all" || p.type === typeFilter
    const matchState = stateFilter === "all" || p.state === stateFilter
    return matchSearch && matchType && matchState
  })

  const totalBeneficiaries = govProjects.reduce((sum: number, p: any) => sum + (p.beneficiaries || 0), 0)
  const totalInvested = govProjects.reduce((sum: number, p: any) => sum + (p.investedAmount || p.invested_amount || 0), 0)
  const totalBlockchain = govProjects.filter(
    (p: any) => p.status === GovProjectStatus.INSCRITO_BLOCKCHAIN,
  ).length

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0a2f2f] py-16 md:py-20">
          <div className="absolute inset-0 mesh-pattern-dark" />
          <div className="container relative mx-auto px-4 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2">
              <Landmark className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium text-teal-400 uppercase tracking-wider">Hall Sthation Gov</span>
            </div>
            <h1 className="mb-4 text-3xl font-black text-white md:text-5xl text-balance">
              Projetos de <span className="text-teal-400">Gestao Publica</span> Verificados
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-white/60">
              Transparencia total das acoes de prefeituras. Cada projeto verificado e rastreavel.
            </p>

            {/* Stats */}
            <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-4">
              {[
                { value: govProjects.length.toString(), label: "Projetos" },
                { value: totalBeneficiaries.toLocaleString("pt-BR"), label: "Beneficiarios" },
                {
                  value: totalInvested > 0 ? `R$ ${(totalInvested / 1000000).toFixed(1)}M` : "R$ 0",
                  label: "Investidos",
                },
                { value: totalBlockchain.toString(), label: "Na Blockchain" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-teal-400/20 bg-white/5 px-4 py-3 backdrop-blur-sm"
                >
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-xs font-medium text-teal-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filtros + Lista */}
        <section className="bg-[#071f1f] py-12">
          <div className="container mx-auto px-4">
            {/* Filtros */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  placeholder="Buscar por projeto ou municipio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border-teal-400/20 text-white placeholder:text-white/40 pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white/5 border-teal-400/20 text-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value={GovProjectType.SOCIAL}>Acao Social</SelectItem>
                  <SelectItem value={GovProjectType.AMBIENTAL}>Acao Ambiental</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-full md:w-40 bg-white/5 border-teal-400/20 text-white">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estados</SelectItem>
                  {STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grid de projetos */}
            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <Landmark className="mx-auto mb-4 h-12 w-12 text-white/20" />
                <p className="text-white/40">Nenhum projeto encontrado com os filtros selecionados.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((project) => {
                  const statusCfg = GOV_STATUS_CONFIG[project.status]
                  const typeCfg = GOV_PROJECT_TYPE_CONFIG[project.type]

                  return (
                    <div
                      key={project.id}
                      className="group flex flex-col rounded-2xl border border-teal-400/20 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-teal-400/40 hover:bg-white/10"
                    >
                      {/* Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {project.type === GovProjectType.SOCIAL ? (
                            <Users className="h-5 w-5 text-teal-400" />
                          ) : (
                            <Leaf className="h-5 w-5 text-teal-400" />
                          )}
                          <Badge variant="outline" className="border-teal-400/30 text-teal-400 text-xs">
                            {typeCfg.label}
                          </Badge>
                        </div>
                        <Badge className={`text-xs ${statusCfg.color}`}>{statusCfg.label}</Badge>
                      </div>

                      {/* Content */}
                      <h3 className="mb-2 text-lg font-bold text-white leading-tight">{project.title}</h3>
                      <p className="mb-1 flex items-center gap-1 text-sm text-white/50">
                        <MapPin className="h-3.5 w-3.5" />
                        {project.municipality}, {project.state}
                      </p>
                      <p className="mb-4 text-xs text-white/40">{project.responsibleDepartment}</p>

                      {/* Stats */}
                      <div className="mb-4 mt-auto grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-white/5 p-3">
                          <div className="text-lg font-bold text-white">
                            {project.beneficiaries.toLocaleString("pt-BR")}
                          </div>
                          <div className="text-xs text-white/40">Beneficiarios</div>
                        </div>
                        <div className="rounded-lg bg-white/5 p-3">
                          <div className="text-lg font-bold text-white">
                            R$ {(project.investedAmount / 1000).toFixed(0)}k
                          </div>
                          <div className="text-xs text-white/40">Investido</div>
                        </div>
                      </div>

                      {/* Verificacao */}
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
                        <span>Verificado por: {project.verificationMethod === "VCA" ? "Checkers (VCA)" : "Certificadora"}</span>
                      </div>

                      {/* Blockchain link */}
                      {project.blockchainTxId && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-teal-400/10 px-3 py-2">
                          <CheckCircle2 className="h-4 w-4 text-teal-400" />
                          <span className="text-xs font-medium text-teal-400">Registrado na Blockchain</span>
                          <ExternalLink className="ml-auto h-3.5 w-3.5 text-teal-400/60" />
                        </div>
                      )}

                      {project.completedAt && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-white/30">
                          <Calendar className="h-3 w-3" />
                          {new Date(project.completedAt).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="relative bg-[#0a2f2f] py-16">
          <div className="absolute inset-0 mesh-pattern-dark" />
          <div className="container relative mx-auto px-4 text-center">
            <h2 className="mb-4 text-2xl font-black text-white md:text-3xl">
              Sua prefeitura tambem pode estar aqui
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-white/60">
              Contrate o Sthation Gov e traga transparencia para as acoes da sua gestao publica.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold rounded-full px-8 glow-teal"
            >
              <Link href="/gov">
                Conheca o Sthation Gov
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Bottom banner */}
        <div className="bg-teal-400 py-3">
          <p className="text-center text-sm font-bold text-[#0a2f2f] uppercase tracking-widest">
            Gestao Publica Transparente. Impacto Verificado. Blockchain.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

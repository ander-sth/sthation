"use client"

import { use } from "react"
import Link from "next/link"
import Image from "next/image"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Leaf,
  MapPin,
  Building2,
  Award,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Loader2,
  Calendar,
  Scale,
  Zap,
  FileCheck,
  Heart,
  Copy,
  Check,
} from "lucide-react"
import { useState } from "react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function TransparencyProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [copied, setCopied] = useState(false)
  
  const { data, isLoading } = useSWR(`/api/iac/${id}`, fetcher)
  const project = data?.project

  const copyHash = () => {
    if (project?.polygon_tx_hash) {
      navigator.clipboard.writeText(project.polygon_tx_hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Projeto nao encontrado</h1>
        <Link href="/transparency" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
    )
  }

  const fundingProgress = project.funding_goal 
    ? Math.min(100, ((project.total_donated || 0) / project.funding_goal) * 100)
    : 0

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
          <Link href="/transparency">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Galeria
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="h-64 md:h-80 bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 relative">
        {project.cover_image ? (
          <Image
            src={project.cover_image}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="h-24 w-24 text-emerald-600/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 container">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-600 text-white">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Certificado
            </Badge>
            {project.certification_score && (
              <Badge variant="outline" className="bg-background/80">
                Score: {project.certification_score}/100
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {project.institution_name}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {project.location_name}, {project.location_state}
            </span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descrição */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {project.description || "Sem descricao disponivel."}
                </p>
              </CardContent>
            </Card>

            {/* Métricas de Impacto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                  Metricas de Impacto
                </CardTitle>
                <CardDescription>
                  Dados verificados e certificados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Leaf className="h-4 w-4" />
                      CO2 Equivalente Evitado
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {project.co2_equivalent || 0} tCO2e/ano
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Scale className="h-4 w-4" />
                      Residuos Processados
                    </div>
                    <p className="text-2xl font-bold">
                      {(project.waste_processed || 0).toLocaleString("pt-BR")} kg
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      Energia Gerada
                    </div>
                    <p className="text-2xl font-bold">
                      {(project.energy_generated || 0).toLocaleString("pt-BR")} kWh
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Certificado em
                    </div>
                    <p className="text-lg font-semibold">
                      {project.certified_at ? formatDate(project.certified_at) : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blockchain */}
            {project.polygon_tx_hash && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    Registro Blockchain
                  </CardTitle>
                  <CardDescription>
                    Este projeto esta registrado de forma imutavel na blockchain Polygon
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Hash da Transacao</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-muted px-3 py-2 rounded font-mono break-all">
                        {project.polygon_tx_hash}
                      </code>
                      <Button variant="outline" size="icon" onClick={copyHash}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <a 
                      href={`https://polygonscan.com/tx/${project.polygon_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver no PolygonScan
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Doação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Apoie este Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.funding_goal > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Arrecadado</span>
                      <span className="font-semibold">
                        {formatCurrency(project.total_donated || 0)} de {formatCurrency(project.funding_goal)}
                      </span>
                    </div>
                    <Progress value={fundingProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {project.donors_count || 0} doadores
                    </p>
                  </div>
                )}
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href={`/doar/${project.id}`}>
                    Fazer uma Doacao
                    <Heart className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Instituição */}
            <Card>
              <CardHeader>
                <CardTitle>Instituicao Responsavel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{project.institution_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.institution_city}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificação */}
            <Card>
              <CardHeader>
                <CardTitle>Certificacao</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className="bg-emerald-600">Certificado</Badge>
                </div>
                {project.certification_score && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Score</span>
                    <span className="font-semibold">{project.certification_score}/100</span>
                  </div>
                )}
                {project.certified_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Data</span>
                    <span className="font-semibold">{formatDate(project.certified_at)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>STHation - Plataforma de Certificacao de Impacto Ambiental</p>
        </div>
      </footer>
    </div>
  )
}

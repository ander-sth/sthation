"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink,
  Shield,
  Leaf,
  Building2,
  Calendar,
  Hash,
  Award,
  ArrowLeft
} from "lucide-react"

interface VerificationResult {
  verified: boolean
  project?: {
    id: string
    title: string
    status: string
    category: string
    institutionName: string
    institutionCnpj: string
    certifierName: string
    co2Equivalent: number
    wasteProcessed: number
    certifiedAt: string
    mintedAt: string
    certificationScore: number
  }
  blockchain?: {
    txHash: string
    explorerLink: string
    certHash: string
    onChainVerified: boolean
  }
  message: string
  error?: string
}

export default function VerificarPage() {
  const [searchValue, setSearchValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    if (!searchValue.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // Detectar se e um hash ou ID
      const isHash = searchValue.startsWith("0x")
      const param = isHash ? `txHash=${searchValue}` : `projectId=${searchValue}`
      
      const res = await fetch(`/api/blockchain/verify?${param}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao verificar")
        return
      }

      setResult(data)
    } catch (err) {
      setError("Erro de conexao. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2f2f] to-[#1a4a4a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a2f2f]/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/sthation-logo.png" alt="STHation" width={140} height={35} />
          </Link>
          <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-6">
            <Shield className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Verificador de Certificados
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Verifique a autenticidade de certificados de impacto ambiental registrados na blockchain Polygon.
          </p>
        </div>

        {/* Search */}
        <Card className="max-w-2xl mx-auto mb-8 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Buscar Certificado</CardTitle>
            <CardDescription className="text-white/60">
              Digite o ID do projeto ou o hash da transacao na blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="ID do projeto ou hash da transacao (0x...)"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <Button 
                onClick={handleVerify} 
                disabled={isLoading || !searchValue.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="max-w-2xl mx-auto mb-8 bg-red-500/10 border-red-500/30">
            <CardContent className="flex items-center gap-3 py-4">
              <XCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {result && (
          <Card className={`max-w-2xl mx-auto ${result.verified ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {result.verified ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                ) : (
                  <XCircle className="h-8 w-8 text-amber-400" />
                )}
                <div>
                  <CardTitle className={result.verified ? "text-emerald-300" : "text-amber-300"}>
                    {result.verified ? "Certificado Verificado" : "Nao Verificado"}
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    {result.message}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            {result.project && (
              <CardContent className="space-y-6">
                {/* Project Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-emerald-400" />
                    Dados do Projeto
                  </h3>
                  
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Titulo</span>
                      <span className="text-white font-medium">{result.project.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Categoria</span>
                      <Badge variant="outline" className="text-emerald-300 border-emerald-500/30">
                        {result.project.category}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        Instituicao
                      </span>
                      <span className="text-white">{result.project.institutionName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        Certificador
                      </span>
                      <span className="text-white">{result.project.certifierName || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">CO2 Evitado</span>
                      <span className="text-emerald-400 font-bold">{result.project.co2Equivalent || 0} tCO2e</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Residuos Processados</span>
                      <span className="text-white">{(result.project.wasteProcessed || 0).toLocaleString("pt-BR")} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Score de Certificacao</span>
                      <span className="text-white">{result.project.certificationScore || "-"}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Certificado em
                      </span>
                      <span className="text-white">
                        {result.project.certifiedAt 
                          ? new Date(result.project.certifiedAt).toLocaleDateString("pt-BR")
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Blockchain Info */}
                {result.blockchain && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Hash className="h-5 w-5 text-purple-400" />
                      Registro Blockchain
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-white/60 block mb-1">Hash da Transacao</span>
                        <code className="text-xs text-purple-300 bg-black/30 px-2 py-1 rounded block break-all">
                          {result.blockchain.txHash}
                        </code>
                      </div>
                      
                      <div>
                        <span className="text-white/60 block mb-1">Hash do Certificado</span>
                        <code className="text-xs text-emerald-300 bg-black/30 px-2 py-1 rounded block break-all">
                          {result.blockchain.certHash}
                        </code>
                      </div>

                      {result.blockchain.explorerLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                          asChild
                        >
                          <a href={result.blockchain.explorerLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver no Polygonscan
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* View Project Link */}
                <div className="pt-4 border-t border-white/10">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" asChild>
                    <Link href={`/transparency/${result.project.id}`}>
                      Ver Detalhes do Projeto
                    </Link>
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 text-center">
              <Shield className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Imutavel</h3>
              <p className="text-sm text-white/60">
                Registros na blockchain nao podem ser alterados ou deletados
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Transparente</h3>
              <p className="text-sm text-white/60">
                Qualquer pessoa pode verificar a autenticidade dos certificados
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 text-center">
              <Leaf className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Sustentavel</h3>
              <p className="text-sm text-white/60">
                Polygon usa prova de participacao, consumindo menos energia
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

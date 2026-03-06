"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

const roles = [
  { value: "DOADOR", label: "Doador" },
  { value: "INSTITUICAO_SOCIAL", label: "Instituicao Social (ONG/Cooperativa)" },
  { value: "EMPRESA_AMBIENTAL", label: "Empresa Ambiental" },
  { value: "CHECKER", label: "Checker (Auditor Comunitario)" },
  { value: "PREFEITURA", label: "Prefeitura / Gestao Publica (Gov)" },
]

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("DOADOR")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await register(email, password, name, role)
      toast({ title: "Conta criada!", description: "Bem-vindo ao STHATION." })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Erro no registro",
        description: error instanceof Error ? error.message : "Falha ao criar conta",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0a2f2f] overflow-hidden">
      {/* Mesh pattern overlay */}
      <div className="absolute inset-0 mesh-pattern-dark" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/50 via-transparent to-cyan-900/30" />

      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header with logo */}
          <div className="mb-8 text-center">
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <Image
                src="/sthation-logo.png"
                alt="STHATION NOBIS"
                width={260}
                height={65}
                className="h-16 w-auto"
                priority
              />
            </Link>
            <p className="text-teal-400 mt-2">Junte-se ao ecossistema de impacto</p>
          </div>

          {/* Benefits cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/5 backdrop-blur-sm border border-teal-400/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-teal-400">100%</div>
              <div className="text-xs text-white/60 uppercase tracking-wide">Rastreável</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-teal-400/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-teal-400">80%</div>
              <div className="text-xs text-white/60 uppercase tracking-wide">Para Impacto</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-teal-400/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-teal-400">Imutável</div>
              <div className="text-xs text-white/60 uppercase tracking-wide">Blockchain</div>
            </div>
          </div>

          {/* Register Card */}
          <Card className="bg-white/5 backdrop-blur-sm border-teal-400/20">
            <CardHeader>
              <CardTitle className="text-white">Criar Conta</CardTitle>
              <CardDescription className="text-white/60">Comece a fazer a diferença hoje</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/80">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-white/10 border-teal-400/30 text-white placeholder:text-white/40 focus:border-teal-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-teal-400/30 text-white placeholder:text-white/40 focus:border-teal-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-white/10 border-teal-400/30 text-white placeholder:text-white/40 focus:border-teal-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-white/80">
                    Tipo de Conta
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="bg-white/10 border-teal-400/30 text-white focus:border-teal-400">
                      <SelectValue placeholder="Selecione o tipo de conta" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a2f2f] border-teal-400/30">
                      {roles.map((r) => (
                        <SelectItem
                          key={r.value}
                          value={r.value}
                          className="text-white hover:bg-teal-400/20 focus:bg-teal-400/20"
                        >
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold rounded-full glow-teal"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
                <p className="text-center text-sm text-white/60">
                  Já tem conta?{" "}
                  <Link href="/login" className="font-medium text-teal-400 hover:text-teal-300">
                    Entrar
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          {/* Back to home link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-teal-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

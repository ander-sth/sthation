"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast({ title: "Login realizado!", description: "Bem-vindo de volta ao STHATION." })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Credenciais inválidas",
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
      <div className="absolute top-20 right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {/* Header with logo */}
          <div className="mb-8 text-center">
            <Link href="/" className="mb-4 inline-flex items-center gap-2 group">
              <Image
                src="/sthation-logo.png"
                alt="STHATION NOBIS"
                width={260}
                height={65}
                className="h-16 w-auto"
                priority
              />
            </Link>
            <p className="text-teal-400 mt-2">The Immutable Impact Layer</p>
          </div>

          <div className="w-full max-w-md mx-auto">
            {/* Login Card */}
            <Card className="bg-white/5 backdrop-blur-sm border-teal-400/20">
              <CardHeader>
                <CardTitle className="text-white">Entrar</CardTitle>
                <CardDescription className="text-white/60">Acesse sua conta na plataforma STHATION</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
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
                      className="bg-white/10 border-teal-400/30 text-white placeholder:text-white/40 focus:border-teal-400"
                    />
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
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                  <p className="text-center text-sm text-white/60">
                    Nao tem conta?{" "}
                    <Link href="/cadastro" className="font-medium text-teal-400 hover:text-teal-300">
                      Criar conta
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>

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

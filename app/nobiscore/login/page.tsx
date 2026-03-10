"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NobisCoreLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/nobiscore/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        localStorage.setItem("nobiscore_token", data.token)
        localStorage.setItem("nobiscore_user", JSON.stringify(data.user))
        toast({
          title: "Login realizado",
          description: "Bem-vindo ao NobisCore!",
        })
        window.location.href = "/nobiscore/dashboard"
      } else {
        toast({
          title: "Erro no login",
          description: data.error || "Email ou senha incorretos",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-black/10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/nobiscore" className="flex items-center gap-2 text-black/60 hover:text-black transition-colors w-fit">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">NobisCore</h1>
            <p className="text-black/60">Acesse sua conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black/80">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                required
                className="bg-black/5 border-black/20 text-black placeholder:text-black/40 focus:border-black/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-black/80">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Sua senha"
                  required
                  className="bg-black/5 border-black/20 text-black placeholder:text-black/40 focus:border-black/40 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white hover:bg-black/90 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-black/60">
              Ainda nao tem conta?{" "}
              <Link href="/nobiscore/cadastro" className="text-black font-medium hover:underline">
                Criar conta
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-black/10" />
            <span className="text-black/40 text-sm">ou</span>
            <div className="flex-1 h-px bg-black/10" />
          </div>

          {/* Info */}
          <div className="text-center text-sm text-black/40">
            <p>O NobisCore e a plataforma de tokenizacao de impacto da Sthation.</p>
            <p className="mt-2">Transforme seus tokens de impacto em Inscriptions imutaveis no Bitcoin.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

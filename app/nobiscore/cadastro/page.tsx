"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Eye, EyeOff, Loader2, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NobisCoreCadastroPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const passwordMatch = formData.password === formData.confirmPassword
  const passwordValid = formData.password.length >= 6
  const canSubmit = formData.name && formData.email && passwordValid && passwordMatch && acceptedTerms

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    
    setIsLoading(true)

    try {
      const res = await fetch("/api/nobiscore/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        localStorage.setItem("nobiscore_token", data.token)
        localStorage.setItem("nobiscore_user", JSON.stringify(data.user))
        toast({
          title: "Conta criada!",
          description: "Bem-vindo ao NobisCore!",
        })
        window.location.href = "/nobiscore/dashboard"
      } else {
        toast({
          title: "Erro no cadastro",
          description: data.error || "Erro ao criar conta",
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/nobiscore" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors w-fit">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      {/* Register Form */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">NobisCore</h1>
            <p className="text-white/60">Criar nova conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">Nome completo</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Seu nome"
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimo 6 caracteres"
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="flex items-center gap-2 text-xs">
                  {passwordValid ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-white/20" />
                  )}
                  <span className={passwordValid ? "text-green-500" : "text-white/40"}>
                    Minimo 6 caracteres
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Digite novamente"
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
              />
              {formData.confirmPassword && !passwordMatch && (
                <p className="text-xs text-red-400">As senhas nao coincidem</p>
              )}
            </div>

            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                className="mt-1 border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              <label htmlFor="terms" className="text-sm text-white/60 cursor-pointer">
                Concordo com os{" "}
                <Link href="/termos" className="text-white hover:underline">Termos de Uso</Link>
                {" "}e{" "}
                <Link href="/privacidade" className="text-white hover:underline">Politica de Privacidade</Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="w-full bg-white text-black hover:bg-white/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/60">
              Ja tem uma conta?{" "}
              <Link href="/nobiscore/login" className="text-white hover:underline">
                Entrar
              </Link>
            </p>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 border border-white/10 rounded-lg">
              <div className="text-2xl mb-2">&#x26A1;</div>
              <p className="text-xs text-white/60">Tokenize impacto</p>
            </div>
            <div className="p-4 border border-white/10 rounded-lg">
              <div className="text-2xl mb-2">&#x1F512;</div>
              <p className="text-xs text-white/60">Imutavel no Bitcoin</p>
            </div>
            <div className="p-4 border border-white/10 rounded-lg">
              <div className="text-2xl mb-2">&#x1F310;</div>
              <p className="text-xs text-white/60">Mercado global</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Heart, Loader2, CheckCircle, ArrowLeft, User, Building2, Mail, Phone as PhoneIcon, Lock } from "lucide-react"

const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

export default function CadastroDoadorPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [personType, setPersonType] = useState<"PF" | "PJ">("PF")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpfCnpj: "",
    phone: "",
    city: "",
    state: "",
    companyName: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14)
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18)
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3")
    }
    return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3").slice(0, 15)
  }

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas nao coincidem",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: personType === "PJ" ? formData.companyName : formData.name,
          email: formData.email,
          password: formData.password,
          role: "DONOR",
          personType,
          cpfCnpj: formData.cpfCnpj,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess(true)
        toast({
          title: "Cadastro realizado!",
          description: "Sua conta foi criada com sucesso.",
        })
      } else {
        toast({
          title: "Erro no cadastro",
          description: data.error || "Erro ao criar conta",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isValid = 
    formData.name && 
    formData.email && 
    formData.password && 
    formData.password === formData.confirmPassword &&
    formData.password.length >= 6

  if (success) {
    return (
      <div className="min-h-screen bg-[#071f1f] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full bg-white/5 border-teal-400/20 backdrop-blur-sm">
            <CardContent className="pt-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-teal-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-teal-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Conta Criada!</h2>
                <p className="text-white/60">
                  Sua conta de doador foi criada com sucesso. Agora voce pode fazer login e comecar a apoiar projetos de impacto.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full bg-teal-500 hover:bg-teal-400 text-[#0a2f2f]">
                  <Link href="/login">Fazer Login</Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-teal-400/30 text-teal-400 hover:bg-teal-400/10">
                  <Link href="/">Voltar ao Inicio</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#071f1f] flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-lg mx-auto px-4">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Heart className="h-8 w-8 text-rose-400" />
              Cadastro de Doador
            </h1>
            <p className="text-white/60">
              Crie sua conta para apoiar projetos de impacto social e ambiental.
            </p>
          </div>

          <Card className="bg-white/5 border-teal-400/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Seus Dados</CardTitle>
              <CardDescription className="text-white/50">
                Preencha as informacoes abaixo para criar sua conta
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Tipo de pessoa */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={personType === "PF" ? "default" : "outline"}
                  onClick={() => setPersonType("PF")}
                  className={personType === "PF" 
                    ? "flex-1 bg-teal-500 hover:bg-teal-400 text-[#0a2f2f]" 
                    : "flex-1 border-white/20 text-white hover:bg-white/10"}
                >
                  <User className="mr-2 h-4 w-4" />
                  Pessoa Fisica
                </Button>
                <Button
                  type="button"
                  variant={personType === "PJ" ? "default" : "outline"}
                  onClick={() => setPersonType("PJ")}
                  className={personType === "PJ" 
                    ? "flex-1 bg-teal-500 hover:bg-teal-400 text-[#0a2f2f]" 
                    : "flex-1 border-white/20 text-white hover:bg-white/10"}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Pessoa Juridica
                </Button>
              </div>

              {personType === "PJ" && (
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-white">Nome da Empresa *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    placeholder="Nome da empresa"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  {personType === "PF" ? "Nome Completo *" : "Nome do Responsavel *"}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpfCnpj" className="text-white">{personType === "PF" ? "CPF" : "CNPJ"}</Label>
                <Input
                  id="cpfCnpj"
                  value={formData.cpfCnpj}
                  onChange={(e) => updateField("cpfCnpj", personType === "PF" ? formatCPF(e.target.value) : formatCNPJ(e.target.value))}
                  placeholder={personType === "PF" ? "000.000.000-00" : "00.000.000/0001-00"}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Telefone</Label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Sua cidade"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-white">Estado</Label>
                  <Select value={formData.state} onValueChange={(v) => updateField("state", v)}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BRASIL.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Minimo 6 caracteres"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirmar Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    placeholder="Repita a senha"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pl-10"
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!isValid || isLoading}
                className="w-full bg-teal-500 hover:bg-teal-400 text-[#0a2f2f]"
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

              <p className="text-center text-sm text-white/40">
                Ja tem uma conta?{" "}
                <Link href="/login" className="text-teal-400 hover:text-teal-300">
                  Faca login
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

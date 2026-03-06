"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Users, Loader2, CheckCircle, ArrowLeft, User, Mail, Phone as PhoneIcon, Lock, Shield, Award } from "lucide-react"

const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

const AREAS_INTERESSE = [
  { value: "ALIMENTACAO", label: "Alimentacao e Seguranca Alimentar" },
  { value: "EDUCACAO", label: "Educacao e Capacitacao" },
  { value: "ASSISTENCIA", label: "Assistencia Social" },
  { value: "SAUDE", label: "Saude e Bem-estar" },
  { value: "MORADIA", label: "Moradia e Habitacao" },
  { value: "MEIO_AMBIENTE", label: "Meio Ambiente" },
]

export default function CadastroCheckerPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
    cpf: "",
    phone: "",
    city: "",
    state: "",
    profession: "",
    experience: "",
    motivation: "",
    areasOfInterest: [] as string[],
  })

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleArea = (area: string) => {
    const current = formData.areasOfInterest
    if (current.includes(area)) {
      updateField("areasOfInterest", current.filter(a => a !== area))
    } else {
      updateField("areasOfInterest", [...current, area])
    }
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14)
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3")
    }
    return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3").slice(0, 15)
  }

  const handleSubmit = async () => {
    if (!user && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas nao coincidem",
        variant: "destructive",
      })
      return
    }

    if (!acceptedTerms) {
      toast({
        title: "Erro",
        description: "Voce precisa aceitar os termos para se tornar Checker",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Se ja esta logado, apenas atualiza para Checker
      // Se nao, cria conta nova como Checker
      const endpoint = user ? "/api/checkers/upgrade" : "/api/auth/register"
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          role: "CHECKER",
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess(true)
        toast({
          title: user ? "Solicitacao enviada!" : "Cadastro realizado!",
          description: user 
            ? "Sua solicitacao para se tornar Checker foi enviada para analise."
            : "Sua conta foi criada e sua solicitacao esta em analise.",
        })
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao processar solicitacao",
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
    formData.cpf.length >= 14 &&
    formData.motivation.length >= 50 &&
    formData.areasOfInterest.length >= 1 &&
    acceptedTerms &&
    (user || (formData.password && formData.password === formData.confirmPassword))

  if (success) {
    return (
      <div className="min-h-screen bg-[#071f1f] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full bg-white/5 border-teal-400/20 backdrop-blur-sm">
            <CardContent className="pt-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Solicitacao Enviada!</h2>
                <p className="text-white/60">
                  Sua solicitacao para se tornar Checker foi enviada com sucesso. Nossa equipe ira analisar seu perfil.
                </p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                <p className="text-sm text-cyan-400">
                  O processo de aprovacao pode levar ate 72 horas. Voce recebera um email com o resultado.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full bg-teal-500 hover:bg-teal-400 text-[#0a2f2f]">
                  <Link href={user ? "/dashboard" : "/login"}>
                    {user ? "Ir para o Dashboard" : "Fazer Login"}
                  </Link>
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
        <div className="container max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="h-8 w-8 text-cyan-400" />
              Tornar-se Checker VCA
            </h1>
            <p className="text-white/60">
              Checkers sao validadores comunitarios que avaliam projetos de impacto social na plataforma STHATION.
            </p>
          </div>

          {/* Info box sobre Checkers */}
          <Card className="mb-6 bg-cyan-500/10 border-cyan-500/20">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Shield className="h-8 w-8 text-cyan-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-2">O que e um Checker?</h3>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• Avalia evidencias de projetos sociais</li>
                    <li>• Participa de rodadas de votacao VCA (Validacao Comunitaria Autonoma)</li>
                    <li>• Recebe recompensas por participacao ativa</li>
                    <li>• Ajuda a garantir a transparencia do impacto social</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-teal-400/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-teal-400" />
                {user ? "Complete seu perfil de Checker" : "Dados para Cadastro"}
              </CardTitle>
              <CardDescription className="text-white/50">
                {user 
                  ? "Preencha as informacoes adicionais para se tornar Checker" 
                  : "Crie sua conta e solicite acesso como Checker"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Seu nome completo"
                    disabled={!!user}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="seu@email.com"
                    disabled={!!user}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 disabled:opacity-50"
                  />
                </div>
              </div>

              {!user && (
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-white">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => updateField("cpf", formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Sua cidade"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-white">Estado *</Label>
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
                <Label htmlFor="profession" className="text-white">Profissao / Ocupacao</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => updateField("profession", e.target.value)}
                  placeholder="Ex: Assistente Social, Professor, Advogado..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Areas de Interesse *</Label>
                <p className="text-xs text-white/50">Selecione as areas que voce tem conhecimento ou interesse em avaliar</p>
                <div className="grid gap-2 sm:grid-cols-2 mt-2">
                  {AREAS_INTERESSE.map((area) => (
                    <div
                      key={area.value}
                      onClick={() => toggleArea(area.value)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.areasOfInterest.includes(area.value)
                          ? "bg-teal-500/20 border-teal-500/50 text-white"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={formData.areasOfInterest.includes(area.value)}
                          className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                        />
                        <span className="text-sm">{area.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivation" className="text-white">Motivacao *</Label>
                <p className="text-xs text-white/50">Conte por que voce quer ser um Checker (minimo 50 caracteres)</p>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => updateField("motivation", e.target.value)}
                  placeholder="Explique sua motivacao para participar da validacao de projetos sociais..."
                  rows={4}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
                />
                <p className="text-xs text-white/40 text-right">{formData.motivation.length}/50 caracteres</p>
              </div>

              {/* Termos */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    className="mt-1 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                  />
                  <label htmlFor="terms" className="text-sm text-white/70 cursor-pointer">
                    Declaro que li e aceito os{" "}
                    <Link href="/termos" className="text-teal-400 hover:text-teal-300">
                      Termos de Uso
                    </Link>{" "}
                    e me comprometo a avaliar projetos de forma imparcial, etica e baseada em evidencias.
                  </label>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!isValid || isLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0a2f2f]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Award className="mr-2 h-4 w-4" />
                    {user ? "Solicitar Acesso como Checker" : "Criar Conta e Solicitar Acesso"}
                  </>
                )}
              </Button>

              {!user && (
                <p className="text-center text-sm text-white/40">
                  Ja tem uma conta?{" "}
                  <Link href="/login" className="text-teal-400 hover:text-teal-300">
                    Faca login
                  </Link>{" "}
                  e solicite acesso como Checker
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

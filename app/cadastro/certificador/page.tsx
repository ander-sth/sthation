"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { FlaskConical, Loader2, CheckCircle, ArrowLeft, User, Mail, Phone as PhoneIcon, Lock, Shield, Award, FileText, Building2 } from "lucide-react"

const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

const ESPECIALIDADES = [
  { value: "COMPOSTAGEM", label: "Compostagem e Residuos Organicos" },
  { value: "ENERGIA_SOLAR", label: "Energia Solar Fotovoltaica" },
  { value: "BIODIGESTAO", label: "Biodigestao e Biogas" },
  { value: "RECICLAGEM", label: "Reciclagem Industrial" },
  { value: "REFLORESTAMENTO", label: "Reflorestamento e Restauracao" },
  { value: "HIDRICOS", label: "Recursos Hidricos" },
  { value: "CARBONO", label: "Creditos de Carbono" },
]

export default function CadastroCertificadorPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    phone: "",
    city: "",
    state: "",
    // Dados profissionais
    formation: "",
    institution: "",
    registrationNumber: "", // CREA, CRQ, etc
    registrationBody: "", // Orgao de registro
    yearsExperience: "",
    specialties: [] as string[],
    curriculum: "",
    linkedIn: "",
  })

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleSpecialty = (spec: string) => {
    const current = formData.specialties
    if (current.includes(spec)) {
      updateField("specialties", current.filter(s => s !== spec))
    } else {
      updateField("specialties", [...current, spec])
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
    if (formData.password !== formData.confirmPassword) {
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
        description: "Voce precisa aceitar os termos",
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
          ...formData,
          role: "CERTIFIER",
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess(true)
        toast({
          title: "Cadastro enviado!",
          description: "Sua solicitacao sera analisada pela equipe STHATION.",
        })
      } else {
        toast({
          title: "Erro no cadastro",
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

  const canProceedStep1 = formData.name && formData.email && formData.cpf.length >= 14 && formData.password && formData.password === formData.confirmPassword
  const canProceedStep2 = formData.formation && formData.registrationNumber && formData.registrationBody && formData.specialties.length >= 1
  const canSubmit = canProceedStep1 && canProceedStep2 && acceptedTerms

  if (success) {
    return (
      <div className="min-h-screen bg-[#071f1f] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full bg-white/5 border-teal-400/20 backdrop-blur-sm">
            <CardContent className="pt-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Solicitacao Enviada!</h2>
                <p className="text-white/60">
                  Sua solicitacao para se tornar Analista Certificador foi enviada. Nossa equipe ira validar suas credenciais.
                </p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <p className="text-sm text-purple-400">
                  O processo de validacao pode levar ate 5 dias uteis. Entraremos em contato por email para solicitar documentos adicionais se necessario.
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
        <div className="container max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <FlaskConical className="h-8 w-8 text-purple-400" />
              Cadastro de Analista Certificador
            </h1>
            <p className="text-white/60">
              Analistas Certificadores sao profissionais qualificados que avaliam e certificam projetos ambientais.
            </p>
          </div>

          {/* Info box */}
          <Card className="mb-6 bg-purple-500/10 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Shield className="h-8 w-8 text-purple-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-2">Requisitos para Certificadores</h3>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• Formacao superior em area ambiental ou correlata</li>
                    <li>• Registro ativo em conselho profissional (CREA, CRQ, etc.)</li>
                    <li>• Experiencia comprovada em auditoria ou certificacao ambiental</li>
                    <li>• Disponibilidade para visitas tecnicas presenciais</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= s ? "bg-purple-500 text-white" : "bg-white/10 text-white/40"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && <div className={`flex-1 h-1 ${step > s ? "bg-purple-500" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>

          <Card className="bg-white/5 border-teal-400/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {step === 1 && <><User className="h-5 w-5 text-purple-400" /> Dados Pessoais</>}
                {step === 2 && <><FileText className="h-5 w-5 text-purple-400" /> Dados Profissionais</>}
                {step === 3 && <><Award className="h-5 w-5 text-purple-400" /> Especialidades</>}
              </CardTitle>
              <CardDescription className="text-white/50">
                {step === 1 && "Informacoes basicas de identificacao"}
                {step === 2 && "Formacao e registro profissional"}
                {step === 3 && "Areas de atuacao e confirmacao"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Dados Pessoais */}
              {step === 1 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Seu nome completo"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
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

                  <div className="grid gap-4 sm:grid-cols-2">
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
                </>
              )}

              {/* Step 2: Dados Profissionais */}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="formation" className="text-white">Formacao Academica *</Label>
                    <Input
                      id="formation"
                      value={formData.formation}
                      onChange={(e) => updateField("formation", e.target.value)}
                      placeholder="Ex: Eng. Ambiental, Quimico, Biologo..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution" className="text-white">Instituicao de Ensino</Label>
                    <Input
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => updateField("institution", e.target.value)}
                      placeholder="Onde voce se formou"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="registrationBody" className="text-white">Conselho Profissional *</Label>
                      <Select value={formData.registrationBody} onValueChange={(v) => updateField("registrationBody", v)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CREA">CREA</SelectItem>
                          <SelectItem value="CRQ">CRQ</SelectItem>
                          <SelectItem value="CRBio">CRBio</SelectItem>
                          <SelectItem value="CONFEA">CONFEA</SelectItem>
                          <SelectItem value="OUTRO">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber" className="text-white">Numero de Registro *</Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) => updateField("registrationNumber", e.target.value)}
                        placeholder="Ex: 123456/D"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience" className="text-white">Anos de Experiencia</Label>
                    <Select value={formData.yearsExperience} onValueChange={(v) => updateField("yearsExperience", v)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3">1 a 3 anos</SelectItem>
                        <SelectItem value="3-5">3 a 5 anos</SelectItem>
                        <SelectItem value="5-10">5 a 10 anos</SelectItem>
                        <SelectItem value="10+">Mais de 10 anos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedIn" className="text-white">LinkedIn (opcional)</Label>
                    <Input
                      id="linkedIn"
                      value={formData.linkedIn}
                      onChange={(e) => updateField("linkedIn", e.target.value)}
                      placeholder="https://linkedin.com/in/seu-perfil"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </>
              )}

              {/* Step 3: Especialidades */}
              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label className="text-white">Especialidades *</Label>
                    <p className="text-xs text-white/50">Selecione as areas em que voce tem experiencia para certificar</p>
                    <div className="grid gap-2 sm:grid-cols-2 mt-2">
                      {ESPECIALIDADES.map((spec) => (
                        <div
                          key={spec.value}
                          onClick={() => toggleSpecialty(spec.value)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            formData.specialties.includes(spec.value)
                              ? "bg-purple-500/20 border-purple-500/50 text-white"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              checked={formData.specialties.includes(spec.value)}
                              className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                            />
                            <span className="text-sm">{spec.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="curriculum" className="text-white">Resumo da Experiencia</Label>
                    <Textarea
                      id="curriculum"
                      value={formData.curriculum}
                      onChange={(e) => updateField("curriculum", e.target.value)}
                      placeholder="Descreva brevemente sua experiencia profissional em auditoria ou certificacao ambiental..."
                      rows={4}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
                    />
                  </div>

                  {/* Termos */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                        className="mt-1 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                      />
                      <label htmlFor="terms" className="text-sm text-white/70 cursor-pointer">
                        Declaro que as informacoes fornecidas sao verdadeiras e que possuo as qualificacoes necessarias para atuar como Analista Certificador. Aceito os{" "}
                        <Link href="/termos" className="text-purple-400 hover:text-purple-300">
                          Termos de Uso
                        </Link>{" "}
                        e o{" "}
                        <Link href="/codigo-etica" className="text-purple-400 hover:text-purple-300">
                          Codigo de Etica
                        </Link>{" "}
                        da plataforma STHATION.
                      </label>
                    </div>
                  </div>

                  {/* Resumo */}
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <h4 className="font-semibold text-white mb-3">Resumo do Cadastro</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Nome:</span>
                        <span className="text-white">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Formacao:</span>
                        <span className="text-white">{formData.formation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Registro:</span>
                        <span className="text-white">{formData.registrationBody} {formData.registrationNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Especialidades:</span>
                        <span className="text-white">{formData.specialties.length} area(s)</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Voltar
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
                    className="flex-1 bg-purple-500 hover:bg-purple-400 text-white"
                  >
                    Proximo
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isLoading}
                    className="flex-1 bg-purple-500 hover:bg-purple-400 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Cadastro"
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-white/40">
            <p>Ja tem uma conta? <Link href="/login" className="text-teal-400 hover:text-teal-300">Faca login</Link></p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

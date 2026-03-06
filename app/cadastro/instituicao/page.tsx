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
import { useToast } from "@/hooks/use-toast"
import { Building2, Loader2, CheckCircle, ArrowLeft, MapPin, User, Phone, Globe, FileText, QrCode, Key, Mail, Smartphone } from "lucide-react"

const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

export default function CadastroInstituicaoPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)

  // Dados do formulario
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    type: "",
    description: "",
    city: "",
    state: "",
    address: "",
    phone: "",
    website: "",
    responsibleName: "",
    responsibleEmail: "",
    responsiblePhone: "",
    // Dados PIX
    pixKey: "",
    pixKeyType: "",
    pixHolderName: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
    if (!token) {
      toast({
        title: "Erro",
        description: "Voce precisa estar logado para cadastrar uma instituicao",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/institutions/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess(true)
        toast({
          title: "Cadastro enviado!",
          description: "Sua instituicao foi cadastrada e aguarda aprovacao.",
        })
      } else {
        toast({
          title: "Erro no cadastro",
          description: data.error || "Erro ao cadastrar instituicao",
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

  const canProceedStep1 = formData.name && formData.cnpj.length >= 14 && formData.type && formData.description
  const canProceedStep2 = formData.city && formData.state
  const canSubmit = canProceedStep1 && canProceedStep2

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
                <h2 className="text-2xl font-bold text-white mb-2">Cadastro Enviado!</h2>
                <p className="text-white/60">
                  Sua instituicao foi cadastrada com sucesso e esta aguardando aprovacao da equipe STHATION.
                </p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <p className="text-sm text-amber-400">
                  Voce recebera um email quando sua instituicao for aprovada. Isso pode levar ate 48 horas uteis.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full bg-teal-500 hover:bg-teal-400 text-[#0a2f2f]">
                  <Link href="/dashboard">Ir para o Dashboard</Link>
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
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Cadastro de Instituicao</h1>
            <p className="text-white/60">
              Preencha os dados abaixo para cadastrar sua instituicao na plataforma STHATION NOBIS.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= s ? "bg-teal-500 text-[#0a2f2f]" : "bg-white/10 text-white/40"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && <div className={`flex-1 h-1 ${step > s ? "bg-teal-500" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>

          <Card className="bg-white/5 border-teal-400/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {step === 1 && <><Building2 className="h-5 w-5 text-teal-400" /> Dados da Instituicao</>}
                {step === 2 && <><MapPin className="h-5 w-5 text-teal-400" /> Localizacao</>}
                {step === 3 && <><User className="h-5 w-5 text-teal-400" /> Responsavel</>}
                {step === 4 && <><QrCode className="h-5 w-5 text-teal-400" /> Dados PIX</>}
              </CardTitle>
              <CardDescription className="text-white/50">
                {step === 1 && "Informacoes basicas da sua instituicao"}
                {step === 2 && "Endereco e localizacao"}
                {step === 3 && "Dados do responsavel pela conta"}
                {step === 4 && "Chave PIX para receber doacoes"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Dados basicos */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Nome da Instituicao *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Ex: Associacao Vida Nova"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj" className="text-white">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => updateField("cnpj", formatCNPJ(e.target.value))}
                      placeholder="00.000.000/0001-00"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-white">Tipo de Instituicao *</Label>
                    <Select value={formData.type} onValueChange={(v) => updateField("type", v)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOCIAL">Instituicao Social (ONG, Associacao, etc.)</SelectItem>
                        <SelectItem value="AMBIENTAL">Empresa Ambiental</SelectItem>
                        <SelectItem value="PREFEITURA">Prefeitura / Orgao Publico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Descricao *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Descreva a missao e atuacao da sua instituicao..."
                      rows={4}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
                    />
                  </div>
                </>
              )}

              {/* Step 2: Localizacao */}
              {step === 2 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-white">Cidade *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Ex: Sao Paulo"
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
                    <Label htmlFor="address" className="text-white">Endereco Completo</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="Rua, numero, bairro, CEP"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
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
                      <Label htmlFor="website" className="text-white">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => updateField("website", e.target.value)}
                          placeholder="https://..."
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Responsavel */}
              {step === 3 && (
                <>
                  <div className="bg-white/5 rounded-lg p-4 mb-4">
                    <p className="text-sm text-white/60">
                      O responsavel sera o contato principal da instituicao na plataforma STHATION.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsibleName" className="text-white">Nome do Responsavel</Label>
                    <Input
                      id="responsibleName"
                      value={formData.responsibleName}
                      onChange={(e) => updateField("responsibleName", e.target.value)}
                      placeholder="Nome completo"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsibleEmail" className="text-white">Email do Responsavel</Label>
                    <Input
                      id="responsibleEmail"
                      type="email"
                      value={formData.responsibleEmail}
                      onChange={(e) => updateField("responsibleEmail", e.target.value)}
                      placeholder="email@instituicao.org"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsiblePhone" className="text-white">Telefone do Responsavel</Label>
                    <Input
                      id="responsiblePhone"
                      value={formData.responsiblePhone}
                      onChange={(e) => updateField("responsiblePhone", formatPhone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </>
              )}

              {/* Step 4: PIX */}
              {step === 4 && (
                <>
                  <div className="bg-teal-500/10 rounded-lg p-4 mb-4 border border-teal-500/20">
                    <p className="text-sm text-teal-400">
                      Configure sua chave PIX para receber doacoes diretamente. Os doadores poderao escanear o QR Code ou copiar a chave.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pixKeyType" className="text-white">Tipo de Chave PIX *</Label>
                    <Select value={formData.pixKeyType} onValueChange={(v) => updateField("pixKeyType", v)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Selecione o tipo de chave" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CNPJ">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" /> CNPJ
                          </div>
                        </SelectItem>
                        <SelectItem value="CPF">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" /> CPF
                          </div>
                        </SelectItem>
                        <SelectItem value="EMAIL">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" /> E-mail
                          </div>
                        </SelectItem>
                        <SelectItem value="TELEFONE">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" /> Telefone
                          </div>
                        </SelectItem>
                        <SelectItem value="ALEATORIA">
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4" /> Chave Aleatoria
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pixKey" className="text-white">Chave PIX *</Label>
                    <Input
                      id="pixKey"
                      value={formData.pixKey}
                      onChange={(e) => updateField("pixKey", e.target.value)}
                      placeholder={
                        formData.pixKeyType === "CNPJ" ? "00.000.000/0001-00" :
                        formData.pixKeyType === "CPF" ? "000.000.000-00" :
                        formData.pixKeyType === "EMAIL" ? "email@instituicao.org" :
                        formData.pixKeyType === "TELEFONE" ? "+5511999999999" :
                        "Cole sua chave aleatoria aqui"
                      }
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pixHolderName" className="text-white">Nome do Titular *</Label>
                    <Input
                      id="pixHolderName"
                      value={formData.pixHolderName}
                      onChange={(e) => updateField("pixHolderName", e.target.value)}
                      placeholder="Nome que aparece na conta PIX"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                    <p className="text-xs text-white/40">
                      Este nome sera exibido para os doadores ao realizar o PIX.
                    </p>
                  </div>

                  {/* Resumo */}
                  <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-teal-400" />
                      Resumo do Cadastro
                    </h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Instituicao:</span>
                        <span className="text-white font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">CNPJ:</span>
                        <span className="text-white">{formData.cnpj}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Tipo:</span>
                        <span className="text-white">{formData.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Local:</span>
                        <span className="text-white">{formData.city}, {formData.state}</span>
                      </div>
                      {formData.pixKey && (
                        <div className="flex justify-between">
                          <span className="text-white/60">PIX ({formData.pixKeyType}):</span>
                          <span className="text-white font-mono text-xs">{formData.pixKey.slice(0, 15)}...</span>
                        </div>
                      )}
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
                {step < 4 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
                    className="flex-1 bg-teal-500 hover:bg-teal-400 text-[#0a2f2f]"
                  >
                    Proximo
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isLoading}
                    className="flex-1 bg-teal-500 hover:bg-teal-400 text-[#0a2f2f]"
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

          {/* Info */}
          <div className="mt-6 text-center text-sm text-white/40">
            <p>Apos o envio, sua instituicao sera analisada pela equipe STHATION.</p>
            <p>Voce sera notificado por email sobre a aprovacao.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

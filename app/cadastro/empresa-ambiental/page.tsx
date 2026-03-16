"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Building2, Loader2, Leaf, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  empresaAmbientalSchema,
  maskCNPJ,
  maskCPF,
  maskPhone,
  maskCEP,
  BRAZILIAN_STATES,
  ENVIRONMENTAL_SECTORS,
  ENVIRONMENTAL_CERTIFICATIONS,
} from "@/lib/validations"

type FormData = z.infer<typeof empresaAmbientalSchema>

export default function CadastroEmpresaAmbientalPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(empresaAmbientalSchema),
    defaultValues: {
      certifications: [],
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.companyName,
          role: "EMPRESA_AMBIENTAL",
          phone: data.phone.replace(/\D/g, ""),
          cpfCnpj: data.cnpj.replace(/\D/g, ""),
          institutionData: {
            name: data.companyName,
            cnpj: data.cnpj.replace(/\D/g, ""),
            type: "EMPRESA_AMBIENTAL",
            description: data.description,
            city: data.city,
            state: data.state,
            street: data.street,
            number: data.number,
            neighborhood: data.neighborhood,
            cep: data.cep.replace(/\D/g, ""),
            phone: data.phone.replace(/\D/g, ""),
            website: data.website || null,
            responsibleName: data.responsibleName,
            responsibleCpf: data.responsibleCpf.replace(/\D/g, ""),
            sector: data.sector,
            certifications: selectedCertifications,
          },
        }),
      })

      const result = await res.json()

      if (res.ok) {
        toast({
          title: "Cadastro realizado!",
          description: "Sua empresa foi cadastrada com sucesso. Faca login para continuar.",
        })
        router.push("/login")
      } else {
        toast({
          title: "Erro no cadastro",
          description: result.error || "Erro ao cadastrar empresa",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar cadastro",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCertification = (cert: string) => {
    setSelectedCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8">
      <div className="container max-w-2xl">
        <Link
          href="/cadastro"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para tipos de cadastro
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Building2 className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">Cadastro de Empresa Ambiental</CardTitle>
            <CardDescription>
              Cadastre sua empresa para certificar projetos ambientais e gerar creditos de carbono
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados da Empresa */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  Dados da Empresa
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label htmlFor="companyName">Razao Social *</Label>
                    <Input
                      id="companyName"
                      {...register("companyName")}
                      placeholder="Nome completo da empresa"
                    />
                    {errors.companyName && (
                      <p className="text-sm text-red-500 mt-1">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      {...register("cnpj")}
                      placeholder="00.000.000/0000-00"
                      onChange={(e) => setValue("cnpj", maskCNPJ(e.target.value))}
                    />
                    {errors.cnpj && (
                      <p className="text-sm text-red-500 mt-1">{errors.cnpj.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="sector">Setor de Atuacao *</Label>
                    <Select onValueChange={(value) => setValue("sector", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {ENVIRONMENTAL_SECTORS.map((sector) => (
                          <SelectItem key={sector.value} value={sector.value}>
                            {sector.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sector && (
                      <p className="text-sm text-red-500 mt-1">{errors.sector.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Acesso */}
              <div className="space-y-4">
                <h3 className="font-semibold">Dados de Acesso</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="contato@empresa.com.br"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      placeholder="Minimo 6 caracteres"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Responsavel */}
              <div className="space-y-4">
                <h3 className="font-semibold">Responsavel Legal</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="responsibleName">Nome Completo *</Label>
                    <Input
                      id="responsibleName"
                      {...register("responsibleName")}
                      placeholder="Nome do responsavel"
                    />
                    {errors.responsibleName && (
                      <p className="text-sm text-red-500 mt-1">{errors.responsibleName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="responsibleCpf">CPF *</Label>
                    <Input
                      id="responsibleCpf"
                      {...register("responsibleCpf")}
                      placeholder="000.000.000-00"
                      onChange={(e) => setValue("responsibleCpf", maskCPF(e.target.value))}
                    />
                    {errors.responsibleCpf && (
                      <p className="text-sm text-red-500 mt-1">{errors.responsibleCpf.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="(00) 00000-0000"
                      onChange={(e) => setValue("phone", maskPhone(e.target.value))}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Endereco */}
              <div className="space-y-4">
                <h3 className="font-semibold">Endereco</h3>
                <div className="grid gap-4 md:grid-cols-6">
                  <div className="md:col-span-4">
                    <Label htmlFor="street">Rua/Avenida *</Label>
                    <Input id="street" {...register("street")} placeholder="Endereco" />
                    {errors.street && (
                      <p className="text-sm text-red-500 mt-1">{errors.street.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="number">Numero *</Label>
                    <Input id="number" {...register("number")} placeholder="123" />
                    {errors.number && (
                      <p className="text-sm text-red-500 mt-1">{errors.number.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-3">
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input id="neighborhood" {...register("neighborhood")} placeholder="Bairro" />
                    {errors.neighborhood && (
                      <p className="text-sm text-red-500 mt-1">{errors.neighborhood.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-3">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      {...register("cep")}
                      placeholder="00000-000"
                      onChange={(e) => setValue("cep", maskCEP(e.target.value))}
                    />
                    {errors.cep && (
                      <p className="text-sm text-red-500 mt-1">{errors.cep.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-4">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input id="city" {...register("city")} placeholder="Cidade" />
                    {errors.city && (
                      <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Select onValueChange={(value) => setValue("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAZILIAN_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.value} - {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Descricao */}
              <div className="space-y-4">
                <h3 className="font-semibold">Sobre a Empresa</h3>
                <div>
                  <Label htmlFor="description">Descricao da Empresa *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Descreva as atividades e objetivos ambientais da empresa (minimo 50 caracteres)"
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="website">Website (opcional)</Label>
                  <Input
                    id="website"
                    {...register("website")}
                    placeholder="https://www.suaempresa.com.br"
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
                  )}
                </div>
              </div>

              {/* Certificacoes */}
              <div className="space-y-4">
                <h3 className="font-semibold">Certificacoes Existentes (opcional)</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {ENVIRONMENTAL_CERTIFICATIONS.map((cert) => (
                    <div key={cert.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={cert.value}
                        checked={selectedCertifications.includes(cert.value)}
                        onCheckedChange={() => toggleCertification(cert.value)}
                      />
                      <Label htmlFor={cert.value} className="text-sm font-normal cursor-pointer">
                        {cert.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Cadastrar Empresa
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Ja tem uma conta?{" "}
                <Link href="/login" className="text-emerald-600 hover:underline">
                  Faca login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

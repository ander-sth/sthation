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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Landmark, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  prefeituraSchema,
  maskCNPJ,
  maskPhone,
  BRAZILIAN_STATES,
} from "@/lib/validations"

type FormData = z.infer<typeof prefeituraSchema>

export default function CadastroPrefeituraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(prefeituraSchema),
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
          name: `Prefeitura de ${data.municipalityName}`,
          role: "PREFEITURA",
          phone: data.phone.replace(/\D/g, ""),
          cpfCnpj: data.cnpj.replace(/\D/g, ""),
          institutionData: {
            name: `Prefeitura Municipal de ${data.municipalityName}`,
            cnpj: data.cnpj.replace(/\D/g, ""),
            type: "PREFEITURA",
            description: `Prefeitura Municipal de ${data.municipalityName} - ${data.state}`,
            city: data.municipalityName,
            state: data.state,
            phone: data.phone.replace(/\D/g, ""),
            website: data.website || null,
            responsibleName: data.responsibleName,
            responsibleRole: data.responsibleRole,
            mayorName: data.mayorName,
            population: data.population,
          },
        }),
      })

      const result = await res.json()

      if (res.ok) {
        toast({
          title: "Cadastro realizado!",
          description: "Prefeitura cadastrada com sucesso. Faca login para continuar.",
        })
        router.push("/login")
      } else {
        toast({
          title: "Erro no cadastro",
          description: result.error || "Erro ao cadastrar prefeitura",
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Landmark className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Cadastro de Prefeitura</CardTitle>
            <CardDescription>
              Cadastre sua prefeitura para acessar servicos de certificacao ambiental on-demand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados do Municipio */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  Dados do Municipio
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label htmlFor="municipalityName">Nome do Municipio *</Label>
                    <Input
                      id="municipalityName"
                      {...register("municipalityName")}
                      placeholder="Ex: Sao Paulo"
                    />
                    {errors.municipalityName && (
                      <p className="text-sm text-red-500 mt-1">{errors.municipalityName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Select onValueChange={(value) => setValue("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
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

                  <div>
                    <Label htmlFor="cnpj">CNPJ da Prefeitura *</Label>
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
                    <Label htmlFor="population">Populacao do Municipio *</Label>
                    <Input
                      id="population"
                      type="number"
                      {...register("population")}
                      placeholder="Ex: 500000"
                    />
                    {errors.population && (
                      <p className="text-sm text-red-500 mt-1">{errors.population.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="mayorName">Nome do Prefeito(a) *</Label>
                    <Input
                      id="mayorName"
                      {...register("mayorName")}
                      placeholder="Nome completo"
                    />
                    {errors.mayorName && (
                      <p className="text-sm text-red-500 mt-1">{errors.mayorName.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Responsavel Tecnico */}
              <div className="space-y-4">
                <h3 className="font-semibold">Responsavel Tecnico</h3>
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
                    <Label htmlFor="responsibleRole">Cargo *</Label>
                    <Input
                      id="responsibleRole"
                      {...register("responsibleRole")}
                      placeholder="Ex: Secretario de Meio Ambiente"
                    />
                    {errors.responsibleRole && (
                      <p className="text-sm text-red-500 mt-1">{errors.responsibleRole.message}</p>
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

              {/* Acesso */}
              <div className="space-y-4">
                <h3 className="font-semibold">Dados de Acesso</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Email Institucional *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="contato@prefeitura.gov.br"
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

              {/* Website */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="website">Site Oficial (opcional)</Label>
                  <Input
                    id="website"
                    {...register("website")}
                    placeholder="https://www.prefeitura.gov.br"
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Cadastrar Prefeitura
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Ja tem uma conta?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
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

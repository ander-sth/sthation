"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Upload, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const categories = [
  "Alimentacao",
  "Educacao",
  "Assistencia Social",
  "Capacitacao Profissional",
  "Saude",
  "Moradia",
  "Protecao Animal",
  "Cultura e Lazer",
]

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    startDate: "",
    endDate: "",
    targetImpact: "",
    budget: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Projeto criado!",
        description: "Seu projeto IAC foi cadastrado com sucesso.",
      })
      router.push("/dashboard/projects")
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao criar projeto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Projeto IAC</h1>
          <p className="text-foreground/60">Cadastre um novo projeto de impacto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Descreva seu projeto de impacto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Projeto</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Cozinha Comunitaria Esperanca"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente o projeto, objetivos e metodologia..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
                      <Input
                        id="location"
                        placeholder="Cidade, Estado"
                        className="pl-9"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cronograma e Metas</CardTitle>
                <CardDescription>Defina prazos e impacto esperado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
                      <Input
                        id="startDate"
                        type="date"
                        className="pl-9"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Término</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
                      <Input
                        id="endDate"
                        type="date"
                        className="pl-9"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetImpact">Meta de Impacto</Label>
                  <Input
                    id="targetImpact"
                    placeholder="Ex: Plantar 10.000 árvores, capturar 500 toneladas de CO2"
                    value={formData.targetImpact}
                    onChange={(e) => setFormData({ ...formData, targetImpact: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Orçamento Estimado (R$)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0,00"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evidências</CardTitle>
                <CardDescription>Adicione fotos e documentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center">
                  <Upload className="mb-4 h-10 w-10 text-foreground/60" />
                  <p className="mb-2 text-sm font-medium">Arraste arquivos ou clique para upload</p>
                  <p className="text-xs text-foreground/60">PNG, JPG, PDF até 10MB</p>
                  <Button variant="outline" className="mt-4 bg-transparent">
                    Selecionar Arquivos
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Projeto"
                  )}
                </Button>
                <Button type="button" variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/dashboard/projects">Cancelar</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

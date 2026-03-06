"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Send, MoreHorizontal, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500/10 text-gray-500",
  EXECUTING: "bg-blue-500/10 text-blue-500",
  SUBMITTED: "bg-amber-500/10 text-amber-500",
  LOCKED: "bg-purple-500/10 text-purple-500",
  VALIDATED: "bg-emerald-500/10 text-emerald-500",
  REJECTED: "bg-red-500/10 text-red-500",
}

const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  EXECUTING: "Em Execução",
  SUBMITTED: "Submetido",
  LOCKED: "Bloqueado",
  VALIDATED: "Validado",
  REJECTED: "Rejeitado",
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Buscar projetos da API (dados reais)
  const { data, isLoading } = useSWR("/api/iac?limit=50", fetcher, {
    revalidateOnFocus: false,
  })

  const projects = (data?.projects || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status,
    createdAt: p.created_at || p.createdAt,
    institution: p.institution?.name || p.institution_name || "",
    category: p.category || "",
  }))

  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projetos IAC</h1>
          <p className="text-foreground/60">Gerencie seus projetos de impacto</p>
        </div>
        {(user?.role === "INSTITUTION" || user?.role === "ADMIN") && (
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
              <Input
                placeholder="Buscar projetos..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="DRAFT">Rascunho</SelectItem>
                <SelectItem value="EXECUTING">Em Execução</SelectItem>
                <SelectItem value="SUBMITTED">Submetido</SelectItem>
                <SelectItem value="VALIDATED">Validado</SelectItem>
                <SelectItem value="REJECTED">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-semibold">{project.title}</h3>
                    <Badge className={statusColors[project.status]}>{statusLabels[project.status]}</Badge>
                  </div>
                  <p className="mb-2 text-sm text-foreground/60">{project.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-foreground/60">
                    <span>{project.institution}</span>
                    <span>{project.category}</span>
                    <span>{project.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Eye className="mr-1 h-4 w-4" />
                      Ver
                    </Link>
                  </Button>
                  {project.status === "EXECUTING" && (
                    <Button size="sm">
                      <Send className="mr-1 h-4 w-4" />
                      Submeter
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Duplicar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="py-12 text-center text-foreground/60">Nenhum projeto encontrado</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

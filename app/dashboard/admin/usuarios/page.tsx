"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useApiData } from "@/hooks/use-api-data"
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Shield,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  name: string
  email: string
  role: string
  is_verified: boolean
  is_active: boolean
  checker_score: number | null
  created_at: string
  institution_name: string | null
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  DOADOR: "Doador",
  INSTITUICAO: "Instituicao",
  CHECKER: "Checker",
  ANALISTA_CERTIFICADOR: "Certificador",
  EMPRESA_AMBIENTAL: "Empresa Ambiental",
  PREFEITURA: "Prefeitura",
}

const roleBadgeColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800",
  DOADOR: "bg-blue-100 text-blue-800",
  INSTITUICAO: "bg-purple-100 text-purple-800",
  CHECKER: "bg-amber-100 text-amber-800",
  ANALISTA_CERTIFICADOR: "bg-emerald-100 text-emerald-800",
  EMPRESA_AMBIENTAL: "bg-teal-100 text-teal-800",
  PREFEITURA: "bg-indigo-100 text-indigo-800",
}

export default function AdminUsuariosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const { data, mutate } = useApiData<{ users: User[] }>("/api/admin/users", { users: [] })
  const users = data?.users || []

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || u.role === selectedRole
    return matchesSearch && matchesRole
  })

  const handleToggleVerified = async (userId: string, currentStatus: boolean) => {
    setIsUpdating(userId)
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, is_verified: !currentStatus }),
      })
      mutate()
    } catch (e) {
      console.error("Erro ao atualizar:", e)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setIsUpdating(userId)
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, is_active: !currentStatus }),
      })
      mutate()
    } catch (e) {
      console.error("Erro ao atualizar:", e)
    } finally {
      setIsUpdating(null)
    }
  }

  const usersByRole = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Gestao de Usuarios
        </h1>
        <p className="text-muted-foreground">Gerencie todos os usuarios da plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {users.filter((u) => u.is_verified).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Checkers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{usersByRole["CHECKER"] || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Certificadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {usersByRole["ANALISTA_CERTIFICADOR"] || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>Lista completa de usuarios cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(roleLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum usuario encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                          {user.institution_name && (
                            <p className="text-xs text-muted-foreground">{user.institution_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleBadgeColors[user.role] || "bg-gray-100"}>
                          {roleLabels[user.role] || user.role}
                        </Badge>
                        {user.checker_score !== null && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            Score: {user.checker_score}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.is_verified ? (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              <XCircle className="mr-1 h-3 w-3" />
                              Pendente
                            </Badge>
                          )}
                          {!user.is_active && (
                            <Badge variant="destructive">Inativo</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {isUpdating === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleToggleVerified(user.id, user.is_verified)}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                {user.is_verified ? "Remover verificacao" : "Verificar usuario"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleActive(user.id, user.is_active)}
                              >
                                {user.is_active ? (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Desativar usuario
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Ativar usuario
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

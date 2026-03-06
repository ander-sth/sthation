"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, UserPlus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// Mock users
const users = [
  { id: "1", name: "Admin STHATION", email: "admin@sthation.local", role: "ADMIN", createdAt: "2025-01-15" },
  { id: "2", name: "Maria Silva", email: "maria@ongverdevivo.org", role: "INSTITUTION", createdAt: "2025-06-20" },
  { id: "3", name: "João Santos", email: "joao@checker.com", role: "CHECKER", createdAt: "2025-08-10" },
  { id: "4", name: "Ana Oliveira", email: "ana@usuario.com", role: "USER", createdAt: "2025-09-05" },
  { id: "5", name: "Carlos Souza", email: "carlos@certificadora.com", role: "CERTIFIER", createdAt: "2025-10-12" },
]

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-500",
  USER: "bg-blue-500/10 text-blue-500",
  INSTITUTION: "bg-emerald-500/10 text-emerald-500",
  CHECKER: "bg-amber-500/10 text-amber-500",
  CERTIFIER: "bg-purple-500/10 text-purple-500",
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  USER: "Usuário",
  INSTITUTION: "Instituição",
  CHECKER: "Checker",
  CERTIFIER: "Certificadora",
}

export default function UsersPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  // Only admins can access this page
  if (user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Acesso Restrito</h2>
          <p className="text-foreground/60">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    )
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-foreground/60">Gerencie os usuários da plataforma</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
              <Input
                placeholder="Buscar usuários..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os papéis</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="USER">Usuário</SelectItem>
                <SelectItem value="INSTITUTION">Instituição</SelectItem>
                <SelectItem value="CHECKER">Checker</SelectItem>
                <SelectItem value="CERTIFIER">Certificadora</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-foreground/60">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[u.role]}>{roleLabels[u.role]}</Badge>
                  </TableCell>
                  <TableCell className="text-foreground/60">{u.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Desativar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

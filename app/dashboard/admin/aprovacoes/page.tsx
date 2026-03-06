"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Loader2,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Globe,
  FileText,
  User,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { UserRole } from "@/lib/types/users"

interface Institution {
  id: string
  name: string
  cnpj: string
  type: "SOCIAL" | "AMBIENTAL" | "PREFEITURA"
  description: string
  city: string
  state: string
  address?: string
  phone?: string
  website?: string
  responsible_name?: string
  responsible_email?: string
  responsible_phone?: string
  is_verified: boolean
  verified_at?: string
  rejection_reason?: string
  created_at: string
  user_email: string
  user_name: string
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  SOCIAL: { label: "Social", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  AMBIENTAL: { label: "Ambiental", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  PREFEITURA: { label: "Prefeitura", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
}

export default function AdminAprovacoesPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [search, setSearch] = useState("")
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Verificar se e admin
  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN) {
      router.push("/dashboard")
    }
  }, [user, router])

  // Carregar instituicoes
  const loadInstitutions = async () => {
    if (!token) return
    setIsLoading(true)

    try {
      const res = await fetch(`/api/admin/institutions?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setInstitutions(data.institutions || [])
      } else {
        toast({
          title: "Erro",
          description: "Erro ao carregar instituicoes",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInstitutions()
  }, [token, activeTab])

  // Aprovar instituicao
  const handleApprove = async (inst: Institution) => {
    if (!token) return
    setIsProcessing(true)

    try {
      const res = await fetch("/api/admin/institutions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          institutionId: inst.id,
          action: "approve",
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast({
          title: "Aprovado!",
          description: `Instituicao "${inst.name}" foi aprovada.`,
        })
        loadInstitutions()
        setSelectedInst(null)
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao aprovar",
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
      setIsProcessing(false)
    }
  }

  // Rejeitar instituicao
  const handleReject = async () => {
    if (!token || !selectedInst) return
    setIsProcessing(true)

    try {
      const res = await fetch("/api/admin/institutions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          institutionId: selectedInst.id,
          action: "reject",
          rejectionReason,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast({
          title: "Rejeitado",
          description: `Instituicao "${selectedInst.name}" foi rejeitada.`,
        })
        loadInstitutions()
        setShowRejectDialog(false)
        setSelectedInst(null)
        setRejectionReason("")
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao rejeitar",
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
      setIsProcessing(false)
    }
  }

  const filteredInstitutions = institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.cnpj.includes(search) ||
      i.city.toLowerCase().includes(search.toLowerCase())
  )

  const pendingCount = institutions.filter((i) => !i.is_verified).length

  if (user?.role !== UserRole.ADMIN) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Aprovacao de Instituicoes</h1>
            <p className="text-muted-foreground">
              Gerencie cadastros pendentes de instituicoes, empresas e prefeituras.
            </p>
          </div>
          <Button variant="outline" onClick={loadInstitutions} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {institutions.filter((i) => i.is_verified).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Aprovadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Building2 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{institutions.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs e Lista */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="pending" className="relative">
                    Pendentes
                    {pendingCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white">
                        {pendingCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="verified">Aprovadas</TabsTrigger>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CNPJ ou cidade..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-[300px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredInstitutions.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhuma instituicao encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInstitutions.map((inst) => (
                  <div
                    key={inst.id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{inst.name}</h3>
                              <Badge variant="outline" className={TYPE_LABELS[inst.type]?.color}>
                                {TYPE_LABELS[inst.type]?.label || inst.type}
                              </Badge>
                              {inst.is_verified ? (
                                <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Aprovada
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{inst.cnpj}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{inst.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {inst.city}, {inst.state}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {inst.user_email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(inst.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInst(inst)}
                        >
                          Ver Detalhes
                        </Button>
                        {!inst.is_verified && (
                          <>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-500"
                              onClick={() => handleApprove(inst)}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedInst(inst)
                                setShowRejectDialog(true)
                              }}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedInst && !showRejectDialog} onOpenChange={() => setSelectedInst(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedInst?.name}
            </DialogTitle>
            <DialogDescription>{selectedInst?.cnpj}</DialogDescription>
          </DialogHeader>
          {selectedInst && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="outline" className={TYPE_LABELS[selectedInst.type]?.color}>
                  {TYPE_LABELS[selectedInst.type]?.label}
                </Badge>
                {selectedInst.is_verified ? (
                  <Badge className="bg-emerald-500/20 text-emerald-500">Aprovada</Badge>
                ) : (
                  <Badge className="bg-amber-500/20 text-amber-500">Pendente</Badge>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-1">Descricao</h4>
                <p className="text-sm text-muted-foreground">{selectedInst.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Localizacao
                  </h4>
                  <p className="text-sm">{selectedInst.city}, {selectedInst.state}</p>
                  {selectedInst.address && (
                    <p className="text-sm text-muted-foreground">{selectedInst.address}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <User className="h-4 w-4" /> Conta
                  </h4>
                  <p className="text-sm">{selectedInst.user_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedInst.user_email}</p>
                </div>
              </div>

              {(selectedInst.phone || selectedInst.website) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedInst.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selectedInst.phone}
                    </div>
                  )}
                  {selectedInst.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={selectedInst.website} target="_blank" rel="noopener" className="text-primary hover:underline">
                        {selectedInst.website}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {selectedInst.responsible_name && (
                <div>
                  <h4 className="font-medium mb-2">Responsavel</h4>
                  <p className="text-sm">{selectedInst.responsible_name}</p>
                  {selectedInst.responsible_email && (
                    <p className="text-sm text-muted-foreground">{selectedInst.responsible_email}</p>
                  )}
                  {selectedInst.responsible_phone && (
                    <p className="text-sm text-muted-foreground">{selectedInst.responsible_phone}</p>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Cadastrada em {new Date(selectedInst.created_at).toLocaleString("pt-BR")}
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedInst && !selectedInst.is_verified && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeitar
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-500"
                  onClick={() => handleApprove(selectedInst)}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  Aprovar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Rejeicao */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Rejeitar Instituicao
            </DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeicao para "{selectedInst?.name}".
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo da rejeicao (ex: documentacao incompleta, CNPJ invalido, etc.)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason || isProcessing}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
              Confirmar Rejeicao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

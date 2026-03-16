"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileUpload } from "@/components/ui/file-upload"
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Shield, 
  Camera,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Key,
  Bell,
  Eye,
  EyeOff,
} from "lucide-react"
import { UserRole } from "@/types"

// Mapeamento de roles para labels
const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  DONOR: "Doador",
  INSTITUICAO: "Instituicao",
  CHECKER: "Checker",
  ANALISTA_CERTIFICADOR: "Certificador",
  EMPRESA_AMBIENTAL: "Empresa Ambiental",
  PREFEITURA: "Prefeitura",
}

export default function PerfilPage() {
  const { user, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  // Dados do perfil
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    avatar_url: "",
    city: "",
    state: "",
  })
  
  // Dados da senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState(false)

  // Carregar dados do perfil
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("sthation_token")
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (res.ok) {
        const data = await res.json()
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          bio: data.user.bio || "",
          avatar_url: data.user.avatar_url || "",
          city: data.user.city || "",
          state: data.user.state || "",
        })
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setMessage(null)
    
    try {
      const token = localStorage.getItem("sthation_token")
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
        refreshUser()
      } else {
        setMessage({ type: "error", text: data.error || "Erro ao atualizar perfil" })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erro ao atualizar perfil" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem" })
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres" })
      return
    }
    
    setIsSaving(true)
    setMessage(null)
    
    try {
      const token = localStorage.getItem("sthation_token")
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage({ type: "success", text: "Senha alterada com sucesso!" })
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        setMessage({ type: "error", text: data.error || "Erro ao alterar senha" })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erro ao alterar senha" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = (result: { url: string }) => {
    setFormData(prev => ({ ...prev, avatar_url: result.url }))
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informacoes pessoais e configuracoes da conta</p>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === "success" 
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
            : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
        }`}>
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Resumo do perfil */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatar_url} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5">
                <Camera className="h-4 w-4" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                <Badge variant="outline">{ROLE_LABELS[user.role] || user.role}</Badge>
                {user.isVerified && (
                  <Badge className="bg-emerald-600">Verificado</Badge>
                )}
                {user.role === UserRole.CHECKER && user.checkerScore && (
                  <Badge variant="secondary">Score: {user.checkerScore}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="security">Seguranca</TabsTrigger>
          <TabsTrigger value="notifications">Notificacoes</TabsTrigger>
        </TabsList>

        {/* Dados Pessoais */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informacoes Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informacoes pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar upload */}
              <div className="space-y-2">
                <Label>Foto de Perfil</Label>
                <FileUpload
                  type="image"
                  folder="avatars"
                  entityId={user.id}
                  onUpload={handleAvatarUpload}
                  label="Clique para fazer upload da foto"
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">O email nao pode ser alterado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="pl-10"
                      placeholder="Sua cidade"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Conte um pouco sobre voce..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Alteracoes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seguranca */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguranca
              </CardTitle>
              <CardDescription>
                Altere sua senha e configure a seguranca da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type={showPasswords ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="pl-10 pr-10"
                      placeholder="Digite sua senha atual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type={showPasswords ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Digite a nova senha"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type={showPasswords ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a nova senha"
                  />
                </div>
              </div>

              <Button onClick={handleChangePassword} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Key className="mr-2 h-4 w-4" />
                )}
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificacoes */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferencias de Notificacao
              </CardTitle>
              <CardDescription>
                Configure como deseja receber notificacoes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Em breve voce podera configurar suas preferencias de notificacao por email e no app.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

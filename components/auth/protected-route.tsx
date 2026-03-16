"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { UserRole } from "@/lib/types/users"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  fallbackUrl?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackUrl = "/dashboard",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Se nao esta logado, redireciona para login
      if (!user) {
        router.push("/login")
        return
      }

      // Se tem roles permitidos e o usuario nao tem permissao
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          router.push(fallbackUrl)
        }
      }
    }
  }, [user, isLoading, allowedRoles, router, fallbackUrl])

  // Mostra loading enquanto verifica
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#0a2f2f]" />
          <p className="text-sm text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  // Se nao tem usuario, nao renderiza nada (vai redirecionar)
  if (!user) {
    return null
  }

  // Se tem roles permitidos e o usuario nao tem permissao
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

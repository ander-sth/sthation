"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { UserRole, ROLE_PERMISSIONS } from "@/lib/types/users"

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  isVerified: boolean
  certifications?: string[]
  checkerScore?: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  can: (permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem("sthation_token")
    const savedUser = localStorage.getItem("sthation_user")
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (res.ok && data.success) {
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as UserRole,
        isVerified: data.user.isVerified,
      }
      setUser(userData)
      setToken(data.token)
      localStorage.setItem("sthation_token", data.token)
      localStorage.setItem("sthation_user", JSON.stringify(userData))
      localStorage.setItem("user_id", data.user.id)
      return
    }

    throw new Error(data.error || "Email ou senha invalidos")
  }

  const register = async (email: string, password: string, name: string, role: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role }),
    })

    const data = await res.json()

    if (res.ok && data.success) {
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as UserRole,
        isVerified: data.user.isVerified,
      }
      setUser(userData)
      setToken(data.token)
      localStorage.setItem("sthation_token", data.token)
      localStorage.setItem("sthation_user", JSON.stringify(userData))
      return
    }

    throw new Error(data.error || "Erro ao registrar")
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("sthation_token")
    localStorage.removeItem("sthation_user")
    localStorage.removeItem("user_id")
  }

  const can = (permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]): boolean => {
    if (!user) return false
    const permissions = ROLE_PERMISSIONS[user.role]
    return permissions ? (permissions[permission] as boolean) : false
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

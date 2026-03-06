"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Sidebar, MobileHeader } from "@/components/dashboard/sidebar"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop - hidden no mobile */}
      <Sidebar />

      <div className="flex flex-1 flex-col">
        {/* Header mobile com hamburger */}
        <MobileHeader />

        {/* Conteudo principal */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Error boundary caught:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-red-100 p-6">
            <AlertTriangle className="h-16 w-16 text-red-600" />
          </div>
        </div>
        
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Algo deu errado
        </h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          Ocorreu um erro inesperado. Nossa equipe foi notificada e esta 
          trabalhando para resolver o problema.
        </p>
        
        {error.digest && (
          <p className="mb-4 font-mono text-xs text-muted-foreground">
            Codigo do erro: {error.digest}
          </p>
        )}
        
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Ir para o inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

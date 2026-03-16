import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-primary/20">404</h1>
          <div className="relative -mt-16">
            <Search className="mx-auto h-24 w-24 text-muted-foreground/50" />
          </div>
        </div>
        
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Pagina nao encontrada
        </h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          A pagina que voce esta procurando pode ter sido removida, 
          teve seu nome alterado ou esta temporariamente indisponivel.
        </p>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Ir para o inicio
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas publicas que nao precisam de autenticacao
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/cadastro",
  "/projetos",
  "/hall-de-impacto",
  "/sobre",
  "/contato",
  "/termos",
  "/privacidade",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir assets estaticos e arquivos do Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next()
  }

  // Verificar se e rota publica
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Para rotas do dashboard, verificar se existe token no cookie
  // A verificacao real do token sera feita no client-side ou nas APIs
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("sthation_token")?.value
    
    // Se nao tem token no cookie, verificar se existe no localStorage via header
    // Como nao podemos acessar localStorage aqui, apenas deixamos passar
    // O AuthProvider no client-side ira redirecionar se nao estiver autenticado
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

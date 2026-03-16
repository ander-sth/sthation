import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sthation-nobis-secret-key-2025"
)

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

// Rotas de API publicas
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/public",
  "/api/projects",
  "/api/institutions",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir assets estaticos e arquivos do Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  // Verificar se e rota publica
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(
    (route) => pathname.startsWith(route)
  )

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next()
  }

  // Rotas protegidas (/dashboard/*)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/")) {
    const token = request.cookies.get("sthation_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      // Se for API, retorna 401
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Nao autorizado" },
          { status: 401 }
        )
      }
      // Se for pagina, redireciona para login
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      
      // Injetar dados do usuario nos headers da request
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", payload.userId as string)
      requestHeaders.set("x-user-role", payload.role as string)
      requestHeaders.set("x-user-email", payload.email as string)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error: any) {
      // Token invalido ou expirado
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Token invalido ou expirado" },
          { status: 401 }
        )
      }
      // Limpar cookie e redirecionar para login
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("sthation_token")
      return response
    }
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
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

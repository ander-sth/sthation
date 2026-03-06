import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sthation-nobis-secret-key-2025"
)

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Extrair token do header
    const authHeader = request.headers.get("Authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token nao fornecido" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]

    // Verificar e decodificar JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Buscar usuario atualizado no banco
    const users = await sql`
      SELECT id, email, name, role, is_verified, phone, document, created_at
      FROM users
      WHERE id = ${payload.userId as string}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Usuario nao encontrado" },
        { status: 404 }
      )
    }

    const user = users[0]

    // Buscar instituicao vinculada se existir
    let institution = null
    if (["INSTITUICAO", "EMPRESA_AMBIENTAL", "PREFEITURA"].includes(user.role)) {
      const institutions = await sql`
        SELECT id, name, cnpj, type, description, is_verified, city, state
        FROM institutions
        WHERE user_id = ${user.id}
      `
      if (institutions.length > 0) {
        institution = institutions[0]
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.is_verified,
        phone: user.phone,
        document: user.document,
        createdAt: user.created_at,
      },
      institution,
    })
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return NextResponse.json(
        { error: "Token expirado" },
        { status: 401 }
      )
    }
    console.error("[AUTH] Erro ao verificar token:", error)
    return NextResponse.json(
      { error: "Token invalido" },
      { status: 401 }
    )
  }
}

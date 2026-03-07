import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

// Schema real:
// users: id, email, password_hash, name, role, is_verified, is_active, phone, document
// institutions: id, name, cnpj, type, description, city, state, user_id, is_verified

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sthation-nobis-secret-key-2025"
)

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const authHeader = request.headers.get("Authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token nao fornecido" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Buscar usuario com colunas corretas do schema real
    const users = await sql`
      SELECT id, email, name, role, is_verified, is_active, phone, document, 
             avatar_url, checker_level, checker_score, validations_count, wallet_address,
             created_at, updated_at
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

    // Buscar instituicao vinculada pelo user_id (se for role de instituicao)
    let institution = null
    if (["INSTITUICAO", "EMPRESA_AMBIENTAL", "PREFEITURA"].includes(user.role)) {
      const institutions = await sql`
        SELECT id, name, cnpj, type, description, is_verified, city, state,
               phone, website, responsible_name, responsible_email, created_at
        FROM institutions
        WHERE user_id = ${user.id}
      `
      if (institutions.length > 0) {
        const inst = institutions[0]
        institution = {
          id: inst.id,
          name: inst.name,
          cnpj: inst.cnpj,
          document: inst.cnpj,
          type: inst.type,
          description: inst.description,
          isVerified: inst.is_verified,
          city: inst.city,
          state: inst.state,
          phone: inst.phone,
          website: inst.website,
          responsibleName: inst.responsible_name,
          responsibleEmail: inst.responsible_email,
          createdAt: inst.created_at,
        }
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.is_verified,
        isActive: user.is_active,
        phone: user.phone,
        document: user.document,
        avatarUrl: user.avatar_url,
        checkerLevel: user.checker_level,
        checkerScore: user.checker_score,
        validationsCount: user.validations_count,
        walletAddress: user.wallet_address,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      institution: institution,
      organization: institution, // alias para compatibilidade
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

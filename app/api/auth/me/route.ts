import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

// Usar tabelas corretas: users e organizations
// Schema users: id, email, password_hash, name, role, status, phone, document, organizationId, createdAt
// Schema organizations: id, name, document, type, description, isVerified, city, state

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

    // Buscar usuario com colunas corretas
    const users = await sql`
      SELECT id, email, name, role, status, phone, document, "organizationId", "createdAt"
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
    const isVerified = user.status === 'ACTIVE'

    // Buscar organizacao vinculada se existir
    let organization = null
    if (["INSTITUTION", "ENVIRONMENTAL_COMPANY", "GOV"].includes(user.role) && user.organizationId) {
      const orgs = await sql`
        SELECT id, name, document, type, description, "isVerified", city, state
        FROM organizations
        WHERE id = ${user.organizationId}
      `
      if (orgs.length > 0) {
        organization = {
          id: orgs[0].id,
          name: orgs[0].name,
          cnpj: orgs[0].document,
          document: orgs[0].document,
          type: orgs[0].type,
          description: orgs[0].description,
          isVerified: orgs[0].isVerified,
          city: orgs[0].city,
          state: orgs[0].state,
        }
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: isVerified,
        phone: user.phone,
        document: user.document,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
      },
      institution: organization,
      organization: organization,
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

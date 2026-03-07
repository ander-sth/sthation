import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

// Usar tabela organizations em vez de institutions

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sthation-nobis-secret-key-2025"
)

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not configured")
  }
  return neon(process.env.DATABASE_URL)
}

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Token nao fornecido", status: 401 }
  }

  const token = authHeader.split(" ")[1]
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (payload.role !== "ADMIN") {
      return { error: "Acesso negado. Apenas administradores.", status: 403 }
    }
    return { userId: payload.userId as string, role: payload.role }
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return { error: "Token expirado", status: 401 }
    }
    return { error: "Token invalido", status: 401 }
  }
}

// GET - Listar organizacoes (com filtro de pendentes)
export async function GET(request: Request) {
  const adminCheck = await verifyAdmin(request)
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  const sql = getDb()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const type = searchParams.get("type")

  let results
  if (status === "pending") {
    results = await sql`
      SELECT o.*, u.email as user_email, u.name as user_name
      FROM organizations o
      LEFT JOIN users u ON u."organizationId" = o.id
      WHERE o."isVerified" = false
      ORDER BY o."createdAt" DESC
    `
  } else if (status === "verified") {
    results = await sql`
      SELECT o.*, u.email as user_email, u.name as user_name
      FROM organizations o
      LEFT JOIN users u ON u."organizationId" = o.id
      WHERE o."isVerified" = true
      ORDER BY o."createdAt" DESC
    `
  } else {
    results = await sql`
      SELECT o.*, u.email as user_email, u.name as user_name
      FROM organizations o
      LEFT JOIN users u ON u."organizationId" = o.id
      ORDER BY o."isVerified" ASC, o."createdAt" DESC
    `
  }

  // Filtrar por tipo se especificado
  let institutions = (results || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    cnpj: r.document,
    document: r.document,
    type: r.type,
    description: r.description,
    isVerified: r.isVerified,
    city: r.city,
    state: r.state,
    userEmail: r.user_email,
    userName: r.user_name,
    createdAt: r.createdAt,
  }))

  if (type) {
    institutions = institutions.filter((i: any) => 
      i.type?.toLowerCase() === type.toLowerCase()
    )
  }

  return NextResponse.json({
    institutions,
    total: institutions.length,
  })
}

// PATCH - Aprovar ou rejeitar organizacao
export async function PATCH(request: Request) {
  const adminCheck = await verifyAdmin(request)
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  const sql = getDb()
  const body = await request.json()
  const { institutionId, organizationId, action, rejectionReason } = body

  const orgId = institutionId || organizationId

  if (!orgId || !action) {
    return NextResponse.json(
      { error: "institutionId/organizationId e action sao obrigatorios" },
      { status: 400 }
    )
  }

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "action deve ser 'approve' ou 'reject'" },
      { status: 400 }
    )
  }

  // Buscar organizacao
  const orgs = await sql`
    SELECT o.*, u.id as user_id, u.email as user_email
    FROM organizations o
    LEFT JOIN users u ON u."organizationId" = o.id
    WHERE o.id = ${orgId}
  `

  if (orgs.length === 0) {
    return NextResponse.json({ error: "Organizacao nao encontrada" }, { status: 404 })
  }

  const org = orgs[0]

  if (action === "approve") {
    await sql`
      UPDATE organizations
      SET "isVerified" = true, "updatedAt" = NOW()
      WHERE id = ${orgId}
    `

    // Atualizar status do usuario vinculado se existir
    if (org.user_id) {
      await sql`
        UPDATE users
        SET status = 'ACTIVE', "updatedAt" = NOW()
        WHERE id = ${org.user_id}
      `
    }

    console.log(`[ADMIN] Organizacao aprovada: ${org.name} (${org.type})`)

    return NextResponse.json({
      success: true,
      message: `Organizacao "${org.name}" aprovada com sucesso`,
      institution: { id: org.id, name: org.name, isVerified: true },
    })
  } else {
    console.log(`[ADMIN] Organizacao rejeitada: ${org.name} - ${rejectionReason}`)

    return NextResponse.json({
      success: true,
      message: `Organizacao "${org.name}" rejeitada`,
      institution: { id: org.id, name: org.name, isVerified: false },
    })
  }
}

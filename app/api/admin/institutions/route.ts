import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sthation-nobis-secret-key-2025"
)

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not configured")
  }
  return neon(process.env.DATABASE_URL)
}

// Verificar se usuario e admin
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

// GET - Listar instituicoes (com filtro de pendentes)
export async function GET(request: Request) {
  const adminCheck = await verifyAdmin(request)
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  const sql = getDb()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") // "pending", "verified", "all"
  const type = searchParams.get("type") // "SOCIAL", "AMBIENTAL", "PREFEITURA"

  let results
  if (status === "pending") {
    if (type) {
      results = await sql`
        SELECT i.*, u.email as user_email, u.name as user_name
        FROM institutions i
        JOIN users u ON i.user_id = u.id
        WHERE i.is_verified = false AND i.type = ${type}
        ORDER BY i.created_at DESC
      `
    } else {
      results = await sql`
        SELECT i.*, u.email as user_email, u.name as user_name
        FROM institutions i
        JOIN users u ON i.user_id = u.id
        WHERE i.is_verified = false
        ORDER BY i.created_at DESC
      `
    }
  } else if (status === "verified") {
    results = await sql`
      SELECT i.*, u.email as user_email, u.name as user_name
      FROM institutions i
      JOIN users u ON i.user_id = u.id
      WHERE i.is_verified = true
      ORDER BY i.created_at DESC
    `
  } else {
    results = await sql`
      SELECT i.*, u.email as user_email, u.name as user_name
      FROM institutions i
      JOIN users u ON i.user_id = u.id
      ORDER BY i.is_verified ASC, i.created_at DESC
    `
  }

  return NextResponse.json({
    institutions: results,
    total: results.length,
  })
}

// PATCH - Aprovar ou rejeitar instituicao
export async function PATCH(request: Request) {
  const adminCheck = await verifyAdmin(request)
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  const sql = getDb()
  const body = await request.json()
  const { institutionId, action, rejectionReason } = body

  if (!institutionId || !action) {
    return NextResponse.json(
      { error: "institutionId e action sao obrigatorios" },
      { status: 400 }
    )
  }

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "action deve ser 'approve' ou 'reject'" },
      { status: 400 }
    )
  }

  // Buscar instituicao
  const institutions = await sql`
    SELECT i.*, u.email as user_email, u.role as user_role
    FROM institutions i
    JOIN users u ON i.user_id = u.id
    WHERE i.id = ${institutionId}
  `

  if (institutions.length === 0) {
    return NextResponse.json({ error: "Instituicao nao encontrada" }, { status: 404 })
  }

  const inst = institutions[0]

  if (action === "approve") {
    // Aprovar instituicao
    await sql`
      UPDATE institutions
      SET is_verified = true, verified_at = NOW(), updated_at = NOW()
      WHERE id = ${institutionId}
    `

    // Verificar usuario tambem
    await sql`
      UPDATE users
      SET is_verified = true, updated_at = NOW()
      WHERE id = ${inst.user_id}
    `

    console.log(`[ADMIN] Instituicao aprovada: ${inst.name} (${inst.type})`)

    return NextResponse.json({
      success: true,
      message: `Instituicao "${inst.name}" aprovada com sucesso`,
      institution: { id: inst.id, name: inst.name, isVerified: true },
    })
  } else {
    // Rejeitar instituicao
    await sql`
      UPDATE institutions
      SET rejection_reason = ${rejectionReason || "Nao aprovado"}, updated_at = NOW()
      WHERE id = ${institutionId}
    `

    console.log(`[ADMIN] Instituicao rejeitada: ${inst.name} - ${rejectionReason}`)

    return NextResponse.json({
      success: true,
      message: `Instituicao "${inst.name}" rejeitada`,
      institution: { id: inst.id, name: inst.name, isVerified: false },
    })
  }
}

import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

// Schema real:
// institutions: id, name, cnpj, type, description, city, state, user_id, is_verified, verified_at, rejection_reason
// users: id, email, name, role, is_verified, is_active

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

// GET - Listar instituicoes (com filtro de pendentes)
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
  if (status === "pending" || status === "PENDING") {
    results = await sql`
      SELECT i.*, u.email as user_email, u.name as user_name
      FROM institutions i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.is_verified = false OR i.is_verified IS NULL
      ORDER BY i.created_at DESC
    `
  } else if (status === "verified" || status === "APPROVED") {
    results = await sql`
      SELECT i.*, u.email as user_email, u.name as user_name
      FROM institutions i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.is_verified = true
      ORDER BY i.created_at DESC
    `
  } else {
    results = await sql`
      SELECT i.*, u.email as user_email, u.name as user_name
      FROM institutions i
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.is_verified ASC, i.created_at DESC
    `
  }

  // Mapear para formato do frontend
  let institutions = (results || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    cnpj: r.cnpj,
    document: r.cnpj,
    type: r.type,
    description: r.description,
    isVerified: r.is_verified,
    verifiedAt: r.verified_at,
    rejectionReason: r.rejection_reason,
    city: r.city,
    state: r.state,
    phone: r.phone,
    website: r.website,
    responsibleName: r.responsible_name,
    responsibleEmail: r.responsible_email,
    responsiblePhone: r.responsible_phone,
    userId: r.user_id,
    userEmail: r.user_email,
    userName: r.user_name,
    createdAt: r.created_at,
    status: r.is_verified ? 'APPROVED' : 'PENDING',
  }))

  // Filtrar por tipo se especificado
  if (type) {
    institutions = institutions.filter((i: any) => 
      i.type?.toUpperCase() === type.toUpperCase()
    )
  }

  return NextResponse.json({
    institutions,
    total: institutions.length,
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
    SELECT i.*, u.id as uid, u.email as user_email
    FROM institutions i
    LEFT JOIN users u ON i.user_id = u.id
    WHERE i.id = ${institutionId}
  `

  if (institutions.length === 0) {
    return NextResponse.json({ error: "Instituicao nao encontrada" }, { status: 404 })
  }

  const inst = institutions[0]

  if (action === "approve") {
    await sql`
      UPDATE institutions
      SET is_verified = true, verified_at = NOW(), updated_at = NOW()
      WHERE id = ${institutionId}
    `

    // Atualizar usuario vinculado para ativo e verificado
    if (inst.uid) {
      await sql`
        UPDATE users
        SET is_verified = true, is_active = true, updated_at = NOW()
        WHERE id = ${inst.uid}
      `
    }

    console.log(`[ADMIN] Instituicao aprovada: ${inst.name} (${inst.type})`)

    return NextResponse.json({
      success: true,
      message: `Instituicao "${inst.name}" aprovada com sucesso`,
      institution: { id: inst.id, name: inst.name, isVerified: true },
    })
  } else {
    await sql`
      UPDATE institutions
      SET rejection_reason = ${rejectionReason || 'Cadastro nao aprovado'}, updated_at = NOW()
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

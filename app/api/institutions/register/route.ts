import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

// Usar tabela "organizations" que existe no banco
// Schema: id, name, type, description, document, logoUrl, website, address, city, state, phone, email, isVerified, createdAt, updatedAt

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sthation-nobis-secret-key-2025"
)

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }
  
  const sql = neon(process.env.DATABASE_URL)
  
  try {
    // Verificar autenticacao
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token nao fornecido" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    const body = await request.json()
    const { name, cnpj, type, description, city, state, address, phone, website, email } = body

    // Validacoes
    if (!name || !cnpj || !type || !description || !city || !state) {
      return NextResponse.json(
        { error: "Campos obrigatorios: name, cnpj, type, description, city, state" },
        { status: 400 }
      )
    }

    const validTypes = ["SOCIAL", "AMBIENTAL", "PREFEITURA", "social", "ambiental", "prefeitura"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Tipo invalido. Permitidos: SOCIAL, AMBIENTAL, PREFEITURA` },
        { status: 400 }
      )
    }

    // Verificar se CNPJ/documento ja existe
    const existingDoc = await sql`
      SELECT id FROM organizations WHERE document = ${cnpj}
    `
    if (existingDoc.length > 0) {
      return NextResponse.json(
        { error: "Este CNPJ ja esta cadastrado" },
        { status: 409 }
      )
    }

    // Criar organizacao (pendente de aprovacao)
    const newOrg = await sql`
      INSERT INTO organizations (
        name, document, type, description, city, state, 
        address, phone, website, email,
        "isVerified", "createdAt", "updatedAt"
      )
      VALUES (
        ${name},
        ${cnpj},
        ${type.toUpperCase()},
        ${description},
        ${city},
        ${state},
        ${address || null},
        ${phone || null},
        ${website || null},
        ${email || null},
        false,
        NOW(),
        NOW()
      )
      RETURNING id, name, document, type, "isVerified", city, state, "createdAt"
    `

    const organization = newOrg[0]

    // Atualizar o usuario para vincular a organizacao
    await sql`
      UPDATE users SET "organizationId" = ${organization.id}, "updatedAt" = NOW()
      WHERE id = ${userId}
    `

    console.log(`[INSTITUTION] Nova organizacao cadastrada: ${organization.name} (${organization.type}) - Pendente aprovacao`)

    return NextResponse.json({
      success: true,
      message: "Instituicao cadastrada com sucesso. Aguardando aprovacao do administrador.",
      institution: {
        id: organization.id,
        name: organization.name,
        cnpj: organization.document,
        document: organization.document,
        type: organization.type,
        isVerified: organization.isVerified,
        city: organization.city,
        state: organization.state,
      },
    })
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return NextResponse.json({ error: "Token expirado" }, { status: 401 })
    }
    console.error("[INSTITUTION] Erro ao cadastrar:", error)
    return NextResponse.json(
      { error: "Erro interno ao cadastrar instituicao" },
      { status: 500 }
    )
  }
}

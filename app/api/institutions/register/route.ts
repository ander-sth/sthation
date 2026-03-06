import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

const sql = neon(process.env.DATABASE_URL!)

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sthation-nobis-secret-key-2025"
)

export async function POST(request: Request) {
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
    const { name, cnpj, type, description, city, state, address, phone, website, responsibleName, responsibleEmail, responsiblePhone, pixKey, pixKeyType, pixHolderName } = body

    // Validacoes
    if (!name || !cnpj || !type || !description || !city || !state) {
      return NextResponse.json(
        { error: "Campos obrigatorios: name, cnpj, type, description, city, state" },
        { status: 400 }
      )
    }

    const validTypes = ["SOCIAL", "AMBIENTAL", "PREFEITURA"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Tipo invalido. Permitidos: ${validTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Verificar se CNPJ ja existe
    const existingCnpj = await sql`
      SELECT id FROM institutions WHERE cnpj = ${cnpj}
    `
    if (existingCnpj.length > 0) {
      return NextResponse.json(
        { error: "Este CNPJ ja esta cadastrado" },
        { status: 409 }
      )
    }

    // Verificar se usuario ja tem instituicao
    const existingInst = await sql`
      SELECT id FROM institutions WHERE user_id = ${userId}
    `
    if (existingInst.length > 0) {
      return NextResponse.json(
        { error: "Voce ja possui uma instituicao cadastrada" },
        { status: 409 }
      )
    }

    // Criar instituicao (pendente de aprovacao)
    const newInst = await sql`
      INSERT INTO institutions (
        user_id, name, cnpj, type, description, city, state, 
        address, phone, website, responsible_name, responsible_email, responsible_phone,
        pix_key, pix_key_type, pix_holder_name,
        is_verified, created_at, updated_at
      )
      VALUES (
        ${userId},
        ${name},
        ${cnpj},
        ${type},
        ${description},
        ${city},
        ${state},
        ${address || null},
        ${phone || null},
        ${website || null},
        ${responsibleName || null},
        ${responsibleEmail || null},
        ${responsiblePhone || null},
        ${pixKey || null},
        ${pixKeyType || null},
        ${pixHolderName || null},
        false,
        NOW(),
        NOW()
      )
      RETURNING id, name, cnpj, type, is_verified, city, state, created_at
    `

    const institution = newInst[0]

    console.log(`[INSTITUTION] Nova instituicao cadastrada: ${institution.name} (${institution.type}) - Pendente aprovacao`)

    return NextResponse.json({
      success: true,
      message: "Instituicao cadastrada com sucesso. Aguardando aprovacao do administrador.",
      institution: {
        id: institution.id,
        name: institution.name,
        cnpj: institution.cnpj,
        type: institution.type,
        isVerified: institution.is_verified,
        city: institution.city,
        state: institution.state,
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

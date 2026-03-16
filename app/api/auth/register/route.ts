// NOVA API REGISTER - USA gen_random_uuid() para ID
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "sthation-nobis-secret-key-2025")

// Mapear roles para valores validos no banco
// Valores permitidos: ADMIN, DOADOR, INSTITUICAO, EMPRESA_AMBIENTAL, PREFEITURA, CHECKER, ANALISTA_CERTIFICADOR
function mapRole(role: string): string {
  const roleUpper = (role || "").toUpperCase()
  const roleMap: Record<string, string> = {
    DOADOR: "DOADOR", 
    DONOR: "DOADOR",
    INSTITUICAO: "INSTITUICAO", 
    INSTITUICAO_SOCIAL: "INSTITUICAO",
    INSTITUTION: "INSTITUICAO",
    EMPRESA_AMBIENTAL: "EMPRESA_AMBIENTAL",
    ENVIRONMENTAL_COMPANY: "EMPRESA_AMBIENTAL",
    PREFEITURA: "PREFEITURA",
    GOV: "PREFEITURA",
    CHECKER: "CHECKER",
    VERIFICADOR: "CHECKER",
    ANALISTA_CERTIFICADOR: "ANALISTA_CERTIFICADOR",
    CERTIFICADOR: "ANALISTA_CERTIFICADOR",
    ADMIN: "ADMIN",
  }
  return roleMap[roleUpper] || "DOADOR"
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database nao configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const body = await req.json()
    const { email, password, name, role, phone, cpfCnpj, document, personType, companyName, institutionData } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, senha e nome sao obrigatorios" }, { status: 400 })
    }

    // Verificar se email ja existe
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email ja cadastrado" }, { status: 409 })
    }

    // Hash da senha
    const hash = await bcrypt.hash(password, 12)
    const finalRole = mapRole(role || "DONOR")
    const finalName = personType === "PJ" && companyName ? companyName : name
    const finalDoc = cpfCnpj || document || null
    const finalPhone = phone || null

    // Para CHECKER, iniciar com score 50
    const checkerScore = finalRole === "CHECKER" ? 50 : null
    // Para ANALISTA_CERTIFICADOR, iniciar como nao verificado
    const isVerified = finalRole === "ANALISTA_CERTIFICADOR" ? false : false

    // Criar usuario
    const result = await sql`
      INSERT INTO users (
        id, email, password_hash, name, role, phone, cpf, is_verified, is_active, checker_score
      ) VALUES (
        gen_random_uuid(),
        ${email.toLowerCase()},
        ${hash},
        ${finalName},
        ${finalRole},
        ${finalPhone},
        ${finalDoc},
        ${isVerified},
        true,
        ${checkerScore}
      )
      RETURNING id, email, name, role, is_verified, is_active, checker_score
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Falha ao criar usuario" }, { status: 500 })
    }

    const user = result[0]

    // Se houver dados de instituicao, criar registro em institutions
    let institutionId = null
    if (institutionData && ["INSTITUICAO", "EMPRESA_AMBIENTAL", "PREFEITURA"].includes(finalRole)) {
      const instResult = await sql`
        INSERT INTO institutions (
          id, user_id, name, cnpj, type, description, city, state, phone, website,
          responsible_name, responsible_email, is_verified, created_at
        ) VALUES (
          gen_random_uuid(),
          ${user.id},
          ${institutionData.name},
          ${institutionData.cnpj || null},
          ${institutionData.type || finalRole},
          ${institutionData.description || null},
          ${institutionData.city || null},
          ${institutionData.state || null},
          ${institutionData.phone || null},
          ${institutionData.website || null},
          ${institutionData.responsibleName || null},
          ${email.toLowerCase()},
          false,
          NOW()
        )
        RETURNING id, name
      `
      if (instResult.length > 0) {
        institutionId = instResult[0].id
      }
    }

    // Gerar JWT
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      institutionId: institutionId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(SECRET)

    return NextResponse.json({
      success: true,
      message: "Cadastro realizado com sucesso!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.is_verified,
        isActive: user.is_active,
        checkerScore: user.checker_score,
        institutionId: institutionId,
      },
      token,
    }, { status: 201 })
  } catch (e: any) {
    console.error("[REGISTER] Erro:", e)
    return NextResponse.json({ error: e.message || "Erro no cadastro" }, { status: 500 })
  }
}

// NOVA API REGISTER - USA gen_random_uuid() para ID
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "sthation-nobis-secret-key-2025")

// Mapear roles para enum UserRole valido
function mapRole(role: string): string {
  const roleMap: Record<string, string> = {
    DOADOR: "DONOR", doador: "DONOR", donor: "DONOR", DONOR: "DONOR",
    INSTITUICAO: "INSTITUTION", instituicao: "INSTITUTION", INSTITUICAO_SOCIAL: "INSTITUTION",
    EMPRESA_AMBIENTAL: "ENVIRONMENTAL_COMPANY", empresa_ambiental: "ENVIRONMENTAL_COMPANY",
    PREFEITURA: "GOV", prefeitura: "GOV", GOV: "GOV",
    VERIFICADOR: "VERIFIER", verificador: "VERIFIER", VERIFIER: "VERIFIER",
    VCA: "VCA",
    ADMIN: "ADMIN",
  }
  return roleMap[role] || "DONOR"
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database nao configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const body = await req.json()
    const { email, password, name, role, phone, cpfCnpj, document, personType, companyName } = body

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

    // IMPORTANTE: Usar gen_random_uuid() para gerar ID
    // E usar casts para enums: ::"UserRole" e ::"UserStatus"
    const result = await sql`
      INSERT INTO users (
        id, email, password_hash, "passwordHash", name, role, phone, document, status, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        ${email.toLowerCase()},
        ${hash},
        ${hash},
        ${finalName},
        ${finalRole}::"UserRole",
        ${finalPhone},
        ${finalDoc},
        'ACTIVE'::"UserStatus",
        NOW(),
        NOW()
      )
      RETURNING id, email, name, role::text as role, status::text as status, "createdAt"
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Falha ao criar usuario" }, { status: 500 })
    }

    const user = result[0]

    // Gerar JWT
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
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
        isVerified: user.status === "ACTIVE",
      },
      token,
    }, { status: 201 })
  } catch (e: any) {
    console.error("[REGISTER] Erro:", e)
    return NextResponse.json({ error: e.message || "Erro no cadastro" }, { status: 500 })
  }
}

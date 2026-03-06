// REGISTER API - NOVA VERSAO LIMPA
// Criado em 2024-03-06 para resolver problema de cache
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"

const JWT_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "sthation-nobis-secret-key-2025"
)

// Mapeamento de roles
const VALID_ROLES: Record<string, string> = {
  DONOR: "DONOR",
  DOADOR: "DONOR",
  INSTITUICAO: "INSTITUTION",
  INSTITUICAO_SOCIAL: "INSTITUTION",
  INSTITUTION: "INSTITUTION",
  EMPRESA_AMBIENTAL: "ENVIRONMENTAL_COMPANY",
  ENVIRONMENTAL_COMPANY: "ENVIRONMENTAL_COMPANY",
  PREFEITURA: "GOV",
  GOV: "GOV",
  CHECKER: "CHECKER",
  CERTIFIER: "CHECKER",
  ANALYST: "ANALYST",
  ADMIN: "ADMIN",
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    )
  }

  const db = neon(process.env.DATABASE_URL)

  try {
    const body = await request.json()
    const {
      email,
      password,
      name,
      role = "DONOR",
      phone,
      cpfCnpj,
      document,
      personType,
      companyName,
    } = body

    // Validacoes
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, senha e nome sao obrigatorios" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter no minimo 6 caracteres" },
        { status: 400 }
      )
    }

    // Mapear role
    const userRole = VALID_ROLES[role.toUpperCase()] || "DONOR"

    // Verificar email existente
    const existingUser = await db`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Este email ja esta cadastrado" },
        { status: 409 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Nome final
    const displayName = personType === "PJ" && companyName ? companyName : name

    // Documento
    const userDocument = cpfCnpj || document || null

    // IMPORTANTE: Usar gen_random_uuid() para gerar ID
    // Usar casts para enums: ::"UserRole" e ::"UserStatus"
    const newUserResult = await db`
      INSERT INTO users (
        id,
        email,
        password_hash,
        "passwordHash",
        name,
        role,
        phone,
        document,
        status,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        ${email.toLowerCase()},
        ${hashedPassword},
        ${hashedPassword},
        ${displayName},
        ${userRole}::"UserRole",
        ${phone || null},
        ${userDocument},
        'ACTIVE'::"UserStatus",
        NOW(),
        NOW()
      )
      RETURNING 
        id, 
        email, 
        name, 
        role::text as role, 
        status::text as status, 
        "createdAt"
    `

    const createdUser = newUserResult[0]

    // Gerar token JWT
    const jwtToken = await new SignJWT({
      userId: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      isVerified: createdUser.status === "ACTIVE",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_KEY)

    console.log(`[REGISTER] Novo usuario: ${createdUser.email} (${createdUser.role})`)

    return NextResponse.json({
      success: true,
      message: "Usuario registrado com sucesso",
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
        isVerified: createdUser.status === "ACTIVE",
      },
      token: jwtToken,
    })
  } catch (err: any) {
    console.error("[REGISTER] Erro:", err)
    return NextResponse.json(
      { error: "Erro interno ao registrar usuario" },
      { status: 500 }
    )
  }
}

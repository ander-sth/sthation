import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sthation-nobis-secret-key-2025"
)

// Mapeamento de roles do frontend para enum do banco
// Enum UserRole: ADMIN, INSTITUTION, DONOR, CHECKER, ANALYST, GOV, ENVIRONMENTAL_COMPANY
const ROLE_MAP: Record<string, string> = {
  "DONOR": "DONOR",
  "DOADOR": "DONOR",
  "INSTITUICAO": "INSTITUTION",
  "INSTITUICAO_SOCIAL": "INSTITUTION",
  "INSTITUTION": "INSTITUTION",
  "EMPRESA_AMBIENTAL": "ENVIRONMENTAL_COMPANY",
  "ENVIRONMENTAL_COMPANY": "ENVIRONMENTAL_COMPANY",
  "PREFEITURA": "GOV",
  "GOV": "GOV",
  "CHECKER": "CHECKER",
  "CERTIFIER": "CHECKER",
  "ANALYST": "ANALYST",
  "ADMIN": "ADMIN",
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const body = await request.json()
    const {
      email, password, name, role = "DONOR",
      phone, cpfCnpj, document,
      personType, companyName,
    } = body

    // Validacoes basicas
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

    // Mapear role para valor valido do enum
    const normalizedRole = ROLE_MAP[role.toUpperCase()] || "DONOR"

    // Verificar se email ja existe
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Este email ja esta cadastrado" },
        { status: 409 }
      )
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12)

    // Nome final
    const finalName = personType === "PJ" && companyName ? companyName : name

    // Criar usuario - IMPORTANTE: usar gen_random_uuid() para gerar o ID
    const newUser = await sql`
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
        ${passwordHash},
        ${passwordHash},
        ${finalName},
        ${normalizedRole}::"UserRole",
        ${phone || null},
        ${cpfCnpj || document || null},
        'ACTIVE'::"UserStatus",
        NOW(),
        NOW()
      )
      RETURNING id, email, name, role::text as role, status::text as status, "createdAt"
    `

    const user = newUser[0]

    // Gerar JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.status === "ACTIVE",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

    console.log(`[AUTH] Novo usuario registrado: ${user.email} (${user.role})`)

    return NextResponse.json({
      success: true,
      message: "Usuario registrado com sucesso",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.status === "ACTIVE",
      },
      token,
    })
  } catch (error: any) {
    console.error("[AUTH] Erro no registro:", error)
    return NextResponse.json(
      { error: "Erro interno ao registrar usuario" },
      { status: 500 }
    )
  }
}

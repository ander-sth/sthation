import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sthation-nobis-secret-key-2025"
)

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const body = await request.json()
    const { 
      email, password, name, role, phone, document,
      // Novos campos para diferentes tipos de usuario
      cpfCnpj, personType, city, state, companyName,
      // Campos para Checker
      profession, areasOfInterest, motivation,
      // Campos para Certificador
      formation, institution, registrationNumber, registrationBody, specialties, curriculum, linkedIn
    } = body

    // Validacoes basicas
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Campos obrigatorios: email, password, name, role" },
        { status: 400 }
      )
    }

    // Mapear roles do frontend para os valores validos do enum no banco
    // Enum UserRole: ADMIN, INSTITUTION, DONOR, CHECKER, ANALYST, GOV, ENVIRONMENTAL_COMPANY
    const roleMapping: Record<string, string> = {
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
    
    const normalizedRole = roleMapping[role.toUpperCase()]
    
    if (!normalizedRole) {
      return NextResponse.json(
        { error: `Role invalido: ${role}. Permitidos: DONOR, INSTITUTION, CHECKER, GOV, ENVIRONMENTAL_COMPANY, ANALYST` },
        { status: 400 }
      )
    }

    // Verificar se email ja existe
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Este email ja esta cadastrado" },
        { status: 409 }
      )
    }

    // Hash da senha com bcrypt
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Preparar metadata adicional
    const metadata = JSON.stringify({
      personType,
      city,
      state,
      companyName,
      profession,
      areasOfInterest,
      motivation,
      formation,
      institution,
      registrationNumber,
      registrationBody,
      specialties,
      curriculum,
      linkedIn,
    })

    // Criar usuario - usando colunas que existem no schema atual
    // Schema: id, email, password_hash, passwordHash, name, role, status, phone, document, metadata, createdAt, updatedAt
    const newUser = await sql`
      INSERT INTO users (email, password_hash, "passwordHash", name, role, phone, document, status, metadata, "createdAt", "updatedAt")
      VALUES (
        ${email.toLowerCase()},
        ${passwordHash},
        ${passwordHash},
        ${personType === "PJ" && companyName ? companyName : name},
        ${normalizedRole},
        ${phone || null},
        ${cpfCnpj || document || null},
        'ACTIVE',
        ${metadata}::jsonb,
        NOW(),
        NOW()
      )
      RETURNING id, email, name, role, status, "createdAt"
    `

    const user = newUser[0]
    const isVerified = user.status === 'ACTIVE'

    // Gerar JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      isVerified: isVerified,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

    // Log de registro
    console.log(`[AUTH] Novo usuario registrado: ${user.email} (${user.role})`)

    return NextResponse.json({
      success: true,
      message: "Usuario registrado com sucesso",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: isVerified,
      },
      token,
    })
  } catch (error) {
    console.error("[AUTH] Erro no registro:", error)
    return NextResponse.json(
      { error: "Erro interno ao registrar usuario" },
      { status: 500 }
    )
  }
}

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

    // Validar role permitido
    const validRoles = ["DONOR", "DOADOR", "INSTITUICAO", "EMPRESA_AMBIENTAL", "PREFEITURA", "CHECKER", "CERTIFIER", "ADMIN"]
    const normalizedRole = role === "DONOR" ? "DOADOR" : (role === "CERTIFIER" ? "CHECKER" : role)
    
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Role invalido. Permitidos: ${validRoles.join(", ")}` },
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

    // Criar usuario
    const newUser = await sql`
      INSERT INTO users (email, password_hash, name, role, phone, document, is_verified, metadata, created_at, updated_at)
      VALUES (
        ${email.toLowerCase()},
        ${passwordHash},
        ${personType === "PJ" && companyName ? companyName : name},
        ${normalizedRole},
        ${phone || null},
        ${cpfCnpj || document || null},
        false,
        ${metadata}::jsonb,
        NOW(),
        NOW()
      )
      RETURNING id, email, name, role, is_verified, created_at
    `

    const user = newUser[0]

    // Gerar JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.is_verified,
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
        isVerified: user.is_verified,
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

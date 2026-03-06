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
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha sao obrigatorios" },
        { status: 400 }
      )
    }

    // Buscar usuario
    const users = await sql`
      SELECT id, email, password_hash, name, role, is_verified, created_at
      FROM users
      WHERE email = ${email.toLowerCase()}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      )
    }

    const user = users[0]

    // Verificar senha - primeiro tenta comparacao direta, depois bcrypt
    let passwordMatch = false
    
    // Comparacao direta (senha em texto plano)
    if (password === user.password_hash) {
      passwordMatch = true
    } else if (user.password_hash && user.password_hash.startsWith('$2')) {
      // Se comeca com $2, e um hash bcrypt
      try {
        passwordMatch = await bcrypt.compare(password, user.password_hash)
      } catch {
        passwordMatch = false
      }
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      )
    }

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

    // Log de login
    console.log(`[AUTH] Login: ${user.email} (${user.role})`)

    return NextResponse.json({
      success: true,
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
    console.error("[AUTH] Erro no login:", error)
    return NextResponse.json(
      { error: "Erro interno ao fazer login" },
      { status: 500 }
    )
  }
}

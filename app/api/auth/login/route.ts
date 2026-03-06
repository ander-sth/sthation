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

    // Buscar usuario - usando colunas que existem no schema atual
    // Schema: id, email, password_hash, passwordHash, name, role, status, etc.
    const users = await sql`
      SELECT id, email, password_hash, "passwordHash", name, role, status, "createdAt"
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
    
    // O banco pode ter senha em password_hash ou passwordHash
    const storedHash = user.password_hash || user.passwordHash
    
    console.log(`[v0] Login attempt for: ${email}`)
    console.log(`[v0] User found: ${user.email}, role: ${user.role}, status: ${user.status}`)
    console.log(`[v0] Has password_hash: ${!!user.password_hash}, Has passwordHash: ${!!user.passwordHash}`)
    console.log(`[v0] Stored hash starts with: ${storedHash?.substring(0, 10)}...`)

    // Verificar senha - primeiro tenta comparacao direta, depois bcrypt
    let passwordMatch = false
    
    // Comparacao direta (senha em texto plano)
    if (password === storedHash) {
      console.log(`[v0] Password matched via direct comparison`)
      passwordMatch = true
    } else if (storedHash && storedHash.startsWith('$2')) {
      // Se comeca com $2, e um hash bcrypt
      try {
        passwordMatch = await bcrypt.compare(password, storedHash)
        console.log(`[v0] Bcrypt comparison result: ${passwordMatch}`)
      } catch (bcryptError) {
        console.log(`[v0] Bcrypt error:`, bcryptError)
        passwordMatch = false
      }
    } else {
      console.log(`[v0] No valid hash found or hash format not recognized`)
    }

    if (!passwordMatch) {
      console.log(`[v0] Password did not match for ${email}`)
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      )
    }

    // Determinar se usuario esta verificado baseado no status
    const isVerified = user.status === 'active' || user.status === 'ACTIVE'

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

    // Log de login
    console.log(`[AUTH] Login: ${user.email} (${user.role})`)

    return NextResponse.json({
      success: true,
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
    console.error("[AUTH] Erro no login:", error)
    return NextResponse.json(
      { error: "Erro interno ao fazer login" },
      { status: 500 }
    )
  }
}

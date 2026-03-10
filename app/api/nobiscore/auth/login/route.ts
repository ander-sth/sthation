import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "nobiscore-secret-key-change-in-production"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email e senha sao obrigatorios" },
        { status: 400 }
      )
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, error: "Banco de dados nao configurado" },
        { status: 500 }
      )
    }

    const sql = neon(process.env.DATABASE_URL)

    // Buscar usuario na tabela nobiscore_users
    const users = await sql`
      SELECT id, email, password_hash, name, created_at
      FROM nobiscore_users
      WHERE email = ${email.toLowerCase()}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "Email ou senha incorretos" },
        { status: 401 }
      )
    }

    const user = users[0]

    // Verificar senha
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Email ou senha incorretos" },
        { status: 401 }
      )
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name,
        platform: "nobiscore"
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("[NOBISCORE AUTH LOGIN] Erro:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}

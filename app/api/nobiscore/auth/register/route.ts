import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "nobiscore-secret-key-change-in-production"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Nome, email e senha sao obrigatorios" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Senha deve ter no minimo 6 caracteres" },
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

    // Verificar se email ja existe
    const existing = await sql`
      SELECT id FROM nobiscore_users WHERE email = ${email.toLowerCase()}
    `

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "Este email ja esta cadastrado" },
        { status: 409 }
      )
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10)

    // Criar usuario
    const result = await sql`
      INSERT INTO nobiscore_users (id, name, email, password_hash, created_at)
      VALUES (gen_random_uuid(), ${name}, ${email.toLowerCase()}, ${passwordHash}, NOW())
      RETURNING id, name, email, created_at
    `

    const user = result[0]

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
      message: "Conta criada com sucesso!",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("[NOBISCORE AUTH REGISTER] Erro:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}

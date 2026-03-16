import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "sthation-secret-key-2024")

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) return null

  try {
    const token = authHeader.split(" ")[1]
    const { payload } = await jwtVerify(token, SECRET)
    return payload.userId as string
  } catch {
    return null
  }
}

// GET - Buscar perfil do usuario
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  const sql = neon(process.env.DATABASE_URL!)

  try {
    const result = await sql`
      SELECT id, email, name, role, phone, cpf, bio, avatar_url, city, state, 
             is_verified, checker_score, created_at
      FROM users WHERE id = ${userId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 })
    }

    const user = result[0]

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        cpf: user.cpf,
        bio: user.bio,
        avatar_url: user.avatar_url,
        city: user.city,
        state: user.state,
        is_verified: user.is_verified,
        checker_score: user.checker_score,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error("[PROFILE GET] Erro:", error)
    return NextResponse.json({ error: "Erro ao buscar perfil" }, { status: 500 })
  }
}

// PUT - Atualizar perfil do usuario
export async function PUT(request: NextRequest) {
  const userId = await getUserIdFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  const sql = neon(process.env.DATABASE_URL!)

  try {
    const body = await request.json()
    const { name, phone, bio, avatar_url, city, state } = body

    const result = await sql`
      UPDATE users SET
        name = COALESCE(${name}, name),
        phone = COALESCE(${phone}, phone),
        bio = COALESCE(${bio}, bio),
        avatar_url = COALESCE(${avatar_url}, avatar_url),
        city = COALESCE(${city}, city),
        state = COALESCE(${state}, state),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, name, role, phone, bio, avatar_url, city, state, is_verified
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: result[0],
    })
  } catch (error) {
    console.error("[PROFILE PUT] Erro:", error)
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 })
  }
}

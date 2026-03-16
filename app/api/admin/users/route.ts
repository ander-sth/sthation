import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database nao configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const users = await sql`
      SELECT 
        u.id, u.name, u.email, u.role, u.is_verified, u.is_active, 
        u.checker_score, u.created_at,
        i.name as institution_name
      FROM users u
      LEFT JOIN institutions i ON u.id = i.user_id
      ORDER BY u.created_at DESC
    `

    return NextResponse.json({ users })
  } catch (e: any) {
    console.error("[ADMIN USERS] Erro:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database nao configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const { userId, is_verified, is_active, role } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "userId obrigatorio" }, { status: 400 })
    }

    const updates: string[] = []
    const values: any[] = []

    if (is_verified !== undefined) {
      await sql`UPDATE users SET is_verified = ${is_verified} WHERE id = ${userId}`
    }

    if (is_active !== undefined) {
      await sql`UPDATE users SET is_active = ${is_active} WHERE id = ${userId}`
    }

    if (role !== undefined) {
      await sql`UPDATE users SET role = ${role} WHERE id = ${userId}`
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[ADMIN USERS PATCH] Erro:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

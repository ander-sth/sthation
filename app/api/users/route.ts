import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ users: [] })
  }

  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  try {
    if (email) {
      // Buscar usuario por email (usado no login)
      const users = await sql`
        SELECT 
          id, email, name, role, is_verified, is_active,
          checker_score, validations_count, checker_level,
          avatar_url, created_at
        FROM users
        WHERE email = ${email} AND is_active = true
      `

      if (!users || users.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ user: users[0] })
    }

    // Listar todos usuarios para admin
    const users = await sql`
      SELECT 
        id, email, name, role, is_verified, is_active,
        checker_score, validations_count, checker_level,
        created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', users: [] },
      { status: 500 }
    )
  }
}

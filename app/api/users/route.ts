import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

// Schema users: id, email, password_hash, passwordHash, name, role, status, phone, document, bio, avatarUrl, organizationId, createdAt, updatedAt
// Enum UserRole: ADMIN, INSTITUTION, DONOR, CHECKER, ANALYST, GOV, ENVIRONMENTAL_COMPANY
// Enum UserStatus: ACTIVE, INACTIVE, PENDING, SUSPENDED

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ users: [] })
  }

  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  try {
    if (email) {
      // Buscar usuario por email
      const users = await sql`
        SELECT 
          id, email, name, role, status, phone, document, bio,
          "avatarUrl", "organizationId", "createdAt"
        FROM users
        WHERE email = ${email} AND status = 'ACTIVE'
      `

      if (!users || users.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const user = users[0]
      return NextResponse.json({ 
        user: {
          ...user,
          isVerified: user.status === 'ACTIVE',
          isActive: user.status === 'ACTIVE',
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        }
      })
    }

    // Listar todos usuarios para admin
    const users = await sql`
      SELECT 
        id, email, name, role, status, phone, document,
        "avatarUrl", "organizationId", "createdAt", "updatedAt"
      FROM users
      ORDER BY "createdAt" DESC
    `

    const formattedUsers = (users || []).map((u: any) => ({
      ...u,
      isVerified: u.status === 'ACTIVE',
      isActive: u.status === 'ACTIVE',
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', users: [] },
      { status: 500 }
    )
  }
}

import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

// Schema users (real do banco):
// id, email, password_hash, name, role, is_verified, is_active, phone, document, avatar_url, 
// checker_level, checker_score, validations_count, wallet_address, metadata, created_at, updated_at

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ users: [] })
  }

  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const role = searchParams.get('role')
  const limit = parseInt(searchParams.get('limit') || '100')

  try {
    if (email) {
      // Buscar usuario por email
      const users = await sql`
        SELECT 
          id, email, name, role, is_verified, is_active, phone, document,
          avatar_url, checker_level, checker_score, validations_count,
          wallet_address, created_at, updated_at
        FROM users
        WHERE email = ${email}
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
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.is_verified,
          isActive: user.is_active,
          phone: user.phone,
          document: user.document,
          avatarUrl: user.avatar_url,
          checkerLevel: user.checker_level,
          checkerScore: user.checker_score,
          validationsCount: user.validations_count,
          walletAddress: user.wallet_address,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        }
      })
    }

    // Listar todos usuarios para admin
    let users
    if (role) {
      users = await sql`
        SELECT 
          id, email, name, role, is_verified, is_active, phone, document,
          avatar_url, checker_level, checker_score, validations_count,
          wallet_address, created_at, updated_at
        FROM users
        WHERE role = ${role}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    } else {
      users = await sql`
        SELECT 
          id, email, name, role, is_verified, is_active, phone, document,
          avatar_url, checker_level, checker_score, validations_count,
          wallet_address, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    }

    const formattedUsers = (users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isVerified: u.is_verified,
      isActive: u.is_active,
      is_verified: u.is_verified,
      is_active: u.is_active,
      phone: u.phone,
      document: u.document,
      avatarUrl: u.avatar_url,
      checkerLevel: u.checker_level,
      checkerScore: u.checker_score,
      validationsCount: u.validations_count,
      walletAddress: u.wallet_address,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }))

    return NextResponse.json({ users: formattedUsers, total: formattedUsers.length })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', users: [] },
      { status: 500 }
    )
  }
}

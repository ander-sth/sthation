import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// Usar tabelas corretas: users tem organizationId que aponta para organizations

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ institution: null })
  }
  
  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("user_id")

  if (!userId) {
    return NextResponse.json({ institution: null })
  }

  try {
    // Buscar organizacao atraves do organizationId do usuario
    const results = await sql`
      SELECT o.* 
      FROM organizations o
      JOIN users u ON u."organizationId" = o.id
      WHERE u.id = ${userId}
      LIMIT 1
    `

    if (results.length === 0) {
      return NextResponse.json({ institution: null })
    }

    const org = results[0]
    return NextResponse.json({ 
      institution: {
        id: org.id,
        name: org.name,
        cnpj: org.document,
        document: org.document,
        type: org.type,
        description: org.description,
        isVerified: org.isVerified,
        city: org.city,
        state: org.state,
        phone: org.phone,
        email: org.email,
        website: org.website,
        createdAt: org.createdAt,
      }
    })
  } catch (error) {
    console.error("Error fetching institution:", error)
    return NextResponse.json({ institution: null })
  }
}

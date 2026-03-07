import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// Schema real:
// institutions: id, name, cnpj, type, description, city, state, user_id, is_verified

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
    // Buscar instituicao pelo user_id (coluna correta no schema)
    const results = await sql`
      SELECT * 
      FROM institutions
      WHERE user_id = ${userId}
      LIMIT 1
    `

    if (results.length === 0) {
      return NextResponse.json({ institution: null })
    }

    const inst = results[0]
    return NextResponse.json({ 
      institution: {
        id: inst.id,
        name: inst.name,
        cnpj: inst.cnpj,
        document: inst.cnpj,
        type: inst.type,
        description: inst.description,
        isVerified: inst.is_verified,
        city: inst.city,
        state: inst.state,
        phone: inst.phone,
        website: inst.website,
        responsibleName: inst.responsible_name,
        responsibleEmail: inst.responsible_email,
        responsiblePhone: inst.responsible_phone,
        createdAt: inst.created_at,
      }
    })
  } catch (error) {
    console.error("Error fetching institution:", error)
    return NextResponse.json({ institution: null })
  }
}

import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

// Usar tabela "organizations" que existe no banco
// Schema: id, name, type, description, document, logoUrl, website, address, city, state, phone, email, isVerified, createdAt, updatedAt

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ institutions: [], total: 0 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const limit = parseInt(searchParams.get("limit") || "50")

    const rows = await sql`
      SELECT 
        id,
        name,
        document,
        type,
        description,
        "isVerified",
        city,
        state,
        phone,
        email,
        website,
        "logoUrl",
        "createdAt"
      FROM organizations
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `
    
    let institutions = (rows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      cnpj: row.document,
      document: row.document,
      type: row.type,
      description: row.description,
      isVerified: row.isVerified,
      city: row.city,
      state: row.state,
      phone: row.phone,
      email: row.email,
      website: row.website,
      logoUrl: row.logoUrl,
      createdAt: row.createdAt,
    }))

    // Filtrar por tipo se especificado
    if (type) {
      institutions = institutions.filter((i: any) => 
        i.type?.toLowerCase() === type.toLowerCase()
      )
    }

    return NextResponse.json({ institutions, total: institutions.length })
  } catch (error) {
    console.error("[API] Error fetching institutions:", error)
    return NextResponse.json(
      { error: "Failed to fetch institutions", institutions: [] },
      { status: 500 }
    )
  }
}

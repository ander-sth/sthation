import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ institutions: [], total: 0 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // SOCIAL, AMBIENTAL, PREFEITURA
    const status = searchParams.get("status") // PENDING, APPROVED, etc
    const limit = parseInt(searchParams.get("limit") || "50")

    // Query simples sem subqueries
    const rows = await sql`
      SELECT 
        i.id,
        i.name,
        i.cnpj,
        i.type,
        i.description,
        i.is_verified,
        i.city,
        i.state,
        i.created_at
      FROM institutions i
      ORDER BY i.created_at DESC
      LIMIT ${limit}
    `
    
    const institutions = (rows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      cnpj: row.cnpj,
      type: row.type,
      description: row.description,
      isVerified: row.is_verified,
      city: row.city,
      state: row.state,
      createdAt: row.created_at,
    }))

    return NextResponse.json({ institutions, total: institutions.length })
  } catch (error) {
    console.error("[API] Error fetching institutions:", error)
    return NextResponse.json(
      { error: "Failed to fetch institutions", institutions: [] },
      { status: 500 }
    )
  }
}

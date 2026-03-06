import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

// API v2 - Usa tabelas corretas: impact_action_cards, organizations, trails

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured", records: [] }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const limitNum = parseInt(searchParams.get("limit") || "50")

    // Buscar IACs com dados de organizacao e trails
    // Usando tabelas que EXISTEM: impact_action_cards, organizations, trails
    const results = await sql`
      SELECT 
        iac.id,
        iac.title,
        iac.description,
        iac.category,
        iac.status::text as status,
        iac.city,
        iac.state,
        iac.budget,
        iac.beneficiaries,
        iac."verificationCode",
        iac."imageUrl",
        iac."odsGoals",
        iac."createdAt",
        o.id as org_id,
        o.name as org_name,
        o.type as org_type,
        o."isVerified" as org_verified,
        t.id as trail_id,
        t."txHash",
        t."blockNumber",
        t."inscriptionId",
        t."createdAt" as trail_created_at
      FROM impact_action_cards iac
      LEFT JOIN organizations o ON iac."organizationId" = o.id
      LEFT JOIN trails t ON t."iacId" = iac.id
      ORDER BY iac."createdAt" DESC
      LIMIT ${limitNum}
    `

    // Filtrar por tipo se especificado
    let filtered = (results || []) as any[]
    if (type) {
      filtered = filtered.filter((r: any) => 
        r.category?.toLowerCase().includes(type.toLowerCase())
      )
    }

    const records = filtered.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      type: row.category?.toLowerCase().includes('ambiental') ? 'AMBIENTAL' : 'SOCIAL',
      status: row.status,
      location: {
        name: row.city,
        state: row.state,
      },
      budget: parseFloat(row.budget) || 0,
      estimatedBeneficiaries: row.beneficiaries,
      verificationCode: row.verificationCode,
      imageUrl: row.imageUrl,
      odsGoals: row.odsGoals || [],
      createdAt: row.createdAt,
      organization: row.org_id ? {
        id: row.org_id,
        name: row.org_name,
        type: row.org_type,
        isVerified: row.org_verified,
      } : null,
      blockchain: row.trail_id ? {
        trailId: row.trail_id,
        txHash: row.txHash,
        blockNumber: row.blockNumber,
        inscriptionId: row.inscriptionId,
        registeredAt: row.trail_created_at,
      } : null,
    }))

    return NextResponse.json({ records, total: records.length })
  } catch (error) {
    console.error("[API] Error fetching impact records:", error)
    return NextResponse.json(
      { error: "Failed to fetch impact records", records: [] },
      { status: 500 }
    )
  }
}

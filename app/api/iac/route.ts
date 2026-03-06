import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

// Usar tabela "impact_action_cards" que existe no banco
// Schema: id, title, description, category, status, verificationCode, organizationId, 
// beneficiaries, budget, location, city, state, startDate, endDate, imageUrl, odsGoals, createdAt, updatedAt

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ projects: [], total: 0 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")

    // Query usando colunas corretas da tabela impact_action_cards
    const rows = await sql`
      SELECT 
        iac.id,
        iac.title,
        iac.description,
        iac.category,
        iac.status,
        iac."verificationCode",
        iac.beneficiaries,
        iac.budget,
        iac.location,
        iac.city,
        iac.state,
        iac."startDate",
        iac."endDate",
        iac."imageUrl",
        iac."odsGoals",
        iac."organizationId",
        iac."createdAt",
        iac."updatedAt",
        o.id as org_id,
        o.name as org_name,
        o.document as org_document,
        o.type as org_type,
        o.city as org_city,
        o.state as org_state,
        o."isVerified" as org_verified,
        (SELECT COUNT(*) FROM evidences e WHERE e."iacId" = iac.id) as evidence_count
      FROM impact_action_cards iac
      LEFT JOIN organizations o ON iac."organizationId" = o.id
      ORDER BY iac."createdAt" DESC
      LIMIT ${limit}
    `

    let projects = (rows || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      type: row.category?.toLowerCase().includes('ambiental') ? 'AMBIENTAL' : 'SOCIAL',
      status: row.status,
      verificationCode: row.verificationCode,
      location: row.location || (row.city ? `${row.city}, ${row.state}` : null),
      location_name: row.city,
      location_state: row.state,
      city: row.city,
      state: row.state,
      budget: parseFloat(row.budget) || 0,
      estimatedBeneficiaries: row.beneficiaries,
      beneficiaries: row.beneficiaries,
      startDate: row.startDate,
      endDate: row.endDate,
      imageUrl: row.imageUrl,
      odsGoals: row.odsGoals || [],
      createdAt: row.createdAt,
      created_at: row.createdAt,
      updatedAt: row.updatedAt,
      organizationId: row.organizationId,
      institution_id: row.org_id,
      institution_name: row.org_name,
      institution_type: row.org_type,
      institution: row.org_id ? {
        id: row.org_id,
        name: row.org_name,
        cnpj: row.org_document,
        document: row.org_document,
        type: row.org_type,
        city: row.org_city,
        state: row.org_state,
        isVerified: row.org_verified,
      } : null,
      evidenceCount: parseInt(row.evidence_count) || 0,
    }))

    // Filtrar por tipo se especificado
    if (type) {
      projects = projects.filter((p: any) => 
        p.type?.toLowerCase() === type.toLowerCase() ||
        p.category?.toLowerCase().includes(type.toLowerCase())
      )
    }

    // Filtrar por status se especificado
    if (status) {
      projects = projects.filter((p: any) => 
        p.status?.toLowerCase() === status.toLowerCase()
      )
    }

    return NextResponse.json({ projects, total: projects.length })
  } catch (error) {
    console.error("[API] Error fetching IACs:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects", projects: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const body = await request.json()
    const {
      title,
      description,
      category,
      organizationId,
      city,
      state,
      budget,
      beneficiaries,
      startDate,
      endDate,
      imageUrl,
      odsGoals,
    } = body

    // Gerar codigo de verificacao unico
    const verificationCode = `IAC-${Date.now().toString(36).toUpperCase()}`

    const result = await sql`
      INSERT INTO impact_action_cards (
        title, description, category, "organizationId", 
        city, state, budget, beneficiaries,
        "startDate", "endDate", "imageUrl", "odsGoals",
        "verificationCode", status, "createdAt", "updatedAt"
      ) VALUES (
        ${title}, ${description}, ${category}, ${organizationId || null},
        ${city || null}, ${state || null}, ${budget || 0}, ${beneficiaries || 0},
        ${startDate || null}, ${endDate || null}, ${imageUrl || null}, ${JSON.stringify(odsGoals || [])}::jsonb,
        ${verificationCode}, 'draft', NOW(), NOW()
      )
      RETURNING *
    `

    return NextResponse.json({ project: result[0] }, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating IAC:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}

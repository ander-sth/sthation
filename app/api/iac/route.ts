import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ projects: [], total: 0 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // SOCIAL ou AMBIENTAL
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")

    // Query simples com template literal
    const rows = await sql`
      SELECT 
        iac.id,
        iac.title,
        iac.description,
        iac.category,
        iac.tsb_category_id,
        iac.type,
        iac.status,
        iac.location_name,
        iac.location_state,
        iac.budget,
        iac.estimated_beneficiaries,
        iac.vca_score,
        iac.created_at,
        iac.updated_at,
        i.id as institution_id,
        i.name as institution_name,
        i.cnpj as institution_cnpj,
        i.type as institution_type,
        i.city as institution_city,
        i.state as institution_state,
        (SELECT COUNT(*) FROM evidences e WHERE e.iac_id = iac.id) as evidence_count,
        fp.id as funding_id,
        fp.current_amount,
        fp.goal_amount,
        fp.donors_count,
        fp.status as funding_status
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      LEFT JOIN funding_projects fp ON fp.iac_id = iac.id
      ORDER BY iac.created_at DESC
      LIMIT ${limit}
    `

    const projects = (rows || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      tsbCategoryId: row.tsb_category_id,
      type: row.type,
      status: row.status,
      location: row.location_name ? `${row.location_name}, ${row.location_state}` : null,
      location_name: row.location_name,
      location_state: row.location_state,
      budget: parseFloat(row.budget) || 0,
      estimatedBeneficiaries: row.estimated_beneficiaries,
      beneficiaries: row.estimated_beneficiaries,
      vcaScore: row.vca_score ? parseFloat(row.vca_score) : null,
      createdAt: row.created_at,
      created_at: row.created_at,
      updatedAt: row.updated_at,
      institution_id: row.institution_id,
      institution_name: row.institution_name,
      institution_type: row.institution_type,
      institution: row.institution_id ? {
        id: row.institution_id,
        name: row.institution_name,
        cnpj: row.institution_cnpj,
        type: row.institution_type,
        city: row.institution_city,
        state: row.institution_state,
      } : null,
      evidenceCount: parseInt(row.evidence_count) || 0,
      funding_goal: row.goal_amount ? parseFloat(row.goal_amount) : 0,
      current_funding: row.current_amount ? parseFloat(row.current_amount) : 0,
      donations_count: row.donors_count || 0,
      funding: row.funding_id ? {
        id: row.funding_id,
        currentAmount: parseFloat(row.current_amount) || 0,
        goalAmount: parseFloat(row.goal_amount) || 0,
        donorsCount: row.donors_count || 0,
        status: row.funding_status,
      } : null,

    }))

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
  try {
    const body = await request.json()
    const {
      title,
      description,
      category,
      tsbCategoryId,
      type,
      institutionId,
      locationName,
      locationState,
      budget,
      estimatedBeneficiaries,
    } = body

    const result = await sql`
      INSERT INTO impact_action_cards (
        title, description, category, tsb_category_id, type, 
        institution_id, location_name, location_state, budget, 
        estimated_beneficiaries, status
      ) VALUES (
        ${title}, ${description}, ${category}, ${tsbCategoryId}, ${type},
        ${institutionId}, ${locationName}, ${locationState}, ${budget},
        ${estimatedBeneficiaries}, 'DRAFT'
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

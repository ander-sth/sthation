import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

// Schema impact_action_cards (real do banco):
// id, title, description, category, type, status, institution_id, location_name, location_state,
// location_lat, location_lng, coordinates, budget, estimated_beneficiaries, deadline,
// vca_score, polygon_tx_hash, polygon_block_number, inscription_id, trail_id,
// tsb_category_id, project_status, data_collection_type, measurement_unit, certification_standard,
// existing_certifications, sensor_types, sensors_count, area_size, waste_processed, energy_generated,
// submitted_at, validated_at, minted_at, created_at, updated_at

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ projects: [], total: 0 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const institutionId = searchParams.get("institutionId")
    const limit = parseInt(searchParams.get("limit") || "50")

    // Query usando colunas corretas da tabela impact_action_cards
    // JOIN com institutions (não organizations)
    const rows = await sql`
      SELECT 
        iac.id,
        iac.title,
        iac.description,
        iac.category,
        iac.type,
        iac.status,
        iac.institution_id,
        iac.location_name,
        iac.location_state,
        iac.location_lat,
        iac.location_lng,
        iac.coordinates,
        iac.budget,
        iac.estimated_beneficiaries,
        iac.deadline,
        iac.vca_score,
        iac.polygon_tx_hash,
        iac.polygon_block_number,
        iac.inscription_id,
        iac.trail_id,
        iac.project_status,
        iac.submitted_at,
        iac.validated_at,
        iac.minted_at,
        iac.created_at,
        iac.updated_at,
        iac.sensors_count,
        iac.co2_equivalent,
        iac.certification_score,
        iac.certified_at,
        i.id as inst_id,
        i.name as inst_name,
        i.cnpj as inst_cnpj,
        i.type as inst_type,
        i.city as inst_city,
        i.state as inst_state,
        i.is_verified as inst_verified
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      ORDER BY iac.created_at DESC
      LIMIT ${limit}
    `

    let projects = (rows || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      type: row.type || (row.category?.toLowerCase().includes('ambiental') ? 'AMBIENTAL' : 'SOCIAL'),
      status: row.status,
      institutionId: row.institution_id,
      institution_id: row.institution_id,
      location: row.location_name ? `${row.location_name}, ${row.location_state}` : null,
      location_name: row.location_name,
      location_state: row.location_state,
      city: row.location_name,
      state: row.location_state,
      locationLat: row.location_lat,
      locationLng: row.location_lng,
      coordinates: row.coordinates,
      budget: parseFloat(row.budget) || 0,
      estimatedBeneficiaries: row.estimated_beneficiaries,
      beneficiaries: row.estimated_beneficiaries,
      deadline: row.deadline,
      vcaScore: row.vca_score,
      polygonTxHash: row.polygon_tx_hash,
      polygonBlockNumber: row.polygon_block_number,
      inscriptionId: row.inscription_id,
      trailId: row.trail_id,
      projectStatus: row.project_status,
      submittedAt: row.submitted_at,
      validatedAt: row.validated_at,
      mintedAt: row.minted_at,
      createdAt: row.created_at,
      created_at: row.created_at,
      updatedAt: row.updated_at,
      sensors_count: row.sensors_count || 0,
      co2_equivalent: parseFloat(row.co2_equivalent) || 0,
      certification_score: row.certification_score,
      certified_at: row.certified_at,
      // Dados da instituição
      institution_name: row.inst_name,
      institution: row.inst_id ? {
        id: row.inst_id,
        name: row.inst_name,
        cnpj: row.inst_cnpj,
        type: row.inst_type,
        city: row.inst_city,
        state: row.inst_state,
        isVerified: row.inst_verified,
      } : null,
    }))

    // Filtrar por tipo se especificado
    if (type) {
      projects = projects.filter((p: any) => 
        p.type?.toUpperCase() === type.toUpperCase() ||
        p.category?.toLowerCase().includes(type.toLowerCase())
      )
    }

    // Filtrar por status se especificado
    if (status) {
      projects = projects.filter((p: any) => 
        p.status?.toUpperCase() === status.toUpperCase()
      )
    }

    // Filtrar por instituição se especificado
    if (institutionId) {
      projects = projects.filter((p: any) => 
        p.institution_id === institutionId
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
      type,
      institutionId,
      locationName,
      locationState,
      budget,
      estimatedBeneficiaries,
      deadline,
    } = body

    const result = await sql`
      INSERT INTO impact_action_cards (
        title, description, category, type, institution_id,
        location_name, location_state, budget, estimated_beneficiaries,
        deadline, status, created_at, updated_at
      ) VALUES (
        ${title}, ${description}, ${category || type}, ${type || 'SOCIAL'}, ${institutionId || null},
        ${locationName || null}, ${locationState || null}, ${budget || 0}, ${estimatedBeneficiaries || 0},
        ${deadline || null}, 'DRAFT', NOW(), NOW()
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

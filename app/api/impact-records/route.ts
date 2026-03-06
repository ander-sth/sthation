import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured", records: [] }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // SOCIAL ou AMBIENTAL
    const limit = searchParams.get("limit") || "50"

    // Buscar projetos finalizados/certificados com registro blockchain
    // Usar tagged template literal para Neon
    let results
    if (type) {
      results = await sql`
        SELECT 
          iac.id,
          iac.title,
          iac.description,
          iac.category,
          iac.type,
          iac.status,
          iac.location_name,
          iac.location_state,
          iac.budget,
          iac.estimated_beneficiaries,
          iac.vca_score,
          iac.created_at,
          i.id as institution_id,
          i.name as institution_name,
          i.type as institution_type,
          pt.trail_id,
          pt.polygon_tx_hash,
          pt.polygon_block_number,
          pt.polygon_registered_at,
          pt.data_hash,
          fp.current_amount as total_raised,
          fp.donors_count,
          (SELECT COUNT(*) FROM donations d WHERE d.funding_project_id = fp.id) as donation_count
        FROM impact_action_cards iac
        LEFT JOIN institutions i ON iac.institution_id = i.id
        LEFT JOIN pipeline_trails pt ON pt.iac_id = iac.id AND pt.polygon_registered = true
        LEFT JOIN funding_projects fp ON fp.iac_id = iac.id
        WHERE iac.status IN ('VALIDATED', 'CERTIFIED', 'MINTED')
        AND iac.type = ${type}
        ORDER BY pt.polygon_registered_at DESC NULLS LAST, iac.created_at DESC
        LIMIT ${parseInt(limit)}
      `
    } else {
      results = await sql`
        SELECT 
          iac.id,
          iac.title,
          iac.description,
          iac.category,
          iac.type,
          iac.status,
          iac.location_name,
          iac.location_state,
          iac.budget,
          iac.estimated_beneficiaries,
          iac.vca_score,
          iac.created_at,
          i.id as institution_id,
          i.name as institution_name,
          i.type as institution_type,
          pt.trail_id,
          pt.polygon_tx_hash,
          pt.polygon_block_number,
          pt.polygon_registered_at,
          pt.data_hash,
          fp.current_amount as total_raised,
          fp.donors_count,
          (SELECT COUNT(*) FROM donations d WHERE d.funding_project_id = fp.id) as donation_count
        FROM impact_action_cards iac
        LEFT JOIN institutions i ON iac.institution_id = i.id
        LEFT JOIN pipeline_trails pt ON pt.iac_id = iac.id AND pt.polygon_registered = true
        LEFT JOIN funding_projects fp ON fp.iac_id = iac.id
        WHERE iac.status IN ('VALIDATED', 'CERTIFIED', 'MINTED')
        ORDER BY pt.polygon_registered_at DESC NULLS LAST, iac.created_at DESC
        LIMIT ${parseInt(limit)}
      `
    }

    const records = results.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      type: row.type,
      status: row.status,
      location: {
        name: row.location_name,
        state: row.location_state,
      },
      budget: parseFloat(row.budget) || 0,
      estimatedBeneficiaries: row.estimated_beneficiaries,
      vcaScore: row.vca_score ? parseFloat(row.vca_score) : null,
      createdAt: row.created_at,
      organization: {
        id: row.institution_id,
        name: row.institution_name,
        type: row.institution_type,
      },
      blockchain: row.trail_id ? {
        trailId: row.trail_id,
        txHash: row.polygon_tx_hash,
        blockNumber: row.polygon_block_number,
        registeredAt: row.polygon_registered_at,
        dataHash: row.data_hash,
      } : null,
      impact: {
        totalRaised: parseFloat(row.total_raised) || 0,
        donorsCount: row.donors_count || 0,
        donationCount: parseInt(row.donation_count) || 0,
      },
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

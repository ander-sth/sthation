import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const url = new URL(request.url)
    const certifierId = url.searchParams.get("certifierId")

    if (!certifierId) {
      return NextResponse.json({ error: "certifierId required" }, { status: 400 })
    }

    // Buscar projetos onde a proposta deste certificador foi aceita (status VALIDATED)
    const projects = await sql`
      SELECT 
        iac.id,
        iac.title,
        iac.description,
        iac.category,
        iac.type,
        iac.status,
        iac.project_status,
        iac.location_name,
        iac.location_state,
        iac.coordinates,
        iac.waste_processed,
        iac.energy_generated,
        iac.area_size,
        iac.measurement_unit,
        iac.certification_standard,
        iac.sensors_count,
        iac.submitted_at,
        iac.created_at,
        i.name as institution_name,
        i.type as institution_type,
        cp.id as proposal_id,
        cp.proposed_value,
        cp.message as proposal_message,
        cp.accepted_at
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      INNER JOIN certification_proposals cp ON cp.iac_id = iac.id
      WHERE cp.certifier_id = ${certifierId}
        AND cp.status = 'ACCEPTED'
        AND iac.status IN ('VALIDATED', 'CERTIFIED')
      ORDER BY cp.accepted_at DESC
    `

    return NextResponse.json({ 
      success: true, 
      projects,
      total: projects.length 
    })

  } catch (error: any) {
    console.error("[API] Erro ao buscar projetos do certificador:", error)
    return NextResponse.json(
      { error: "Erro ao buscar projetos", details: error.message },
      { status: 500 }
    )
  }
}

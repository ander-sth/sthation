import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Buscar usuário certificador do header (simplificado)
    const url = new URL(request.url)
    const certifierId = url.searchParams.get("certifierId")

    // Buscar projetos com status SUBMITTED (aguardando certificação)
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
        i.type as institution_type
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      WHERE iac.status = 'SUBMITTED'
      ORDER BY iac.submitted_at DESC
    `

    // Se tiver certifierId, buscar propostas já enviadas por este certificador
    let projectsWithProposals = projects
    if (certifierId) {
      const proposals = await sql`
        SELECT iac_id, proposed_value, status, created_at
        FROM certification_proposals
        WHERE certifier_id = ${certifierId}
      `

      const proposalMap = new Map(proposals.map((p: any) => [p.iac_id, p]))

      projectsWithProposals = projects.map((project: any) => ({
        ...project,
        my_proposal: proposalMap.get(project.id) || null,
      }))
    }

    return NextResponse.json({ 
      success: true, 
      projects: projectsWithProposals,
      total: projects.length 
    })

  } catch (error: any) {
    console.error("[API] Erro ao buscar projetos pendentes:", error)
    return NextResponse.json(
      { error: "Erro ao buscar projetos", details: error.message },
      { status: 500 }
    )
  }
}

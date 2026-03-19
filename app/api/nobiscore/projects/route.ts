import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ projects: [], stats: {} })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Buscar projetos certificados com dados da instituicao
    const projects = await sql`
      SELECT 
        iac.id,
        iac.title,
        iac.description,
        iac.category,
        iac.type,
        iac.status,
        iac.location_name,
        iac.location_state,
        iac.co2_equivalent,
        iac.waste_processed,
        iac.certificate_hash,
        iac.polygon_tx_hash,
        iac.certified_at,
        iac.certificate_score,
        iac.cover_image,
        iac.created_at,
        i.name as institution_name,
        i.is_verified as institution_verified,
        i.logo_url as institution_logo
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      WHERE iac.status = 'CERTIFIED'
      ORDER BY iac.certified_at DESC NULLS LAST, iac.created_at DESC
    `

    // Calcular estatisticas
    const statsResult = await sql`
      SELECT 
        COUNT(*)::int as total_projects,
        COALESCE(SUM(co2_equivalent), 0)::numeric as total_co2,
        COALESCE(SUM(waste_processed), 0)::numeric as total_waste,
        COUNT(DISTINCT institution_id)::int as total_institutions
      FROM impact_action_cards
      WHERE status = 'CERTIFIED'
    `

    const stats = statsResult[0] || {
      total_projects: 0,
      total_co2: 0,
      total_waste: 0,
      total_institutions: 0
    }

    return NextResponse.json({
      projects: projects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        type: p.type,
        status: p.status,
        location_name: p.location_name,
        location_state: p.location_state,
        co2_equivalent: Number(p.co2_equivalent) || 0,
        waste_processed: Number(p.waste_processed) || 0,
        certificate_hash: p.certificate_hash,
        polygon_tx_hash: p.polygon_tx_hash,
        certified_at: p.certified_at,
        certificate_score: p.certificate_score,
        cover_image: p.cover_image,
        institution_name: p.institution_name,
        institution_verified: p.institution_verified,
        institution_logo: p.institution_logo,
      })),
      stats: {
        totalProjects: Number(stats.total_projects) || 0,
        totalCO2: Number(stats.total_co2) || 0,
        totalWaste: Number(stats.total_waste) || 0,
        totalInstitutions: Number(stats.total_institutions) || 0,
      }
    })
  } catch (error) {
    console.error("[NOBISCORE PROJECTS] Erro:", error)
    return NextResponse.json({ projects: [], stats: {} })
  }
}

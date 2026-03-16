import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database nao configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Buscar projetos certificados (CERTIFIED, INSCRIBED, MINTED)
    const projects = await sql`
      SELECT 
        iac.id,
        iac.title,
        iac.description,
        iac.category,
        iac.status,
        iac.location_name,
        iac.location_state,
        iac.cover_image,
        iac.waste_processed,
        iac.co2_equivalent,
        iac.energy_generated,
        iac.certification_score,
        iac.certified_at,
        iac.polygon_tx_hash,
        iac.total_donated,
        iac.donors_count,
        iac.created_at,
        i.name as institution_name,
        i.city as institution_city
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      WHERE iac.status IN ('CERTIFIED', 'INSCRIBED', 'MINTED')
      ORDER BY iac.certified_at DESC NULLS LAST
    `

    // Calcular estatísticas
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total_projects,
        COALESCE(SUM(co2_equivalent), 0) as total_co2,
        COALESCE(SUM(total_donated), 0) as total_donated,
        COUNT(DISTINCT institution_id) as total_institutions
      FROM impact_action_cards
      WHERE status IN ('CERTIFIED', 'INSCRIBED', 'MINTED')
    `

    const stats = statsResult[0] || {}

    return NextResponse.json({
      projects,
      stats: {
        totalProjects: parseInt(stats.total_projects) || 0,
        totalCO2: parseFloat(stats.total_co2) || 0,
        totalDonated: parseInt(stats.total_donated) || 0,
        totalInstitutions: parseInt(stats.total_institutions) || 0,
      },
    })
  } catch (error: any) {
    console.error("[TRANSPARENCY] Erro:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

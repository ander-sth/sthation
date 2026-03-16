import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database nao configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(req.url)
  const city = searchParams.get("city") || ""
  const state = searchParams.get("state") || ""

  try {
    // Buscar estatisticas da regiao
    const projectStats = await sql`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'CERTIFIED' THEN 1 END) as certified_projects,
        COALESCE(SUM(co2_equivalent), 0) as total_co2,
        COALESCE(SUM(waste_processed), 0) as total_waste,
        COALESCE(SUM(total_donated), 0) as total_donations
      FROM impact_action_cards
      WHERE (location_city ILIKE ${'%' + city + '%'} OR location_state = ${state} OR ${city} = '' AND ${state} = '')
    `

    // Contar instituicoes
    const institutionStats = await sql`
      SELECT COUNT(DISTINCT i.id) as total_institutions
      FROM institutions i
      WHERE (i.city ILIKE ${'%' + city + '%'} OR i.state = ${state} OR ${city} = '' AND ${state} = '')
    `

    // Projetos por categoria
    const categoryStats = await sql`
      SELECT category, COUNT(*) as count
      FROM impact_action_cards
      WHERE (location_city ILIKE ${'%' + city + '%'} OR location_state = ${state} OR ${city} = '' AND ${state} = '')
      GROUP BY category
    `

    const projectsByCategory: Record<string, number> = {}
    categoryStats.forEach((row: any) => {
      if (row.category) {
        projectsByCategory[row.category] = parseInt(row.count)
      }
    })

    const stats = {
      totalProjects: parseInt(projectStats[0]?.total_projects || "0"),
      certifiedProjects: parseInt(projectStats[0]?.certified_projects || "0"),
      totalCO2Avoided: parseFloat(projectStats[0]?.total_co2 || "0"),
      totalWasteProcessed: parseInt(projectStats[0]?.total_waste || "0"),
      totalDonations: parseInt(projectStats[0]?.total_donations || "0"),
      totalInstitutions: parseInt(institutionStats[0]?.total_institutions || "0"),
      projectsByCategory,
    }

    return NextResponse.json({ stats })
  } catch (e: any) {
    console.error("[GOV STATS] Erro:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

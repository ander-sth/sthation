// API NobisCore Stats - Estatísticas gerais da plataforma
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      totalInscriptions: 0,
      totalOnPolygon: 0,
      socialImpact: 0,
      environmentalImpact: 0,
      totalBeneficiaries: 0,
      pendingBridges: 0,
      recentActivity: []
    })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Total de inscriptions registradas
    const inscriptions = await sql`
      SELECT COUNT(*) as total 
      FROM impact_action_cards 
      WHERE inscription_id IS NOT NULL
    `

    // Total de IACs na Polygon
    const onPolygon = await sql`
      SELECT COUNT(*) as total 
      FROM impact_action_cards 
      WHERE polygon_tx_hash IS NOT NULL
    `

    // IACs por tipo
    const byType = await sql`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(estimated_beneficiaries) as beneficiaries
      FROM impact_action_cards
      WHERE status IN ('VALIDATED', 'REGISTERED', 'COMPLETED')
      GROUP BY type
    `

    // Pendentes para bridge (na Polygon mas sem inscription)
    const pending = await sql`
      SELECT COUNT(*) as total
      FROM impact_action_cards
      WHERE polygon_tx_hash IS NOT NULL
        AND inscription_id IS NULL
        AND status IN ('VALIDATED', 'REGISTERED', 'COMPLETED')
    `

    // Total de beneficiários
    const beneficiaries = await sql`
      SELECT COALESCE(SUM(estimated_beneficiaries), 0) as total
      FROM impact_action_cards
      WHERE status IN ('VALIDATED', 'REGISTERED', 'COMPLETED')
    `

    // Atividade recente (últimos 10 registros)
    const recentActivity = await sql`
      SELECT 
        iac.id,
        iac.title,
        iac.type,
        iac.category,
        iac.status,
        iac.inscription_id,
        iac.polygon_tx_hash,
        iac.minted_at,
        iac.validated_at,
        iac.created_at,
        i.name as institution_name
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      WHERE iac.status IN ('VALIDATED', 'REGISTERED', 'COMPLETED', 'MINTED')
      ORDER BY COALESCE(iac.minted_at, iac.validated_at, iac.created_at) DESC
      LIMIT 10
    `

    // Pipeline trails recentes
    const pipelineTrails = await sql`
      SELECT 
        pt.id,
        pt.trail_id,
        pt.type,
        pt.current_stage,
        pt.status,
        pt.polygon_registered,
        pt.polygon_tx_hash,
        pt.created_at,
        iac.title,
        iac.inscription_id
      FROM pipeline_trails pt
      LEFT JOIN impact_action_cards iac ON pt.iac_id = iac.id
      ORDER BY pt.created_at DESC
      LIMIT 10
    `

    const socialData = byType.find(t => t.type === 'SOCIAL') || { count: 0, beneficiaries: 0 }
    const environmentalData = byType.find(t => t.type === 'AMBIENTAL') || { count: 0, beneficiaries: 0 }

    return NextResponse.json({
      totalInscriptions: parseInt(inscriptions[0]?.total || "0"),
      totalOnPolygon: parseInt(onPolygon[0]?.total || "0"),
      socialCount: parseInt(socialData.count || "0"),
      environmentalCount: parseInt(environmentalData.count || "0"),
      totalBeneficiaries: parseInt(beneficiaries[0]?.total || "0"),
      pendingBridges: parseInt(pending[0]?.total || "0"),
      recentActivity,
      pipelineTrails
    })
  } catch (error) {
    console.error("[NOBISCORE STATS] Erro:", error)
    return NextResponse.json({
      totalInscriptions: 0,
      totalOnPolygon: 0,
      socialCount: 0,
      environmentalCount: 0,
      totalBeneficiaries: 0,
      pendingBridges: 0,
      recentActivity: [],
      pipelineTrails: []
    })
  }
}

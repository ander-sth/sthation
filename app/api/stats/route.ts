import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Estatisticas gerais da plataforma
    const [projectStats] = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status != 'DRAFT') as total_projects,
        COUNT(*) FILTER (WHERE type = 'SOCIAL' AND status != 'DRAFT') as social_projects,
        COUNT(*) FILTER (WHERE type = 'AMBIENTAL' AND status != 'DRAFT') as environmental_projects,
        COUNT(*) FILTER (WHERE status = 'VALIDATED' OR status = 'CERTIFIED' OR status = 'MINTED') as validated_projects
      FROM impact_action_cards
    `

    const [fundingStats] = await sql`
      SELECT 
        COALESCE(SUM(current_amount), 0) as total_raised,
        COALESCE(SUM(donors_count), 0) as total_donors,
        COUNT(*) as total_campaigns,
        COUNT(*) FILTER (WHERE status = 'FUNDED') as funded_campaigns
      FROM funding_projects
    `

    const [userStats] = await sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'DOADOR') as donors,
        COUNT(*) FILTER (WHERE role = 'CHECKER') as checkers,
        COUNT(*) FILTER (WHERE role = 'ANALISTA_CERTIFICADOR') as analysts,
        COUNT(*) FILTER (WHERE role = 'INSTITUICAO_SOCIAL') as social_institutions,
        COUNT(*) FILTER (WHERE role = 'EMPRESA_AMBIENTAL') as environmental_companies
      FROM users
      WHERE is_active = true
    `

    const [vcaStats] = await sql`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE status = 'CLOSED' AND result = 'APPROVED') as approved,
        COUNT(*) FILTER (WHERE status = 'CLOSED' AND result = 'REJECTED') as rejected,
        COUNT(*) FILTER (WHERE status = 'OPEN') as in_progress,
        COALESCE(AVG(final_score), 0) as avg_score
      FROM vca_sessions
    `

    const [blockchainStats] = await sql`
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(*) FILTER (WHERE polygon_registered = true) as polygon_registered
      FROM pipeline_trails
    `

    return NextResponse.json({
      projects: {
        total: parseInt(projectStats.total_projects),
        social: parseInt(projectStats.social_projects),
        environmental: parseInt(projectStats.environmental_projects),
        validated: parseInt(projectStats.validated_projects),
      },
      funding: {
        totalRaised: parseFloat(fundingStats.total_raised),
        totalDonors: parseInt(fundingStats.total_donors),
        totalCampaigns: parseInt(fundingStats.total_campaigns),
        fundedCampaigns: parseInt(fundingStats.funded_campaigns),
      },
      users: {
        total: parseInt(userStats.total_users),
        donors: parseInt(userStats.donors),
        checkers: parseInt(userStats.checkers),
        analysts: parseInt(userStats.analysts),
        socialInstitutions: parseInt(userStats.social_institutions),
        environmentalCompanies: parseInt(userStats.environmental_companies),
      },
      vca: {
        totalSessions: parseInt(vcaStats.total_sessions),
        approved: parseInt(vcaStats.approved),
        rejected: parseInt(vcaStats.rejected),
        inProgress: parseInt(vcaStats.in_progress),
        avgScore: parseFloat(vcaStats.avg_score).toFixed(1),
      },
      blockchain: {
        totalTransactions: parseInt(blockchainStats.total_transactions),
        polygonRegistered: parseInt(blockchainStats.polygon_registered),
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

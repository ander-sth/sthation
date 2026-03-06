import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

// Estatisticas usando tabelas que EXISTEM no banco:
// users, projects, impact_action_cards, donations, organizations, trails, vca_assignments

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Estatisticas de projetos (usando tabela projects)
    const [projectStats] = await sql`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(*) FILTER (WHERE category ILIKE '%social%') as social_projects,
        COUNT(*) FILTER (WHERE category ILIKE '%ambiental%' OR category ILIKE '%environmental%') as environmental_projects,
        COUNT(*) FILTER (WHERE status = 'completed' OR status = 'funded') as validated_projects
      FROM projects
    `

    // Estatisticas de financiamento (usando tabela projects e donations)
    const [fundingStats] = await sql`
      SELECT 
        COALESCE(SUM("currentAmount"), 0) as total_raised,
        COUNT(*) as total_campaigns,
        COUNT(*) FILTER (WHERE "currentAmount" >= "targetAmount" AND "targetAmount" > 0) as funded_campaigns
      FROM projects
    `
    
    const [donorStats] = await sql`
      SELECT COUNT(DISTINCT "donorId") as total_donors
      FROM donations
      WHERE status = 'confirmed' OR status = 'CONFIRMED'
    `

    // Estatisticas de usuarios (usando enum correto: ADMIN, INSTITUTION, DONOR, CHECKER, ANALYST, GOV, ENVIRONMENTAL_COMPANY)
    const [userStats] = await sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'DONOR') as donors,
        COUNT(*) FILTER (WHERE role = 'CHECKER') as checkers,
        COUNT(*) FILTER (WHERE role = 'ANALYST') as analysts,
        COUNT(*) FILTER (WHERE role = 'INSTITUTION') as social_institutions,
        COUNT(*) FILTER (WHERE role = 'ENVIRONMENTAL_COMPANY') as environmental_companies
      FROM users
      WHERE status = 'ACTIVE'
    `

    // Estatisticas de VCA (usando tabela vca_assignments)
    const [vcaStats] = await sql`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE "isApproved" = true) as approved,
        COUNT(*) FILTER (WHERE "isApproved" = false AND "completedAt" IS NOT NULL) as rejected,
        COUNT(*) FILTER (WHERE "completedAt" IS NULL) as in_progress,
        COALESCE(AVG(score), 0) as avg_score
      FROM vca_assignments
    `

    // Estatisticas de blockchain (usando tabela trails)
    const [blockchainStats] = await sql`
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(*) FILTER (WHERE "inscriptionId" IS NOT NULL) as inscribed
      FROM trails
    `

    return NextResponse.json({
      projects: {
        total: parseInt(projectStats.total_projects) || 0,
        social: parseInt(projectStats.social_projects) || 0,
        environmental: parseInt(projectStats.environmental_projects) || 0,
        validated: parseInt(projectStats.validated_projects) || 0,
      },
      funding: {
        totalRaised: parseFloat(fundingStats.total_raised) || 0,
        totalDonors: parseInt(donorStats.total_donors) || 0,
        totalCampaigns: parseInt(fundingStats.total_campaigns) || 0,
        fundedCampaigns: parseInt(fundingStats.funded_campaigns) || 0,
      },
      users: {
        total: parseInt(userStats.total_users) || 0,
        donors: parseInt(userStats.donors) || 0,
        checkers: parseInt(userStats.checkers) || 0,
        analysts: parseInt(userStats.analysts) || 0,
        socialInstitutions: parseInt(userStats.social_institutions) || 0,
        environmentalCompanies: parseInt(userStats.environmental_companies) || 0,
      },
      vca: {
        totalSessions: parseInt(vcaStats.total_sessions) || 0,
        approved: parseInt(vcaStats.approved) || 0,
        rejected: parseInt(vcaStats.rejected) || 0,
        inProgress: parseInt(vcaStats.in_progress) || 0,
        avgScore: parseFloat(vcaStats.avg_score || 0).toFixed(1),
      },
      blockchain: {
        totalTransactions: parseInt(blockchainStats.total_transactions) || 0,
        polygonRegistered: parseInt(blockchainStats.inscribed) || 0,
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

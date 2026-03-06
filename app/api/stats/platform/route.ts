// STATS PLATFORM API v2 - TIMESTAMP: 2024-03-06-22-15-00
// Usa tabelas e colunas corretas: users.status, organizations (nao institutions)
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const defaultStats = {
  stats: {
    totalArrecadado: 0,
    totalDoacoes: 0,
    totalProjetos: 0,
    projetosAtivos: 0,
    projetosConcluidos: 0,
    totalBeneficiarios: 0,
    totalDoadores: 0,
    totalInstituicoes: 0,
    totalCheckers: 0,
    validacoesRealizadas: 0,
    projetosSociais: 0,
    projetosAmbientais: 0,
    nobisRegistered: 0,
  }
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(defaultStats)
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Query usando colunas CORRETAS do schema
    // users.status (enum) ao inves de is_active
    // organizations ao inves de institutions
    // projects e impact_action_cards para projetos

    const usersTotal = await sql`
      SELECT COUNT(*) as total FROM users WHERE status = 'ACTIVE'
    `
    const doadores = await sql`
      SELECT COUNT(*) as total FROM users WHERE role = 'DONOR' AND status = 'ACTIVE'
    `
    const checkers = await sql`
      SELECT COUNT(*) as total FROM users WHERE role = 'CHECKER' AND status = 'ACTIVE'
    `

    // Total de projetos da tabela projects
    const projectsTotal = await sql`SELECT COUNT(*) as total FROM projects`
    const projectsActive = await sql`SELECT COUNT(*) as total FROM projects WHERE status::text = 'active'`
    const projectsCompleted = await sql`SELECT COUNT(*) as total FROM projects WHERE status::text = 'completed'`
    
    // Beneficiarios dos projetos
    const beneficiarios = await sql`
      SELECT COALESCE(SUM(beneficiaries), 0) as total FROM projects
    `

    // Total de organizacoes (NAO institutions)
    const orgsTotal = await sql`SELECT COUNT(*) as total FROM organizations`

    // Total arrecadado e doacoes
    const doacoesStats = await sql`
      SELECT 
        COUNT(*) as total_doacoes,
        COALESCE(SUM(amount), 0) as total_arrecadado
      FROM donations
    `

    // IACs por categoria (social/ambiental baseado em category)
    const iacSocial = await sql`
      SELECT COUNT(*) as total FROM impact_action_cards 
      WHERE LOWER(category) LIKE '%social%'
    `
    const iacAmbiental = await sql`
      SELECT COUNT(*) as total FROM impact_action_cards 
      WHERE LOWER(category) LIKE '%ambiental%' OR LOWER(category) LIKE '%environment%'
    `

    return NextResponse.json({
      stats: {
        totalArrecadado: Number(doacoesStats[0]?.total_arrecadado || 0),
        totalDoacoes: Number(doacoesStats[0]?.total_doacoes || 0),
        totalProjetos: Number(projectsTotal[0]?.total || 0),
        projetosAtivos: Number(projectsActive[0]?.total || 0),
        projetosConcluidos: Number(projectsCompleted[0]?.total || 0),
        totalBeneficiarios: Number(beneficiarios[0]?.total || 0),
        totalDoadores: Number(doadores[0]?.total || 0),
        totalInstituicoes: Number(orgsTotal[0]?.total || 0),
        totalCheckers: Number(checkers[0]?.total || 0),
        validacoesRealizadas: 0,
        projetosSociais: Number(iacSocial[0]?.total || 0),
        projetosAmbientais: Number(iacAmbiental[0]?.total || 0),
        nobisRegistered: 0,
        totalUsuarios: Number(usersTotal[0]?.total || 0),
      }
    })
  } catch (error) {
    console.error("Error fetching platform stats:", error)
    return NextResponse.json(defaultStats)
  }
}

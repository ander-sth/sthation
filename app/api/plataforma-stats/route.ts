// API STATS DA PLATAFORMA - CORRIGIDA PARA USAR SCHEMA REAL
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// Schema real do banco:
// users: id, email, name, role, is_verified, is_active
// institutions: id, name, cnpj, type, is_verified
// impact_action_cards: id, title, category, type, status, estimated_beneficiaries
// funding_projects: id, title, status, goal_amount, current_amount, donors_count
// donations: id, amount, donor_id, funding_project_id, payment_status

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
    totalUsuarios: 0,
  }
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(defaultStats)
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Usuarios
    const usersTotal = await sql`SELECT COUNT(*) as total FROM users WHERE is_active = true`
    const doadores = await sql`SELECT COUNT(*) as total FROM users WHERE role = 'DOADOR' AND is_active = true`
    const checkers = await sql`SELECT COUNT(*) as total FROM users WHERE role = 'CHECKER' AND is_active = true`

    // Instituicoes (usando tabela correta)
    const institutionsTotal = await sql`SELECT COUNT(*) as total FROM institutions`
    const institutionsVerified = await sql`SELECT COUNT(*) as total FROM institutions WHERE is_verified = true`

    // Projetos de funding (tabela pode nao existir)
    let fundingTotal = [{ total: 0 }]
    let fundingActive = [{ total: 0 }]
    let fundingCompleted = [{ total: 0 }]
    try {
      fundingTotal = await sql`SELECT COUNT(*) as total FROM funding_projects`
      fundingActive = await sql`SELECT COUNT(*) as total FROM funding_projects WHERE status = 'FUNDING'`
      fundingCompleted = await sql`SELECT COUNT(*) as total FROM funding_projects WHERE status = 'COMPLETED'`
    } catch (e) {
      // Tabela funding_projects pode nao existir
    }

    // IACs (Impact Action Cards)
    const iacTotal = await sql`SELECT COUNT(*) as total FROM impact_action_cards`
    const iacSocial = await sql`SELECT COUNT(*) as total FROM impact_action_cards WHERE type = 'SOCIAL' OR LOWER(category) LIKE '%social%'`
    const iacAmbiental = await sql`SELECT COUNT(*) as total FROM impact_action_cards WHERE type = 'AMBIENTAL' OR LOWER(category) LIKE '%ambiental%'`
    
    // Beneficiarios
    const beneficiarios = await sql`SELECT COALESCE(SUM(estimated_beneficiaries), 0) as total FROM impact_action_cards`

    // Doacoes (tabela pode nao existir)
    let doacoesStats = [{ total_doacoes: 0, total_arrecadado: 0 }]
    try {
      doacoesStats = await sql`
        SELECT 
          COUNT(*) as total_doacoes, 
          COALESCE(SUM(amount), 0) as total_arrecadado
        FROM donations
        WHERE payment_status = 'CONFIRMED' OR payment_status IS NULL
      `
    } catch (e) {
      // Tabela donations pode nao existir
    }

    // NOBIS registrados (com inscription_id)
    let nobisRegistered = [{ total: 0 }]
    try {
      nobisRegistered = await sql`SELECT COUNT(*) as total FROM impact_action_cards WHERE inscription_id IS NOT NULL`
    } catch (e) {
      // Coluna inscription_id pode nao existir
    }

    // Validacoes VCA (tabela pode nao existir)
    let validacoes = [{ total: 0 }]
    try {
      validacoes = await sql`SELECT COUNT(*) as total FROM vca_votes`
    } catch (e) {
      // Tabela vca_votes pode nao existir
    }

    return NextResponse.json({
      stats: {
        totalArrecadado: Number(doacoesStats[0]?.total_arrecadado || 0),
        totalDoacoes: Number(doacoesStats[0]?.total_doacoes || 0),
        totalProjetos: Number(fundingTotal[0]?.total || 0) + Number(iacTotal[0]?.total || 0),
        projetosAtivos: Number(fundingActive[0]?.total || 0),
        projetosConcluidos: Number(fundingCompleted[0]?.total || 0),
        totalBeneficiarios: Number(beneficiarios[0]?.total || 0),
        totalDoadores: Number(doadores[0]?.total || 0),
        totalInstituicoes: Number(institutionsTotal[0]?.total || 0),
        instituicoesVerificadas: Number(institutionsVerified[0]?.total || 0),
        totalCheckers: Number(checkers[0]?.total || 0),
        validacoesRealizadas: Number(validacoes[0]?.total || 0),
        projetosSociais: Number(iacSocial[0]?.total || 0),
        projetosAmbientais: Number(iacAmbiental[0]?.total || 0),
        nobisRegistered: Number(nobisRegistered[0]?.total || 0),
        totalUsuarios: Number(usersTotal[0]?.total || 0),
      }
    })
  } catch (error) {
    console.error("[PLATAFORMA-STATS] Erro:", error)
    return NextResponse.json(defaultStats)
  }
}

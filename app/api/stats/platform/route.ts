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
    // Query simples - total de usuarios
    const usersTotal = await sql`SELECT COUNT(*) as total FROM users WHERE is_active = true`
    const doadores = await sql`SELECT COUNT(*) as total FROM users WHERE role = 'DOADOR' AND is_active = true`
    const checkers = await sql`SELECT COUNT(*) as total FROM users WHERE role = 'CHECKER' AND is_active = true`

    // Total de projetos
    const iacTotal = await sql`SELECT COUNT(*) as total FROM impact_action_cards`
    const iacSocial = await sql`SELECT COUNT(*) as total FROM impact_action_cards WHERE type = 'SOCIAL'`
    const iacAmbiental = await sql`SELECT COUNT(*) as total FROM impact_action_cards WHERE type = 'AMBIENTAL'`
    const beneficiarios = await sql`SELECT COALESCE(SUM(estimated_beneficiaries), 0) as total FROM impact_action_cards`

    // Total de instituicoes
    const instTotal = await sql`SELECT COUNT(*) as total FROM institutions`

    return NextResponse.json({
      stats: {
        totalArrecadado: 0,
        totalDoacoes: 0,
        totalProjetos: Number(iacTotal[0]?.total || 0),
        projetosAtivos: Number(iacTotal[0]?.total || 0),
        projetosConcluidos: 0,
        totalBeneficiarios: Number(beneficiarios[0]?.total || 0),
        totalDoadores: Number(doadores[0]?.total || 0),
        totalInstituicoes: Number(instTotal[0]?.total || 0),
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

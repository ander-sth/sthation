import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// API de estatisticas especificas do usuario
// Dados apenas do usuario logado - suas acoes pessoais

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("user_id")
  const role = searchParams.get("role")

  if (!userId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ stats: getEmptyStats(role || "DOADOR") })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    if (role === "DOADOR") {
      return NextResponse.json({ stats: await getDonorStats(sql, userId) })
    } else if (role === "INSTITUICAO" || role === "INSTITUICAO_SOCIAL") {
      return NextResponse.json({ stats: await getInstitutionStats(sql, userId) })
    } else if (role === "CHECKER") {
      return NextResponse.json({ stats: await getCheckerStats(sql, userId) })
    } else if (role === "PREFEITURA") {
      return NextResponse.json({ stats: await getPrefeituraStats(sql, userId) })
    } else {
      return NextResponse.json({ stats: getEmptyStats(role || "DOADOR") })
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ stats: getEmptyStats(role || "DOADOR") })
  }
}

async function getDonorStats(sql: any, userId: string) {
  // Doacoes do usuario
  const donations = await sql`
    SELECT 
      COALESCE(SUM(amount), 0) as total_doado,
      COUNT(*) as total_doacoes,
      COUNT(DISTINCT funding_project_id) as projetos_apoiados
    FROM donations
    WHERE donor_id = ${userId} AND status = 'COMPLETED'
  `

  const totalDoado = Number(donations[0]?.total_doado || 0)
  const cashback = Math.floor(totalDoado * 0.05)

  // Posicao no ranking (quantos doaram mais que ele)
  const ranking = await sql`
    SELECT COUNT(*) + 1 as posicao
    FROM (
      SELECT donor_id, SUM(amount) as total
      FROM donations
      WHERE status = 'COMPLETED'
      GROUP BY donor_id
      HAVING SUM(amount) > ${totalDoado}
    ) ranked
  `

  return {
    totalDoado,
    totalDoacoes: Number(donations[0]?.total_doacoes || 0),
    projetosApoiados: Number(donations[0]?.projetos_apoiados || 0),
    cashbackDisponivel: cashback,
    posicaoRanking: totalDoado > 0 ? Number(ranking[0]?.posicao || 1) : null,
  }
}

async function getInstitutionStats(sql: any, userId: string) {
  // Buscar instituicao do usuario
  const institution = await sql`
    SELECT id FROM institutions WHERE user_id = ${userId} LIMIT 1
  `
  
  if (!institution[0]) {
    return {
      totalArrecadado: 0,
      totalIACs: 0,
      iacsAtivos: 0,
      totalBeneficiarios: 0,
      totalDoacoes: 0,
    }
  }

  const instId = institution[0].id

  // IACs da instituicao
  const iacs = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status IN ('DRAFT', 'FUNDING', 'EXECUTING')) as ativos,
      COALESCE(SUM(estimated_beneficiaries), 0) as beneficiarios
    FROM impact_action_cards
    WHERE institution_id = ${instId}
  `

  // Doacoes recebidas
  const donations = await sql`
    SELECT 
      COALESCE(SUM(d.amount), 0) as total,
      COUNT(*) as count
    FROM donations d
    JOIN funding_projects fp ON d.funding_project_id = fp.id
    JOIN impact_action_cards iac ON fp.iac_id = iac.id
    WHERE iac.institution_id = ${instId} AND d.status = 'COMPLETED'
  `

  return {
    totalArrecadado: Number(donations[0]?.total || 0),
    totalIACs: Number(iacs[0]?.total || 0),
    iacsAtivos: Number(iacs[0]?.ativos || 0),
    totalBeneficiarios: Number(iacs[0]?.beneficiarios || 0),
    totalDoacoes: Number(donations[0]?.count || 0),
  }
}

async function getCheckerStats(sql: any, userId: string) {
  // Validacoes do checker
  const validations = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE vote = 'APPROVED') as aprovadas,
      COUNT(*) FILTER (WHERE vote = 'REJECTED') as rejeitadas
    FROM vca_votes
    WHERE checker_id = ${userId}
  `

  // Nobis ganhos (simulado por enquanto)
  const nobisGanhos = Number(validations[0]?.total || 0) * 10

  return {
    totalValidacoes: Number(validations[0]?.total || 0),
    aprovadas: Number(validations[0]?.aprovadas || 0),
    rejeitadas: Number(validations[0]?.rejeitadas || 0),
    nobisGanhos,
    pendentes: 0, // Seria calculado com base em sessoes abertas
  }
}

async function getPrefeituraStats(sql: any, userId: string) {
  // Por enquanto retorna dados vazios - a tabela gov_projects sera criada futuramente
  // Quando implementar, buscar de gov_projects e gov_subscriptions
  return {
    projetosInscritos: 0,
    projetosVerificados: 0,
    projetosBlockchain: 0,
    projetosEmAnalise: 0,
    projetosSociais: 0,
    projetosAmbientais: 0,
    totalBeneficiarios: 0,
    totalInvestido: 0,
  }
}

function getEmptyStats(role: string) {
  if (role === "DOADOR") {
    return {
      totalDoado: 0,
      totalDoacoes: 0,
      projetosApoiados: 0,
      cashbackDisponivel: 0,
      posicaoRanking: null,
    }
  } else if (role === "INSTITUICAO" || role === "INSTITUICAO_SOCIAL") {
    return {
      totalArrecadado: 0,
      totalIACs: 0,
      iacsAtivos: 0,
      totalBeneficiarios: 0,
      totalDoacoes: 0,
    }
  } else if (role === "CHECKER") {
    return {
      totalValidacoes: 0,
      aprovadas: 0,
      rejeitadas: 0,
      nobisGanhos: 0,
      pendentes: 0,
    }
  } else if (role === "PREFEITURA") {
    return {
      projetosInscritos: 0,
      projetosVerificados: 0,
      projetosBlockchain: 0,
      projetosEmAnalise: 0,
      projetosSociais: 0,
      projetosAmbientais: 0,
      totalBeneficiarios: 0,
      totalInvestido: 0,
    }
  }
  return {}
}

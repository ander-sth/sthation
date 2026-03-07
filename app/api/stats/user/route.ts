// STATS USER API v2 - TIMESTAMP: 2024-03-06-22-25-00
// Usa tabelas corretas: donations.donorId, organizations, projects
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("user_id")
  const role = searchParams.get("role")

  if (!userId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ stats: getEmptyStats(role || "DONOR") })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Mapear roles do frontend para backend
    const normalizedRole = normalizeRole(role || "DONOR")

    if (normalizedRole === "DONOR") {
      return NextResponse.json({ stats: await getDonorStats(sql, userId) })
    } else if (normalizedRole === "INSTITUTION") {
      return NextResponse.json({ stats: await getInstitutionStats(sql, userId) })
    } else if (normalizedRole === "CHECKER") {
      return NextResponse.json({ stats: await getCheckerStats(sql, userId) })
    } else if (normalizedRole === "GOV") {
      return NextResponse.json({ stats: await getGovStats(sql, userId) })
    } else {
      return NextResponse.json({ stats: getEmptyStats(normalizedRole) })
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ stats: getEmptyStats(role || "DONOR") })
  }
}

function normalizeRole(role: string): string {
  const map: Record<string, string> = {
    "DOADOR": "DONOR", "DONOR": "DONOR",
    "INSTITUICAO": "INSTITUTION", "INSTITUICAO_SOCIAL": "INSTITUTION", "INSTITUTION": "INSTITUTION",
    "EMPRESA_AMBIENTAL": "ENVIRONMENTAL_COMPANY", "ENVIRONMENTAL_COMPANY": "ENVIRONMENTAL_COMPANY",
    "PREFEITURA": "GOV", "GOV": "GOV",
    "CHECKER": "CHECKER", "CERTIFIER": "CHECKER",
    "ANALYST": "ANALYST", "ADMIN": "ADMIN",
  }
  return map[role.toUpperCase()] || "DONOR"
}

async function getDonorStats(sql: any, userId: string) {
  // Doacoes do usuario - usa donorId (camelCase)
  const donations = await sql`
    SELECT 
      COALESCE(SUM(amount), 0) as total_doado,
      COUNT(*) as total_doacoes,
      COUNT(DISTINCT "projectId") as projetos_apoiados
    FROM donations
    WHERE "donorId" = ${userId} AND status = 'CONFIRMED'
  `

  const totalDoado = Number(donations[0]?.total_doado || 0)
  const cashback = Math.floor(totalDoado * 0.05)

  // Posicao no ranking
  const ranking = await sql`
    SELECT COUNT(*) + 1 as posicao
    FROM (
      SELECT "donorId", SUM(amount) as total
      FROM donations
      WHERE status = 'CONFIRMED'
      GROUP BY "donorId"
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
  // Buscar organizacao do usuario via organizationId
  const user = await sql`
    SELECT "organizationId" FROM users WHERE id = ${userId} LIMIT 1
  `
  
  const orgId = user[0]?.organizationId
  if (!orgId) {
    return getEmptyStats("INSTITUTION")
  }

  // Projetos da organizacao
  const projects = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status::text IN ('active', 'funded', 'executing')) as ativos,
      COALESCE(SUM(beneficiaries), 0) as beneficiarios,
      COALESCE(SUM("currentAmount"), 0) as arrecadado
    FROM projects
    WHERE "organizationId" = ${orgId}
  `

  // IACs da organizacao
  const iacs = await sql`
    SELECT COUNT(*) as total
    FROM impact_action_cards
    WHERE "organizationId" = ${orgId}
  `

  // Doacoes recebidas
  const donations = await sql`
    SELECT COUNT(*) as count
    FROM donations d
    JOIN projects p ON d."projectId" = p.id
    WHERE p."organizationId" = ${orgId} AND d.status = 'CONFIRMED'
  `

  return {
    totalArrecadado: Number(projects[0]?.arrecadado || 0),
    totalProjetos: Number(projects[0]?.total || 0),
    totalIACs: Number(iacs[0]?.total || 0),
    iacsAtivos: Number(projects[0]?.ativos || 0),
    totalBeneficiarios: Number(projects[0]?.beneficiarios || 0),
    totalDoacoes: Number(donations[0]?.count || 0),
  }
}

async function getCheckerStats(sql: any, userId: string) {
  // Validacoes do checker usando vca_assignments
  const validations = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE "isApproved" = true) as aprovadas,
      COUNT(*) FILTER (WHERE "isApproved" = false AND "completedAt" IS NOT NULL) as rejeitadas,
      COUNT(*) FILTER (WHERE "completedAt" IS NULL) as pendentes
    FROM vca_assignments
    WHERE "checkerId" = ${userId}
  `

  const nobisGanhos = Number(validations[0]?.total || 0) * 10

  return {
    totalValidacoes: Number(validations[0]?.total || 0),
    aprovadas: Number(validations[0]?.aprovadas || 0),
    rejeitadas: Number(validations[0]?.rejeitadas || 0),
    nobisGanhos,
    pendentes: Number(validations[0]?.pendentes || 0),
  }
}

async function getGovStats(sql: any, userId: string) {
  // Estatisticas para prefeituras/governos
  // Buscar projetos na regiao do usuario
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
  if (role === "DONOR") {
    return {
      totalDoado: 0,
      totalDoacoes: 0,
      projetosApoiados: 0,
      cashbackDisponivel: 0,
      posicaoRanking: null,
    }
  } else if (role === "INSTITUTION" || role === "ENVIRONMENTAL_COMPANY") {
    return {
      totalArrecadado: 0,
      totalProjetos: 0,
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
  } else if (role === "GOV") {
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

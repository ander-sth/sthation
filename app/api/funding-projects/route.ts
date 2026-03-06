// FUNDING PROJECTS API - NOVA VERSAO LIMPA
// Criado em 2024-03-06 para resolver problema de cache
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// Funcao auxiliar para mapear status
function mapProjectStatus(rawStatus: string | null): string {
  if (!rawStatus) return "FUNDING"
  const statusMap: Record<string, string> = {
    active: "FUNDING",
    ACTIVE: "FUNDING",
    funded: "FUNDED",
    FUNDED: "FUNDED",
    executing: "EXECUTING",
    EXECUTING: "EXECUTING",
    completed: "COMPLETED",
    COMPLETED: "COMPLETED",
    cancelled: "CANCELLED",
    CANCELLED: "CANCELLED",
  }
  return statusMap[rawStatus] || "FUNDING"
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const statusFilter = url.searchParams.get("status")
  const categoryFilter = url.searchParams.get("category")
  const maxResults = parseInt(url.searchParams.get("limit") || "20")

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ projects: [] })
  }

  const db = neon(process.env.DATABASE_URL)

  try {
    // Buscar projetos - IMPORTANTE: usar ::text para converter enum
    const rawProjects = await db`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.category,
        p.subcategory,
        p.status::text as raw_status,
        p."targetAmount",
        p."currentAmount",
        p.beneficiaries,
        p."endDate",
        p.city,
        p.state,
        p."imageUrl",
        p."odsGoals",
        p."createdAt",
        o.id as org_id,
        o.name as org_name,
        o."isVerified" as org_verified,
        o.type as org_type
      FROM projects p
      LEFT JOIN organizations o ON p."organizationId" = o.id
      ORDER BY p."createdAt" DESC
      LIMIT ${maxResults}
    `

    // Processar e filtrar em JavaScript (evita erros de enum)
    let projectList = (rawProjects || []) as any[]

    // Excluir cancelados
    projectList = projectList.filter((p) => {
      const st = (p.raw_status || "").toLowerCase()
      return st !== "cancelled" && st !== "canceled"
    })

    // Filtrar por status se solicitado
    if (statusFilter) {
      projectList = projectList.filter((p) =>
        (p.raw_status || "").toLowerCase() === statusFilter.toLowerCase()
      )
    }

    // Filtrar por categoria se solicitado
    if (categoryFilter) {
      projectList = projectList.filter((p) =>
        (p.category || "").toLowerCase().includes(categoryFilter.toLowerCase())
      )
    }

    // Formatar resposta final
    const formattedProjects = projectList.map((p) => ({
      id: p.id,
      iacId: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory,
      status: mapProjectStatus(p.raw_status),
      goalAmount: Number(p.targetAmount) || 0,
      currentAmount: Number(p.currentAmount) || 0,
      donorsCount: 0,
      deadline: p.endDate,
      location: { name: p.city, state: p.state },
      vcaScore: null,
      estimatedBeneficiaries: p.beneficiaries,
      imageUrl: p.imageUrl,
      odsGoals: p.odsGoals || [],
      institution: {
        id: p.org_id,
        name: p.org_name || "Instituicao",
        verified: p.org_verified || false,
        type: p.org_type,
      },
      createdAt: p.createdAt,
      progress: p.targetAmount > 0
        ? Math.round((Number(p.currentAmount) / Number(p.targetAmount)) * 100)
        : 0,
    }))

    return NextResponse.json({ projects: formattedProjects })
  } catch (err) {
    console.error("Funding projects error:", err)
    return NextResponse.json(
      { error: "Failed to fetch projects", projects: [] },
      { status: 500 }
    )
  }
}

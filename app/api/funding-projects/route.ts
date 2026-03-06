// FUNDING PROJECTS API v8 - COMPLETAMENTE REESCRITO
// TIMESTAMP: 2024-03-06-22-20-00
// USA status::text para converter enum, SEM comparacao no SQL
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const category = searchParams.get("category")
  const limitParam = parseInt(searchParams.get("limit") || "20")

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ projects: [] })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Query busca TODOS os projetos e converte status para texto
    // NAO usa WHERE com enum para evitar erro "invalid input value"
    const projects = await sql`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.category,
        p.subcategory,
        p.status::text as status,
        p."targetAmount" as goal_amount,
        p."currentAmount" as current_amount,
        p.beneficiaries,
        p."endDate" as deadline,
        p.city as location_name,
        p.state as location_state,
        p."imageUrl" as image_url,
        p."odsGoals" as ods_goals,
        p."createdAt" as created_at,
        org.name as institution_name,
        org.id as institution_id,
        org."isVerified" as institution_verified,
        org.type as institution_type
      FROM projects p
      LEFT JOIN organizations org ON p."organizationId" = org.id
      ORDER BY p."createdAt" DESC
      LIMIT ${limitParam}
    `

    // Filtrar em JavaScript (NAO no SQL para evitar erro de enum)
    let filtered = (projects || []) as any[]

    // Filtrar por status se especificado
    if (status) {
      filtered = filtered.filter((p) => 
        p.status?.toLowerCase() === status.toLowerCase()
      )
    }

    // Filtrar por categoria se especificado
    if (category) {
      filtered = filtered.filter((p) =>
        p.category?.toLowerCase().includes(category.toLowerCase())
      )
    }

    // Excluir cancelados (filtro em JS, nao SQL)
    filtered = filtered.filter((p) => {
      const s = p.status?.toLowerCase()
      return s !== "cancelled" && s !== "canceled"
    })

    // Formatar resposta
    const formatted = filtered.map((p) => ({
      id: p.id,
      iacId: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory,
      status: mapStatus(p.status),
      goalAmount: Number(p.goal_amount) || 0,
      currentAmount: Number(p.current_amount) || 0,
      donorsCount: 0,
      deadline: p.deadline,
      location: { name: p.location_name, state: p.location_state },
      vcaScore: null,
      estimatedBeneficiaries: p.beneficiaries,
      imageUrl: p.image_url,
      odsGoals: p.ods_goals || [],
      institution: {
        id: p.institution_id,
        name: p.institution_name || "Instituicao",
        verified: p.institution_verified || false,
        type: p.institution_type,
      },
      createdAt: p.created_at,
      progress: p.goal_amount > 0 
        ? Math.round((Number(p.current_amount) / Number(p.goal_amount)) * 100) 
        : 0,
    }))

    return NextResponse.json({ projects: formatted })
  } catch (error) {
    console.error("Error fetching funding projects:", error)
    return NextResponse.json({ error: "Failed to fetch", projects: [] }, { status: 500 })
  }
}

function mapStatus(s: string | null): string {
  if (!s) return "FUNDING"
  const map: Record<string, string> = {
    active: "FUNDING", ACTIVE: "FUNDING",
    funded: "FUNDED", FUNDED: "FUNDED",
    executing: "EXECUTING", EXECUTING: "EXECUTING",
    completed: "COMPLETED", COMPLETED: "COMPLETED",
    cancelled: "CANCELLED", CANCELLED: "CANCELLED",
  }
  return map[s] || "FUNDING"
}

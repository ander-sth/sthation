import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// GET funding projects from database
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const category = searchParams.get("category")
  const limitParam = parseInt(searchParams.get("limit") || "20")

  // Verificar DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error("[v0] DATABASE_URL not configured")
    return NextResponse.json({ projects: [] })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Query using the existing database schema:
    // - projects table for funding data (targetAmount, currentAmount, status)
    // - impact_action_cards for IAC details
    // - organizations for institution info
    const projects = await sql`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.category,
        p.subcategory,
        p.status,
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
      WHERE p.status != 'cancelled'
      ORDER BY 
        CASE p.status::text
          WHEN 'active' THEN 1 
          WHEN 'funded' THEN 2 
          WHEN 'completed' THEN 3 
        END,
        p."createdAt" DESC
      LIMIT ${limitParam}
    `

    // Filtrar no JS para maior flexibilidade
    let filteredProjects = projects as any[]

    if (status) {
      filteredProjects = filteredProjects.filter((p) => 
        p.status?.toLowerCase() === status.toLowerCase()
      )
    }

    if (category) {
      filteredProjects = filteredProjects.filter((p) =>
        p.category?.toLowerCase().includes(category.toLowerCase())
      )
    }

    // Transformar para o formato esperado pelo frontend
    const formattedProjects = filteredProjects.map((p) => ({
      id: p.id,
      iacId: p.id, // Use project id as iacId for compatibility
      title: p.title,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory,
      status: mapStatus(p.status),
      goalAmount: Number(p.goal_amount) || 0,
      currentAmount: Number(p.current_amount) || 0,
      donorsCount: 0, // Not tracked in current schema
      deadline: p.deadline,
      location: {
        name: p.location_name,
        state: p.location_state,
      },
      vcaScore: null, // Not available in projects table
      estimatedBeneficiaries: p.beneficiaries,
      imageUrl: p.image_url,
      odsGoals: p.ods_goals || [],
      institution: {
        id: p.institution_id,
        name: p.institution_name || 'Instituicao',
        verified: p.institution_verified || false,
        type: p.institution_type,
        pixKey: null,
        pixKeyType: null,
        pixHolderName: null,
      },
      createdAt: p.created_at,
      // Calcular progresso
      progress: p.goal_amount > 0 ? Math.round((Number(p.current_amount) / Number(p.goal_amount)) * 100) : 0,
    }))

    return NextResponse.json({ projects: formattedProjects })
  } catch (error) {
    console.error("Error fetching funding projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch funding projects" },
      { status: 500 }
    )
  }
}

// Map database status to API status
function mapStatus(dbStatus: string | null): string {
  if (!dbStatus) return 'FUNDING'
  const statusMap: Record<string, string> = {
    'active': 'FUNDING',
    'funded': 'FUNDED',
    'executing': 'EXECUTING',
    'completed': 'COMPLETED',
    'cancelled': 'CANCELLED',
  }
  return statusMap[dbStatus.toLowerCase()] || 'FUNDING'
}

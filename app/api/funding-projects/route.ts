import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

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
    const projects = await sql`
      SELECT 
        fp.id,
        fp.iac_id,
        iac.title,
        iac.description,
        iac.category,
        iac.tsb_category_id,
        fp.status,
        fp.goal_amount,
        fp.current_amount,
        fp.donors_count,
        fp.deadline,
        iac.location_name,
        iac.location_state,
        iac.vca_score,
        iac.estimated_beneficiaries,
        inst.name as institution_name,
        inst.id as institution_id,
        inst.is_verified as institution_verified,
        inst.pix_key,
        inst.pix_key_type,
        inst.pix_holder_name,
        fp.created_at
      FROM funding_projects fp
      JOIN impact_action_cards iac ON fp.iac_id = iac.id
      JOIN institutions inst ON iac.institution_id = inst.id
      WHERE fp.status != 'CANCELLED'
      ORDER BY 
        CASE fp.status 
          WHEN 'FUNDING' THEN 1 
          WHEN 'FUNDED' THEN 2 
          WHEN 'COMPLETED' THEN 3 
        END,
        fp.created_at DESC
      LIMIT ${limitParam}
    `

    // Filtrar no JS para maior flexibilidade
    let filteredProjects = projects as any[]

    if (status) {
      filteredProjects = filteredProjects.filter((p) => p.status === status)
    }

    if (category) {
      filteredProjects = filteredProjects.filter((p) =>
        p.category.toLowerCase().includes(category.toLowerCase())
      )
    }

    // Transformar para o formato esperado pelo frontend
    const formattedProjects = filteredProjects.map((p) => ({
      id: p.id,
      iacId: p.iac_id,
      title: p.title,
      description: p.description,
      category: p.category,
      tsbCategoryId: p.tsb_category_id,
      status: p.status,
      goalAmount: Number(p.goal_amount),
      currentAmount: Number(p.current_amount),
      donorsCount: p.donors_count,
      deadline: p.deadline,
      location: {
        name: p.location_name,
        state: p.location_state,
      },
      vcaScore: p.vca_score ? Number(p.vca_score) : null,
      estimatedBeneficiaries: p.estimated_beneficiaries,
      institution: {
        id: p.institution_id,
        name: p.institution_name,
        verified: p.institution_verified,
        pixKey: p.pix_key,
        pixKeyType: p.pix_key_type,
        pixHolderName: p.pix_holder_name,
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

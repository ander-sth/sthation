import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ validations: [] })
  }
  
  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const limitParam = parseInt(searchParams.get("limit") || "20")

  try {
    // Buscar sessoes VCA pendentes/abertas com dados do IAC e instituicao
    const sessions = await sql`
      SELECT 
        vs.id,
        vs.iac_id,
        vs.status,
        vs.started_at,
        vs.deadline,
        vs.votes_count,
        vs.total_checkers,
        vs.approval_percentage,
        iac.title,
        iac.description,
        iac.category,
        iac.tsb_category_id,
        iac.location_name,
        iac.location_state,
        iac.estimated_beneficiaries,
        iac.vca_score,
        inst.name as institution_name,
        inst.is_verified as institution_verified
      FROM vca_sessions vs
      JOIN impact_action_cards iac ON vs.iac_id = iac.id
      JOIN institutions inst ON iac.institution_id = inst.id
      WHERE vs.status IN ('OPEN', 'PENDING', 'IN_PROGRESS')
      ORDER BY vs.started_at DESC
      LIMIT ${limitParam}
    `

    // Formatar dados para o frontend
    const validations = sessions.map((s: any) => ({
      id: s.id,
      iacId: s.iac_id,
      title: s.title,
      description: s.description,
      category: s.category || s.tsb_category_id,
      institution: {
        name: s.institution_name,
        verified: s.institution_verified,
      },
      location: {
        name: s.location_name,
        state: s.location_state,
      },
      status: s.status,
      startedAt: s.started_at,
      deadline: s.deadline,
      votesCount: s.votes_count || 0,
      totalCheckers: s.total_checkers || 5,
      approvalPercentage: s.approval_percentage || 0,
      estimatedBeneficiaries: s.estimated_beneficiaries,
      vcaScore: s.vca_score,
    }))

    return NextResponse.json({ validations })
  } catch (error) {
    console.error("[API] Error fetching VCA sessions:", error)
    return NextResponse.json({ validations: [] })
  }
}

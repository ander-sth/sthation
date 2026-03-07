// API FUNDING PROJECTS - USANDO SCHEMA REAL
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// Schema real:
// funding_projects: id, title, description, status, goal_amount, current_amount, donors_count, deadline, iac_id
// impact_action_cards: id, title, description, category, type, institution_id, location_name, location_state
// institutions: id, name, cnpj, type, is_verified

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ projects: [] })
  }

  const sql = neon(process.env.DATABASE_URL)
  const params = new URL(req.url).searchParams
  const status = params.get("status")
  const limit = parseInt(params.get("limit") || "20")

  try {
    let data
    
    if (status) {
      data = await sql`
        SELECT 
          fp.id, fp.title, fp.description, fp.status,
          fp.goal_amount, fp.current_amount, fp.donors_count, fp.deadline,
          fp.iac_id, fp.created_at, fp.updated_at,
          iac.category, iac.type as iac_type, iac.location_name, iac.location_state,
          iac.estimated_beneficiaries, iac.vca_score,
          i.id as inst_id, i.name as inst_name, i.is_verified as inst_verified, i.type as inst_type
        FROM funding_projects fp
        LEFT JOIN impact_action_cards iac ON fp.iac_id = iac.id
        LEFT JOIN institutions i ON iac.institution_id = i.id
        WHERE fp.status = ${status}
        ORDER BY fp.created_at DESC
        LIMIT ${limit}
      `
    } else {
      data = await sql`
        SELECT 
          fp.id, fp.title, fp.description, fp.status,
          fp.goal_amount, fp.current_amount, fp.donors_count, fp.deadline,
          fp.iac_id, fp.created_at, fp.updated_at,
          iac.category, iac.type as iac_type, iac.location_name, iac.location_state,
          iac.estimated_beneficiaries, iac.vca_score,
          i.id as inst_id, i.name as inst_name, i.is_verified as inst_verified, i.type as inst_type
        FROM funding_projects fp
        LEFT JOIN impact_action_cards iac ON fp.iac_id = iac.id
        LEFT JOIN institutions i ON iac.institution_id = i.id
        ORDER BY fp.created_at DESC
        LIMIT ${limit}
      `
    }

    // Mapear para formato esperado
    const projects = (data || []).map((r: any) => ({
      id: r.id,
      iacId: r.iac_id,
      title: r.title,
      description: r.description,
      category: r.category || 'social',
      status: r.status || 'FUNDING',
      goalAmount: Number(r.goal_amount) || 0,
      currentAmount: Number(r.current_amount) || 0,
      donorsCount: r.donors_count || 0,
      deadline: r.deadline,
      location: { name: r.location_name, state: r.location_state },
      location_name: r.location_name,
      location_state: r.location_state,
      vcaScore: r.vca_score,
      estimatedBeneficiaries: r.estimated_beneficiaries,
      institution: { 
        id: r.inst_id, 
        name: r.inst_name || "Instituicao", 
        type: r.inst_type,
        verified: r.inst_verified || false 
      },
      institution_name: r.inst_name,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      progress: r.goal_amount > 0 ? Math.round((Number(r.current_amount) / Number(r.goal_amount)) * 100) : 0,
    }))

    return NextResponse.json({ projects })
  } catch (e) {
    console.error("[FUNDING] Erro:", e)
    return NextResponse.json({ projects: [], error: "Erro ao buscar projetos" }, { status: 500 })
  }
}

// API PARA LISTAR PROJETOS PARA DOACAO - USANDO SCHEMA REAL
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// Schema real:
// funding_projects: id, title, description, status, goal_amount, current_amount, donors_count, deadline, iac_id
// impact_action_cards: id, title, description, category, type, institution_id, location_name, location_state, estimated_beneficiaries
// institutions: id, name, cnpj, type, is_verified

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ projects: [] })
  }

  const sql = neon(process.env.DATABASE_URL)
  const params = new URL(req.url).searchParams
  const limit = parseInt(params.get("limit") || "20")

  try {
    // Primeiro, tentar buscar de funding_projects
    let data: any[] = []
    
    try {
      data = await sql`
        SELECT 
          fp.id, fp.title, fp.description, fp.status,
          fp.goal_amount, fp.current_amount, fp.donors_count, fp.deadline,
          fp.iac_id, fp.created_at,
          iac.category, iac.type as iac_type, iac.location_name, iac.location_state,
          iac.estimated_beneficiaries,
          i.id as inst_id, i.name as inst_name, i.is_verified as inst_verified
        FROM funding_projects fp
        LEFT JOIN impact_action_cards iac ON fp.iac_id = iac.id
        LEFT JOIN institutions i ON iac.institution_id = i.id
        WHERE fp.status = 'FUNDING'
        ORDER BY fp.created_at DESC
        LIMIT ${limit}
      `
    } catch {
      // Se funding_projects nao existe, buscar direto de impact_action_cards
      data = await sql`
        SELECT 
          iac.id, iac.title, iac.description, iac.status,
          iac.funding_goal as goal_amount, iac.total_donated as current_amount, 
          iac.donors_count, iac.created_at,
          iac.id as iac_id,
          iac.category, iac.type as iac_type, iac.location_name, iac.location_state,
          iac.estimated_beneficiaries,
          i.id as inst_id, i.name as inst_name, i.is_verified as inst_verified
        FROM impact_action_cards iac
        LEFT JOIN institutions i ON iac.institution_id = i.id
        WHERE iac.status IN ('SUBMITTED', 'VALIDATED', 'CERTIFIED', 'EM_ANDAMENTO')
        ORDER BY iac.created_at DESC
        LIMIT ${limit}
      `
    }

    // Mapear para formato esperado pelo frontend
    const projects = (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category || 'social',
      status: r.status || 'FUNDING',
      goal_amount: Number(r.goal_amount) || 0,
      goalAmount: Number(r.goal_amount) || 0,
      current_amount: Number(r.current_amount) || 0,
      currentAmount: Number(r.current_amount) || 0,
      raised: Number(r.current_amount) || 0,
      goal: Number(r.goal_amount) || 0,
      deadline: r.deadline,
      donors_count: r.donors_count || 0,
      donorsCount: r.donors_count || 0,
      location_name: r.location_name,
      location_state: r.location_state,
      beneficiaries: r.estimated_beneficiaries || 0,
      institution_name: r.inst_name || "Instituicao",
      institution: {
        id: r.inst_id,
        name: r.inst_name || "Instituicao",
        verified: r.inst_verified || false,
      },
      createdAt: r.created_at,
      progress: r.goal_amount > 0 ? Math.round((Number(r.current_amount) / Number(r.goal_amount)) * 100) : 0,
    }))

    return NextResponse.json({ projects })
  } catch (e) {
    console.error("[PROJETOS-DOAR] Erro:", e)
    return NextResponse.json({ projects: [], error: String(e) }, { status: 500 })
  }
}

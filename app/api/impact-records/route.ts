// API IMPACT RECORDS - USANDO SCHEMA REAL
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// Schema real:
// impact_action_cards: id, title, description, category, type, status, institution_id, location_name, location_state, estimated_beneficiaries, budget
// institutions: id, name, cnpj, type, is_verified

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ impactRecords: [] })
  }

  const sql = neon(process.env.DATABASE_URL)
  const params = new URL(req.url).searchParams
  const limit = parseInt(params.get("limit") || "20")

  try {
    // Buscar impact_action_cards com institutions (tabela correta)
    const data = await sql`
      SELECT 
        iac.id, iac.title, iac.description, iac.category, iac.type,
        iac.status, iac.estimated_beneficiaries, iac.budget,
        iac.location_name, iac.location_state, iac.vca_score,
        iac.polygon_tx_hash, iac.inscription_id, iac.trail_id,
        iac.created_at,
        i.id as inst_id, i.name as inst_name, i.is_verified as inst_verified
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      ORDER BY iac.created_at DESC
      LIMIT ${limit}
    `

    const records = (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      type: r.type || 'SOCIAL',
      status: r.status || "DRAFT",
      beneficiaries: r.estimated_beneficiaries || 0,
      estimatedBeneficiaries: r.estimated_beneficiaries || 0,
      budget: Number(r.budget) || 0,
      location: { name: r.location_name, state: r.location_state },
      location_name: r.location_name,
      location_state: r.location_state,
      vcaScore: r.vca_score,
      polygonTxHash: r.polygon_tx_hash,
      inscriptionId: r.inscription_id,
      trailId: r.trail_id,
      institution: { 
        id: r.inst_id, 
        name: r.inst_name || "Instituicao", 
        verified: r.inst_verified || false 
      },
      institution_name: r.inst_name,
      createdAt: r.created_at,
    }))

    return NextResponse.json({ impactRecords: records })
  } catch (e) {
    console.error("[IMPACT] Erro:", e)
    return NextResponse.json({ impactRecords: [], error: "Erro ao buscar registros" }, { status: 500 })
  }
}

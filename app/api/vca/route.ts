import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// GET - Listar sessões VCA abertas para votação
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const checkerId = searchParams.get("checkerId")
  const status = searchParams.get("status") || "OPEN"

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database não configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Buscar sessões VCA com detalhes do IAC
    const sessions = await sql`
      SELECT 
        s.*,
        iac.title as iac_title,
        iac.category as iac_category,
        iac.location_name,
        iac.location_state,
        inst.name as institution_name,
        (SELECT COUNT(*) FROM vca_votes v WHERE v.session_id = s.id) as votes_count,
        ${checkerId ? sql`(SELECT COUNT(*) FROM vca_votes v WHERE v.session_id = s.id AND v.checker_id = ${checkerId}) > 0` : sql`false`} as already_voted
      FROM vca_sessions s
      JOIN impact_action_cards iac ON iac.id = s.iac_id
      LEFT JOIN institutions inst ON inst.id = iac.institution_id
      WHERE s.status = ${status}
      ORDER BY s.created_at DESC
    `

    return NextResponse.json({ sessions })
  } catch (error: any) {
    console.error("[VCA] Erro:", error)
    
    // Mock data para desenvolvimento
    if (error.message?.includes("does not exist")) {
      return NextResponse.json({
        sessions: [
          {
            id: "vca-1",
            iac_id: "iac-1",
            iac_title: "Projeto Horta Comunitária",
            iac_category: "SOCIAL",
            institution_name: "ONG Verde Vida",
            location_name: "São Paulo",
            location_state: "SP",
            status: "OPEN",
            min_checkers: 3,
            max_checkers: 7,
            votes_count: 2,
            already_voted: false,
            start_date: new Date().toISOString(),
          },
          {
            id: "vca-2",
            iac_id: "iac-2",
            iac_title: "Reciclagem Solidária",
            iac_category: "AMBIENTAL",
            institution_name: "Cooperativa EcoRecicla",
            location_name: "Curitiba",
            location_state: "PR",
            status: "OPEN",
            min_checkers: 3,
            max_checkers: 5,
            votes_count: 1,
            already_voted: false,
            start_date: new Date().toISOString(),
          },
        ],
      })
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar nova sessão VCA para um IAC
export async function POST(request: Request) {
  const body = await request.json()
  const { iacId, minCheckers = 3, maxCheckers = 7 } = body

  if (!iacId) {
    return NextResponse.json({ error: "iacId é obrigatório" }, { status: 400 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database não configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Verificar se já existe sessão aberta para este IAC
    const existing = await sql`
      SELECT id FROM vca_sessions WHERE iac_id = ${iacId} AND status = 'OPEN'
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "Já existe sessão VCA aberta para este projeto" }, { status: 409 })
    }

    // Criar sessão
    const result = await sql`
      INSERT INTO vca_sessions (iac_id, min_checkers, max_checkers, end_date)
      VALUES (${iacId}, ${minCheckers}, ${maxCheckers}, NOW() + INTERVAL '7 days')
      RETURNING *
    `

    // Atualizar status do IAC
    await sql`
      UPDATE impact_action_cards SET status = 'VCA_PENDING' WHERE id = ${iacId}
    `

    return NextResponse.json({ success: true, session: result[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[VCA POST] Erro:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

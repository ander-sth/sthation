import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Buscar IAC
    const iacs = await sql`
      SELECT 
        iac.*,
        i.name as institution_name,
        i.type as institution_type,
        i.city as institution_city,
        i.state as institution_state
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON i.id = iac.institution_id
      WHERE iac.id = ${id}
    `

    if (iacs.length === 0) {
      return NextResponse.json({ error: "IAC not found" }, { status: 404 })
    }

    const iac = iacs[0]

    // Buscar evidencias (tabela pode nao existir)
    let evidences: any[] = []
    try {
      evidences = await sql`
        SELECT * FROM evidences 
        WHERE iac_id = ${id}
        ORDER BY captured_at DESC
      `
    } catch (e) {
      // Tabela evidences pode nao existir ainda
    }

    // Buscar audit log (tabela pode nao existir)
    let auditLog: any[] = []
    try {
      auditLog = await sql`
        SELECT * FROM iac_audit_logs 
        WHERE iac_id = ${id}
        ORDER BY created_at DESC
      `
    } catch (e) {
      // Tabela iac_audit_logs pode nao existir ainda
    }

    // Buscar dados da Polygon (se houver)
    let polygonData = null
    try {
      const polygonTokens = await sql`
        SELECT * FROM polygon_tokens 
        WHERE iac_id = ${id}
        LIMIT 1
      `
      if (polygonTokens.length > 0) {
        polygonData = polygonTokens[0]
      }
    } catch (e) {
      // Tabela pode nao existir ainda
    }

    // Montar resposta
    const response = {
      iac: {
        ...iac,
        impact_metrics: iac.impact_metrics || null,
      },
      evidences,
      auditLog,
      institution: iac.institution_name ? {
        name: iac.institution_name,
        type: iac.institution_type,
        city: iac.institution_city,
        state: iac.institution_state,
      } : null,
      polygonData,
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error("[API] Erro ao buscar IAC:", error)
    return NextResponse.json(
      { error: "Erro ao buscar IAC", details: error.message },
      { status: 500 }
    )
  }
}

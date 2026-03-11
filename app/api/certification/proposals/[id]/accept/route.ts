import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Buscar proposta
    const proposals = await sql`
      SELECT cp.*, iac.institution_id, iac.title as project_title
      FROM certification_proposals cp
      JOIN impact_action_cards iac ON cp.iac_id = iac.id
      WHERE cp.id = ${id}
    `

    if (proposals.length === 0) {
      return NextResponse.json({ error: "Proposta nao encontrada" }, { status: 404 })
    }

    const proposal = proposals[0]

    if (proposal.status !== "PENDING") {
      return NextResponse.json(
        { error: "Esta proposta ja foi processada" },
        { status: 400 }
      )
    }

    // Aceitar esta proposta
    await sql`
      UPDATE certification_proposals 
      SET status = 'ACCEPTED', accepted_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
    `

    // Rejeitar outras propostas para o mesmo projeto
    await sql`
      UPDATE certification_proposals 
      SET status = 'REJECTED', rejected_at = NOW(), updated_at = NOW()
      WHERE iac_id = ${proposal.iac_id} AND id != ${id} AND status = 'PENDING'
    `

    // Atualizar status do projeto para "VALIDATED" (proposta aceita, aguardando certificação final)
    await sql`
      UPDATE impact_action_cards 
      SET status = 'VALIDATED', updated_at = NOW()
      WHERE id = ${proposal.iac_id}
    `

    return NextResponse.json({ 
      success: true, 
      message: "Proposta aceita com sucesso. O certificador sera notificado para iniciar a certificacao.",
      proposal: { ...proposal, status: "ACCEPTED" }
    })

  } catch (error: any) {
    console.error("[API] Erro ao aceitar proposta:", error)
    return NextResponse.json(
      { error: "Erro ao aceitar proposta", details: error.message },
      { status: 500 }
    )
  }
}

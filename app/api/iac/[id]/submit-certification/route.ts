import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

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
    // Verificar se o projeto existe e qual seu status atual
    const project = await sql`
      SELECT id, status, title, institution_id FROM impact_action_cards WHERE id = ${id}
    `

    if (project.length === 0) {
      return NextResponse.json({ error: "Projeto nao encontrado" }, { status: 404 })
    }

    const currentProject = project[0]

    // Verificar se pode submeter para certificação
    const allowedStatuses = ["DRAFT", "COLLECTING", "EM_ANDAMENTO", "CONCLUIDO"]
    if (!allowedStatuses.includes(currentProject.status)) {
      return NextResponse.json(
        { error: "Este projeto ja foi submetido para certificacao ou esta em um status que nao permite nova submissao" },
        { status: 400 }
      )
    }

    // Atualizar status para SUBMITTED (Aguardando Certificação)
    const updated = await sql`
      UPDATE impact_action_cards 
      SET 
        status = 'SUBMITTED',
        submitted_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (updated.length === 0) {
      return NextResponse.json({ error: "Falha ao atualizar projeto" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Projeto enviado para certificacao com sucesso",
      project: updated[0]
    })

  } catch (error) {
    console.error("Erro ao submeter para certificacao:", error)
    return NextResponse.json(
      { error: "Erro interno ao processar solicitacao" },
      { status: 500 }
    )
  }
}

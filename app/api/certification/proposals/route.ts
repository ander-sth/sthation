import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// Enviar proposta de certificação
export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const body = await request.json()
    const { iacId, certifierId, certifierInstitutionId, proposedValue, message } = body

    if (!iacId || !certifierId || !proposedValue) {
      return NextResponse.json(
        { error: "Dados incompletos. iacId, certifierId e proposedValue sao obrigatorios" },
        { status: 400 }
      )
    }

    // Verificar se projeto existe e está aguardando certificação
    const project = await sql`
      SELECT id, status, title FROM impact_action_cards WHERE id = ${iacId}
    `
    if (project.length === 0) {
      return NextResponse.json({ error: "Projeto nao encontrado" }, { status: 404 })
    }
    if (project[0].status !== "SUBMITTED") {
      return NextResponse.json(
        { error: "Este projeto nao esta aguardando certificacao" },
        { status: 400 }
      )
    }

    // Verificar se certificador já enviou proposta para este projeto
    const existingProposal = await sql`
      SELECT id FROM certification_proposals 
      WHERE iac_id = ${iacId} AND certifier_id = ${certifierId}
    `
    if (existingProposal.length > 0) {
      return NextResponse.json(
        { error: "Voce ja enviou uma proposta para este projeto" },
        { status: 400 }
      )
    }

    // Criar proposta
    const result = await sql`
      INSERT INTO certification_proposals (
        iac_id,
        certifier_id,
        certifier_institution_id,
        proposed_value,
        message,
        status
      ) VALUES (
        ${iacId},
        ${certifierId},
        ${certifierInstitutionId || null},
        ${proposedValue},
        ${message || null},
        'PENDING'
      )
      RETURNING *
    `

    return NextResponse.json({ 
      success: true, 
      proposal: result[0],
      message: "Proposta enviada com sucesso" 
    })

  } catch (error: any) {
    console.error("[API] Erro ao criar proposta:", error)
    return NextResponse.json(
      { error: "Erro ao criar proposta", details: error.message },
      { status: 500 }
    )
  }
}

// Buscar propostas (para empresa ambiental ver propostas recebidas)
export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const url = new URL(request.url)
    const iacId = url.searchParams.get("iacId")
    const institutionId = url.searchParams.get("institutionId")

    if (iacId) {
      // Buscar propostas para um projeto específico
      const proposals = await sql`
        SELECT 
          cp.*,
          u.name as certifier_name,
          u.email as certifier_email,
          i.name as certifier_institution_name
        FROM certification_proposals cp
        JOIN users u ON cp.certifier_id = u.id
        LEFT JOIN institutions i ON cp.certifier_institution_id = i.id
        WHERE cp.iac_id = ${iacId}
        ORDER BY cp.created_at DESC
      `
      return NextResponse.json({ success: true, proposals })
    }

    if (institutionId) {
      // Buscar todas as propostas para projetos de uma instituição
      const proposals = await sql`
        SELECT 
          cp.*,
          u.name as certifier_name,
          u.email as certifier_email,
          ci.name as certifier_institution_name,
          iac.title as project_title,
          iac.id as project_id
        FROM certification_proposals cp
        JOIN users u ON cp.certifier_id = u.id
        LEFT JOIN institutions ci ON cp.certifier_institution_id = ci.id
        JOIN impact_action_cards iac ON cp.iac_id = iac.id
        WHERE iac.institution_id = ${institutionId}
        ORDER BY cp.created_at DESC
      `
      return NextResponse.json({ success: true, proposals })
    }

    return NextResponse.json({ error: "iacId ou institutionId e obrigatorio" }, { status: 400 })

  } catch (error: any) {
    console.error("[API] Erro ao buscar propostas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar propostas", details: error.message },
      { status: 500 }
    )
  }
}

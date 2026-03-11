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
    const body = await request.json()
    const {
      certifierId,
      co2Avoided,
      methodologyScore,
      evidenceScore,
      totalScore,
      technicalNotes,
      checklist,
    } = body

    // Verificar se o projeto existe e está no status correto
    const projects = await sql`
      SELECT * FROM impact_action_cards WHERE id = ${id}
    `

    if (projects.length === 0) {
      return NextResponse.json({ error: "Projeto nao encontrado" }, { status: 404 })
    }

    const project = projects[0]

    if (project.status !== "VALIDATED") {
      return NextResponse.json(
        { error: "Projeto nao esta pronto para certificacao" },
        { status: 400 }
      )
    }

    // Gerar hash do certificado
    const certificationData = {
      projectId: id,
      projectTitle: project.title,
      institutionId: project.institution_id,
      co2Avoided,
      methodologyScore,
      evidenceScore,
      totalScore,
      certifierId,
      certifiedAt: new Date().toISOString(),
      checklist,
    }

    const hashData = JSON.stringify(certificationData)
    const hash = crypto.createHash("sha256").update(hashData).digest("hex")
    const polygonHash = `0x${hash}`

    // Atualizar projeto com certificação
    await sql`
      UPDATE impact_action_cards SET
        status = 'CERTIFIED',
        polygon_tx_hash = ${polygonHash},
        certified_at = NOW(),
        certification_score = ${totalScore},
        co2_equivalent = ${co2Avoided},
        updated_at = NOW()
      WHERE id = ${id}
    `

    // Registrar no histórico/audit (se tabela existir)
    try {
      await sql`
        INSERT INTO iac_audit_logs (iac_id, action, actor_id, details, created_at)
        VALUES (
          ${id},
          'CERTIFIED',
          ${certifierId},
          ${JSON.stringify({ hash: polygonHash, score: totalScore, co2Avoided, technicalNotes })},
          NOW()
        )
      `
    } catch (e) {
      // Tabela pode não existir
    }

    return NextResponse.json({
      success: true,
      hash: polygonHash,
      score: totalScore,
      co2Avoided,
      message: "Projeto certificado com sucesso",
    })

  } catch (error: any) {
    console.error("[API] Erro ao certificar projeto:", error)
    return NextResponse.json(
      { error: "Erro ao certificar projeto", details: error.message },
      { status: 500 }
    )
  }
}

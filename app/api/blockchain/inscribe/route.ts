import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { generateCertificateHash, registerCertificateOnChain, getExplorerLink } from "@/lib/blockchain"

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database nao configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const body = await req.json()
    const { projectId, userId } = body

    if (!projectId) {
      return NextResponse.json({ error: "projectId obrigatorio" }, { status: 400 })
    }

    // Buscar projeto
    const projects = await sql`
      SELECT 
        iac.*,
        i.name as institution_name,
        u.name as certifier_name
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      LEFT JOIN certification_proposals cp ON cp.iac_id = iac.id AND cp.status = 'ACCEPTED'
      LEFT JOIN users u ON cp.certifier_id = u.id
      WHERE iac.id = ${projectId}
      LIMIT 1
    `

    if (projects.length === 0) {
      return NextResponse.json({ error: "Projeto nao encontrado" }, { status: 404 })
    }

    const project = projects[0]

    // Verificar se ja esta certificado
    if (project.status !== "CERTIFIED") {
      return NextResponse.json({ 
        error: "Projeto precisa estar certificado antes de inscrever na blockchain" 
      }, { status: 400 })
    }

    // Verificar se ja foi inscrito
    if (project.polygon_tx_hash) {
      return NextResponse.json({ 
        error: "Projeto ja foi inscrito na blockchain",
        txHash: project.polygon_tx_hash 
      }, { status: 400 })
    }

    // Gerar hash do certificado
    const certHash = generateCertificateHash({
      projectId: project.id,
      title: project.title,
      institutionId: project.institution_id,
      co2Equivalent: project.co2_equivalent || 0,
      wasteProcessed: project.waste_processed || 0,
      certifiedAt: project.certified_at?.toISOString() || new Date().toISOString(),
      certifierName: project.certifier_name || "STHation"
    })

    // Verificar se tem configuracao de blockchain
    const hasBlockchainConfig = process.env.STHATION_CONTRACT_ADDRESS && process.env.STHATION_WALLET_PRIVATE_KEY

    let txHash: string
    let blockNumber: number = 0

    if (hasBlockchainConfig) {
      // Registrar na blockchain real
      const result = await registerCertificateOnChain(
        project.id,
        certHash,
        project.co2_equivalent || 0,
        project.waste_processed || 0,
        true // testnet
      )
      txHash = result.txHash
      blockNumber = result.blockNumber
    } else {
      // Modo simulacao - gerar hash local
      txHash = certHash
      console.log("[BLOCKCHAIN] Modo simulacao - usando hash local como txHash")
    }

    // Atualizar projeto com hash da transacao
    await sql`
      UPDATE impact_action_cards
      SET 
        polygon_tx_hash = ${txHash},
        status = 'INSCRIBED',
        minted_at = NOW(),
        updated_at = NOW()
      WHERE id = ${projectId}
    `

    // Criar notificacao para a instituicao
    if (project.institution_id) {
      const instUsers = await sql`
        SELECT user_id FROM institutions WHERE id = ${project.institution_id}
      `
      if (instUsers.length > 0 && instUsers[0].user_id) {
        await sql`
          INSERT INTO notifications (user_id, type, title, message, link)
          VALUES (
            ${instUsers[0].user_id},
            'BLOCKCHAIN',
            'Projeto inscrito na blockchain!',
            ${`O projeto "${project.title}" foi inscrito na blockchain Polygon com sucesso.`},
            ${`/dashboard/environmental/${projectId}`}
          )
        `
      }
    }

    return NextResponse.json({
      success: true,
      txHash,
      blockNumber,
      explorerLink: hasBlockchainConfig ? getExplorerLink(txHash, true) : null,
      certHash,
      message: hasBlockchainConfig 
        ? "Certificado inscrito na blockchain Polygon com sucesso!"
        : "Certificado registrado localmente (blockchain nao configurada)"
    })

  } catch (error: any) {
    console.error("[API] Erro ao inscrever na blockchain:", error)
    return NextResponse.json({ error: error.message || "Erro ao inscrever" }, { status: 500 })
  }
}

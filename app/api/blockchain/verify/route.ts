import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { generateCertificateHash, verifyCertificateOnChain, getCertificateFromChain, getExplorerLink } from "@/lib/blockchain"

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database nao configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get("projectId")
  const txHash = searchParams.get("txHash")

  if (!projectId && !txHash) {
    return NextResponse.json({ error: "projectId ou txHash obrigatorio" }, { status: 400 })
  }

  try {
    // Buscar projeto no banco
    let query
    if (projectId) {
      query = sql`
        SELECT 
          iac.*,
          i.name as institution_name,
          i.cnpj as institution_cnpj,
          u.name as certifier_name
        FROM impact_action_cards iac
        LEFT JOIN institutions i ON iac.institution_id = i.id
        LEFT JOIN certification_proposals cp ON cp.iac_id = iac.id AND cp.status = 'ACCEPTED'
        LEFT JOIN users u ON cp.certifier_id = u.id
        WHERE iac.id = ${projectId}
        LIMIT 1
      `
    } else {
      query = sql`
        SELECT 
          iac.*,
          i.name as institution_name,
          i.cnpj as institution_cnpj,
          u.name as certifier_name
        FROM impact_action_cards iac
        LEFT JOIN institutions i ON iac.institution_id = i.id
        LEFT JOIN certification_proposals cp ON cp.iac_id = iac.id AND cp.status = 'ACCEPTED'
        LEFT JOIN users u ON cp.certifier_id = u.id
        WHERE iac.polygon_tx_hash = ${txHash}
        LIMIT 1
      `
    }

    const projects = await query

    if (projects.length === 0) {
      return NextResponse.json({ 
        verified: false,
        error: "Projeto nao encontrado" 
      }, { status: 404 })
    }

    const project = projects[0]

    // Verificar se foi inscrito na blockchain
    if (!project.polygon_tx_hash) {
      return NextResponse.json({
        verified: false,
        status: project.status,
        message: "Projeto ainda nao foi inscrito na blockchain"
      })
    }

    // Gerar hash esperado
    const expectedHash = generateCertificateHash({
      projectId: project.id,
      title: project.title,
      institutionId: project.institution_id,
      co2Equivalent: project.co2_equivalent || 0,
      wasteProcessed: project.waste_processed || 0,
      certifiedAt: project.certified_at?.toISOString() || project.created_at.toISOString(),
      certifierName: project.certifier_name || "STHation"
    })

    // Verificar na blockchain se configurado
    const hasBlockchainConfig = process.env.STHATION_CONTRACT_ADDRESS && process.env.STHATION_WALLET_PRIVATE_KEY
    let onChainData = null
    let onChainVerified = false

    if (hasBlockchainConfig) {
      onChainVerified = await verifyCertificateOnChain(project.id, expectedHash, true)
      onChainData = await getCertificateFromChain(project.id, true)
    }

    // Verificacao local (comparar hash armazenado)
    const localVerified = project.polygon_tx_hash === expectedHash || 
                          project.polygon_tx_hash.startsWith("0x")

    return NextResponse.json({
      verified: localVerified || onChainVerified,
      project: {
        id: project.id,
        title: project.title,
        status: project.status,
        category: project.category,
        institutionName: project.institution_name,
        institutionCnpj: project.institution_cnpj,
        certifierName: project.certifier_name,
        co2Equivalent: project.co2_equivalent,
        wasteProcessed: project.waste_processed,
        certifiedAt: project.certified_at,
        mintedAt: project.minted_at,
        certificationScore: project.certification_score
      },
      blockchain: {
        txHash: project.polygon_tx_hash,
        explorerLink: getExplorerLink(project.polygon_tx_hash, true),
        certHash: expectedHash,
        onChainData,
        onChainVerified
      },
      message: localVerified || onChainVerified
        ? "Certificado verificado com sucesso!"
        : "Nao foi possivel verificar o certificado"
    })

  } catch (error: any) {
    console.error("[API] Erro ao verificar certificado:", error)
    return NextResponse.json({ error: error.message || "Erro na verificacao" }, { status: 500 })
  }
}

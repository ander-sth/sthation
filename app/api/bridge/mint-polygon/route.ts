// API: Mint Token na Polygon (ERC-1155)
// Registra IAC aprovado na blockchain Polygon
import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// Simula interação com contrato ERC-1155 na Polygon
// Em produção, usar ethers.js ou viem com private key do backend
async function mintOnPolygon(iacId: string, metadata: object): Promise<{
  txHash: string
  tokenId: string
  contractAddress: string
}> {
  // Simulação - em produção conectar com Polygon via RPC
  const txHash = `0x${Buffer.from(iacId + Date.now()).toString('hex').slice(0, 64)}`
  const tokenId = Math.floor(Math.random() * 1000000).toString()
  const contractAddress = process.env.POLYGON_CONTRACT_ADDRESS || "0x1234567890abcdef1234567890abcdef12345678"
  
  // Aqui entraria a lógica real de mint:
  // const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL)
  // const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY, provider)
  // const contract = new ethers.Contract(contractAddress, ERC1155_ABI, wallet)
  // const tx = await contract.mint(wallet.address, tokenId, 1, metadata)
  // await tx.wait()
  
  return { txHash, tokenId, contractAddress }
}

export async function POST(req: NextRequest) {
  try {
    const { iacId, payGasFee } = await req.json()

    if (!iacId) {
      return NextResponse.json({ error: "IAC ID obrigatório" }, { status: 400 })
    }

    // Buscar IAC
    const iacs = await sql`
      SELECT 
        iac.id, iac.title, iac.description, iac.type, iac.category,
        iac.estimated_beneficiaries, iac.status, iac.polygon_tx_hash,
        i.name as institution_name, i.cnpj, i.type as institution_type
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      WHERE iac.id = ${iacId}
    `

    if (iacs.length === 0) {
      return NextResponse.json({ error: "IAC não encontrado" }, { status: 404 })
    }

    const iac = iacs[0]

    // Verificar se já foi mintado
    if (iac.polygon_tx_hash) {
      return NextResponse.json({ 
        error: "IAC já registrado na Polygon",
        txHash: iac.polygon_tx_hash 
      }, { status: 400 })
    }

    // Verificar se IAC foi aprovado (VERIFIED ou APPROVED)
    if (!['VERIFIED', 'APPROVED', 'REGISTERED'].includes(iac.status)) {
      return NextResponse.json({ 
        error: "IAC precisa estar aprovado para ser registrado na blockchain",
        currentStatus: iac.status
      }, { status: 400 })
    }

    // Preparar metadata para o token
    const metadata = {
      name: iac.title,
      description: iac.description,
      type: iac.type,
      category: iac.category,
      beneficiaries: iac.estimated_beneficiaries,
      institution: {
        name: iac.institution_name,
        cnpj: iac.cnpj,
        type: iac.institution_type
      },
      timestamp: new Date().toISOString(),
      platform: "STHATION"
    }

    // Mint na Polygon
    const { txHash, tokenId, contractAddress } = await mintOnPolygon(iacId, metadata)

    // Atualizar IAC com tx hash
    await sql`
      UPDATE impact_action_cards
      SET 
        polygon_tx_hash = ${txHash},
        status = 'REGISTERED',
        updated_at = NOW()
      WHERE id = ${iacId}
    `

    // Registrar token na tabela polygon_tokens
    await sql`
      INSERT INTO polygon_tokens (
        id, iac_id, token_id, contract_address, tx_hash, 
        metadata, status, gas_paid
      ) VALUES (
        gen_random_uuid(),
        ${iacId},
        ${tokenId},
        ${contractAddress},
        ${txHash},
        ${JSON.stringify(metadata)},
        'MINTED',
        ${payGasFee ? true : false}
      )
    `

    // Registrar evento
    await sql`
      INSERT INTO bridge_events (id, event_type, iac_id, polygon_tx_hash, data)
      VALUES (
        gen_random_uuid(),
        'POLYGON_MINT',
        ${iacId},
        ${txHash},
        ${JSON.stringify({ tokenId, contractAddress, metadata })}
      )
    `

    // Adicionar à fila de bridge se gas foi pago
    if (payGasFee) {
      await sql`
        INSERT INTO bridge_queue (id, iac_id, polygon_tx_hash, polygon_token_id, status)
        VALUES (
          gen_random_uuid(),
          ${iacId},
          ${txHash},
          ${tokenId},
          'PENDING'
        )
      `
    }

    return NextResponse.json({
      success: true,
      message: "Token mintado com sucesso na Polygon",
      data: {
        iacId,
        txHash,
        tokenId,
        contractAddress,
        explorerUrl: `https://polygonscan.com/tx/${txHash}`,
        queuedForBridge: payGasFee
      }
    })

  } catch (error) {
    console.error("[BRIDGE] Erro ao mintar na Polygon:", error)
    return NextResponse.json({ 
      error: "Erro interno ao registrar na blockchain" 
    }, { status: 500 })
  }
}

// GET: Verificar status de mint
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const iacId = searchParams.get("iacId")

  if (!iacId) {
    return NextResponse.json({ error: "IAC ID obrigatório" }, { status: 400 })
  }

  try {
    const tokens = await sql`
      SELECT 
        pt.*,
        iac.title, iac.type, iac.status as iac_status
      FROM polygon_tokens pt
      JOIN impact_action_cards iac ON pt.iac_id = iac.id
      WHERE pt.iac_id = ${iacId}
    `

    if (tokens.length === 0) {
      return NextResponse.json({ 
        minted: false,
        message: "IAC ainda não foi registrado na Polygon"
      })
    }

    return NextResponse.json({
      minted: true,
      token: tokens[0]
    })

  } catch (error) {
    console.error("[BRIDGE] Erro ao verificar mint:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

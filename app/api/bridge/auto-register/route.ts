// API: Auto-registrar IACs aprovados na Polygon
// Esta API é chamada quando um IAC é aprovado via VCA ou Certificação
import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// POST: Registrar IAC aprovado automaticamente na Polygon
export async function POST(req: NextRequest) {
  try {
    const { iacId, approvalType } = await req.json()
    // approvalType: 'VCA' (social) ou 'CERTIFICATION' (ambiental)

    if (!iacId) {
      return NextResponse.json({ error: "IAC ID obrigatório" }, { status: 400 })
    }

    // Buscar IAC
    const iacs = await sql`
      SELECT 
        iac.*,
        i.name as institution_name, i.cnpj, i.type as institution_type
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      WHERE iac.id = ${iacId}
    `

    if (iacs.length === 0) {
      return NextResponse.json({ error: "IAC não encontrado" }, { status: 404 })
    }

    const iac = iacs[0]

    // Verificar se já foi registrado
    if (iac.polygon_tx_hash) {
      return NextResponse.json({ 
        message: "IAC já registrado na Polygon",
        txHash: iac.polygon_tx_hash,
        alreadyRegistered: true
      })
    }

    // Gerar hash de transação simulado (em produção, mint real na Polygon)
    const txHash = `0x${Buffer.from(iacId + Date.now() + Math.random()).toString('hex').slice(0, 64)}`
    const tokenId = Math.floor(Math.random() * 1000000).toString()
    const contractAddress = process.env.POLYGON_CONTRACT_ADDRESS || "0x1234567890abcdef1234567890abcdef12345678"

    // Preparar metadata
    const metadata = {
      protocol: "sthation-impact",
      version: "1.0",
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
      approval: {
        type: approvalType,
        timestamp: new Date().toISOString()
      },
      platform: "STHATION"
    }

    // Atualizar IAC
    await sql`
      UPDATE impact_action_cards
      SET 
        polygon_tx_hash = ${txHash},
        status = 'REGISTERED',
        updated_at = NOW()
      WHERE id = ${iacId}
    `

    // Registrar token
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
        false
      )
    `

    // Registrar evento
    await sql`
      INSERT INTO bridge_events (id, event_type, iac_id, polygon_tx_hash, data)
      VALUES (
        gen_random_uuid(),
        'AUTO_POLYGON_MINT',
        ${iacId},
        ${txHash},
        ${JSON.stringify({ 
          approvalType, 
          tokenId, 
          contractAddress,
          autoRegistered: true 
        })}
      )
    `

    return NextResponse.json({
      success: true,
      message: "IAC registrado automaticamente na Polygon",
      data: {
        iacId,
        txHash,
        tokenId,
        contractAddress,
        explorerUrl: `https://polygonscan.com/tx/${txHash}`,
        nextStep: "Usuário pode pagar gas fee para bridge ao Bitcoin"
      }
    })

  } catch (error) {
    console.error("[BRIDGE] Erro no auto-register:", error)
    return NextResponse.json({ 
      error: "Erro interno ao registrar na blockchain" 
    }, { status: 500 })
  }
}

// GET: Listar IACs prontos para registro (aprovados mas não registrados)
export async function GET() {
  try {
    const pending = await sql`
      SELECT 
        iac.id, iac.title, iac.type, iac.category, iac.status,
        iac.estimated_beneficiaries, iac.created_at,
        i.name as institution_name, i.type as institution_type
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      WHERE iac.status IN ('VERIFIED', 'APPROVED')
        AND iac.polygon_tx_hash IS NULL
      ORDER BY iac.created_at DESC
    `

    return NextResponse.json({
      success: true,
      pendingRegistration: pending,
      total: pending.length
    })

  } catch (error) {
    console.error("[BRIDGE] Erro ao listar pendentes:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

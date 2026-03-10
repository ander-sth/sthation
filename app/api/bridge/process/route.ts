// API: Processar Bridge Queue (Polygon → Bitcoin)
// Queima token na Polygon e cria Inscription no Bitcoin
import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// Simula queima do token na Polygon
async function burnOnPolygon(tokenId: string, txHash: string): Promise<{
  burnTxHash: string
  burnProof: string
}> {
  // Simulação - em produção usar ethers.js
  const burnTxHash = `0x${Buffer.from('burn' + tokenId + Date.now()).toString('hex').slice(0, 64)}`
  const burnProof = Buffer.from(JSON.stringify({
    originalTx: txHash,
    burnTx: burnTxHash,
    timestamp: Date.now()
  })).toString('base64')
  
  return { burnTxHash, burnProof }
}

// Simula criação de Inscription no Bitcoin via Ordinals
async function createInscription(metadata: object, burnProof: string): Promise<{
  inscriptionId: string
  ordinalId: string
  satoshi: number
}> {
  // Simulação - em produção usar API de Ordinals (ord, ordinalsbot, etc)
  const inscriptionId = `${Math.random().toString(36).slice(2)}i0`
  const ordinalId = Math.floor(Math.random() * 2100000000000000)
  const satoshi = Math.floor(Math.random() * 100000) + 546 // min dust
  
  return { inscriptionId, ordinalId: ordinalId.toString(), satoshi }
}

// POST: Processar item da fila de bridge
export async function POST(req: NextRequest) {
  try {
    const { queueId, btcAddress } = await req.json()

    if (!queueId) {
      return NextResponse.json({ error: "Queue ID obrigatório" }, { status: 400 })
    }

    // Buscar item da fila
    const queue = await sql`
      SELECT 
        bq.*,
        iac.title, iac.description, iac.type, iac.category,
        iac.estimated_beneficiaries,
        pt.metadata, pt.token_id, pt.contract_address,
        i.name as institution_name, i.cnpj
      FROM bridge_queue bq
      JOIN impact_action_cards iac ON bq.iac_id = iac.id
      JOIN polygon_tokens pt ON bq.polygon_tx_hash = pt.tx_hash
      LEFT JOIN institutions i ON iac.institution_id = i.id
      WHERE bq.id = ${queueId}
    `

    if (queue.length === 0) {
      return NextResponse.json({ error: "Item não encontrado na fila" }, { status: 404 })
    }

    const item = queue[0]

    if (item.status !== 'PENDING' && item.status !== 'BURNING') {
      return NextResponse.json({ 
        error: "Item já foi processado",
        currentStatus: item.status
      }, { status: 400 })
    }

    // FASE 1: Queimar token na Polygon
    await sql`
      UPDATE bridge_queue SET status = 'BURNING', updated_at = NOW()
      WHERE id = ${queueId}
    `

    const { burnTxHash, burnProof } = await burnOnPolygon(
      item.polygon_token_id, 
      item.polygon_tx_hash
    )

    // Registrar evento de burn
    await sql`
      INSERT INTO bridge_events (id, event_type, iac_id, polygon_tx_hash, data)
      VALUES (
        gen_random_uuid(),
        'POLYGON_BURN',
        ${item.iac_id},
        ${burnTxHash},
        ${JSON.stringify({ burnProof, originalTx: item.polygon_tx_hash })}
      )
    `

    // Atualizar fila
    await sql`
      UPDATE bridge_queue 
      SET 
        status = 'BURNED',
        burn_tx_hash = ${burnTxHash},
        burn_proof = ${burnProof},
        updated_at = NOW()
      WHERE id = ${queueId}
    `

    // FASE 2: Criar Inscription no Bitcoin
    await sql`
      UPDATE bridge_queue SET status = 'INSCRIBING', updated_at = NOW()
      WHERE id = ${queueId}
    `

    // Preparar metadata para Inscription
    const inscriptionMetadata = {
      protocol: "nobis",
      version: "1.0",
      type: item.type,
      title: item.title,
      description: item.description,
      category: item.category,
      beneficiaries: item.estimated_beneficiaries,
      institution: item.institution_name,
      cnpj: item.cnpj,
      polygon: {
        txHash: item.polygon_tx_hash,
        burnTxHash: burnTxHash,
        burnProof: burnProof
      },
      timestamp: new Date().toISOString(),
      platform: "STHATION"
    }

    const { inscriptionId, ordinalId, satoshi } = await createInscription(
      inscriptionMetadata, 
      burnProof
    )

    // Registrar evento de inscription
    await sql`
      INSERT INTO bridge_events (id, event_type, iac_id, bitcoin_inscription_id, data)
      VALUES (
        gen_random_uuid(),
        'BITCOIN_INSCRIPTION',
        ${item.iac_id},
        ${inscriptionId},
        ${JSON.stringify({ ordinalId, satoshi, metadata: inscriptionMetadata })}
      )
    `

    // Finalizar fila
    await sql`
      UPDATE bridge_queue 
      SET 
        status = 'COMPLETED',
        bitcoin_inscription_id = ${inscriptionId},
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${queueId}
    `

    // Atualizar IAC com inscription_id
    await sql`
      UPDATE impact_action_cards
      SET 
        inscription_id = ${inscriptionId},
        status = 'INSCRIBED',
        updated_at = NOW()
      WHERE id = ${item.iac_id}
    `

    // Criar registro no nobis_tokens
    await sql`
      INSERT INTO nobis_tokens (
        id, inscription_id, token_id, metadata, status
      ) VALUES (
        gen_random_uuid(),
        ${inscriptionId},
        ${item.polygon_token_id},
        ${JSON.stringify(inscriptionMetadata)},
        'ACTIVE'
      )
      ON CONFLICT (inscription_id) DO NOTHING
    `

    return NextResponse.json({
      success: true,
      message: "Bridge completado com sucesso!",
      data: {
        queueId,
        iacId: item.iac_id,
        polygon: {
          originalTx: item.polygon_tx_hash,
          burnTx: burnTxHash
        },
        bitcoin: {
          inscriptionId,
          ordinalId,
          satoshi,
          explorerUrl: `https://ordinals.com/inscription/${inscriptionId}`
        }
      }
    })

  } catch (error) {
    console.error("[BRIDGE] Erro ao processar bridge:", error)
    return NextResponse.json({ 
      error: "Erro interno ao processar bridge" 
    }, { status: 500 })
  }
}

// GET: Listar fila de bridge
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  try {
    let queue
    if (status) {
      queue = await sql`
        SELECT 
          bq.*,
          iac.title, iac.type, iac.category,
          i.name as institution_name
        FROM bridge_queue bq
        JOIN impact_action_cards iac ON bq.iac_id = iac.id
        LEFT JOIN institutions i ON iac.institution_id = i.id
        WHERE bq.status = ${status}
        ORDER BY bq.created_at DESC
        LIMIT 50
      `
    } else {
      queue = await sql`
        SELECT 
          bq.*,
          iac.title, iac.type, iac.category,
          i.name as institution_name
        FROM bridge_queue bq
        JOIN impact_action_cards iac ON bq.iac_id = iac.id
        LEFT JOIN institutions i ON iac.institution_id = i.id
        ORDER BY bq.created_at DESC
        LIMIT 50
      `
    }

    return NextResponse.json({
      success: true,
      queue,
      total: queue.length
    })

  } catch (error) {
    console.error("[BRIDGE] Erro ao listar fila:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

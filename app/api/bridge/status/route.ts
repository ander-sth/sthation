// API: Status do Bridge e Estatísticas
import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const iacId = searchParams.get("iacId")

  try {
    // Se passou iacId, retorna status específico
    if (iacId) {
      const status = await sql`
        SELECT 
          iac.id,
          iac.title,
          iac.type,
          iac.status as iac_status,
          iac.polygon_tx_hash,
          iac.inscription_id,
          pt.token_id as polygon_token_id,
          pt.status as polygon_status,
          pt.gas_paid,
          pt.created_at as polygon_minted_at,
          bq.id as bridge_queue_id,
          bq.status as bridge_status,
          bq.burn_tx_hash,
          bq.bitcoin_inscription_id,
          bq.completed_at as bridge_completed_at,
          nt.id as nobis_token_id,
          nt.status as nobis_status
        FROM impact_action_cards iac
        LEFT JOIN polygon_tokens pt ON iac.id = pt.iac_id
        LEFT JOIN bridge_queue bq ON iac.id = bq.iac_id
        LEFT JOIN nobis_tokens nt ON iac.inscription_id = nt.inscription_id
        WHERE iac.id = ${iacId}
      `

      if (status.length === 0) {
        return NextResponse.json({ error: "IAC não encontrado" }, { status: 404 })
      }

      const item = status[0]
      
      // Determinar fase atual
      let currentPhase = 'NOT_STARTED'
      let progress = 0
      
      if (item.nobis_status === 'ACTIVE') {
        currentPhase = 'COMPLETED'
        progress = 100
      } else if (item.bridge_status === 'COMPLETED') {
        currentPhase = 'INSCRIPTION_COMPLETE'
        progress = 100
      } else if (item.bridge_status === 'INSCRIBING') {
        currentPhase = 'INSCRIBING'
        progress = 80
      } else if (item.bridge_status === 'BURNED') {
        currentPhase = 'BURNED'
        progress = 60
      } else if (item.bridge_status === 'BURNING') {
        currentPhase = 'BURNING'
        progress = 40
      } else if (item.bridge_status === 'PENDING') {
        currentPhase = 'QUEUED_FOR_BRIDGE'
        progress = 30
      } else if (item.polygon_tx_hash) {
        currentPhase = 'MINTED_ON_POLYGON'
        progress = 20
      } else if (['VERIFIED', 'APPROVED'].includes(item.iac_status)) {
        currentPhase = 'READY_TO_MINT'
        progress = 10
      }

      return NextResponse.json({
        success: true,
        iacId,
        currentPhase,
        progress,
        details: {
          polygon: {
            minted: !!item.polygon_tx_hash,
            txHash: item.polygon_tx_hash,
            tokenId: item.polygon_token_id,
            gasPaid: item.gas_paid
          },
          bridge: {
            status: item.bridge_status,
            burnTxHash: item.burn_tx_hash,
            queueId: item.bridge_queue_id
          },
          bitcoin: {
            inscriptionId: item.bitcoin_inscription_id || item.inscription_id,
            nobisTokenId: item.nobis_token_id
          }
        }
      })
    }

    // Estatísticas gerais do bridge
    const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM polygon_tokens) as total_polygon_tokens,
        (SELECT COUNT(*) FROM polygon_tokens WHERE gas_paid = true) as tokens_with_gas,
        (SELECT COUNT(*) FROM bridge_queue WHERE status = 'PENDING') as pending_bridges,
        (SELECT COUNT(*) FROM bridge_queue WHERE status = 'BURNING') as burning,
        (SELECT COUNT(*) FROM bridge_queue WHERE status = 'INSCRIBING') as inscribing,
        (SELECT COUNT(*) FROM bridge_queue WHERE status = 'COMPLETED') as completed_bridges,
        (SELECT COUNT(*) FROM nobis_tokens WHERE status = 'ACTIVE') as active_nobis_tokens,
        (SELECT COUNT(*) FROM impact_action_cards WHERE inscription_id IS NOT NULL) as total_inscriptions
    `

    // Últimos eventos
    const recentEvents = await sql`
      SELECT 
        be.*,
        iac.title
      FROM bridge_events be
      LEFT JOIN impact_action_cards iac ON be.iac_id = iac.id
      ORDER BY be.created_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      success: true,
      stats: stats[0],
      recentEvents
    })

  } catch (error) {
    console.error("[BRIDGE] Erro ao buscar status:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// API NobisCore Assets - Tokens e IACs do usuário
import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "sthation-secret-key-2024"

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Verificar autenticação
    const authHeader = request.headers.get("authorization")
    let userId: string | null = null

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        userId = decoded.userId
      } catch {
        // Token inválido, continuar sem autenticação
      }
    }

    // Buscar tokens NOBIS do usuário (ou todos se não autenticado)
    const tokensQuery = userId
      ? sql`
          SELECT 
            nt.id,
            nt.token_id,
            nt.inscription_id,
            nt.minted_at,
            nt.is_tradeable,
            nt.metadata,
            iac.title,
            iac.description,
            iac.category,
            iac.type,
            iac.status,
            iac.vca_score,
            iac.estimated_beneficiaries,
            iac.polygon_tx_hash,
            iac.location_name,
            iac.location_state,
            i.name as institution_name
          FROM nobis_tokens nt
          JOIN impact_action_cards iac ON nt.iac_id = iac.id
          LEFT JOIN institutions i ON iac.institution_id = i.id
          WHERE nt.owner_id = ${userId}
          ORDER BY nt.minted_at DESC
        `
      : sql`
          SELECT 
            nt.id,
            nt.token_id,
            nt.inscription_id,
            nt.minted_at,
            nt.is_tradeable,
            nt.metadata,
            iac.title,
            iac.description,
            iac.category,
            iac.type,
            iac.status,
            iac.vca_score,
            iac.estimated_beneficiaries,
            iac.polygon_tx_hash,
            iac.location_name,
            iac.location_state,
            i.name as institution_name
          FROM nobis_tokens nt
          JOIN impact_action_cards iac ON nt.iac_id = iac.id
          LEFT JOIN institutions i ON iac.institution_id = i.id
          ORDER BY nt.minted_at DESC
          LIMIT 50
        `

    const tokens = await tokensQuery

    // Buscar IACs elegíveis para transformação (validados na Polygon, sem inscription)
    const eligibleIacs = userId
      ? await sql`
          SELECT 
            iac.id,
            iac.title,
            iac.description,
            iac.category,
            iac.type,
            iac.status,
            iac.vca_score,
            iac.estimated_beneficiaries,
            iac.polygon_tx_hash,
            iac.polygon_block_number,
            iac.location_name,
            iac.location_state,
            iac.validated_at,
            i.name as institution_name
          FROM impact_action_cards iac
          LEFT JOIN institutions i ON iac.institution_id = i.id
          WHERE iac.polygon_tx_hash IS NOT NULL
            AND iac.inscription_id IS NULL
            AND iac.status IN ('VALIDATED', 'REGISTERED', 'COMPLETED')
            AND iac.institution_id IN (
              SELECT id FROM institutions WHERE user_id = ${userId}
            )
          ORDER BY iac.validated_at DESC
        `
      : []

    // Estatísticas
    const stats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE inscription_id IS NOT NULL) as total_inscriptions,
        COUNT(*) FILTER (WHERE polygon_tx_hash IS NOT NULL) as total_on_polygon,
        COUNT(*) FILTER (WHERE type = 'SOCIAL' AND inscription_id IS NOT NULL) as social_inscriptions,
        COUNT(*) FILTER (WHERE type = 'AMBIENTAL' AND inscription_id IS NOT NULL) as environmental_inscriptions
      FROM impact_action_cards
    `

    return NextResponse.json({
      tokens,
      eligibleForBridge: eligibleIacs,
      stats: stats[0] || {
        total_inscriptions: 0,
        total_on_polygon: 0,
        social_inscriptions: 0,
        environmental_inscriptions: 0
      }
    })
  } catch (error) {
    console.error("[NOBISCORE ASSETS] Erro:", error)
    return NextResponse.json({ error: "Erro ao buscar assets" }, { status: 500 })
  }
}

// API NobisCore Marketplace - Inscriptions disponíveis para venda
import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  
  const type = searchParams.get("type") // SOCIAL, AMBIENTAL, all
  const category = searchParams.get("category")
  const search = searchParams.get("search")
  const sortBy = searchParams.get("sortBy") || "recent" // recent, price, impact
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const offset = (page - 1) * limit

  try {
    // Buscar inscriptions disponíveis (tokens com is_tradeable = true)
    let listings = await sql`
      SELECT 
        nt.id,
        nt.token_id,
        nt.inscription_id,
        nt.minted_at,
        nt.metadata,
        iac.title,
        iac.description,
        iac.category,
        iac.type,
        iac.vca_score,
        iac.estimated_beneficiaries,
        iac.polygon_tx_hash,
        iac.location_name,
        iac.location_state,
        i.name as institution_name,
        u.name as owner_name,
        u.wallet_address as owner_wallet
      FROM nobis_tokens nt
      JOIN impact_action_cards iac ON nt.iac_id = iac.id
      LEFT JOIN institutions i ON iac.institution_id = i.id
      LEFT JOIN users u ON nt.owner_id = u.id
      WHERE nt.is_tradeable = true
        AND nt.inscription_id IS NOT NULL
        AND (${type}::text IS NULL OR ${type} = 'all' OR iac.type = ${type})
        AND (${category}::text IS NULL OR iac.category ILIKE ${'%' + (category || '') + '%'})
        AND (${search}::text IS NULL OR iac.title ILIKE ${'%' + (search || '') + '%'} OR iac.description ILIKE ${'%' + (search || '') + '%'})
      ORDER BY 
        CASE WHEN ${sortBy} = 'recent' THEN nt.minted_at END DESC,
        CASE WHEN ${sortBy} = 'impact' THEN iac.vca_score END DESC NULLS LAST
      LIMIT ${limit}
      OFFSET ${offset}
    `

    // Total de listings
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM nobis_tokens nt
      JOIN impact_action_cards iac ON nt.iac_id = iac.id
      WHERE nt.is_tradeable = true
        AND nt.inscription_id IS NOT NULL
        AND (${type}::text IS NULL OR ${type} = 'all' OR iac.type = ${type})
        AND (${category}::text IS NULL OR iac.category ILIKE ${'%' + (category || '') + '%'})
        AND (${search}::text IS NULL OR iac.title ILIKE ${'%' + (search || '') + '%'})
    `

    // Estatísticas do marketplace
    const stats = await sql`
      SELECT
        COUNT(*) as total_listings,
        COUNT(*) FILTER (WHERE iac.type = 'SOCIAL') as social_count,
        COUNT(*) FILTER (WHERE iac.type = 'AMBIENTAL') as environmental_count
      FROM nobis_tokens nt
      JOIN impact_action_cards iac ON nt.iac_id = iac.id
      WHERE nt.is_tradeable = true
        AND nt.inscription_id IS NOT NULL
    `

    // Categorias disponíveis
    const categories = await sql`
      SELECT DISTINCT iac.category, COUNT(*) as count
      FROM nobis_tokens nt
      JOIN impact_action_cards iac ON nt.iac_id = iac.id
      WHERE nt.is_tradeable = true
        AND nt.inscription_id IS NOT NULL
        AND iac.category IS NOT NULL
      GROUP BY iac.category
      ORDER BY count DESC
    `

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total: parseInt(countResult[0]?.total || "0"),
        totalPages: Math.ceil(parseInt(countResult[0]?.total || "0") / limit)
      },
      stats: stats[0] || { total_listings: 0, social_count: 0, environmental_count: 0 },
      categories
    })
  } catch (error) {
    console.error("[NOBISCORE MARKETPLACE] Erro:", error)
    return NextResponse.json({ error: "Erro ao buscar marketplace" }, { status: 500 })
  }
}

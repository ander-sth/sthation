import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "20")

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database não configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Buscar ranking de checkers
    const ranking = await sql`
      SELECT 
        r.*,
        u.name,
        u.email,
        u.checker_score,
        u.avatar_url
      FROM checker_rankings r
      JOIN users u ON u.id = r.checker_id
      ORDER BY r.reputation_score DESC, r.total_validations DESC
      LIMIT ${limit}
    `

    // Estatísticas gerais
    const stats = await sql`
      SELECT 
        COUNT(*) as total_checkers,
        AVG(reputation_score) as avg_reputation,
        SUM(total_validations) as total_validations
      FROM checker_rankings
    `

    return NextResponse.json({
      ranking,
      stats: stats[0] || { total_checkers: 0, avg_reputation: 50, total_validations: 0 },
    })
  } catch (error: any) {
    console.error("[CHECKER RANKING] Erro:", error)

    // Mock data
    if (error.message?.includes("does not exist")) {
      return NextResponse.json({
        ranking: [
          {
            id: "1",
            checker_id: "c1",
            name: "Maria Silva",
            total_validations: 45,
            accuracy_score: 92.5,
            reputation_score: 95,
            level: "GOLD",
            rewards_earned: 450,
          },
          {
            id: "2",
            checker_id: "c2",
            name: "João Santos",
            total_validations: 38,
            accuracy_score: 88.0,
            reputation_score: 88,
            level: "SILVER",
            rewards_earned: 380,
          },
          {
            id: "3",
            checker_id: "c3",
            name: "Ana Costa",
            total_validations: 25,
            accuracy_score: 85.0,
            reputation_score: 75,
            level: "BRONZE",
            rewards_earned: 250,
          },
        ],
        stats: { total_checkers: 150, avg_reputation: 72, total_validations: 1250 },
      })
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

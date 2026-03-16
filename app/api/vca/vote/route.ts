import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// POST - Registrar voto do checker
export async function POST(request: Request) {
  const body = await request.json()
  const { sessionId, checkerId, score, comment, evidenceVerified, visitCompleted } = body

  if (!sessionId || !checkerId || score === undefined) {
    return NextResponse.json({ error: "sessionId, checkerId e score são obrigatórios" }, { status: 400 })
  }

  if (score < 0 || score > 100) {
    return NextResponse.json({ error: "Score deve estar entre 0 e 100" }, { status: 400 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database não configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Verificar se sessão está aberta
    const session = await sql`
      SELECT * FROM vca_sessions WHERE id = ${sessionId} AND status = 'OPEN'
    `

    if (session.length === 0) {
      return NextResponse.json({ error: "Sessão VCA não encontrada ou fechada" }, { status: 404 })
    }

    // Verificar se checker já votou
    const existingVote = await sql`
      SELECT id FROM vca_votes WHERE session_id = ${sessionId} AND checker_id = ${checkerId}
    `

    if (existingVote.length > 0) {
      return NextResponse.json({ error: "Você já votou nesta sessão" }, { status: 409 })
    }

    // Registrar voto
    const vote = await sql`
      INSERT INTO vca_votes (session_id, checker_id, score, comment, evidence_verified, visit_completed)
      VALUES (${sessionId}, ${checkerId}, ${score}, ${comment || null}, ${evidenceVerified || false}, ${visitCompleted || false})
      RETURNING *
    `

    // Contar votos atuais
    const voteCount = await sql`
      SELECT COUNT(*) as count, AVG(score) as avg_score FROM vca_votes WHERE session_id = ${sessionId}
    `

    const currentVotes = parseInt(voteCount[0].count)
    const avgScore = parseFloat(voteCount[0].avg_score)

    // Verificar se atingiu mínimo de votos para fechar
    if (currentVotes >= session[0].min_checkers) {
      // Calcular desvio padrão para verificar consenso
      const stdDev = await sql`
        SELECT STDDEV(score) as std_dev FROM vca_votes WHERE session_id = ${sessionId}
      `
      
      const deviation = parseFloat(stdDev[0].std_dev) || 0
      const consensusReached = deviation <= 15 // Consenso se desvio <= 15 pontos

      // Atualizar sessão
      await sql`
        UPDATE vca_sessions 
        SET status = 'COMPLETED', 
            final_score = ${avgScore}, 
            consensus_reached = ${consensusReached},
            end_date = NOW()
        WHERE id = ${sessionId}
      `

      // Atualizar IAC com score VCA
      await sql`
        UPDATE impact_action_cards 
        SET vca_score = ${avgScore}, 
            status = CASE WHEN ${avgScore} >= 70 THEN 'VCA_APPROVED' ELSE 'VCA_REJECTED' END
        WHERE id = ${session[0].iac_id}
      `

      // Atualizar ranking dos checkers que votaram
      await sql`
        UPDATE checker_rankings 
        SET total_validations = total_validations + 1,
            last_validation_at = NOW(),
            updated_at = NOW()
        WHERE checker_id IN (SELECT checker_id FROM vca_votes WHERE session_id = ${sessionId})
      `

      // Aumentar checker_score dos votantes
      await sql`
        UPDATE users 
        SET checker_score = COALESCE(checker_score, 50) + 2
        WHERE id IN (SELECT checker_id FROM vca_votes WHERE session_id = ${sessionId})
      `
    }

    return NextResponse.json({
      success: true,
      vote: vote[0],
      sessionStatus: {
        currentVotes,
        avgScore: avgScore.toFixed(1),
        minRequired: session[0].min_checkers,
        isComplete: currentVotes >= session[0].min_checkers,
      },
    })
  } catch (error: any) {
    console.error("[VCA VOTE] Erro:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// GET - Buscar progresso do usuário
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database não configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Buscar progresso por módulo
    const progress = await sql`
      SELECT 
        m.id as module_id,
        m.title as module_title,
        COUNT(l.id) as total_lessons,
        COUNT(p.completed_at) as completed_lessons,
        COALESCE(AVG(p.quiz_score), 0) as avg_quiz_score
      FROM academy_modules m
      LEFT JOIN academy_lessons l ON l.module_id = m.id AND l.is_active = true
      LEFT JOIN academy_progress p ON p.lesson_id = l.id AND p.user_id = ${userId}
      WHERE m.is_active = true
      GROUP BY m.id, m.title
      ORDER BY m.order_index ASC
    `

    // Buscar certificados
    const certificates = await sql`
      SELECT 
        c.*,
        m.title as module_title
      FROM academy_certificates c
      JOIN academy_modules m ON m.id = c.module_id
      WHERE c.user_id = ${userId}
      ORDER BY c.issued_at DESC
    `

    // Calcular estatísticas gerais
    const totalLessons = progress.reduce((sum: number, m: any) => sum + parseInt(m.total_lessons || 0), 0)
    const completedLessons = progress.reduce((sum: number, m: any) => sum + parseInt(m.completed_lessons || 0), 0)

    return NextResponse.json({
      progress,
      certificates,
      stats: {
        totalLessons,
        completedLessons,
        completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        certificatesCount: certificates.length,
      },
    })
  } catch (error: any) {
    console.error("[ACADEMY PROGRESS] Erro:", error)
    
    // Mock data
    if (error.message?.includes("does not exist")) {
      return NextResponse.json({
        progress: [],
        certificates: [],
        stats: {
          totalLessons: 18,
          completedLessons: 0,
          completionRate: 0,
          certificatesCount: 0,
        },
      })
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Registrar progresso
export async function POST(request: Request) {
  const body = await request.json()
  const { userId, lessonId, quizScore } = body

  if (!userId || !lessonId) {
    return NextResponse.json({ error: "userId e lessonId são obrigatórios" }, { status: 400 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database não configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Upsert progresso
    const result = await sql`
      INSERT INTO academy_progress (user_id, lesson_id, completed_at, quiz_score, quiz_attempts)
      VALUES (${userId}, ${lessonId}, NOW(), ${quizScore || 0}, 1)
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET 
        completed_at = COALESCE(academy_progress.completed_at, NOW()),
        quiz_score = GREATEST(academy_progress.quiz_score, ${quizScore || 0}),
        quiz_attempts = academy_progress.quiz_attempts + 1
      RETURNING *
    `

    // Verificar se completou o módulo para emitir certificado
    const lesson = await sql`
      SELECT module_id FROM academy_lessons WHERE id = ${lessonId}
    `

    if (lesson.length > 0) {
      const moduleId = lesson[0].module_id

      // Verificar se todas as lições do módulo foram completadas
      const moduleProgress = await sql`
        SELECT 
          COUNT(l.id) as total,
          COUNT(p.completed_at) as completed
        FROM academy_lessons l
        LEFT JOIN academy_progress p ON p.lesson_id = l.id AND p.user_id = ${userId}
        WHERE l.module_id = ${moduleId} AND l.is_active = true
      `

      if (moduleProgress[0].total > 0 && moduleProgress[0].total === moduleProgress[0].completed) {
        // Calcular score médio e emitir certificado
        const avgScore = await sql`
          SELECT AVG(p.quiz_score) as avg_score
          FROM academy_progress p
          JOIN academy_lessons l ON l.id = p.lesson_id
          WHERE l.module_id = ${moduleId} AND p.user_id = ${userId}
        `

        const score = Math.round(avgScore[0].avg_score || 0)
        const hash = require("crypto")
          .createHash("sha256")
          .update(`${userId}-${moduleId}-${Date.now()}`)
          .digest("hex")

        await sql`
          INSERT INTO academy_certificates (user_id, module_id, score, certificate_hash)
          VALUES (${userId}, ${moduleId}, ${score}, ${hash})
          ON CONFLICT (user_id, module_id) DO NOTHING
        `

        // Aumentar checker_score do usuário
        await sql`
          UPDATE users SET checker_score = COALESCE(checker_score, 50) + 10 WHERE id = ${userId}
        `
      }
    }

    return NextResponse.json({ success: true, progress: result[0] })
  } catch (error: any) {
    console.error("[ACADEMY PROGRESS POST] Erro:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

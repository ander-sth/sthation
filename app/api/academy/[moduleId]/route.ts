import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database não configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Buscar módulo
    const moduleResult = await sql`
      SELECT * FROM academy_modules WHERE id = ${moduleId} AND is_active = true
    `

    if (moduleResult.length === 0) {
      return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 })
    }

    // Buscar lições do módulo
    const lessons = await sql`
      SELECT 
        l.*,
        (SELECT COUNT(*) FROM academy_quizzes q WHERE q.lesson_id = l.id) as quiz_count
      FROM academy_lessons l
      WHERE l.module_id = ${moduleId} AND l.is_active = true
      ORDER BY l.order_index ASC
    `

    return NextResponse.json({
      module: moduleResult[0],
      lessons,
    })
  } catch (error: any) {
    console.error("[ACADEMY MODULE] Erro:", error)
    
    // Mock data para desenvolvimento
    if (error.message?.includes("does not exist")) {
      return NextResponse.json({
        module: {
          id: moduleId,
          title: "Módulo de Exemplo",
          description: "Descrição do módulo",
          order_index: 1,
        },
        lessons: [
          {
            id: "lesson-1",
            title: "Lição 1: Introdução",
            content: "Conteúdo da lição...",
            duration_minutes: 15,
            order_index: 1,
            quiz_count: 3,
          },
          {
            id: "lesson-2",
            title: "Lição 2: Conceitos Básicos",
            content: "Conteúdo da lição...",
            duration_minutes: 20,
            order_index: 2,
            quiz_count: 5,
          },
        ],
      })
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

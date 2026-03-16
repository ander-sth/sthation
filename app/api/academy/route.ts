import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database não configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Buscar todos os módulos ativos com suas lições
    const modules = await sql`
      SELECT 
        m.id,
        m.title,
        m.description,
        m.order_index,
        COUNT(l.id) as lessons_count,
        COALESCE(SUM(l.duration_minutes), 0) as total_duration
      FROM academy_modules m
      LEFT JOIN academy_lessons l ON l.module_id = m.id AND l.is_active = true
      WHERE m.is_active = true
      GROUP BY m.id
      ORDER BY m.order_index ASC
    `

    return NextResponse.json({ modules })
  } catch (error: any) {
    console.error("[ACADEMY] Erro:", error)
    
    // Se tabela não existe, retornar dados mock para desenvolvimento
    if (error.message?.includes("does not exist")) {
      return NextResponse.json({
        modules: [
          {
            id: "mod-1",
            title: "Introdução à Validação Social",
            description: "Aprenda os fundamentos da validação de projetos de impacto social",
            order_index: 1,
            lessons_count: 5,
            total_duration: 45,
          },
          {
            id: "mod-2",
            title: "Análise de Evidências",
            description: "Técnicas para analisar documentos e evidências de projetos",
            order_index: 2,
            lessons_count: 4,
            total_duration: 60,
          },
          {
            id: "mod-3",
            title: "Visita Técnica e Relatórios",
            description: "Como realizar visitas técnicas e elaborar relatórios de validação",
            order_index: 3,
            lessons_count: 6,
            total_duration: 90,
          },
          {
            id: "mod-4",
            title: "Ética e Boas Práticas",
            description: "Código de conduta e melhores práticas para Checkers",
            order_index: 4,
            lessons_count: 3,
            total_duration: 30,
          },
        ],
      })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

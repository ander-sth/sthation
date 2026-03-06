import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { GOV_PLAN_DEFAULT } from "@/lib/types/gov"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    // Por enquanto retorna uma subscription mockada para prefeituras
    // TODO: Implementar tabela gov_subscriptions no banco
    
    // Verificar se o usuario tem uma subscription ativa
    // const subs = await sql`
    //   SELECT * FROM gov_subscriptions 
    //   WHERE user_id = ${userId} AND status = 'ACTIVE'
    //   LIMIT 1
    // `

    // Retornar subscription mockada para desenvolvimento
    const subscription = {
      id: "gov-sub-001",
      prefeituraId: userId,
      prefeituraName: "Prefeitura de Joinville",
      municipality: "Joinville",
      state: "SC",
      cnpj: "83.169.623/0001-10",
      plan: GOV_PLAN_DEFAULT,
      projectsUsed: 0,
      status: "ACTIVE",
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Erro ao buscar subscription gov:", error)
    return NextResponse.json(
      { error: "Erro ao buscar subscription", subscription: null },
      { status: 500 }
    )
  }
}

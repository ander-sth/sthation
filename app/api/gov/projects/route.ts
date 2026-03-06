import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { GovProjectType, GovProjectStatus } from "@/lib/types/gov"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    // Buscar projetos Gov da prefeitura
    // TODO: Implementar tabela gov_projects no banco
    
    // Por enquanto retorna lista vazia - prefeitura ainda nao tem projetos
    const projects: any[] = []

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Erro ao buscar projetos gov:", error)
    return NextResponse.json(
      { error: "Erro ao buscar projetos", projects: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      type,
      municipality,
      state,
      responsibleDepartment,
      impactGoal,
      investedAmount,
      executionPeriod,
      beneficiaries,
      evidences,
      userId,
    } = body

    // Validar campos obrigatorios
    if (!title || !type || !municipality) {
      return NextResponse.json(
        { error: "Campos obrigatorios faltando" },
        { status: 400 }
      )
    }

    // Determinar metodo de verificacao baseado no tipo
    const verificationMethod = type === GovProjectType.SOCIAL ? "VCA" : "CERTIFICADORA"

    // TODO: Criar tabela gov_projects e salvar no banco
    // Por enquanto retorna projeto mockado
    const project = {
      id: `gov-proj-${Date.now()}`,
      subscriptionId: "gov-sub-001",
      title,
      description,
      type,
      status: GovProjectStatus.INSCRITO,
      municipality,
      state,
      responsibleDepartment,
      impactGoal,
      investedAmount: investedAmount || 0,
      executionPeriod: executionPeriod || { start: null, end: null },
      beneficiaries: beneficiaries || 0,
      evidences: evidences || { photos: [], documents: [] },
      verificationMethod,
      blockchainTxId: null,
      inscriptionId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar projeto gov:", error)
    return NextResponse.json(
      { error: "Erro ao criar projeto" },
      { status: 500 }
    )
  }
}

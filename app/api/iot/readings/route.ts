import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ownerId = searchParams.get("owner_id")
  const limit = parseInt(searchParams.get("limit") || "10")

  // Por enquanto retorna vazio - dados reais viriam de sensores IoT conectados
  // Em producao, buscaria do banco de dados de leituras IoT
  const readings: any[] = []

  return NextResponse.json({ 
    readings,
    total: 0,
    message: ownerId ? "Nenhum sensor conectado a este usuario" : "Nenhum sensor encontrado"
  })
}

// Webhook especifico para Organa (Arduino composteira)
// Recebe dados de sensores de composteira e insere na trail ambiental
// Formato: dispositivo Arduino envia kg residuos organicos -> kg compostagem

import { NextResponse } from "next/server"
import { validateOrganaPayload } from "@/lib/pipeline/validators"
import { processIoTData, organaToDataPoint, getTrail } from "@/lib/pipeline/engine"
import type { PipelineResponse } from "@/lib/pipeline/types"

// Mapa de dispositivos Organa para trails (MVP in-memory)
// Em producao, consultar banco de dados
const deviceTrailMap = new Map<string, { trailId: string; projectId: string; projectTitle: string; companyId: string; companyName: string }>()

// Dispositivo demo pre-registrado
deviceTrailMap.set("organa_arduino_001", {
  trailId: "trail_demo_env_001",
  projectId: "proj_env_001",
  projectTitle: "Compostagem Urbana - Organa SP",
  companyId: "company_organa",
  companyName: "Organa Compostagem",
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = validateOrganaPayload(body)

    if (!validation.valid) {
      return NextResponse.json<PipelineResponse>(
        { success: false, error: `Validacao falhou: ${validation.errors.join(", ")}` },
        { status: 400 },
      )
    }

    // Validar API key (MVP: chave fixa, producao: banco de dados)
    const ORGANA_API_KEY = process.env.ORGANA_API_KEY ?? "organa_dev_key_2025"
    if (body.api_key !== ORGANA_API_KEY) {
      return NextResponse.json<PipelineResponse>(
        { success: false, error: "API key invalida" },
        { status: 401 },
      )
    }

    // Buscar configuracao do dispositivo
    const deviceConfig = deviceTrailMap.get(body.device_id)
    if (!deviceConfig) {
      return NextResponse.json<PipelineResponse>(
        { success: false, error: `Dispositivo ${body.device_id} nao registrado. Registre primeiro via dashboard.` },
        { status: 404 },
      )
    }

    // Verificar se trail existente ainda aceita dados
    const existingTrail = getTrail(deviceConfig.trailId)
    if (existingTrail && existingTrail.status !== "COLLECTING" && existingTrail.status !== "OPEN") {
      return NextResponse.json<PipelineResponse>(
        { success: false, error: `Trail ${deviceConfig.trailId} nao esta aceitando dados (status: ${existingTrail.status}). Dados do Arduino descartados.` },
        { status: 409 },
      )
    }

    // Converter payload Organa para formato generico
    const dataPoint = organaToDataPoint(body)

    // Processar via engine
    const { trail, event } = await processIoTData({
      trailId: deviceConfig.trailId,
      projectId: deviceConfig.projectId,
      projectTitle: deviceConfig.projectTitle,
      companyId: deviceConfig.companyId,
      companyName: deviceConfig.companyName,
      partnerIntegration: "organa",
      sensorType: "composteira",
      dataPoints: [dataPoint],
    })

    return NextResponse.json<PipelineResponse>({
      success: true,
      trailId: trail.id,
      eventId: event.id,
      hash: event.dataHash,
      data: {
        trailStatus: trail.status,
        totalInputKg: trail.environmental?.totalInput,
        totalOutputKg: trail.environmental?.totalOutput,
        dataPointsCount: trail.environmental?.dataPoints.length,
        message: `Recebido: ${body.data.kg_residuos_entrada}kg residuos -> ${body.data.kg_compostagem_saida}kg compostagem`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno"
    return NextResponse.json<PipelineResponse>(
      { success: false, error: message },
      { status: 500 },
    )
  }
}

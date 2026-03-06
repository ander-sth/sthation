import { NextResponse } from "next/server"
import { validateRegisterPayload } from "@/lib/pipeline/validators"
import { getTrail, markRegistering, markRegistered } from "@/lib/pipeline/engine"
import { canRegister, registerOnPolygon } from "@/lib/pipeline/polygon-registry"
import type { RegisterPayload, PipelineResponse } from "@/lib/pipeline/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = validateRegisterPayload(body)

    if (!validation.valid) {
      return NextResponse.json<PipelineResponse>(
        { success: false, error: `Validacao falhou: ${validation.errors.join(", ")}` },
        { status: 400 },
      )
    }

    const payload = body as RegisterPayload
    const trail = getTrail(payload.trailId)
    if (!trail) {
      return NextResponse.json<PipelineResponse>(
        { success: false, error: `Trail ${payload.trailId} nao encontrada` },
        { status: 404 },
      )
    }

    // Valida se pode registrar
    const check = canRegister(trail)
    if (!check.allowed) {
      return NextResponse.json<PipelineResponse>(
        { success: false, error: check.reason },
        { status: 422 },
      )
    }

    // Marca como registrando
    await markRegistering(payload.trailId)

    // Registra na Polygon
    const polygonResult = await registerOnPolygon(trail, payload.network)

    // Marca como registrado
    const { trail: finalTrail, event } = await markRegistered(payload.trailId, {
      ...polygonResult,
      network: payload.network,
    })

    return NextResponse.json<PipelineResponse>({
      success: true,
      trailId: finalTrail.id,
      eventId: event.id,
      hash: polygonResult.packetHash,
      data: {
        trailStatus: finalTrail.status,
        txHash: polygonResult.txHash,
        blockNumber: polygonResult.blockNumber,
        explorerUrl: polygonResult.explorerUrl,
        gasUsed: polygonResult.gasUsed,
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

import { NextResponse } from "next/server"
import { validateFinalizePayload } from "@/lib/pipeline/validators"
import { finalizeSocialTrail } from "@/lib/pipeline/engine"
import type { FinalizePayload, PipelineResponse } from "@/lib/pipeline/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = validateFinalizePayload(body)

    if (!validation.valid) {
      return NextResponse.json<PipelineResponse>(
        { success: false, error: `Validacao falhou: ${validation.errors.join(", ")}` },
        { status: 400 },
      )
    }

    const payload = body as FinalizePayload
    const { trail, event } = await finalizeSocialTrail(payload)

    return NextResponse.json<PipelineResponse>({
      success: true,
      trailId: trail.id,
      eventId: event.id,
      hash: event.dataHash,
      data: {
        trailStatus: trail.status,
        totalRaised: trail.social?.currentAmount,
        donationsCount: trail.social?.donationsCount,
        eventChainLength: trail.events.length,
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

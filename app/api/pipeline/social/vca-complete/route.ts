import { NextResponse } from "next/server"
import { validateVCACompletePayload } from "@/lib/pipeline/validators"
import { processVCAComplete } from "@/lib/pipeline/engine"
import type { VCACompletePayload, PipelineResponse } from "@/lib/pipeline/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = validateVCACompletePayload(body)

    if (!validation.valid) {
      return NextResponse.json<PipelineResponse>(
        { success: false, error: `Validacao falhou: ${validation.errors.join(", ")}` },
        { status: 400 },
      )
    }

    const payload = body as VCACompletePayload
    const { trail, event } = await processVCAComplete(payload)

    return NextResponse.json<PipelineResponse>({
      success: true,
      trailId: trail.id,
      eventId: event.id,
      hash: event.dataHash,
      data: {
        trailStatus: trail.status,
        vcaScore: trail.social?.vcaScore,
        vcaApproved: trail.social?.vcaApproved,
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

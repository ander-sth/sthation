import { NextResponse } from "next/server"
import { validateIoTIngestPayload } from "@/lib/pipeline/validators"
import { processIoTData } from "@/lib/pipeline/engine"
import type { IoTIngestPayload, PipelineResponse } from "@/lib/pipeline/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = validateIoTIngestPayload(body)

    if (!validation.valid) {
      return NextResponse.json<PipelineResponse>(
        { success: false, error: `Validacao falhou: ${validation.errors.join(", ")}` },
        { status: 400 },
      )
    }

    const payload = body as IoTIngestPayload
    const { trail, event } = await processIoTData(payload)

    return NextResponse.json<PipelineResponse>({
      success: true,
      trailId: trail.id,
      eventId: event.id,
      hash: event.dataHash,
      data: {
        trailStatus: trail.status,
        totalInput: trail.environmental?.totalInput,
        totalOutput: trail.environmental?.totalOutput,
        dataPointsCount: trail.environmental?.dataPoints.length,
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

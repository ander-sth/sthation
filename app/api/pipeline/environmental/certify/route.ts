import { NextResponse } from "next/server"
import { validateCertifyPayload } from "@/lib/pipeline/validators"
import { processCertification } from "@/lib/pipeline/engine"
import type { CertifyPayload, PipelineResponse } from "@/lib/pipeline/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = validateCertifyPayload(body)

    if (!validation.valid) {
      return NextResponse.json<PipelineResponse>(
        { success: false, error: `Validacao falhou: ${validation.errors.join(", ")}` },
        { status: 400 },
      )
    }

    const payload = body as CertifyPayload
    const { trail, event } = await processCertification(payload)

    return NextResponse.json<PipelineResponse>({
      success: true,
      trailId: trail.id,
      eventId: event.id,
      hash: event.dataHash,
      data: {
        trailStatus: trail.status,
        certifierScore: trail.environmental?.certifierScore,
        certifierApproved: trail.environmental?.certifierApproved,
        certifiedBy: trail.environmental?.certifiedBy,
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

import { NextResponse } from "next/server"
import { validateDonationPayload } from "@/lib/pipeline/validators"
import { processDonation } from "@/lib/pipeline/engine"
import type { DonationPayload, PipelineResponse } from "@/lib/pipeline/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = validateDonationPayload(body)

    if (!validation.valid) {
      return NextResponse.json<PipelineResponse>(
        { success: false, error: `Validacao falhou: ${validation.errors.join(", ")}` },
        { status: 400 },
      )
    }

    const payload: DonationPayload = {
      ...body,
      timestamp: body.timestamp ?? Date.now(),
      currency: "BRL",
    }

    const { trail, event } = await processDonation(payload)

    return NextResponse.json<PipelineResponse>({
      success: true,
      trailId: trail.id,
      eventId: event.id,
      hash: event.dataHash,
      data: {
        trailStatus: trail.status,
        currentAmount: trail.social?.currentAmount,
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

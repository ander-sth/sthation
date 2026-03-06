import { NextResponse } from "next/server"
import { getTrail } from "@/lib/pipeline/engine"
import type { PipelineResponse } from "@/lib/pipeline/types"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ trailId: string }> },
) {
  try {
    const { trailId } = await params
    const trail = getTrail(trailId)

    if (!trail) {
      return NextResponse.json<PipelineResponse>(
        { success: false, error: `Trail ${trailId} nao encontrada` },
        { status: 404 },
      )
    }

    return NextResponse.json<PipelineResponse>({
      success: true,
      trailId: trail.id,
      data: {
        id: trail.id,
        type: trail.type,
        status: trail.status,
        projectId: trail.projectId,
        projectTitle: trail.projectTitle,
        organizationId: trail.organizationId,
        organizationName: trail.organizationName,
        createdAt: trail.createdAt,
        updatedAt: trail.updatedAt,
        eventsCount: trail.events.length,
        events: trail.events.map((e) => ({
          id: e.id,
          type: e.type,
          timestamp: e.timestamp,
          dataHash: e.dataHash,
          previousHash: e.previousHash,
          actor: e.actor,
          payload: e.payload,
        })),
        social: trail.social,
        environmental: trail.environmental
          ? {
              ...trail.environmental,
              dataPointsCount: trail.environmental.dataPoints.length,
              dataPoints: trail.environmental.dataPoints.slice(-10), // Ultimos 10
            }
          : undefined,
        polygon: trail.polygon,
        hashChainValid: validateHashChain(trail.events.map((e) => ({
          hash: e.dataHash,
          previousHash: e.previousHash,
        }))),
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

// Valida integridade da cadeia de hashes
function validateHashChain(events: Array<{ hash: string; previousHash: string }>): boolean {
  for (let i = 1; i < events.length; i++) {
    if (events[i].previousHash !== events[i - 1].hash) {
      return false
    }
  }
  return true
}

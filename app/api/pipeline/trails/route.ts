import { NextResponse } from "next/server"
import { getAllTrails, getTrailsByType, getTrailsByStatus } from "@/lib/pipeline/engine"
import type { TrailType, TrailStatus, PipelineResponse } from "@/lib/pipeline/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as TrailType | null
    const status = searchParams.get("status") as TrailStatus | null

    let trails = getAllTrails()

    if (type) {
      trails = trails.filter((t) => t.type === type)
    }
    if (status) {
      trails = trails.filter((t) => t.status === status)
    }

    return NextResponse.json<PipelineResponse>({
      success: true,
      data: {
        total: trails.length,
        trails: trails.map((t) => ({
          id: t.id,
          type: t.type,
          status: t.status,
          projectId: t.projectId,
          projectTitle: t.projectTitle,
          organizationName: t.organizationName,
          eventsCount: t.events.length,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          lastEventHash: t.events[t.events.length - 1]?.dataHash,
          hasPolygon: !!t.polygon,
          summary: t.type === "SOCIAL"
            ? { currentAmount: t.social?.currentAmount, targetAmount: t.social?.targetAmount, donationsCount: t.social?.donationsCount }
            : { totalInput: t.environmental?.totalInput, totalOutput: t.environmental?.totalOutput, partner: t.environmental?.partnerIntegration },
        })),
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

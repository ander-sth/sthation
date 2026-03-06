import { BaseService } from "./base-service"
import { mockImpactRecords } from "@/lib/mock-data"
import type { ImpactRecord } from "@/lib/types/impact-registry"

class ImpactService extends BaseService<ImpactRecord> {
  protected mockData = mockImpactRecords
  protected endpoint = "/api/impact/records"

  protected findInMock(id: string): ImpactRecord | null {
    return this.mockData.find((r) => r.id === id) || null
  }

  async getByType(type: "SOCIAL" | "AMBIENTAL") {
    const all = await this.getAll()
    return all.filter((r) => r.type === type)
  }

  async getRecent(limit = 5) {
    const all = await this.getAll()
    return all.slice(0, limit)
  }
}

export const impactService = new ImpactService()

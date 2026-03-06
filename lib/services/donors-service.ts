import { BaseService } from "./base-service"
import { mockDonorRankings, mockCategoryRankings, donorStats } from "@/lib/mock-donors"
import type { DonorRanking, CategoryRanking } from "@/lib/types/donor-ranking"
import { config } from "@/lib/config"

class DonorsService extends BaseService<DonorRanking> {
  protected mockData = mockDonorRankings
  protected endpoint = "/api/donors/ranking"

  protected findInMock(id: string): DonorRanking | null {
    return this.mockData.find((d) => d.id === id) || null
  }

  async getTopDonors(limit = 10) {
    const all = await this.getAll()
    return all.sort((a, b) => b.impactScore - a.impactScore).slice(0, limit)
  }

  async getCategoryRankings(): Promise<CategoryRanking[]> {
    try {
      const response = await fetch(`${config.apiUrl}/api/donors/ranking/categories`, {
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) return response.json()
      throw new Error("API unavailable")
    } catch {
      if (config.useMockFallback) return mockCategoryRankings
      throw new Error("Failed to fetch category rankings")
    }
  }

  async getStats() {
    try {
      const response = await fetch(`${config.apiUrl}/api/donors/stats`, {
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) return response.json()
      throw new Error("API unavailable")
    } catch {
      if (config.useMockFallback) return donorStats
      throw new Error("Failed to fetch donor stats")
    }
  }
}

export const donorsService = new DonorsService()

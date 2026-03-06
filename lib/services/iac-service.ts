import { BaseService } from "./base-service"
import { mockIACs } from "@/lib/mock-data"
import type { ImpactActionCard } from "@/lib/types/iac"
import { config } from "@/lib/config"

class IacService extends BaseService<ImpactActionCard> {
  protected mockData = mockIACs
  protected endpoint = "/api/iac"

  protected findInMock(id: string): ImpactActionCard | null {
    return this.mockData.find((iac) => iac.id === id) || null
  }

  async getByStatus(status: string) {
    const all = await this.getAll()
    return all.filter((iac) => iac.status === status)
  }

  async getByInstitution(institutionId: string) {
    const all = await this.getAll()
    return all.filter((iac) => iac.institutionId === institutionId)
  }

  async create(data: Partial<ImpactActionCard>) {
    const token = localStorage.getItem("sthation_token")

    const response = await fetch(`${config.apiUrl}/api/iac`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create IAC")
    }

    return response.json()
  }

  async submitForValidation(id: string) {
    const token = localStorage.getItem("sthation_token")

    const response = await fetch(`${config.apiUrl}/api/iac/${id}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to submit IAC")
    }

    return response.json()
  }
}

export const iacService = new IacService()

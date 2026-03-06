import { BaseService } from "./base-service"
import { mockFundingProjects } from "@/lib/mock-data"
import type { FundingProject } from "@/lib/types/funding"

class ProjectsService extends BaseService<FundingProject> {
  protected mockData = mockFundingProjects
  protected endpoint = "/api/projects"

  protected findInMock(id: string): FundingProject | null {
    return this.mockData.find((p) => p.id === id) || null
  }

  async getByStatus(status: string) {
    const all = await this.getAll()
    return all.filter((p) => p.status === status)
  }

  async getFunding() {
    return this.getByStatus("FUNDING")
  }

  async getFeatured() {
    const all = await this.getAll()
    return all.slice(0, 3) // Primeiros 3 projetos como destaque
  }
}

export const projectsService = new ProjectsService()

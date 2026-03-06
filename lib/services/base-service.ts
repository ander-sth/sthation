import { config, debugLog } from "@/lib/config"

export interface ServiceOptions {
  useMock?: boolean
}

export abstract class BaseService<T> {
  protected abstract mockData: T[]
  protected abstract endpoint: string

  async getAll(options?: ServiceOptions): Promise<T[]> {
    const useMock = options?.useMock ?? config.useMockFallback

    try {
      const response = await this.fetchFromApi(this.endpoint)
      debugLog(`${this.endpoint} loaded from API`, response)
      return response
    } catch (error) {
      if (useMock) {
        debugLog(`${this.endpoint} fallback to mock data`, error)
        return this.mockData
      }
      throw error
    }
  }

  async getById(id: string, options?: ServiceOptions): Promise<T | null> {
    const useMock = options?.useMock ?? config.useMockFallback

    try {
      const response = await this.fetchFromApi(`${this.endpoint}/${id}`)
      debugLog(`${this.endpoint}/${id} loaded from API`, response)
      return response
    } catch (error) {
      if (useMock) {
        debugLog(`${this.endpoint}/${id} fallback to mock data`, error)
        return this.findInMock(id)
      }
      throw error
    }
  }

  protected abstract findInMock(id: string): T | null

  protected async fetchFromApi(url: string): Promise<T[] | T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("sthation_token") : null

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout)

    try {
      const response = await fetch(`${config.apiUrl}${url}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }
}

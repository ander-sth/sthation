import type { ImpactActionCard, Evidence, TsbCategoryCode } from "./types/iac"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("sthation_token") : null

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || "Request failed")
  }

  return res.json()
}

// IAC endpoints - aligned with Blueprint DDD structure
export interface CreateIacDto {
  title: string
  description: string
  tsbCategory: TsbCategoryCode
  location: {
    name: string
    coordinates: { lat: number; lng: number }
  }
  targetImpact: string
  startDate: string
  endDate: string
  budget?: number
}

export interface AddEvidenceDto {
  url: string
  type: "PHOTO" | "VIDEO" | "IOT_LOG" | "DOCUMENT"
  timestamp: string
  gps: { lat: number; lng: number }
  deviceSignature: string
  contentHash: string
  description?: string
}

export const iacApi = {
  list: (): Promise<ImpactActionCard[]> => apiFetch("/api/iac"),
  getById: (id: string): Promise<ImpactActionCard> => apiFetch(`/api/iac/${id}`),
  create: (data: CreateIacDto): Promise<ImpactActionCard> =>
    apiFetch("/api/iac", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateIacDto>): Promise<ImpactActionCard> =>
    apiFetch(`/api/iac/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  addEvidence: (id: string, evidence: AddEvidenceDto): Promise<Evidence> =>
    apiFetch(`/api/iac/${id}/evidence`, { method: "POST", body: JSON.stringify(evidence) }),
  submitForValidation: (id: string): Promise<ImpactActionCard> => apiFetch(`/api/iac/${id}/submit`, { method: "POST" }),
  getAuditLog: (id: string) => apiFetch(`/api/iac/${id}/audit-log`),
}

// VCA endpoints
export const vcaApi = {
  getPending: () => apiFetch("/api/vca/pending"),
  start: (iacId: string) => apiFetch(`/api/vca/start/${iacId}`, { method: "POST" }),
  vote: (vcaId: string, vote: "approve" | "reject", comments: string) =>
    apiFetch(`/api/vca/${vcaId}/vote`, { method: "POST", body: JSON.stringify({ vote, comments }) }),
  getResults: (vcaId: string) => apiFetch(`/api/vca/${vcaId}/results`),
}

// Users endpoints
export const usersApi = {
  list: () => apiFetch("/api/users"),
  me: () => apiFetch("/api/users/me"),
}

// NOBIS endpoints
export const nobisApi = {
  mint: (iacId: string) => apiFetch(`/api/nobis/mint/${iacId}`, { method: "POST" }),
  getByIac: (iacId: string) => apiFetch(`/api/nobis/iac/${iacId}`),
  list: () => apiFetch("/api/nobis"),
}

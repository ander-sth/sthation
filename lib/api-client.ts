/**
 * Cliente API centralizado para comunicacao com o backend em producao
 * Backend: https://sthation-api-production.up.railway.app
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sthation-api-production.up.railway.app"

// Armazena o token JWT em memoria (client-side)
let authToken: string | null = null

/**
 * Define o token de autenticacao
 */
export function setAuthToken(token: string | null) {
  authToken = token
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("sthation_token", token)
    } else {
      localStorage.removeItem("sthation_token")
    }
  }
}

/**
 * Recupera o token de autenticacao
 */
export function getAuthToken(): string | null {
  if (authToken) return authToken
  if (typeof window !== "undefined") {
    authToken = localStorage.getItem("sthation_token")
  }
  return authToken
}

/**
 * Verifica se o usuario esta autenticado com a API real
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

/**
 * Headers padrao para requisicoes autenticadas
 */
function getHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  
  const token = getAuthToken()
  if (includeAuth && token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  
  return headers
}

/**
 * Funcao generica para fazer requisicoes a API
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth = true
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(includeAuth),
        ...options.headers,
      },
    })

    const status = response.status

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        data: null,
        error: errorData.message || errorData.error || `Erro ${status}`,
        status,
      }
    }

    const data = await response.json()
    return { data, error: null, status }
  } catch (error) {
    console.error("[API Client] Request failed:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Erro de conexao com a API",
      status: 0,
    }
  }
}

// ============================================
// AUTH ENDPOINTS
// ============================================

export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  token: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: string
  document?: string
  phone?: string
}

/**
 * Login na API real
 */
export async function apiLogin(email: string, password: string) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, false)
}

/**
 * Registro de novo usuario
 */
export async function apiRegister(data: RegisterData) {
  return apiRequest<LoginResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  }, false)
}

/**
 * Logout - limpa o token
 */
export function apiLogout() {
  setAuthToken(null)
}

// ============================================
// DATA ENDPOINTS
// ============================================

/**
 * Buscar organizacoes
 */
export async function fetchOrganizations() {
  return apiRequest<any[]>("/api/organizations")
}

/**
 * Buscar projetos
 */
export async function fetchProjects(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : ""
  return apiRequest<any[]>(`/api/projects${query}`)
}

/**
 * Buscar IACs
 */
export async function fetchIACs(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : ""
  return apiRequest<any[]>(`/api/iac${query}`)
}

/**
 * Buscar doacoes
 */
export async function fetchDonations(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : ""
  return apiRequest<any[]>(`/api/donations${query}`)
}

/**
 * Criar doacao
 */
export async function createDonation(data: {
  projectId: string
  amount: number
  paymentMethod: string
}) {
  return apiRequest<any>("/api/donations", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * Ranking de doadores
 */
export async function fetchDonorsRanking() {
  return apiRequest<any[]>("/api/donors/ranking")
}

/**
 * Estatisticas de doadores
 */
export async function fetchDonorsStats() {
  return apiRequest<any>("/api/donors/stats")
}

/**
 * Buscar VCAs
 */
export async function fetchVCAs(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : ""
  return apiRequest<any[]>(`/api/vca${query}`)
}

/**
 * Buscar dados de governanca
 */
export async function fetchGov() {
  return apiRequest<any>("/api/gov")
}

/**
 * Buscar evidencias
 */
export async function fetchEvidences(iacId?: string) {
  const query = iacId ? `?iacId=${iacId}` : ""
  return apiRequest<any[]>(`/api/evidences${query}`)
}

/**
 * Buscar inscricoes
 */
export async function fetchInscriptions() {
  return apiRequest<any[]>("/api/inscriptions")
}

/**
 * Buscar dados do Nobis Hall
 */
export async function fetchNobisHall() {
  return apiRequest<any>("/api/nobis")
}

/**
 * Buscar pipeline
 */
export async function fetchPipeline() {
  return apiRequest<any[]>("/api/pipeline")
}

/**
 * Health check da API
 */
export async function checkApiHealth() {
  return apiRequest<{ status: string }>("/health", {}, false)
}

// ============================================
// SWR FETCHER
// ============================================

/**
 * Fetcher para uso com SWR
 */
export const swrFetcher = async (url: string) => {
  const fullUrl = url.startsWith("/api") ? `${API_BASE_URL}${url}` : url
  const token = getAuthToken()
  
  const response = await fetch(fullUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  
  if (!response.ok) {
    const error = new Error("Erro ao buscar dados")
    throw error
  }
  
  return response.json()
}

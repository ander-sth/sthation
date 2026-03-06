// Configuracao central da aplicacao - MODO PRODUCAO

export const config = {
  // Mock fallback DESABILITADO - usar apenas dados reais do banco
  useMockFallback: false,

  // URL da API backend (Railway production)
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://sthation-api-production.up.railway.app",

  // Timeout para requisições API (ms)
  apiTimeout: 10000,

  // Habilitar logs de debug
  debug: process.env.NODE_ENV === "development",
}

// Helper para log condicional
export function debugLog(message: string, data?: unknown) {
  if (config.debug) {
    console.log(`[STHATION] ${message}`, data || "")
  }
}

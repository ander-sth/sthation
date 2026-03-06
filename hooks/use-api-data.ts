"use client"

import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import { config } from "@/lib/config"

interface UseApiDataOptions<T> {
  /** Dados de fallback para modo demo */
  fallbackData?: T
  /** Desabilitar fetch automatico */
  disabled?: boolean
  /** Revalidar ao focar na janela */
  revalidateOnFocus?: boolean
}

/**
 * Hook para buscar dados da API com autenticacao JWT e fallback para mock
 */
export function useApiData<T>(
  endpoint: string | null,
  options: UseApiDataOptions<T> = {}
) {
  const { token, user } = useAuth()
  const { fallbackData, disabled = false, revalidateOnFocus = false } = options

  // Verifica se e modo demo (token comeca com demo_)
  const isDemoMode = token?.startsWith("demo_") || false

  const fetcher = async (url: string): Promise<T> => {
    // Se modo demo, retorna fallback imediatamente
    if (isDemoMode && fallbackData !== undefined) {
      return fallbackData
    }

    const fullUrl = `${config.apiUrl}${url}`
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    
    if (token && !isDemoMode) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(fullUrl, { headers })

    if (!response.ok) {
      // Se API falhou e temos fallback, usar fallback
      if (config.useMockFallback && fallbackData !== undefined) {
        console.log("[useApiData] API error, using fallback for:", url)
        return fallbackData
      }
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  const shouldFetch = !disabled && endpoint && (token || !endpoint.includes("/api/"))

  const { data, error, isLoading, mutate } = useSWR<T>(
    shouldFetch ? endpoint : null,
    fetcher,
    {
      fallbackData: isDemoMode ? fallbackData : undefined,
      revalidateOnFocus,
      onError: (err) => {
        console.error("[useApiData] Error fetching:", endpoint, err)
      },
    }
  )

  // Se estamos em modo demo e temos fallback, usar fallback
  const finalData = isDemoMode && fallbackData !== undefined ? fallbackData : data

  return {
    data: finalData,
    error,
    isLoading: !isDemoMode && isLoading,
    mutate,
    isDemoMode,
    isAuthenticated: !!token,
  }
}

/**
 * Hook para buscar dados publicos (sem autenticacao)
 */
export function usePublicData<T>(
  endpoint: string | null,
  options: UseApiDataOptions<T> = {}
) {
  const { fallbackData, disabled = false, revalidateOnFocus = false } = options

  const fetcher = async (url: string): Promise<T> => {
    const fullUrl = `${config.apiUrl}${url}`
    
    const response = await fetch(fullUrl)

    if (!response.ok) {
      if (config.useMockFallback && fallbackData !== undefined) {
        console.log("[usePublicData] API error, using fallback for:", url)
        return fallbackData
      }
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  const { data, error, isLoading, mutate } = useSWR<T>(
    disabled ? null : endpoint,
    fetcher,
    {
      fallbackData,
      revalidateOnFocus,
    }
  )

  return {
    data: data ?? fallbackData,
    error,
    isLoading,
    mutate,
  }
}

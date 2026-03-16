"use client"

import { useState, useCallback } from "react"

interface UploadOptions {
  type?: "image" | "document" | "certificate" | "evidence"
  folder?: string
  entityId?: string
}

interface UploadResult {
  url: string
  pathname: string
  contentType: string
  size: number
}

interface UseFileUploadReturn {
  upload: (file: File, options?: UploadOptions) => Promise<UploadResult>
  deleteFile: (url: string) => Promise<void>
  isUploading: boolean
  error: string | null
  progress: number
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const upload = useCallback(async (file: File, options: UploadOptions = {}): Promise<UploadResult> => {
    setIsUploading(true)
    setError(null)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", options.type || "image")
      formData.append("folder", options.folder || "uploads")
      if (options.entityId) formData.append("entityId", options.entityId)

      // Simular progresso (já que fetch não suporta upload progress nativamente)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falha no upload")
      }

      return {
        url: data.url,
        pathname: data.pathname,
        contentType: data.contentType,
        size: data.size,
      }
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao fazer upload"
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const deleteFile = useCallback(async (url: string): Promise<void> => {
    try {
      const response = await fetch("/api/upload/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Falha ao deletar")
      }
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao deletar arquivo"
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }, [])

  return {
    upload,
    deleteFile,
    isUploading,
    error,
    progress,
  }
}

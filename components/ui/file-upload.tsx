"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, X, FileText, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onUpload: (result: { url: string; pathname: string }) => void
  onError?: (error: string) => void
  type?: "image" | "document" | "certificate" | "evidence"
  folder?: string
  entityId?: string
  accept?: string
  maxSize?: number // em MB
  className?: string
  disabled?: boolean
  label?: string
  preview?: boolean
}

export function FileUpload({
  onUpload,
  onError,
  type = "image",
  folder = "uploads",
  entityId,
  accept,
  maxSize,
  className,
  disabled = false,
  label = "Arraste um arquivo ou clique para selecionar",
  preview = true,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Aceitar tipos baseado no tipo de upload
  const getAcceptedTypes = () => {
    if (accept) return accept
    switch (type) {
      case "image":
        return "image/jpeg,image/png,image/gif,image/webp"
      case "document":
        return "application/pdf,.doc,.docx"
      case "certificate":
        return "application/pdf,image/jpeg,image/png"
      case "evidence":
        return "image/jpeg,image/png,image/gif,application/pdf,video/mp4"
      default:
        return "*"
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      formData.append("folder", folder)
      if (entityId) formData.append("entityId", entityId)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falha no upload")
      }

      setUploadedFile({ url: data.url, name: file.name })
      onUpload({ url: data.url, pathname: data.pathname })
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao fazer upload"
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      uploadFile(files[0])
    }
  }, [disabled, type, folder, entityId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }

  const handleRemove = async () => {
    if (!uploadedFile) return

    try {
      await fetch("/api/upload/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: uploadedFile.url }),
      })
    } catch (err) {
      console.error("Erro ao deletar arquivo:", err)
    }

    setUploadedFile(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Área de upload */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragging && "border-primary bg-primary/5",
          !isDragging && "border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          uploadedFile && "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={getAcceptedTypes()}
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
            </>
          ) : uploadedFile ? (
            <>
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-700">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">Arquivo enviado com sucesso!</p>
            </>
          ) : (
            <>
              {type === "image" ? (
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              ) : (
                <FileText className="h-10 w-10 text-muted-foreground" />
              )}
              <div className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {type === "image" && "JPG, PNG, GIF ou WebP (max 5MB)"}
                {type === "document" && "PDF ou Word (max 10MB)"}
                {type === "certificate" && "PDF, JPG ou PNG (max 10MB)"}
                {type === "evidence" && "Imagem, PDF ou Video (max 50MB)"}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Preview da imagem */}
      {preview && uploadedFile && type === "image" && (
        <div className="mt-3 relative inline-block">
          <img
            src={uploadedFile.url}
            alt="Preview"
            className="h-20 w-20 rounded-lg object-cover border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              handleRemove()
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Botão remover para não-imagens */}
      {uploadedFile && type !== "image" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={handleRemove}
        >
          <X className="mr-1 h-3 w-3" />
          Remover arquivo
        </Button>
      )}

      {/* Erro */}
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

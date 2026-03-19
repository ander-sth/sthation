"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ImageIcon, 
  FileText, 
  Video, 
  Cpu, 
  Download, 
  ExternalLink, 
  Shield, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Eye
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Evidence {
  id: string
  type: "PHOTO" | "VIDEO" | "DOCUMENT" | "SENSOR"
  url: string
  title?: string
  description?: string
  hash?: string
  created_at: string
  metadata?: Record<string, any>
}

interface EvidenceGalleryProps {
  evidences: Evidence[]
  projectTitle?: string
}

const TYPE_ICONS = {
  PHOTO: ImageIcon,
  VIDEO: Video,
  DOCUMENT: FileText,
  SENSOR: Cpu,
}

const TYPE_LABELS = {
  PHOTO: "Foto",
  VIDEO: "Video",
  DOCUMENT: "Documento",
  SENSOR: "Sensor IoT",
}

const TYPE_COLORS = {
  PHOTO: "bg-blue-100 text-blue-700",
  VIDEO: "bg-purple-100 text-purple-700",
  DOCUMENT: "bg-amber-100 text-amber-700",
  SENSOR: "bg-emerald-100 text-emerald-700",
}

export function EvidenceGallery({ evidences, projectTitle }: EvidenceGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const selectedEvidence = selectedIndex !== null ? evidences[selectedIndex] : null

  const openModal = (index: number) => setSelectedIndex(index)
  const closeModal = () => setSelectedIndex(null)
  
  const goNext = () => {
    if (selectedIndex !== null && selectedIndex < evidences.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }
  
  const goPrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  if (!evidences || evidences.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl bg-muted/50 border border-dashed">
        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">Nenhuma evidencia registrada</p>
      </div>
    )
  }

  return (
    <>
      {/* Grid de Evidencias */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {evidences.map((evidence, index) => {
          const Icon = TYPE_ICONS[evidence.type] || ImageIcon
          const isImage = evidence.type === "PHOTO" || evidence.type === "VIDEO"
          
          return (
            <button
              key={evidence.id}
              onClick={() => openModal(index)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-border hover:border-primary/50 transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {isImage && evidence.url ? (
                <Image
                  src={evidence.url}
                  alt={evidence.title || `Evidencia ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <Icon className="h-12 w-12 text-muted-foreground/50" />
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Badge de tipo */}
              <div className="absolute top-2 left-2">
                <Badge className={`${TYPE_COLORS[evidence.type]} text-xs`}>
                  {TYPE_LABELS[evidence.type]}
                </Badge>
              </div>
              
              {/* Hash indicator */}
              {evidence.hash && (
                <div className="absolute top-2 right-2">
                  <div className="p-1 rounded-full bg-emerald-500 text-white">
                    <Shield className="h-3 w-3" />
                  </div>
                </div>
              )}
              
              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium truncate">
                  {evidence.title || `Evidencia ${index + 1}`}
                </p>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Clique para ver
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Modal de Visualizacao */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => closeModal()}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          {selectedEvidence && (
            <>
              {/* Header */}
              <DialogHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={TYPE_COLORS[selectedEvidence.type]}>
                      {TYPE_LABELS[selectedEvidence.type]}
                    </Badge>
                    <DialogTitle className="text-lg">
                      {selectedEvidence.title || `Evidencia ${(selectedIndex || 0) + 1}`}
                    </DialogTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {(selectedIndex || 0) + 1} / {evidences.length}
                    </span>
                  </div>
                </div>
              </DialogHeader>

              {/* Content */}
              <div className="relative">
                {/* Imagem/Video */}
                {(selectedEvidence.type === "PHOTO" || selectedEvidence.type === "VIDEO") && selectedEvidence.url ? (
                  <div className="relative aspect-video bg-black">
                    {selectedEvidence.type === "PHOTO" ? (
                      <Image
                        src={selectedEvidence.url}
                        alt={selectedEvidence.title || "Evidencia"}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <video
                        src={selectedEvidence.url}
                        controls
                        className="w-full h-full"
                      />
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {(() => {
                      const Icon = TYPE_ICONS[selectedEvidence.type]
                      return <Icon className="h-24 w-24 text-muted-foreground/30" />
                    })()}
                  </div>
                )}

                {/* Navigation arrows */}
                {evidences.length > 1 && (
                  <>
                    <button
                      onClick={goPrev}
                      disabled={selectedIndex === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={goNext}
                      disabled={selectedIndex === evidences.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Details */}
              <div className="p-4 space-y-4 max-h-[200px] overflow-y-auto">
                {/* Descricao */}
                {selectedEvidence.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedEvidence.description}
                  </p>
                )}

                {/* Metadados */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(selectedEvidence.created_at), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  
                  {selectedEvidence.hash && (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono truncate">
                        {selectedEvidence.hash.substring(0, 16)}...
                      </code>
                    </div>
                  )}
                </div>

                {/* Sensor metadata */}
                {selectedEvidence.type === "SENSOR" && selectedEvidence.metadata && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <p className="text-xs font-medium text-emerald-800 mb-2">Dados do Sensor</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {Object.entries(selectedEvidence.metadata).map(([key, value]) => (
                        <div key={key} className="text-emerald-700">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {selectedEvidence.url && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedEvidence.url} download target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedEvidence.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Abrir
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

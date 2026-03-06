"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Copy, QrCode, Smartphone, Building2, Mail, Key, AlertCircle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface PixDonationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: {
    title: string
    institution: {
      name: string
      pixKey?: string
      pixKeyType?: string
      pixHolderName?: string
    }
  }
  amount: number
  onConfirmDonation?: () => void
}

const PIX_KEY_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  CPF: { label: "CPF", icon: <Smartphone className="h-4 w-4" /> },
  CNPJ: { label: "CNPJ", icon: <Building2 className="h-4 w-4" /> },
  EMAIL: { label: "E-mail", icon: <Mail className="h-4 w-4" /> },
  TELEFONE: { label: "Telefone", icon: <Smartphone className="h-4 w-4" /> },
  ALEATORIA: { label: "Chave Aleatoria", icon: <Key className="h-4 w-4" /> },
}

export function PixDonationModal({ open, onOpenChange, project, amount, onConfirmDonation }: PixDonationModalProps) {
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const pixKey = project.institution.pixKey
  const pixKeyType = project.institution.pixKeyType || "ALEATORIA"
  const pixHolderName = project.institution.pixHolderName || project.institution.name

  // Gerar payload PIX (simplificado - em producao usar biblioteca pix-payload)
  const generatePixPayload = () => {
    // Payload simplificado - apenas a chave PIX
    // Em producao, usar EMV QR Code padrao BACEN
    return pixKey || ""
  }

  const pixPayload = generatePixPayload()

  const handleCopyPix = async () => {
    if (!pixKey) return
    try {
      await navigator.clipboard.writeText(pixKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  const handleConfirmDonation = async () => {
    setConfirming(true)
    // Aqui poderia registrar a doacao como "pendente" no banco
    // e depois confirmar manualmente ou via webhook
    if (onConfirmDonation) {
      onConfirmDonation()
    }
    setTimeout(() => {
      setConfirming(false)
      onOpenChange(false)
    }, 1500)
  }

  if (!pixKey) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              PIX nao configurado
            </DialogTitle>
            <DialogDescription>
              A instituicao ainda nao cadastrou uma chave PIX para receber doacoes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Entre em contato com <strong>{project.institution.name}</strong> para mais informacoes sobre como doar.
            </p>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-teal-500" />
            Doar via PIX
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR Code ou copie a chave PIX para fazer sua doacao
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo da doacao */}
          <Card className="bg-teal-50 border-teal-200">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Valor da doacao</p>
                  <p className="text-2xl font-bold text-teal-700">R$ {amount.toLocaleString("pt-BR")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Projeto</p>
                  <p className="font-medium text-sm">{project.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <div className="flex justify-center py-4">
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-200">
              <QRCodeSVG 
                value={pixPayload} 
                size={180}
                level="M"
                includeMargin
              />
            </div>
          </div>

          {/* Dados do PIX */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Titular</Label>
              <p className="font-medium">{pixHolderName}</p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                {PIX_KEY_TYPE_LABELS[pixKeyType]?.icon}
                Chave PIX ({PIX_KEY_TYPE_LABELS[pixKeyType]?.label || pixKeyType})
              </Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  value={pixKey} 
                  readOnly 
                  className="font-mono text-sm bg-gray-50"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleCopyPix}
                  className={copied ? "bg-green-50 border-green-300" : ""}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1">Chave copiada!</p>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-amber-50 p-2 rounded">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>Apos realizar o PIX, clique em "Confirmar Doacao" para registrar sua contribuicao.</span>
            </div>
          </div>

          {/* Acoes */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-teal-600 hover:bg-teal-700"
              onClick={handleConfirmDonation}
              disabled={confirming}
            >
              {confirming ? "Registrando..." : "Confirmar Doacao"}
            </Button>
          </div>

          {/* Instituicao */}
          <div className="text-center pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Doacao para <Badge variant="outline" className="ml-1">{project.institution.name}</Badge>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

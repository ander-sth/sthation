"use client"

import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (type: ToastType, title: string, message?: string) => void
  removeToast: (id: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, type, title, message }])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const success = (title: string, message?: string) => addToast("success", title, message)
  const error = (title: string, message?: string) => addToast("error", title, message)
  const warning = (title: string, message?: string) => addToast("warning", title, message)
  const info = (title: string, message?: string) => addToast("info", title, message)

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

const typeConfig = {
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-50 border-red-200",
    iconColor: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
  },
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type]
        const Icon = config.icon
        
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right-5",
              config.bg
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", config.iconColor)} />
            <div className="flex-1">
              <p className="font-medium text-foreground">{toast.title}</p>
              {toast.message && (
                <p className="mt-1 text-sm text-muted-foreground">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

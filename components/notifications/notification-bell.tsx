"use client"

import { useState } from "react"
import useSWR from "swr"
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const NOTIFICATION_ICONS: Record<string, string> = {
  donation: "💰",
  certification: "🏆",
  proposal: "📋",
  vca: "✅",
  system: "🔔",
  alert: "⚠️",
}

function formatTimeAgo(date: string) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "agora"
  if (diffMins < 60) return `${diffMins}min`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return then.toLocaleDateString("pt-BR")
}

export function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const { data, mutate } = useSWR(
    user?.id ? `/api/notifications?userId=${user.id}` : null,
    fetcher,
    { refreshInterval: 30000 } // Atualiza a cada 30s
  )

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      })
      mutate()
    } catch (e) {
      console.error("Erro ao marcar notificação:", e)
    }
  }

  const markAllAsRead = async () => {
    if (!user?.id) return
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, markAllRead: true }),
      })
      mutate()
    } catch (e) {
      console.error("Erro ao marcar todas:", e)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  className={`flex gap-3 p-4 transition-colors hover:bg-muted/50 ${
                    !notif.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex-shrink-0 text-xl">
                    {NOTIFICATION_ICONS[notif.type] || "🔔"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notif.is_read ? "font-medium" : ""}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 flex-shrink-0"
                          onClick={() => markAsRead(notif.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                          onClick={() => {
                            markAsRead(notif.id)
                            setOpen(false)
                          }}
                        >
                          Ver mais <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserRole, ROLE_PERMISSIONS } from "@/lib/types/users"
import {
  LayoutDashboard,
  FileCheck,
  Vote,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Heart,
  GraduationCap,
  BarChart3,
  Award,
  FolderHeart,
  Trophy,
  Stamp,
  PieChart,
  Leaf,
  Landmark,
  GitBranch,
  Menu,
  X,
} from "lucide-react"
import { useState, useEffect } from "react"
import { RankingShareCard } from "./ranking-share-card"

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  exact?: boolean
  badge?: string
  roles?: UserRole[]
  permission?: keyof (typeof ROLE_PERMISSIONS)[UserRole]
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Visao Geral", exact: true },

  // Doador
  {
    href: "/dashboard/donate",
    icon: Heart,
    label: "Doar",
    roles: [UserRole.DOADOR],
  },

  // Instituicao Social - gerencia seus projetos
  {
    href: "/dashboard/iac",
    icon: FolderHeart,
    label: "Meus Projetos",
    roles: [UserRole.INSTITUICAO_SOCIAL],
  },

  // Empresa Ambiental - gerencia seus projetos
  {
    href: "/dashboard/environmental",
    icon: FileCheck,
    label: "Projetos Ambientais",
    roles: [UserRole.EMPRESA_AMBIENTAL],
  },

  // VCA - Apenas Checkers (valida somente projetos SOCIAIS)
  {
    href: "/dashboard/vca",
    icon: Vote,
    label: "VCA (Social)",
    badge: "2",
    roles: [UserRole.CHECKER],
  },

  // Certificacao Ambiental - Exclusivo Analistas Certificadores
  {
    href: "/dashboard/technical-review",
    icon: Award,
    label: "Certificacao Ambiental",
    roles: [UserRole.ANALISTA_CERTIFICADOR],
  },

  // Hall de Impacto - visivel para todos
  { href: "/hall-de-impacto", icon: Trophy, label: "Hall de Impacto" },

  // Meus Ativos - para quem gera ou recebe ativos
  {
    href: "/dashboard/my-assets",
    icon: Leaf,
    label: "Meus Ativos",
    roles: [
      UserRole.INSTITUICAO_SOCIAL,
      UserRole.EMPRESA_AMBIENTAL,
      UserRole.CHECKER,
      UserRole.ANALISTA_CERTIFICADOR,
    ],
  },

  // Prefeitura - Sthation Gov
  {
    href: "/dashboard/gov",
    icon: Landmark,
    label: "Sthation Gov",
    roles: [UserRole.PREFEITURA],
  },

  // Academy - para doadores
  {
    href: "/dashboard/academy",
    icon: GraduationCap,
    label: "Sthation Academy",
    roles: [UserRole.DOADOR],
  },

  // Dashboard de Impacto - exceto admin (tem painel proprio)
  { 
    href: "/dashboard/impact", 
    icon: BarChart3, 
    label: "Dashboard de Impacto",
    roles: [UserRole.DOADOR, UserRole.INSTITUICAO_SOCIAL, UserRole.EMPRESA_AMBIENTAL, UserRole.CHECKER, UserRole.ANALISTA_CERTIFICADOR, UserRole.PREFEITURA],
  },

  // Pipeline Polygon - para quem inscreve projetos
  {
    href: "/dashboard/pipeline",
    icon: GitBranch,
    label: "Pipeline Polygon",
    roles: [UserRole.INSTITUICAO_SOCIAL, UserRole.EMPRESA_AMBIENTAL, UserRole.PREFEITURA],
  },

  // === ADMIN ONLY ===
  {
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    label: "Painel Admin",
    roles: [UserRole.ADMIN],
  },

  // Admin pode criar IAC Social para testes
  {
    href: "/dashboard/iac/new",
    icon: FolderHeart,
    label: "Criar IAC Social",
    roles: [UserRole.ADMIN],
  },

  // Admin pode criar projeto ambiental para testes
  {
    href: "/dashboard/environmental/new",
    icon: Leaf,
    label: "Criar Proj. Ambiental",
    roles: [UserRole.ADMIN],
  },

  // Admin pode processar inscriptions
  {
    href: "/dashboard/admin/inscriptions",
    icon: Stamp,
    label: "Inscriptions",
    badge: "3",
    roles: [UserRole.ADMIN],
  },

  // Admin pode configurar split
  {
    href: "/dashboard/admin/split-pagamento",
    icon: PieChart,
    label: "Split de Pagamento",
    roles: [UserRole.ADMIN],
  },

  // Configuracoes - para todos
  { href: "/dashboard/settings", icon: Settings, label: "Configuracoes" },
]

export function MobileHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // fechar ao navegar
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true
    if (!user) return false
    return item.roles.includes(user.role)
  })

  const roleLabel = user ? ROLE_PERMISSIONS[user.role]?.label : ""

  return (
    <>
      {/* Barra superior mobile */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <Link href="/" className="flex items-center">
          <div className="flex items-center rounded-md bg-[#0a2f2f] px-2 py-1">
            <Image src="/sthation-logo.png" alt="STHATION" width={160} height={40} className="h-8 w-auto" />
          </div>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 text-foreground hover:bg-muted"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer lateral */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-background transition-transform duration-200 md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/" onClick={() => setOpen(false)}>
            <div className="flex items-center rounded-md bg-[#0a2f2f] px-2 py-1">
              <Image src="/sthation-logo.png" alt="STHATION" width={160} height={40} className="h-8 w-auto" />
            </div>
          </Link>
          <button onClick={() => setOpen(false)} className="rounded-md p-1 text-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2" style={{ maxHeight: "calc(100vh - 56px - 120px)" }}>
          {filteredItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-[#0a2f2f] text-white">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info + logout */}
        <div className="absolute inset-x-0 bottom-0 border-t border-border bg-background p-3">
          {user && (
            <div className="mb-2 rounded-lg bg-muted p-2.5">
              <p className="truncate text-sm font-medium text-foreground">{user.name || user.email}</p>
              <p className="truncate text-xs text-foreground/60">{roleLabel}</p>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-foreground hover:bg-muted"
            onClick={() => { logout(); setOpen(false) }}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>
    </>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true
    if (!user) return false
    return item.roles.includes(user.role)
  })

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + "/")
  }

  const roleLabel = user ? ROLE_PERMISSIONS[user.role]?.label : ""

  const donorStats =
    user?.role === UserRole.DOADOR
      ? {
          name: user.name || "Doador",
          rank: 5,
          totalDonated: 38500,
          impactScore: 4475,
          donationsCount: 65,
          projectsSupported: 28,
          topCategory: "Alimentacao",
          topCategoryRank: 3,
          currentStreak: 15,
          level: "gold" as const,
        }
      : null

  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:flex",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center">
            <div className="flex items-center rounded-lg bg-[#0a2f2f] px-3 py-2">
              <Image src="/sthation-logo.png" alt="STHATION NOBIS" width={240} height={60} className="h-12 w-auto" />
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0a2f2f] p-2">
              <Image src="/sthation-icon.png" alt="STHATION" width={48} height={48} className="h-10 w-10" />
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {filteredItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(item)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-[#0a2f2f] text-white"
                  >
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        {user?.role === UserRole.DOADOR && donorStats && (
          <div className="mb-2">
            <RankingShareCard donor={donorStats} collapsed={collapsed} />
          </div>
        )}

        {!collapsed && user && (
          <div className="mb-2 rounded-lg bg-sidebar-accent p-3">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name || user.email}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{roleLabel}</p>
            {user.checkerScore !== undefined && (
              <div className="mt-1 flex items-center gap-1">
                <div className="h-1.5 flex-1 rounded-full bg-sidebar-border">
                  <div className="h-full rounded-full bg-[#0a2f2f]" style={{ width: `${user.checkerScore}%` }} />
                </div>
                <span className="text-xs text-sidebar-foreground/60">{user.checkerScore}</span>
              </div>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "justify-center px-2",
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Heart, Leaf, ChevronDown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-teal-400/20 bg-[#0a2f2f]/95 backdrop-blur-lg">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/sthation-logo.png"
            alt="STHATION NOBIS"
            width={220}
            height={55}
            className="h-14 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <div className="group relative">
            <Link
              href="/projetos"
              className="flex items-center gap-1 text-sm font-medium text-white/70 transition-colors hover:text-teal-400 uppercase tracking-wide"
            >
              Projetos
              <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
            </Link>
            <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="w-56 rounded-xl border border-teal-400/20 bg-[#0a2f2f] p-2 shadow-xl backdrop-blur-lg">
                <Link
                  href="/projetos"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Heart className="h-4 w-4 text-rose-400" />
                  <div>
                    <p className="font-medium">Sociais</p>
                    <p className="text-xs text-white/40">Recebem doacoes, VCA</p>
                  </div>
                </Link>
                <Link
                  href="/projetos?tab=ambientais"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Leaf className="h-4 w-4 text-emerald-400" />
                  <div>
                    <p className="font-medium">Ambientais</p>
                    <p className="text-xs text-white/40">Certificadoras, sem doacoes</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          <Link
            href="/doadores"
            className="text-sm font-medium text-white/70 transition-colors hover:text-teal-400 uppercase tracking-wide"
          >
            Ranking
          </Link>
          <Link
            href="#como-funciona"
            className="text-sm font-medium text-white/70 transition-colors hover:text-teal-400 uppercase tracking-wide"
          >
            Como Funciona
          </Link>
          <Link
            href="/hall-de-impacto"
            className="text-sm font-medium text-white/70 transition-colors hover:text-teal-400 uppercase tracking-wide"
          >
            Hall de Impacto
          </Link>
          <Link
            href="/gov"
            className="text-sm font-medium text-teal-400 transition-colors hover:text-teal-300 uppercase tracking-wide"
          >
            Gov
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button asChild className="bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold rounded-full px-6">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-white hover:text-teal-400 hover:bg-white/5">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild className="bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold rounded-full px-6">
                <Link href="/cadastro">Cadastrar</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-teal-400/20 bg-[#0a2f2f] p-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Projetos</p>
              <Link
                href="/projetos"
                className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-teal-400 pl-2"
                onClick={() => setIsOpen(false)}
              >
                <Heart className="h-3.5 w-3.5 text-rose-400" />
                Sociais
              </Link>
              <Link
                href="/projetos?tab=ambientais"
                className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-teal-400 pl-2"
                onClick={() => setIsOpen(false)}
              >
                <Leaf className="h-3.5 w-3.5 text-emerald-400" />
                Ambientais
              </Link>
            </div>
            <Link
              href="/doadores"
              className="text-sm font-medium text-white/70 hover:text-teal-400"
              onClick={() => setIsOpen(false)}
            >
              Ranking
            </Link>
            <Link
              href="#como-funciona"
              className="text-sm font-medium text-white/70 hover:text-teal-400"
              onClick={() => setIsOpen(false)}
            >
              Como Funciona
            </Link>
            <Link
              href="/hall-de-impacto"
              className="text-sm font-medium text-white/70 hover:text-teal-400"
              onClick={() => setIsOpen(false)}
            >
              Hall de Impacto
            </Link>
            <Link
              href="/gov"
              className="text-sm font-medium text-teal-400 hover:text-teal-300"
              onClick={() => setIsOpen(false)}
            >
              Sthation Gov
            </Link>
            <hr className="border-teal-400/20" />
            {user ? (
              <Button asChild className="w-full bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold rounded-full">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="w-full text-white hover:text-teal-400">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild className="w-full bg-teal-500 hover:bg-teal-400 text-[#0a2f2f] font-bold rounded-full">
                  <Link href="/cadastro">Cadastrar</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

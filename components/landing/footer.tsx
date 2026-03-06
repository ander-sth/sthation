import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative bg-[#0a2f2f] border-t border-teal-400/20">
      <div className="absolute inset-0 mesh-pattern-dark" />

      <div className="container relative mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 inline-block">
              <Image src="/sthation-logo.png" alt="STHATION NOBIS" width={240} height={60} className="h-16 w-auto" />
            </Link>
            <p className="mt-4 text-sm text-white/60">A infraestrutura da verdade para o mercado de impacto.</p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white uppercase text-sm tracking-wider">Plataforma</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link href="/projetos" className="hover:text-teal-400 transition-colors">
                  Projetos
                </Link>
              </li>
              <li>
                <Link href="/hall-de-impacto" className="hover:text-teal-400 transition-colors">
                  Hall de Impacto
                </Link>
              </li>
              <li>
                <Link href="/doadores" className="hover:text-teal-400 transition-colors">
                  Ranking
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-teal-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/gov" className="hover:text-teal-400 transition-colors">
                  Sthation Gov
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white uppercase text-sm tracking-wider">Recursos</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link href="#" className="hover:text-teal-400 transition-colors">
                  Documentação
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition-colors">
                  Whitepaper
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white uppercase text-sm tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link href="#" className="hover:text-teal-400 transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition-colors">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-teal-400 transition-colors">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-teal-400/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} STHATION. Todos os direitos reservados.
            </p>
            <p className="text-sm text-teal-400 font-medium uppercase tracking-wider">
              Transparência Total. Impacto Real. Blockchain.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

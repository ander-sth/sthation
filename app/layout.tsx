import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Space_Grotesk, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })
const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: {
    default: "STHATION - Infraestrutura da Verdade para o Mercado de Impacto",
    template: "%s | STHATION",
  },
  description:
    "Plataforma que transforma alegacoes de impacto ambiental em fatos comprovados criptograficamente atraves do protocolo NOBIS e Polygon blockchain.",
  generator: "STHATION",
  keywords: ["ESG", "carbono", "sustentabilidade", "blockchain", "polygon", "impacto ambiental", "certificacao", "creditos de carbono"],
  authors: [{ name: "STHATION" }],
  creator: "STHATION",
  publisher: "STHATION",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sthation.com"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "STHATION",
    title: "STHATION - Infraestrutura da Verdade para o Mercado de Impacto",
    description: "Plataforma de certificacao e validacao de impacto ambiental com blockchain.",
  },
  twitter: {
    card: "summary_large_image",
    title: "STHATION",
    description: "Plataforma de certificacao e validacao de impacto ambiental com blockchain.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

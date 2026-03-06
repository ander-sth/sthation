import { Suspense } from "react"
import { DoadoresContent } from "./content"

export const metadata = {
  title: "Hall dos Doadores | STHATION",
  description: "Conheça os doadores que estão transformando vidas através da plataforma STHATION",
}

export default function DoadoresPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <DoadoresContent />
    </Suspense>
  )
}

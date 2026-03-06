import { Suspense } from "react"
import { HallDeImpactoContent } from "./content"
import { Skeleton } from "@/components/ui/skeleton"

function LoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-8 h-4 w-96" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-96 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function HallDeImpactoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HallDeImpactoContent />
    </Suspense>
  )
}

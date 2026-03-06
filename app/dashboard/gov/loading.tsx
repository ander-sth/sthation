import { Skeleton } from "@/components/ui/skeleton"

export default function GovLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 bg-muted" />
          <Skeleton className="mt-2 h-4 w-72 bg-muted" />
        </div>
        <Skeleton className="h-10 w-40 rounded-full bg-muted" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl bg-muted" />
      <div className="grid gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl bg-muted" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-xl bg-muted" />
    </div>
  )
}

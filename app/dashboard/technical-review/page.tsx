import { Suspense } from "react"
import TechnicalReviewLoading from "./loading"
import { TechnicalReviewContent } from "./content"

export default function TechnicalReviewPage() {
  return (
    <Suspense fallback={<TechnicalReviewLoading />}>
      <TechnicalReviewContent />
    </Suspense>
  )
}

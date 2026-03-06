import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturedProjects } from "@/components/landing/featured-projects"
import { HowItWorks } from "@/components/landing/how-it-works"
import { CheckerSection } from "@/components/landing/checker-section"
import { ActorsSection } from "@/components/landing/actors-section"
import { GovSection } from "@/components/landing/gov-section"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedProjects />
        <GovSection />
        <HowItWorks />
        <CheckerSection />
        <section id="ecossistema">
          <ActorsSection />
        </section>
      </main>
      <Footer />
    </div>
  )
}

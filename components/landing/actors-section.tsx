"use client"

import { Heart, Building2, TreePine, Satellite, UserCheck, Award } from "lucide-react"

const actors = [
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Doador",
    description: "Financia projetos via Crowdfunding em troca de transparência total sobre o destino do dinheiro.",
    iconColor: "text-rose-400",
    borderColor: "hover:border-rose-400/50",
  },
  {
    icon: <Building2 className="h-6 w-6" />,
    title: "Instituição Social",
    description: "ONG ou Cooperativa que cria projetos de captação e executa ações de impacto social.",
    iconColor: "text-teal-400",
    borderColor: "hover:border-teal-400/50",
  },
  {
    icon: <Satellite className="h-6 w-6" />,
    title: "Empresa Ambiental",
    description: "Parceiros técnicos que registram dados de impacto ambiental para validação.",
    iconColor: "text-cyan-400",
    borderColor: "hover:border-cyan-400/50",
  },
  {
    icon: <UserCheck className="h-6 w-6" />,
    title: "Checker",
    description: "Auditor comunitário capacitado pela STHATION Academy que valida as evidências.",
    iconColor: "text-amber-400",
    borderColor: "hover:border-amber-400/50",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Analista Certificador",
    description: "Especialista técnico que valida dados de projetos ambientais e de alta complexidade.",
    iconColor: "text-sky-400",
    borderColor: "hover:border-sky-400/50",
  },
  {
    icon: <TreePine className="h-6 w-6" />,
    title: "Administrador",
    description: "Gestão da plataforma, transformação de impactos validados em Inscriptions imutáveis.",
    iconColor: "text-emerald-400",
    borderColor: "hover:border-emerald-400/50",
  },
]

export function ActorsSection() {
  return (
    <section className="relative bg-[#0a2f2f] py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 mesh-pattern-dark" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-5xl text-white uppercase">
            Ecossistema <span className="text-teal-400">STHATION</span>
          </h2>
          <p className="text-lg text-white/60">Seis perfis estratégicos conectados em uma plataforma única</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {actors.map((actor) => (
            <div
              key={actor.title}
              className={`group rounded-xl border border-teal-400/20 bg-white/5 backdrop-blur-sm p-6 transition-all ${actor.borderColor} hover:bg-white/10`}
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 ${actor.iconColor}`}>
                {actor.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{actor.title}</h3>
              <p className="text-sm text-white/60">{actor.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

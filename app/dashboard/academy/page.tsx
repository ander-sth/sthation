"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GraduationCap,
  Award,
  Clock,
  CheckCircle,
  Lock,
  PlayCircle,
  FileText,
  Users,
  Leaf,
  Droplet,
  TreePine,
  Video,
  ClipboardCheck,
  BookOpenCheck,
  ExternalLink,
} from "lucide-react"

import { UserRole } from "@/lib/types/users"
import { Heart, BarChart3, ShieldCheck, Target, BookOpen, TrendingUp } from "lucide-react"

// Cursos para DOADORES (educacao sobre impacto e doacao consciente)
const donorCourses = [
  {
    id: "impact-101",
    title: "Impacto Social 101",
    description: "Entenda como projetos sociais geram transformacao real: metricas de impacto, teoria da mudanca e indicadores",
    duration: "3 horas",
    modules: 4,
    progress: 100,
    status: "completed" as const,
    badge: "DOADOR-CONSCIENTE-2025",
    icon: Heart,
    resources: {
      videoUrl: "https://www.youtube.com/watch?v=exemplo1",
      tutorialUrl: "/docs/tutorial-impacto-social.pdf",
      assessmentUrl: "/academy/assessments/impact-101",
    },
  },
  {
    id: "smart-giving",
    title: "Doacao Inteligente",
    description: "Como avaliar projetos, interpretar scores VCA, entender o split de pagamento e rastrear seu impacto",
    duration: "2 horas",
    modules: 3,
    progress: 45,
    status: "in-progress" as const,
    badge: null,
    icon: Target,
    resources: {
      videoUrl: "https://www.youtube.com/watch?v=exemplo2",
      tutorialUrl: "/docs/tutorial-doacao-inteligente.pdf",
      assessmentUrl: "/academy/assessments/smart-giving",
    },
  },
  {
    id: "blockchain-transparency",
    title: "Blockchain e Transparencia",
    description: "Como o registro na Polygon garante a rastreabilidade da sua doacao, do deposito ate o impacto final",
    duration: "2 horas",
    modules: 3,
    progress: 0,
    status: "locked" as const,
    badge: null,
    icon: ShieldCheck,
    resources: {
      videoUrl: "https://www.youtube.com/watch?v=exemplo3",
      tutorialUrl: "/docs/tutorial-blockchain.pdf",
      assessmentUrl: "/academy/assessments/blockchain",
    },
  },
]

// Cursos para Checkers (Secao 2.2.2)
const checkerCourses = [
  {
    id: "vca-fundamentals",
    title: "Fundamentos do VCA 2.0",
    description: "Conceitos de validacao por consenso aferido, protocolo de triangulacao de dados",
    duration: "8 horas",
    modules: 5,
    progress: 100,
    status: "completed",
    badge: "VCA-CHECKER-2025",
    resources: {
      videoUrl: "https://www.youtube.com/watch?v=vca-fund",
      tutorialUrl: "/docs/tutorial-vca-fundamentos.pdf",
      assessmentUrl: "/academy/assessments/vca-fundamentals",
    },
  },
  {
    id: "ethics-conduct",
    title: "Codigo de Conduta e Etica",
    description: "Conflitos de interesse, confidencialidade de dados e LGPD",
    duration: "4 horas",
    modules: 3,
    progress: 100,
    status: "completed",
    badge: null,
    resources: {
      videoUrl: "https://www.youtube.com/watch?v=etica-vca",
      tutorialUrl: "/docs/tutorial-etica-conduta.pdf",
      assessmentUrl: "/academy/assessments/ethics-conduct",
    },
  },
  {
    id: "platform-tools",
    title: "Ferramentas e Plataforma",
    description: "Uso do Transparency Hall, interface de validacao e integracao com wallets",
    duration: "6 horas",
    modules: 4,
    progress: 65,
    status: "in-progress",
    badge: null,
    resources: {
      videoUrl: "https://www.youtube.com/watch?v=ferramentas",
      tutorialUrl: "/docs/tutorial-plataforma.pdf",
      assessmentUrl: "/academy/assessments/platform-tools",
    },
  },
]

// Cursos para Analistas (Seção 2.2.3)
const analystCourses = [
  {
    id: "carbon-specialist",
    title: "Especialização em Carbono",
    description: "GHG Protocol, metodologias IPCC, cálculo de baseline e redução líquida",
    duration: "40 horas",
    modules: 12,
    progress: 0,
    status: "locked",
    badge: "CARBON-ANALYST-2025",
    icon: Leaf,
    prerequisites: ["vca-fundamentals", "ethics-conduct", "platform-tools"],
  },
  {
    id: "water-specialist",
    title: "Especialização em Recursos Hídricos",
    description: "Quantificação de impacto hídrico, padrões Alliance for Water Stewardship",
    duration: "40 horas",
    modules: 10,
    progress: 0,
    status: "locked",
    badge: "WATER-ANALYST-2025",
    icon: Droplet,
    prerequisites: ["vca-fundamentals", "ethics-conduct", "platform-tools"],
  },
  {
    id: "biodiversity-specialist",
    title: "Especialização em Biodiversidade",
    description: "Metodologias de mensuração de biodiversidade, padrões de conservação",
    duration: "40 horas",
    modules: 11,
    progress: 0,
    status: "locked",
    badge: "BIO-ANALYST-2025",
    icon: TreePine,
    prerequisites: ["vca-fundamentals", "ethics-conduct", "platform-tools"],
  },
]

export default function AcademyPage() {
  const { user } = useAuth()

  const earnedBadges = user?.certifications || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          Sthation Academy
        </h1>
        <p className="text-foreground/60">Programa de educação e certificação para validadores da rede</p>
      </div>

      {/* Badges conquistados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Suas Certificações
          </CardTitle>
          <CardDescription>Badges digitais que comprovam sua qualificação - válidos por 12 meses</CardDescription>
        </CardHeader>
        <CardContent>
          {earnedBadges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {earnedBadges.map((badge) => (
                <Badge key={badge} variant="outline" className="py-2 px-4 gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  {badge}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/60">
              Você ainda não possui certificações. Complete os cursos para obter seus badges.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Trilhas de Aprendizado */}
      <Tabs defaultValue={user?.role === UserRole.DOADOR ? "donor" : "donor"} className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="donor" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Trilha Doador
          </TabsTrigger>
          {user?.role === UserRole.ADMIN && (
            <>
              <TabsTrigger value="checker" className="gap-2">
                <Users className="h-4 w-4" />
                Trilha Checker
              </TabsTrigger>
              <TabsTrigger value="analyst" className="gap-2">
                <Award className="h-4 w-4" />
                Trilha Analista
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Trilha Doador */}
        <TabsContent value="donor" className="space-y-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Doador Consciente</h3>
                  <p className="text-sm text-foreground/60">
                    Aprenda a maximizar o impacto das suas doacoes com conhecimento sobre metricas, blockchain e ODS
                  </p>
                  <div className="mt-2">
                    <Progress value={33} className="h-2" />
                    <p className="text-xs text-foreground/60 mt-1">33% concluido - 1 de 3 cursos completos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {donorCourses.map((course, index) => {
              const Icon = course.icon
              return (
                <Card key={course.id} className={course.status === "locked" ? "opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge
                        variant={
                          course.status === "completed"
                            ? "default"
                            : course.status === "in-progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {course.status === "completed"
                          ? "Concluido"
                          : course.status === "in-progress"
                            ? "Em andamento"
                            : "Bloqueado"}
                      </Badge>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-foreground/60">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {course.modules} modulos
                      </span>
                    </div>
                    {course.status !== "locked" && (
                      <div className="mt-4">
                        <Progress value={course.progress} className="h-2" />
                        <p className="text-xs text-foreground/60 mt-1">{course.progress}% concluido</p>
                      </div>
                    )}
                    {course.badge && (
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-primary" />
                        <span>Badge: {course.badge}</span>
                      </div>
                    )}

                    {/* Recursos do Curso */}
                    {course.resources && course.status !== "locked" && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        <p className="text-xs font-medium text-foreground/70 uppercase tracking-wide">Recursos</p>
                        <div className="flex flex-col gap-2">
                          <a
                            href={course.resources.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Video className="h-4 w-4" />
                            <span>Video Aula</span>
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </a>
                          <a
                            href={course.resources.tutorialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <BookOpenCheck className="h-4 w-4" />
                            <span>Tutorial</span>
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </a>
                          <a
                            href={course.resources.assessmentUrl}
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ClipboardCheck className="h-4 w-4" />
                            <span>Avaliacao</span>
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={course.status === "completed" ? "outline" : "default"}
                      disabled={course.status === "locked"}
                    >
                      {course.status === "completed" ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Revisar
                        </>
                      ) : course.status === "in-progress" ? (
                        <>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Continuar
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Bloqueado
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Trilha Checker */}
        <TabsContent value="checker" className="space-y-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Certificação Checker VCA</h3>
                  <p className="text-sm text-foreground/60">
                    Complete todos os 3 módulos para se tornar um Checker certificado e participar das validações
                    comunitárias
                  </p>
                  <div className="mt-2">
                    <Progress value={88} className="h-2" />
                    <p className="text-xs text-foreground/60 mt-1">88% concluído - 2 de 3 módulos completos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {checkerCourses.map((course, index) => (
              <Card key={course.id} className={course.status === "locked" ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge
                      variant={
                        course.status === "completed"
                          ? "default"
                          : course.status === "in-progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {course.status === "completed"
                        ? "Concluído"
                        : course.status === "in-progress"
                          ? "Em andamento"
                          : "Bloqueado"}
                    </Badge>
                    <span className="text-sm text-foreground/60">Módulo {index + 1}</span>
                  </div>
                  <CardTitle className="text-lg mt-2">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-foreground/60">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {course.modules} módulos
                    </span>
                  </div>
                  {course.status !== "locked" && (
                    <div className="mt-4">
                      <Progress value={course.progress} className="h-2" />
                      <p className="text-xs text-foreground/60 mt-1">{course.progress}% concluído</p>
                    </div>
                  )}
                  {course.badge && (
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-primary" />
                      <span>Badge: {course.badge}</span>
                    </div>
                  )}

                  {/* Recursos do Curso */}
                  {course.resources && course.status !== "locked" && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <p className="text-xs font-medium text-foreground/70 uppercase tracking-wide">Recursos</p>
                      <div className="flex flex-col gap-2">
                        <a
                          href={course.resources.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Video className="h-4 w-4" />
                          <span>Video Aula</span>
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                        <a
                          href={course.resources.tutorialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <BookOpenCheck className="h-4 w-4" />
                          <span>Tutorial</span>
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                        <a
                          href={course.resources.assessmentUrl}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                          <span>Avaliacao</span>
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={course.status === "completed" ? "outline" : "default"}
                    disabled={course.status === "locked"}
                  >
                    {course.status === "completed" ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Revisar
                      </>
                    ) : course.status === "in-progress" ? (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Continuar
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Bloqueado
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trilha Analista */}
        <TabsContent value="analyst" className="space-y-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Certificação Analista Técnico</h3>
                  <p className="text-sm text-foreground/60">
                    Especializações técnicas para validação de projetos ambientais complexos. Requer certificação
                    Checker prévia.
                  </p>
                  <Badge variant="outline" className="mt-2">
                    Pré-requisito: Trilha Checker completa
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analystCourses.map((course) => {
              const Icon = course.icon
              return (
                <Card key={course.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline">
                        <Lock className="mr-1 h-3 w-3" />
                        Bloqueado
                      </Badge>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-foreground/60">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {course.modules} módulos
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-primary" />
                      <span>Badge: {course.badge}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-transparent" variant="outline" disabled>
                      <Lock className="mr-2 h-4 w-4" />
                      Complete a Trilha Checker
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

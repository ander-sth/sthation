"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { UserRole, ROLE_PERMISSIONS } from "@/lib/types/users"
import { useApiData } from "@/hooks/use-api-data"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  ArrowRight,
  Heart,
  FileCheck,
  Vote,
  Bitcoin,
  TrendingUp,
  Users,
  Leaf,
  Award,
  CheckCircle2,
  Clock,
  DollarSign,
  Stamp,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, can } = useAuth()

  if (!user) return null

  const roleConfig = ROLE_PERMISSIONS[user.role] || { label: "Usuario", description: "Bem-vindo a plataforma", permissions: {} }

  return (
    <div className="space-y-8">
      {/* Header com saudação e ações rápidas baseadas no role */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Ola, {user.name}!</h1>
          <p className="text-foreground/60">
            {roleConfig?.label || "Usuario"} - {roleConfig?.description || ""}
          </p>
        </div>
        <div className="flex gap-2">
          {can("canCreateIAC") && user.role !== UserRole.EMPRESA_AMBIENTAL && (
            <Button asChild>
              <Link href="/dashboard/iac/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo IAC
              </Link>
            </Button>
          )}
          {user.role === UserRole.EMPRESA_AMBIENTAL && (
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/dashboard/environmental/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Projeto Ambiental
              </Link>
            </Button>
          )}
          {can("canDonate") && (
            <Button asChild variant="outline">
              <Link href="/dashboard/donate">
                <Heart className="mr-2 h-4 w-4" />
                Doar
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Estatisticas Gerais da Plataforma - visivel para todos */}
      <PlatformStats />

      {/* Stats Cards do Usuario - dados pessoais baseados no role */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Doador */}
        {user.role === UserRole.DOADOR && <DonorStats userId={user.id} />}

        {/* Instituicao Social - projetos sociais com doacoes e VCA */}
        {(user.role === UserRole.INSTITUICAO_SOCIAL || user.role === UserRole.INSTITUICAO) && (
          <InstitutionStats userId={user.id} role={user.role} />
        )}

        {/* Empresa Ambiental - projetos ambientais com dados IoT e certificacao */}
        {user.role === UserRole.EMPRESA_AMBIENTAL && (
          <EmpresaAmbientalStats userId={user.id} />
        )}

        {/* Checker */}
        {user.role === UserRole.CHECKER && (
          <>
            <StatCard title="Validações Pendentes" value="3" description="Aguardando seu voto" icon={Vote} highlight />
            <StatCard title="Validações Realizadas" value="47" description="Este mês" icon={CheckCircle2} />
            <StatCard
              title="Score de Reputação"
              value={`${user.checkerScore || 0}`}
              description="Média da comunidade: 78"
              icon={Award}
            />
            <StatCard title="Tokens Recebidos" value="R$ 1.880" description="Do Fundo de Validação" icon={DollarSign} />
          </>
        )}

        {/* Analista Certificador - APENAS projetos ambientais, sem VCA */}
        {user.role === UserRole.ANALISTA_CERTIFICADOR && (
          <>
            <StatCard title="Certificacoes Pendentes" value="3" description="Projetos ambientais aguardando analise" icon={Clock} highlight />
            <StatCard title="Certificacoes Concluidas" value="34" description="Este mes" icon={CheckCircle2} />
            <StatCard title="Impacto Verificado" value="5.420 tCO2e" description="Total certificado" icon={Leaf} />
            <StatCard
              title="Credenciais Ativas"
              value={`${user.certifications?.length || 0}`}
              description="Certificacoes profissionais"
              icon={Award}
            />
          </>
        )}

        {/* Admin */}
        {user.role === UserRole.ADMIN && (
          <>
            <StatCard
              title="Total Arrecadado"
              value="R$ 2.4M"
              description="+32% vs mês anterior"
              icon={TrendingUp}
              trend="up"
            />
            <StatCard title="Usuários Ativos" value="1.847" description="142 novos esta semana" icon={Users} />
            <StatCard title="IACs em Validação" value="23" description="Aguardando VCA" icon={Vote} />
            <StatCard title="Inscriptions Pendentes" value="3" description="Aguardando registro" icon={Stamp} />
          </>
        )}

        {/* Prefeitura (Gov) - Plano on-demand, projetos sociais e ambientais */}
        {user.role === UserRole.PREFEITURA && <PrefeituraStats userId={user.id} />}
      </div>

      {/* Conteúdo específico por role */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Doador - Projetos para doar */}
        {user.role === UserRole.DOADOR && (
          <>
            <ProjectsToFund />
            <MyDonations />
          </>
        )}

        {/* Instituicao Social - Meus IACs sociais e progresso de captacao */}
        {(user.role === UserRole.INSTITUICAO_SOCIAL || user.role === UserRole.INSTITUICAO) && (
          <>
            <MyIACs />
            <FundingProgress />
          </>
        )}

        {/* Empresa Ambiental - Projetos ambientais */}
        {user.role === UserRole.EMPRESA_AMBIENTAL && (
          <>
            <MyEnvironmentalProjects />
            <IoTSensorOverview />
          </>
        )}

        {/* Checker - Validacoes pendentes e historico */}
        {user.role === UserRole.CHECKER && (
          <>
            <PendingValidations />
            <ValidationHistory />
          </>
        )}

        {/* Analista Certificador - Disputas tecnicas e certificacoes */}
        {user.role === UserRole.ANALISTA_CERTIFICADOR && (
          <>
            <TechnicalDisputes />
            <AnalysisHistory />
          </>
        )}

        {/* Admin */}
        {user.role === UserRole.ADMIN && (
          <>
            <RecentActivity />
            <PendingApprovals />
          </>
        )}

        {/* Prefeitura (Gov) - Painel exclusivo */}
        {user.role === UserRole.PREFEITURA && (
          <>
            <GovProjectsSummary />
            <GovQuickActions />
          </>
        )}
      </div>
    </div>
  )
}

// Componentes auxiliares

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  highlight,
}: {
  title: string
  value: string
  description: string
  icon: React.ElementType
  trend?: "up" | "down"
  highlight?: boolean
}) {
  return (
    <Card className={`border-border bg-card ${highlight ? "border-[#0a2f2f]/50" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground/60">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${highlight ? "text-[#0a2f2f]" : "text-foreground/40"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className={`text-xs ${trend === "up" ? "text-[#0a2f2f]" : "text-foreground/60"}`}>{description}</p>
      </CardContent>
    </Card>
  )
}

function ProjectsToFund() {
  const { data, isLoading } = useApiData<any[]>("/api/funding-projects?status=FUNDING&limit=3", {})

  const projects = data?.projects || []

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Projetos para Apoiar</CardTitle>
        <CardDescription className="text-foreground/60">Projetos sociais buscando doacoes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">Nenhum projeto em captacao no momento.</div>
        ) : (
          projects.map((project: any) => {
            const raised = project.raised ?? project.current_amount ?? 0
            const goal = project.goal ?? project.goal_amount ?? 50000
            const progress = goal > 0 ? Math.round((raised / goal) * 100) : 0
            return (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{project.title}</span>
                  <Badge variant="outline">{project.category}</Badge>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>R$ {raised.toLocaleString("pt-BR")}</span>
                  <span>Meta: R$ {goal.toLocaleString("pt-BR")}</span>
                </div>
              </div>
            )
          })
        )}
        <Button variant="ghost" className="w-full" asChild>
          <Link href="/dashboard/donate">
            Ver todos os projetos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function MyDonations() {
  const { data, isLoading } = useApiData<any[]>("/api/donations?limit=3", {})

  const donations = data?.donations || []

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Minhas Doacoes</CardTitle>
        <CardDescription className="text-foreground/60">Historico de contribuicoes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        ) : donations.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">Voce ainda nao fez nenhuma doacao.</div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation: any) => (
              <div key={donation.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{donation.project ?? donation.project_title}</p>
                  <p className="text-sm text-muted-foreground">
                    {donation.date ?? new Date(donation.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">R$ {(donation.amount ?? 0).toLocaleString("pt-BR")}</p>
                  <Badge variant="outline" className="text-xs">
                    Concluida
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MyIACs() {
  const { user } = useAuth()
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null
  const { data, isLoading } = useApiData<any>(`/api/iacs?institution_user_id=${userId || user?.id || ""}`, {})
  const iacs = data?.iacs || []

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-500/10 text-gray-500",
    CAPTANDO: "bg-teal-500/10 text-[#0a2f2f]",
    FUNDING: "bg-teal-500/10 text-[#0a2f2f]",
    EXECUTANDO: "bg-amber-500/10 text-amber-400",
    EXECUTING: "bg-amber-500/10 text-amber-400",
    VCA: "bg-cyan-500/10 text-cyan-400",
    VALIDADO: "bg-emerald-500/10 text-emerald-400",
    VALIDATED: "bg-emerald-500/10 text-emerald-400",
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Meus Impact Action Cards</CardTitle>
          <CardDescription className="text-foreground/60">Projetos sociais cadastrados</CardDescription>
        </div>
        <Button size="sm" asChild>
          <Link href="/dashboard/iac/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        ) : iacs.length === 0 ? (
          <div className="text-center py-8">
            <FileCheck className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">Nenhum projeto cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">Crie seu primeiro Impact Action Card para comecar a receber doacoes</p>
            <Button asChild>
              <Link href="/dashboard/iac/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Projeto
              </Link>
            </Button>
          </div>
        ) : (
        <div className="space-y-4">
          {iacs.map((iac: any) => (
            <div key={iac.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{iac.title}</p>
                <p className="text-sm text-muted-foreground">R$ {(iac.funding_goal || iac.budget || 0).toLocaleString()} meta</p>
              </div>
              <Badge className={statusColors[iac.status] || "bg-gray-500/10 text-gray-500"}>{iac.status}</Badge>
            </div>
          ))}
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/dashboard/iac">
              Ver todos os IACs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        )}
      </CardContent>
    </Card>
  )
}

function FundingProgress() {
  const { data, isLoading } = useApiData<any[]>("/api/funding-projects?status=FUNDING&limit=3", {})
  const projects = data?.projects || []

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Progresso de Captacao</CardTitle>
        <CardDescription className="text-foreground/60">Seus projetos em financiamento</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">Nenhum projeto em captacao.</div>
        ) : (
          projects.map((project: any) => {
            const goal = project.goal_amount || project.goalAmount || 1
            const raised = project.current_amount || project.currentAmount || 0
            const percent = Math.round((raised / goal) * 100)
            return (
              <div key={project.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{project.title}</span>
                  <span className="font-medium">{percent}%</span>
                </div>
                <Progress value={percent} className="h-2" />
                <p className="text-xs text-muted-foreground">R$ {raised.toLocaleString()} de R$ {goal.toLocaleString()}</p>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

function PendingValidations() {
  const { data, isLoading } = useApiData<any[]>("/api/vca/pending?limit=5", {})
  const validations = data?.rounds || []

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          Validacoes Pendentes
          <Badge className="bg-[#0a2f2f]/10 text-[#0a2f2f] border-[#0a2f2f]/20">{validations.length}</Badge>
        </CardTitle>
        <CardDescription className="text-foreground/60">Projetos aguardando seu voto VCA</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        ) : validations.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">Nenhuma validacao pendente.</div>
        ) : (
        <div className="space-y-4">
          {validations.map((v: any) => (
            <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{v.iac?.title || v.title}</p>
                <p className="text-sm text-muted-foreground">
                  {v.iac?.institution?.name || v.institution} - {v.evidences_count || 0} evidencias
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-amber-500">
                  {v.deadline || "Em aberto"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        )}
        <Button className="mt-4 w-full" asChild>
          <Link href="/dashboard/vca">
            Iniciar Validação
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function ValidationHistory() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Histórico de Validações</CardTitle>
        <CardDescription className="text-foreground/60">Suas últimas validações VCA</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { project: "Centro de Acolhimento", vote: "APPROVE", score: 92 },
            { project: "Reforco Escolar Comunidade", vote: "APPROVE", score: 88 },
            { project: "Biblioteca Comunitária", vote: "REJECT", score: 45 },
          ].map((v, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{v.project}</p>
                <p className="text-sm text-muted-foreground">Score: {v.score}/100</p>
              </div>
              <Badge
                className={v.vote === "APPROVE" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}
              >
                {v.vote === "APPROVE" ? "Aprovado" : "Rejeitado"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TechnicalDisputes() {
  const { data, isLoading } = useApiData<any[]>("/api/iac?type=AMBIENTAL&status=SUBMITTED&limit=5", {})
  const projects = data?.projects || []

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          Certificacoes Pendentes
          <Badge className="bg-[#0a2f2f]/10 text-[#0a2f2f] border-[#0a2f2f]/20">{projects.length}</Badge>
        </CardTitle>
        <CardDescription className="text-foreground/60">Projetos ambientais aguardando sua certificacao</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">Nenhum projeto aguardando certificacao.</div>
        ) : (
        <div className="space-y-4">
          {projects.map((d: any) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{d.title}</p>
                <p className="text-sm text-muted-foreground">
                  {d.category} - {d.location_name || d.locationName}
                </p>
              </div>
              <Button size="sm" asChild>
                <Link href="/dashboard/technical-review">Certificar</Link>
              </Button>
            </div>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  )
}

function AnalysisHistory() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Certificacoes Realizadas</CardTitle>
        <CardDescription className="text-foreground/60">Historico de projetos ambientais certificados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { project: "Biodigestor Fazenda Sol", result: "Certificado", impact: "320 tCO2e evitados" },
            { project: "Reflorestamento Serra Verde", result: "Certificado", impact: "1.200 mudas plantadas" },
            { project: "Tratamento Efluentes Rio Claro", result: "Rejeitado", impact: "Dados IoT inconsistentes" },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{a.project}</p>
                <p className="text-sm text-muted-foreground">{a.impact}</p>
              </div>
              <Badge
                className={
                  a.result === "Certificado" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                }
              >
                {a.result}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MyEnvironmentalProjects() {
  const { user } = useAuth()
  const { data, isLoading } = useApiData<any>(`/api/iac?type=AMBIENTAL&owner_id=${user?.id || ""}`, {})
  const projects = data?.projects || []

  const statusLabels: Record<string, string> = {
    DRAFT: "Rascunho",
    SUBMITTED: "Aguardando cert.",
    CERTIFIED: "Certificado",
    INSCRIBED: "Inscrito blockchain",
    COLLECTING: "Coletando dados",
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Meus Projetos Ambientais</CardTitle>
        <CardDescription className="text-foreground/60">Projetos com coleta de dados IoT em andamento</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8">
            <Leaf className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">Nenhum projeto cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">Cadastre seu primeiro projeto ambiental</p>
            <Button asChild>
              <Link href="/dashboard/iac/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar Projeto
              </Link>
            </Button>
          </div>
        ) : (
          projects.map((p: any) => (
            <div key={p.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.sensors_count || 0} sensores IoT - {statusLabels[p.status] || p.status}
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/iac/${p.id}`}>Ver</Link>
                </Button>
              </div>
              {p.status === "COLLECTING" && <Progress value={p.progress || 50} className="h-1.5" />}
            </div>
          ))
        )}
        {projects.length > 0 && (
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/dashboard/environmental">
              Ver todos os projetos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function IoTSensorOverview() {
  const { user } = useAuth()
  const { data, isLoading } = useApiData<any>(`/api/iot/readings?owner_id=${user?.id || ""}&limit=5`, {})
  const readings = data?.readings || []

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Dados IoT Recentes</CardTitle>
        <CardDescription className="text-foreground/60">Ultimas leituras dos sensores</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        ) : readings.length === 0 ? (
          <div className="text-center py-8">
            <Leaf className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">Nenhum sensor conectado</h3>
            <p className="text-sm text-muted-foreground">Configure sensores IoT em seus projetos ambientais</p>
          </div>
        ) : (
          <div className="space-y-4">
            {readings.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm">{s.sensor_name || s.sensor}</p>
                  <p className="text-xs text-muted-foreground">{s.timestamp || s.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{s.value} {s.unit || ""}</p>
                  <Badge
                    variant="outline"
                    className={s.status === "ok" || s.status === "normal" ? "text-emerald-600 border-emerald-600/30" : "text-amber-600 border-amber-600/30"}
                  >
                    {s.status === "ok" || s.status === "normal" ? "Normal" : "Atencao"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Stats para Empresa Ambiental - busca dados reais do banco
function EmpresaAmbientalStats({ userId }: { userId: string }) {
  const { data, isLoading } = useApiData<any>(`/api/iac?type=AMBIENTAL&owner_id=${userId}`, {})
  const projects = data?.projects || []
  
  const totalProjects = projects.length
  const collectingProjects = projects.filter((p: any) => p.status === "COLLECTING" || p.status === "SUBMITTED").length
  const certifiedProjects = projects.filter((p: any) => p.status === "CERTIFIED" || p.status === "INSCRIBED").length
  const inscribedProjects = projects.filter((p: any) => p.status === "INSCRIBED").length
  const totalCO2 = projects.reduce((sum: number, p: any) => sum + (p.carbon_credits || p.co2_avoided || 0), 0)
  const totalSensors = projects.reduce((sum: number, p: any) => sum + (p.sensors_count || 0), 0)

  if (isLoading) {
    return (
      <>
        <StatCard title="Projetos Ativos" value="..." description="Carregando..." icon={FileCheck} highlight />
        <StatCard title="Sensores IoT" value="..." description="Carregando..." icon={Leaf} />
        <StatCard title="tCO2e Evitados" value="..." description="Carregando..." icon={TrendingUp} />
        <StatCard title="Certificados" value="..." description="Carregando..." icon={Award} />
      </>
    )
  }

  return (
    <>
      <StatCard 
        title="Projetos Ativos" 
        value={totalProjects.toString()} 
        description={`${collectingProjects} coletando dados IoT`} 
        icon={FileCheck} 
        highlight 
      />
      <StatCard 
        title="Sensores IoT" 
        value={totalSensors.toString()} 
        description="conectados aos projetos" 
        icon={Leaf} 
      />
      <StatCard 
        title="tCO2e Evitados" 
        value={totalCO2.toLocaleString("pt-BR")} 
        description="Total dos projetos" 
        icon={TrendingUp} 
        trend={totalCO2 > 0 ? "up" : undefined} 
      />
      <StatCard 
        title="Certificados" 
        value={certifiedProjects.toString()} 
        description={`${inscribedProjects} inscrito na blockchain`} 
        icon={Award} 
      />
    </>
  )
}

function PendingApprovals() {
  const { data, isLoading } = useApiData<any>("/api/institutions?status=PENDING&limit=10", {})
  const pending = data?.institutions || []

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          Aprovacoes Pendentes
          <Badge className="bg-amber-500/20 text-amber-600 border-0">{pending.length}</Badge>
        </CardTitle>
        <CardDescription className="text-foreground/60">Instituicoes aguardando aprovacao</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        ) : pending.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">Nenhuma aprovacao pendente</div>
        ) : (
          <div className="space-y-4">
            {pending.map((inst: any) => (
              <div key={inst.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{inst.name}</p>
                  <p className="text-sm text-muted-foreground">{inst.type} - {inst.city}, {inst.state}</p>
                </div>
                <Badge variant="outline" className="text-amber-600">Pendente</Badge>
              </div>
            ))}
          </div>
        )}
        <Button className="mt-4 w-full" variant="outline" asChild>
          <Link href="/dashboard/admin">
            Ver Painel Admin
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function PendingInscriptions() {
  const pending = [
    { id: "1", title: "Cozinha Comunitaria Esperanca", type: "Social", certDate: "2025-01-10" },
    { id: "2", title: "Escola Rural Vida Nova", type: "Social", certDate: "2025-01-08" },
    { id: "3", title: "Capacitacao Profissional Jovem", type: "Social", certDate: "2025-01-05" },
  ]

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          Inscriptions Pendentes
          <Badge className="bg-amber-500/20 text-amber-600 border-0">{pending.length}</Badge>
        </CardTitle>
        <CardDescription className="text-foreground/60">Projetos certificados aguardando registro na Polygon</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pending.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-muted-foreground">
                  {p.type} - Certificado em {p.certDate}
                </p>
              </div>
              <Badge variant="outline" className="text-amber-600">Pendente</Badge>
            </div>
          ))}
        </div>
        <Button className="mt-4 w-full" asChild>
          <Link href="/dashboard/admin/inscriptions">
            Gerenciar Inscriptions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// Estatisticas gerais da plataforma - visiveis para todos
function PlatformStats() {
  const { data } = useApiData<any>("/api/stats/platform", {})
  const stats = data?.stats || {}
  
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Impacto Total da Plataforma</CardTitle>
        <CardDescription className="text-foreground/60">Dados agregados de toda a comunidade STHATION</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">R$ {(stats.totalArrecadado || 0).toLocaleString("pt-BR")}</p>
            <p className="text-xs text-muted-foreground">Total Arrecadado</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalProjetos || 0}</p>
            <p className="text-xs text-muted-foreground">Projetos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{(stats.totalBeneficiarios || 0).toLocaleString("pt-BR")}</p>
            <p className="text-xs text-muted-foreground">Beneficiarios</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalDoadores || 0}</p>
            <p className="text-xs text-muted-foreground">Doadores</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InstitutionStats({ userId, role }: { userId: string; role: string }) {
  // Buscar dados reais da instituicao via API centralizada
  const { data } = useApiData<any>(`/api/stats/user?user_id=${userId}&role=${role}`, {})
  const stats = data?.stats || {}
  
  return (
    <>
      <StatCard
        title="Total Arrecadado"
        value={`R$ ${(stats.totalArrecadado || 0).toLocaleString("pt-BR")}`}
        description={stats.totalDoacoes > 0 ? `${stats.totalDoacoes} doacoes recebidas` : "Nenhuma doacao ainda"}
        icon={TrendingUp}
      />
      <StatCard 
        title="IACs Ativos" 
        value={String(stats.iacsAtivos || 0)} 
        description={stats.totalIACs > 0 ? `${stats.totalIACs} total cadastrados` : "Crie seu primeiro projeto"} 
        icon={FileCheck} 
      />
      <StatCard 
        title="Impactos Registrados" 
        value={String(stats.totalIACs || 0)} 
        description="Projetos cadastrados" 
        icon={Leaf} 
      />
      <StatCard 
        title="Beneficiarios" 
        value={(stats.totalBeneficiarios || 0).toLocaleString("pt-BR")} 
        description="Pessoas a impactar" 
        icon={Users} 
      />
    </>
  )
}

function DonorStats({ userId }: { userId: string }) {
  const { user } = useAuth()
  // Buscar dados reais do usuario via API centralizada
  const { data } = useApiData<any>(`/api/stats/user?user_id=${userId}&role=${user?.role}`, {})
  const stats = data?.stats || {}
  
  return (
    <>
      <StatCard
        title="Total Doado"
        value={`R$ ${(stats.totalDoado || 0).toLocaleString("pt-BR")}`}
        description={stats.totalDoacoes > 0 ? `${stats.totalDoacoes} doacoes realizadas` : "Nenhuma doacao ainda"}
        icon={Heart}
      />
      <StatCard 
        title="Projetos Apoiados" 
        value={String(stats.projetosApoiados || 0)} 
        description={stats.projetosApoiados > 0 ? "Projetos diferentes" : "Apoie seu primeiro projeto"} 
        icon={FileCheck} 
      />
      <StatCard 
        title="Posicao no Ranking" 
        value={stats.posicaoRanking ? `#${stats.posicaoRanking}` : "--"} 
        description={stats.posicaoRanking ? "No ranking de doadores" : "Doe para entrar no ranking"} 
        icon={Award} 
      />
      <StatCard 
        title="Cashback Disponivel" 
        value={`R$ ${(stats.cashbackDisponivel || 0).toLocaleString("pt-BR")}`} 
        description="5% das doacoes" 
        icon={DollarSign} 
      />
    </>
  )
}

function RecentActivity() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Atividade Recente</CardTitle>
        <CardDescription className="text-foreground/60">Últimas ações na plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { action: "Novo IAC submetido", user: "Instituto Esperança", time: "5 min atrás" },
            { action: "VCA concluído - Aprovado", user: "Escola Rural Vida Nova", time: "15 min atrás" },
            { action: "Doação recebida", user: "R$ 2.500", time: "32 min atrás" },
            { action: "Novo usuário Checker", user: "Maria Silva", time: "1h atrás" },
            { action: "Inscription realizada", user: "Abrigo São José", time: "2h atrás" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-[#0a2f2f]" />
              <div className="flex-1">
                <span className="font-medium text-foreground">{a.action}</span>
                <span className="text-foreground/60"> - {a.user}</span>
              </div>
              <span className="text-xs text-foreground/40">{a.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Componentes Prefeitura (Gov)
function PrefeituraStats({ userId }: { userId: string }) {
  const { data } = useApiData<any>("/api/gov/subscription", {})
  const sub = data?.subscription || {}
  const projectsUsed = sub.projectsUsed || 0
  const maxProjects = sub.plan?.maxProjects || 50
  
  return (
    <>
      <StatCard
        title="Plano Ativo"
        value={sub.plan?.name || "On-Demand"}
        description={`Expira em ${sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString("pt-BR") : "--"}`}
        icon={Stamp}
        highlight
      />
      <StatCard 
        title="Projetos Inscritos" 
        value={`${projectsUsed}/${maxProjects}`} 
        description={`${maxProjects - projectsUsed} restantes no plano`} 
        icon={FileCheck} 
      />
      <StatCard 
        title="Verificados" 
        value="0" 
        description="Aguardando projetos" 
        icon={CheckCircle2} 
      />
      <StatCard 
        title="Na Blockchain" 
        value="0" 
        description="Registros imutaveis" 
        icon={Award} 
      />
    </>
  )
}

function GovProjectsSummary() {
  const { data, isLoading } = useApiData<any>("/api/gov/projects", {})
  const projects = data?.projects || []

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Projetos Gov</CardTitle>
          <CardDescription className="text-foreground/60">Projetos sociais e ambientais inscritos</CardDescription>
        </div>
        <Button size="sm" asChild>
          <Link href="/dashboard/gov/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8">
            <FileCheck className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">Nenhum projeto inscrito</h3>
            <p className="text-sm text-muted-foreground mb-4">Inscreva seu primeiro projeto para verificacao e registro na blockchain</p>
            <Button asChild>
              <Link href="/dashboard/gov/new">
                <Plus className="mr-2 h-4 w-4" />
                Inscrever Projeto
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 5).map((project: any) => (
              <div key={project.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{project.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {project.type === "SOCIAL" ? "Acao Social" : "Acao Ambiental"} - {project.municipality}
                  </p>
                </div>
                <Badge className={
                  project.status === "VERIFICADO" ? "bg-emerald-500/10 text-emerald-500" :
                  project.status === "INSCRITO_BLOCKCHAIN" ? "bg-teal-500/10 text-teal-500" :
                  project.status === "EM_ANALISE" ? "bg-amber-500/10 text-amber-500" :
                  "bg-blue-500/10 text-blue-500"
                }>
                  {project.status}
                </Badge>
              </div>
            ))}
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/dashboard/gov">
                Ver todos os projetos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function GovQuickActions() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Acoes Rapidas</CardTitle>
        <CardDescription className="text-foreground/60">Gerencie seu plano Gov</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/dashboard/gov/new">
            <Plus className="mr-2 h-4 w-4" />
            Inscrever Novo Projeto
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/dashboard/gov">
            <FileCheck className="mr-2 h-4 w-4" />
            Gerenciar Projetos
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/gov/hall">
            <Award className="mr-2 h-4 w-4" />
            Ver Hall Gov
          </Link>
        </Button>
        <div className="mt-4 p-4 rounded-lg bg-muted">
          <h4 className="font-medium mb-2">Fluxo de Verificacao</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>1. Projetos <strong>Sociais</strong> vao para Checkers (VCA)</li>
            <li>2. Projetos <strong>Ambientais</strong> vao para Certificadoras</li>
            <li>3. Verificados sao registrados na Blockchain</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

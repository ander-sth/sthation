// Types para o Hall de Impacto - Registro de Trilha de Impacto
// Dois fluxos: Social (com doações) e Ambiental (sem doações)

export type ImpactType = "SOCIAL" | "AMBIENTAL"

export type ImpactPhase =
  | "CAPTACAO" // Só Social: projeto buscando doações
  | "DOACAO" // Só Social: doações recebidas
  | "EXECUCAO" // Ambos: execução com evidências
  | "CHECAGEM" // Só Social: checkers validando
  | "CERTIFICACAO" // Ambos: certificadores avaliando
  | "INSCRICAO" // Ambos: registro em inscription (timestamp)
  | "CONCLUIDO" // Ambos: disponível no Hall de Impacto

export interface TimelineEvent {
  id: string
  phase: ImpactPhase
  title: string
  description: string
  timestamp: Date
  actor?: {
    id: string
    name: string
    role: string
  }
  data?: Record<string, any>
  hash?: string // Hash de integridade
}

export interface ImpactRecord {
  id: string
  type: ImpactType
  title: string
  description: string
  category: string

  // Instituição/Empresa responsável
  organization: {
    id: string
    name: string
    logo?: string
    type: "INSTITUICAO_SOCIAL" | "EMPRESA_AMBIENTAL"
  }

  location: {
    name: string
    state: string
    coordinates?: { lat: number; lng: number }
  }

  // Trilha de eventos (timeline)
  timeline: TimelineEvent[]
  currentPhase: ImpactPhase

  // Métricas de impacto
  metrics: {
    totalInvested: number // Custo total de geração
    beneficiaries?: number // Só social
    carbonCredits?: number // Só ambiental
    impactUnits: number
    impactUnit: string
    impactScore: number
  }

  // Validação
  validation?: {
    checkersCount?: number // Só social
    checkersApproval?: number // Só social (%)
    certifiersCount: number
    certifiersApproval: number // (%)
    validatedAt: Date
  }

  // Inscription (Bitcoin)
  inscription?: {
    txid: string
    inscriptionId: string
    inscribedAt: Date
    blockHeight: number
  }

  // Status
  status: "EM_ANDAMENTO" | "VALIDADO" | "INSCRITO"

  // Metadados
  createdAt: Date
  updatedAt: Date

  // Imagens
  coverImage: string
  evidenceImages?: string[]

  // Disponível para plataforma externa de negociação
  availableForTrading: boolean
  tradingPlatformUrl?: string
}

// Categorias sociais
export const SOCIAL_CATEGORIES = [
  "Alimentação e Segurança Alimentar",
  "Educação e Qualificação",
  "Saúde e Bem-estar",
  "Assistência Social",
  "Habitação",
  "Proteção Animal",
  "Cultura e Esporte",
  "Direitos Humanos",
] as const

// Categorias ambientais
export const ENVIRONMENTAL_CATEGORIES = [
  "Reflorestamento",
  "Energia Renovável",
  "Biodiversidade",
  "Recursos Hídricos",
  "Agricultura Regenerativa",
  "Economia Circular",
  "Prevenção da Poluição",
] as const

// Labels das fases
export const PHASE_CONFIG: Record<ImpactPhase, { label: string; icon: string; description: string }> = {
  CAPTACAO: {
    label: "Captação",
    icon: "heart",
    description: "Projeto publicado para receber doações",
  },
  DOACAO: {
    label: "Doações",
    icon: "hand-coins",
    description: "Recursos captados de doadores",
  },
  EXECUCAO: {
    label: "Execução",
    icon: "play",
    description: "Projeto em execução com registro de evidências",
  },
  CHECAGEM: {
    label: "Checagem",
    icon: "users",
    description: "Validação por checkers independentes",
  },
  CERTIFICACAO: {
    label: "Certificação",
    icon: "shield-check",
    description: "Avaliação por especialistas certificadores",
  },
  INSCRICAO: {
    label: "Inscrição",
    icon: "bitcoin",
    description: "Dados registrados como inscription no Bitcoin",
  },
  CONCLUIDO: {
    label: "Concluído",
    icon: "trophy",
    description: "Impacto validado e registrado no Hall de Impacto",
  },
}

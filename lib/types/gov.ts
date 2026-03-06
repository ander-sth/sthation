// Tipos do modulo Sthation Gov - Prefeituras
// Projetos de acoes sociais e ambientais para verificacao

export enum GovProjectType {
  SOCIAL = "SOCIAL",
  AMBIENTAL = "AMBIENTAL",
}

export enum GovProjectStatus {
  INSCRITO = "INSCRITO",
  EM_ANALISE = "EM_ANALISE",
  VERIFICADO = "VERIFICADO",
  REPROVADO = "REPROVADO",
  INSCRITO_BLOCKCHAIN = "INSCRITO_BLOCKCHAIN",
}

export interface GovProject {
  id: string
  subscriptionId: string
  title: string
  description: string
  type: GovProjectType
  status: GovProjectStatus
  municipality: string
  state: string
  responsibleDepartment: string
  impactGoal: string
  investedAmount: number
  executionPeriod: {
    start: string
    end: string
  }
  beneficiaries: number
  evidences: {
    photos: string[]
    documents: string[]
  }
  // Verificacao
  verificationMethod: "VCA" | "CERTIFICADORA"
  verificationResult?: {
    approved: boolean
    score: number
    checkerIds?: string[]
    certifierId?: string
    completedAt: string
    observations: string
  }
  // Blockchain
  blockchainTxId?: string
  inscriptionId?: string
  createdAt: string
  updatedAt: string
}

export interface GovSubscription {
  id: string
  prefeituraId: string
  prefeituraName: string
  municipality: string
  state: string
  cnpj: string
  plan: GovPlan
  projectsUsed: number
  status: "ACTIVE" | "EXPIRED" | "PENDING_PAYMENT"
  activatedAt: string
  expiresAt: string
}

export interface GovPlan {
  id: string
  name: string
  maxProjects: number
  priceInBRL: number
  validityDays: number
  includesBlockchain: boolean
  features: string[]
}

// Plano padrao on-demand
export const GOV_PLAN_DEFAULT: GovPlan = {
  id: "gov-on-demand-50",
  name: "Sthation Gov On-Demand",
  maxProjects: 50,
  priceInBRL: 150000,
  validityDays: 365,
  includesBlockchain: true,
  features: [
    "Ate 50 projetos por plano",
    "Verificacao social via Checkers (VCA)",
    "Verificacao ambiental via Certificadoras",
    "Registro imutavel na Blockchain",
    "Dashboard exclusivo de gestao",
    "Relatorios de transparencia",
    "Selo Sthation Gov de verificacao",
    "Suporte dedicado",
  ],
}

// Status labels e cores
export const GOV_STATUS_CONFIG: Record<GovProjectStatus, { label: string; color: string }> = {
  [GovProjectStatus.INSCRITO]: {
    label: "Inscrito",
    color: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  },
  [GovProjectStatus.EM_ANALISE]: {
    label: "Em Analise",
    color: "bg-amber-500/20 text-amber-400 border-amber-400/30",
  },
  [GovProjectStatus.VERIFICADO]: {
    label: "Verificado",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-400/30",
  },
  [GovProjectStatus.REPROVADO]: {
    label: "Reprovado",
    color: "bg-red-500/20 text-red-400 border-red-400/30",
  },
  [GovProjectStatus.INSCRITO_BLOCKCHAIN]: {
    label: "Registrado Blockchain",
    color: "bg-teal-500/20 text-teal-400 border-teal-400/30",
  },
}

export const GOV_PROJECT_TYPE_CONFIG: Record<GovProjectType, { label: string; description: string; verifier: string }> =
  {
    [GovProjectType.SOCIAL]: {
      label: "Acao Social",
      description: "Projetos de assistencia social, educacao, saude, cultura",
      verifier: "Checkers (VCA)",
    },
    [GovProjectType.AMBIENTAL]: {
      label: "Acao Ambiental",
      description: "Projetos de sustentabilidade, preservacao, reducao de carbono",
      verifier: "Certificadoras",
    },
  }

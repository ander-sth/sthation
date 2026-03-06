// Types alinhados com o Blueprint de Implementação Técnica (Módulo IAC)
// Baseado na arquitetura DDD do documento

// 2.1 Enum de Estados (Máquina de Estados)
export enum IacStatus {
  DRAFT = "DRAFT", // Rascunho inicial
  EXECUTING = "EXECUTING", // Em execução (coleta de evidências)
  SUBMITTED = "SUBMITTED", // Enviado para validação (Bloqueado para edição)
  VALIDATED = "VALIDATED", // Aprovado pelo VCA (Consenso > 80%)
  REJECTED = "REJECTED", // Reprovado pelo VCA
  MINTED = "MINTED", // Transformado em NOBIS (Smart Contract)
}

// 2.2 Value Object: Evidência (Proof of Action)
export type EvidenceType = "PHOTO" | "VIDEO" | "IOT_LOG" | "DOCUMENT"

export interface GpsCoordinates {
  lat: number
  lng: number
}

export interface Evidence {
  id: string
  url: string
  type: EvidenceType
  timestamp: Date
  gpsCoordinates: GpsCoordinates
  deviceSignature: string // Assinatura do App Sthation
  contentHash: string // Hash SHA-256 do arquivo
  description?: string
}

// Taxonomia Sustentável Brasileira (TSB)
export const TSB_CATEGORIES = [
  { code: "TSB-01", name: "Mitigação de Mudanças Climáticas", icon: "cloud" },
  { code: "TSB-02", name: "Adaptação às Mudanças Climáticas", icon: "shield" },
  { code: "TSB-03", name: "Uso Sustentável de Recursos Hídricos", icon: "droplet" },
  { code: "TSB-04", name: "Economia Circular", icon: "recycle" },
  { code: "TSB-05", name: "Prevenção da Poluição", icon: "wind" },
  { code: "TSB-06", name: "Biodiversidade e Ecossistemas", icon: "leaf" },
  { code: "TSB-07", name: "Energia Renovável", icon: "sun" },
  { code: "TSB-08", name: "Agricultura Regenerativa", icon: "sprout" },
] as const

export type TsbCategoryCode = (typeof TSB_CATEGORIES)[number]["code"]

// Audit Log Entry
export interface AuditLogEntry {
  timestamp: Date
  action: string
  userId?: string
  details?: string
}

// 2.3 Entidade: Impact Action Card (Aggregate Root)
export interface ImpactActionCard {
  id: string
  institutionId: string
  projectId: string
  title: string
  description: string
  tsbCategory: TsbCategoryCode // Taxonomia Sustentável Brasileira
  location: {
    name: string
    coordinates: GpsCoordinates
  }
  targetImpact: string
  startDate: Date
  endDate: Date
  budget?: number

  // Estado e Evidências
  status: IacStatus
  evidences: Evidence[]
  auditLog: AuditLogEntry[]

  // Metadados
  createdAt: Date
  updatedAt: Date
  submittedAt?: Date
  validatedAt?: Date
  mintedAt?: Date

  // Relacionamentos
  institution?: {
    id: string
    name: string
    logo?: string
  }
}

// Validation rules from Blueprint
export const IAC_VALIDATION_RULES = {
  MIN_EVIDENCES_TO_SUBMIT: 3, // Regra: Mínimo de 3 evidências para auditoria
  VCA_APPROVAL_THRESHOLD: 0.8, // Consenso > 80%
  VCA_MIN_CHECKERS: 10, // Mínimo de checkers para VCA
}

// Status labels e cores
export const STATUS_CONFIG: Record<IacStatus, { label: string; color: string; description: string }> = {
  [IacStatus.DRAFT]: {
    label: "Rascunho",
    color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    description: "IAC em construção, pode ser editado livremente",
  },
  [IacStatus.EXECUTING]: {
    label: "Em Execução",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    description: "Coletando evidências de impacto",
  },
  [IacStatus.SUBMITTED]: {
    label: "Submetido",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Enviado para VCA, bloqueado para edições",
  },
  [IacStatus.VALIDATED]: {
    label: "Validado",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Aprovado pelo VCA com consenso > 80%",
  },
  [IacStatus.REJECTED]: {
    label: "Rejeitado",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    description: "Reprovado pelo VCA",
  },
  [IacStatus.MINTED]: {
    label: "NOBIS Emitido",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    description: "Transformado em ativo NOBIS inscrito no Bitcoin",
  },
}

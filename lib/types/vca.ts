// VCA (Validation Community Audit) Types conforme Documento Mestre v6.0
// Seção 6.3.2: Protocolo VCA

export enum VcaStatus {
  PENDING = "PENDING", // Aguardando votações
  IN_PROGRESS = "IN_PROGRESS", // Votações em andamento
  APPROVED = "APPROVED", // Aprovado (Consenso > 80%)
  REJECTED = "REJECTED", // Reprovado
  DISPUTE = "DISPUTE", // Em disputa (requer análise técnica)
}

// Regras do VCA conforme Documento Mestre
export const VCA_RULES = {
  MIN_CHECKERS: 10, // Mínimo de 10 Checkers por validação
  APPROVAL_THRESHOLD: 0.8, // Consenso > 80% para aprovar
  DISPUTE_THRESHOLD: 0.6, // Entre 60-80% vai para disputa
  MIN_SCORE_TO_VALIDATE: 70, // Score mínimo do Checker para participar
  COOLDOWN_HOURS: 24, // Tempo mínimo entre validações do mesmo projeto
}

// Checklist de validação (conforme Módulo IAC Blueprint)
export const VCA_CHECKLIST = [
  {
    id: "evidence_quality",
    label: "Qualidade das Evidências",
    description: "Fotos/vídeos são claros, nítidos e verificáveis",
    weight: 0.25,
  },
  {
    id: "gps_verification",
    label: "Verificação GPS",
    description: "Coordenadas correspondem à localização declarada do projeto",
    weight: 0.2,
  },
  {
    id: "timestamp_consistency",
    label: "Consistência de Timestamps",
    description: "Datas e horários são consistentes com o cronograma do projeto",
    weight: 0.15,
  },
  {
    id: "impact_measurable",
    label: "Impacto Mensurável",
    description: "Os resultados declarados são quantificáveis e verificáveis",
    weight: 0.2,
  },
  {
    id: "documentation_complete",
    label: "Documentação Completa",
    description: "Todos os documentos necessários estão presentes e legíveis",
    weight: 0.1,
  },
  {
    id: "methodology_adherence",
    label: "Aderência à Metodologia",
    description: "O projeto segue a metodologia TSB declarada",
    weight: 0.1,
  },
]

export interface VcaVote {
  id: string
  checkerId: string
  checkerName: string
  checkerScore: number
  vote: "APPROVE" | "REJECT" | "ABSTAIN"
  checklistScores: Record<string, number> // Score por item do checklist (0-100)
  overallScore: number // Score final ponderado
  comments?: string
  votedAt: Date
}

export interface VcaSession {
  id: string
  iacId: string
  iacTitle: string
  institutionId: string
  institutionName: string
  status: VcaStatus
  // Checkers
  assignedCheckers: string[] // IDs dos 10 checkers sorteados
  excludedCheckers: string[] // IDs excluídos por conflito de interesse
  votes: VcaVote[]
  // Resultados
  approvalRate?: number // Percentual de aprovação (0-100)
  averageScore?: number // Score médio
  // Timestamps
  startedAt: Date
  deadline: Date // 48h para votação
  completedAt?: Date
  // Disputa (se aplicável)
  requiresTechnicalReview?: boolean
  technicalReviewerId?: string
  technicalReviewComment?: string
}

// Status labels e cores para VCA
export const VCA_STATUS_CONFIG: Record<VcaStatus, { label: string; color: string }> = {
  [VcaStatus.PENDING]: {
    label: "Aguardando",
    color: "bg-gray-500/10 text-gray-500",
  },
  [VcaStatus.IN_PROGRESS]: {
    label: "Em Votação",
    color: "bg-blue-500/10 text-blue-500",
  },
  [VcaStatus.APPROVED]: {
    label: "Aprovado",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  [VcaStatus.REJECTED]: {
    label: "Rejeitado",
    color: "bg-red-500/10 text-red-500",
  },
  [VcaStatus.DISPUTE]: {
    label: "Em Disputa",
    color: "bg-amber-500/10 text-amber-500",
  },
}

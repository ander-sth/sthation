// Pipeline Types - Trilha de rastreamento de dados ate a Polygon
// Cada projeto gera uma Trail que acumula eventos desde a abertura ate o registro final

export type TrailType = "SOCIAL" | "ENVIRONMENTAL"

export type TrailStatus =
  | "OPEN"              // Card aberto, aceitando dados
  | "FUNDRAISING"       // Captando doacoes (social only)
  | "COLLECTING"        // Coletando dados IoT (ambiental only)
  | "AWAITING_REVIEW"   // Captacao/coleta finalizada, aguardando revisao
  | "VCA_IN_PROGRESS"   // Checagem VCA em andamento (social)
  | "CERT_IN_PROGRESS"  // Certificacao em andamento (ambiental)
  | "VALIDATED"         // Aprovado por VCA ou certificadores
  | "REJECTED"          // Reprovado
  | "REGISTERING"       // Em processo de registro na Polygon
  | "REGISTERED"        // Registrado na Polygon com txHash

export type TrailEventType =
  | "CARD_OPENED"
  | "DONATION_RECEIVED"
  | "FUNDRAISING_COMPLETE"
  | "IOT_DATA_RECEIVED"
  | "COLLECTION_COMPLETE"
  | "VCA_STARTED"
  | "VCA_COMPLETE"
  | "CERTIFIER_STARTED"
  | "CERTIFIER_COMPLETE"
  | "POLYGON_SUBMITTED"
  | "POLYGON_CONFIRMED"

// --- Evento individual na trail ---

export interface TrailEvent {
  id: string
  type: TrailEventType
  timestamp: number           // Unix ms
  dataHash: string            // SHA-256 deste evento
  previousHash: string        // Hash do evento anterior (cadeia)
  payload: Record<string, unknown>
  actor: {
    id: string
    type: "DONOR" | "INSTITUTION" | "COMPANY" | "CHECKER" | "CERTIFIER" | "SYSTEM" | "IOT_DEVICE"
    name: string
  }
}

// --- Trail (trilha) principal ---

export interface Trail {
  id: string
  type: TrailType
  projectId: string
  projectTitle: string
  organizationId: string
  organizationName: string
  status: TrailStatus
  events: TrailEvent[]
  createdAt: number
  updatedAt: number

  // Dados acumulados social
  social?: {
    targetAmount: number          // Meta de captacao
    currentAmount: number         // Valor captado ate agora
    donationsCount: number
    deliverables: string[]        // O que a instituicao deve entregar
    estimatedBeneficiaries: number
    vcaScore?: number             // Resultado VCA (0-100)
    vcaApproved?: boolean
  }

  // Dados acumulados ambiental
  environmental?: {
    partnerIntegration: string    // Ex: "organa", "arduino", etc
    sensorType: string            // Ex: "composteira", "energia_solar"
    dataPoints: IoTDataPoint[]    // Dados IoT acumulados
    totalInput: number            // Total entrada (ex: kg residuos)
    totalOutput: number           // Total saida (ex: kg compostagem)
    inputUnit: string             // Ex: "kg_residuos_organicos"
    outputUnit: string            // Ex: "kg_compostagem"
    certifierScore?: number
    certifierApproved?: boolean
    certifiedBy?: string
  }

  // Dados Polygon
  polygon?: {
    packetHash: string            // SHA-256 do pacote completo
    txHash: string                // Hash da transacao Polygon
    blockNumber: number
    registeredAt: number
    explorerUrl: string
    contractAddress: string
    gasUsed: number
    network: "mainnet" | "testnet"
  }
}

// --- Payloads de entrada ---

export interface DonationPayload {
  trailId?: string                // Se ja existe trail, senao cria nova
  projectId: string
  projectTitle: string
  institutionId: string
  institutionName: string
  donor: {
    id: string
    name: string
    email: string
    anonymous: boolean
  }
  amount: number                  // Valor em centavos
  currency: "BRL"
  motivoCard: string              // Motivo do card de captacao aberto
  estimatedTarget: number         // Valor estimado de captacao total
  deliverables: string[]          // O que deve ser entregue pela instituicao
  estimatedBeneficiaries: number
  timestamp: number
}

export interface IoTDataPoint {
  deviceId: string
  sensorType: string
  inputValue: number              // Ex: 50kg residuos
  outputValue: number             // Ex: 35kg compostagem
  inputUnit: string
  outputUnit: string
  timestamp: number
  gps?: { lat: number; lon: number }
  rawData?: Record<string, unknown>
}

export interface IoTIngestPayload {
  trailId?: string
  projectId: string
  projectTitle: string
  companyId: string
  companyName: string
  partnerIntegration: string      // "organa", "custom", etc
  sensorType: string
  dataPoints: IoTDataPoint[]
}

export interface OrganaWebhookPayload {
  device_id: string
  api_key: string
  timestamp: string               // ISO 8601
  data: {
    kg_residuos_entrada: number
    kg_compostagem_saida: number
    temperatura_celsius: number
    umidade_percent: number
    ciclo_id: string
  }
  gps: {
    lat: number
    lon: number
  }
}

export interface FinalizePayload {
  trailId: string
  finalizedBy: {
    id: string
    name: string
    role: string
  }
  notes?: string
}

export interface VCACompletePayload {
  trailId: string
  score: number                   // 0-100
  approved: boolean
  checkers: Array<{
    id: string
    name: string
    vote: "APPROVE" | "REJECT"
    criteria: Record<string, number>
  }>
  completedAt: number
}

export interface CertifyPayload {
  trailId: string
  score: number
  approved: boolean
  certifier: {
    id: string
    name: string
    certification: string         // Ex: "CARBON-ANALYST-2025"
  }
  report: {
    methodology: string
    findings: string
    dataVerified: boolean
    accuracy: number              // 0-100
  }
  completedAt: number
}

export interface RegisterPayload {
  trailId: string
  network: "mainnet" | "testnet"
  registeredBy: {
    id: string
    name: string
  }
}

// --- Resposta da API ---

export interface PipelineResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  trailId?: string
  eventId?: string
  hash?: string
}

// Motor da Pipeline - Gerencia trails, eventos e transicoes de estado
// Usa hash chain: cada evento referencia o hash do anterior

import type {
  Trail,
  TrailEvent,
  TrailEventType,
  TrailStatus,
  TrailType,
  DonationPayload,
  IoTIngestPayload,
  IoTDataPoint,
  FinalizePayload,
  VCACompletePayload,
  CertifyPayload,
} from "./types"

// --- SHA-256 ---

async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const buffer = encoder.encode(data)
  const hash = await crypto.subtle.digest("SHA-256", buffer)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function generateId(): string {
  return `trail_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// --- In-memory store (MVP) ---
// Em producao, usar banco de dados (Supabase/Neon)

const trailStore = new Map<string, Trail>()

// Trails de demonstracao pre-populadas
const demoTrails: Trail[] = [
  {
    id: "trail_demo_social_001",
    type: "SOCIAL",
    projectId: "proj_social_001",
    projectTitle: "Alimentacao Solidaria - Comunidade Vila Nova",
    organizationId: "inst_001",
    organizationName: "Instituto Mao Amiga",
    status: "FUNDRAISING",
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    events: [
      {
        id: "evt_demo_001",
        type: "CARD_OPENED",
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        dataHash: "a1b2c3d4e5f6",
        previousHash: "0000000000",
        payload: { reason: "Captacao para cestas basicas" },
        actor: { id: "inst_001", type: "INSTITUTION", name: "Instituto Mao Amiga" },
      },
      {
        id: "evt_demo_002",
        type: "DONATION_RECEIVED",
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        dataHash: "b2c3d4e5f6a1",
        previousHash: "a1b2c3d4e5f6",
        payload: { amount: 15000, donorName: "Maria Silva" },
        actor: { id: "donor_001", type: "DONOR", name: "Maria Silva" },
      },
      {
        id: "evt_demo_003",
        type: "DONATION_RECEIVED",
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
        dataHash: "c3d4e5f6a1b2",
        previousHash: "b2c3d4e5f6a1",
        payload: { amount: 25000, donorName: "Joao Santos" },
        actor: { id: "donor_002", type: "DONOR", name: "Joao Santos" },
      },
    ],
    social: {
      targetAmount: 100000,
      currentAmount: 40000,
      donationsCount: 2,
      deliverables: ["500 cestas basicas", "Distribuicao em 3 bairros"],
      estimatedBeneficiaries: 500,
    },
  },
  {
    id: "trail_demo_social_002",
    type: "SOCIAL",
    projectId: "proj_social_002",
    projectTitle: "Educacao Digital para Jovens",
    organizationId: "inst_002",
    organizationName: "ONG Futuro Brilhante",
    status: "VALIDATED",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    events: [
      {
        id: "evt_demo_010",
        type: "CARD_OPENED",
        timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
        dataHash: "d4e5f6a1b2c3",
        previousHash: "0000000000",
        payload: {},
        actor: { id: "inst_002", type: "INSTITUTION", name: "ONG Futuro Brilhante" },
      },
      {
        id: "evt_demo_011",
        type: "FUNDRAISING_COMPLETE",
        timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
        dataHash: "e5f6a1b2c3d4",
        previousHash: "d4e5f6a1b2c3",
        payload: { totalRaised: 80000 },
        actor: { id: "system", type: "SYSTEM", name: "Sthation" },
      },
      {
        id: "evt_demo_012",
        type: "VCA_COMPLETE",
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        dataHash: "f6a1b2c3d4e5",
        previousHash: "e5f6a1b2c3d4",
        payload: { score: 92, approved: true },
        actor: { id: "checker_001", type: "CHECKER", name: "Checkers VCA" },
      },
    ],
    social: {
      targetAmount: 80000,
      currentAmount: 80000,
      donationsCount: 15,
      deliverables: ["30 notebooks", "Curso de 6 meses"],
      estimatedBeneficiaries: 120,
      vcaScore: 92,
      vcaApproved: true,
    },
  },
  {
    id: "trail_demo_env_001",
    type: "ENVIRONMENTAL",
    projectId: "proj_env_001",
    projectTitle: "Compostagem Urbana - Organa SP",
    organizationId: "company_organa",
    organizationName: "Organa Compostagem",
    status: "COLLECTING",
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3600000,
    events: [
      {
        id: "evt_demo_020",
        type: "CARD_OPENED",
        timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
        dataHash: "aa11bb22cc33",
        previousHash: "0000000000",
        payload: {},
        actor: { id: "company_organa", type: "COMPANY", name: "Organa Compostagem" },
      },
      {
        id: "evt_demo_021",
        type: "IOT_DATA_RECEIVED",
        timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
        dataHash: "bb22cc33dd44",
        previousHash: "aa11bb22cc33",
        payload: { inputKg: 120, outputKg: 85 },
        actor: { id: "arduino_001", type: "IOT_DEVICE", name: "Composteira Arduino #1" },
      },
      {
        id: "evt_demo_022",
        type: "IOT_DATA_RECEIVED",
        timestamp: Date.now() - 3600000,
        dataHash: "cc33dd44ee55",
        previousHash: "bb22cc33dd44",
        payload: { inputKg: 95, outputKg: 67 },
        actor: { id: "arduino_001", type: "IOT_DEVICE", name: "Composteira Arduino #1" },
      },
    ],
    environmental: {
      partnerIntegration: "organa",
      sensorType: "composteira",
      dataPoints: [
        {
          deviceId: "arduino_001",
          sensorType: "composteira",
          inputValue: 120,
          outputValue: 85,
          inputUnit: "kg_residuos_organicos",
          outputUnit: "kg_compostagem",
          timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
        },
        {
          deviceId: "arduino_001",
          sensorType: "composteira",
          inputValue: 95,
          outputValue: 67,
          inputUnit: "kg_residuos_organicos",
          outputUnit: "kg_compostagem",
          timestamp: Date.now() - 3600000,
        },
      ],
      totalInput: 215,
      totalOutput: 152,
      inputUnit: "kg_residuos_organicos",
      outputUnit: "kg_compostagem",
    },
  },
  {
    id: "trail_demo_env_002",
    type: "ENVIRONMENTAL",
    projectId: "proj_env_002",
    projectTitle: "Energia Solar Comunitaria - Recife",
    organizationId: "company_solar",
    organizationName: "SolarTech Brasil",
    status: "REGISTERED",
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    events: [
      {
        id: "evt_demo_030",
        type: "CARD_OPENED",
        timestamp: Date.now() - 60 * 24 * 60 * 60 * 1000,
        dataHash: "1a2b3c4d5e6f",
        previousHash: "0000000000",
        payload: {},
        actor: { id: "company_solar", type: "COMPANY", name: "SolarTech Brasil" },
      },
      {
        id: "evt_demo_031",
        type: "COLLECTION_COMPLETE",
        timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000,
        dataHash: "2b3c4d5e6f1a",
        previousHash: "1a2b3c4d5e6f",
        payload: {},
        actor: { id: "system", type: "SYSTEM", name: "Sthation" },
      },
      {
        id: "evt_demo_032",
        type: "CERTIFIER_COMPLETE",
        timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
        dataHash: "3c4d5e6f1a2b",
        previousHash: "2b3c4d5e6f1a",
        payload: { score: 95, approved: true },
        actor: { id: "cert_001", type: "CERTIFIER", name: "Dr. Roberto Carbono" },
      },
      {
        id: "evt_demo_033",
        type: "POLYGON_CONFIRMED",
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        dataHash: "4d5e6f1a2b3c",
        previousHash: "3c4d5e6f1a2b",
        payload: { txHash: "0xabc123def456" },
        actor: { id: "system", type: "SYSTEM", name: "Sthation" },
      },
    ],
    environmental: {
      partnerIntegration: "custom",
      sensorType: "energia_solar",
      dataPoints: [],
      totalInput: 45000,
      totalOutput: 38250,
      inputUnit: "kwh_gerados",
      outputUnit: "kwh_distribuidos",
      certifierScore: 95,
      certifierApproved: true,
      certifiedBy: "Dr. Roberto Carbono",
    },
    polygon: {
      packetHash: "0x5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f",
      txHash: "0xabc123def456789abc123def456789abc123def456789abc123def456789abcd",
      blockNumber: 55234891,
      registeredAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      explorerUrl: "https://amoy.polygonscan.com/tx/0xabc123def456789",
      contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
      gasUsed: 95432,
      network: "testnet",
    },
  },
]

// Inicializa store com demos
demoTrails.forEach((t) => trailStore.set(t.id, t))

// --- Transicoes de estado validas ---

const VALID_TRANSITIONS: Record<TrailStatus, TrailStatus[]> = {
  OPEN: ["FUNDRAISING", "COLLECTING"],
  FUNDRAISING: ["AWAITING_REVIEW"],
  COLLECTING: ["AWAITING_REVIEW"],
  AWAITING_REVIEW: ["VCA_IN_PROGRESS", "CERT_IN_PROGRESS"],
  VCA_IN_PROGRESS: ["VALIDATED", "REJECTED"],
  CERT_IN_PROGRESS: ["VALIDATED", "REJECTED"],
  VALIDATED: ["REGISTERING"],
  REJECTED: ["OPEN"],          // Pode reabrir
  REGISTERING: ["REGISTERED"],
  REGISTERED: [],               // Estado final
}

// --- API publica do engine ---

export function getTrail(trailId: string): Trail | undefined {
  return trailStore.get(trailId)
}

export function getAllTrails(): Trail[] {
  return Array.from(trailStore.values()).sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getTrailsByType(type: TrailType): Trail[] {
  return getAllTrails().filter((t) => t.type === type)
}

export function getTrailsByStatus(status: TrailStatus): Trail[] {
  return getAllTrails().filter((t) => t.status === status)
}

// Cria evento com hash chain
async function createEvent(
  trail: Trail,
  type: TrailEventType,
  payload: Record<string, unknown>,
  actor: TrailEvent["actor"],
): Promise<TrailEvent> {
  const previousHash = trail.events.length > 0
    ? trail.events[trail.events.length - 1].dataHash
    : "0000000000000000000000000000000000000000000000000000000000000000"

  const timestamp = Date.now()
  const dataString = `${trail.id}:${type}:${previousHash}:${JSON.stringify(payload)}:${timestamp}`
  const dataHash = await sha256(dataString)

  return {
    id: generateEventId(),
    type,
    timestamp,
    dataHash,
    previousHash,
    payload,
    actor,
  }
}

// Valida transicao de estado
function canTransition(from: TrailStatus, to: TrailStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

// --- Operacoes Social ---

export async function processDonation(payload: DonationPayload): Promise<{ trail: Trail; event: TrailEvent }> {
  let trail = payload.trailId ? trailStore.get(payload.trailId) : undefined

  // Se trailId foi fornecido mas nao existe, erro explicito
  if (payload.trailId && !trail) {
    throw new Error(`Trail ${payload.trailId} nao encontrada. Envie sem trailId para criar uma nova.`)
  }

  // Cria nova trail se nao existe
  if (!trail) {
    trail = {
      id: generateId(),
      type: "SOCIAL",
      projectId: payload.projectId,
      projectTitle: payload.projectTitle,
      organizationId: payload.institutionId,
      organizationName: payload.institutionName,
      status: "OPEN",
      events: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      social: {
        targetAmount: payload.estimatedTarget,
        currentAmount: 0,
        donationsCount: 0,
        deliverables: payload.deliverables,
        estimatedBeneficiaries: payload.estimatedBeneficiaries,
      },
    }

    // Adiciona evento CARD_OPENED
    const openEvent = await createEvent(trail, "CARD_OPENED", {
      motivoCard: payload.motivoCard,
      estimatedTarget: payload.estimatedTarget,
      deliverables: payload.deliverables,
    }, {
      id: payload.institutionId,
      type: "INSTITUTION",
      name: payload.institutionName,
    })
    trail.events.push(openEvent)
    trail.status = "FUNDRAISING"
  }

  // Valida que trail esta em estado correto
  if (trail.status !== "FUNDRAISING" && trail.status !== "OPEN") {
    throw new Error(`Trail ${trail.id} nao esta aceitando doacoes (status: ${trail.status})`)
  }

  // Adiciona evento de doacao
  const donationEvent = await createEvent(trail, "DONATION_RECEIVED", {
    donorId: payload.donor.id,
    donorName: payload.donor.anonymous ? "Anonimo" : payload.donor.name,
    donorEmail: payload.donor.email,
    amount: payload.amount,
    currency: payload.currency,
    timestamp: payload.timestamp,
    motivoCard: payload.motivoCard,
  }, {
    id: payload.donor.id,
    type: "DONOR",
    name: payload.donor.anonymous ? "Anonimo" : payload.donor.name,
  })

  trail.events.push(donationEvent)
  trail.social!.currentAmount += payload.amount
  trail.social!.donationsCount += 1
  trail.status = "FUNDRAISING"
  trail.updatedAt = Date.now()

  trailStore.set(trail.id, trail)
  return { trail, event: donationEvent }
}

export async function finalizeSocialTrail(payload: FinalizePayload): Promise<{ trail: Trail; event: TrailEvent }> {
  const trail = trailStore.get(payload.trailId)
  if (!trail) throw new Error(`Trail ${payload.trailId} nao encontrada`)
  if (trail.type !== "SOCIAL") throw new Error("Trail nao e do tipo SOCIAL")
  if (!canTransition(trail.status, "AWAITING_REVIEW")) {
    throw new Error(`Transicao invalida: ${trail.status} -> AWAITING_REVIEW`)
  }

  const event = await createEvent(trail, "FUNDRAISING_COMPLETE", {
    totalRaised: trail.social!.currentAmount,
    donationsCount: trail.social!.donationsCount,
    notes: payload.notes,
  }, {
    id: payload.finalizedBy.id,
    type: "INSTITUTION",
    name: payload.finalizedBy.name,
  })

  trail.events.push(event)
  trail.status = "AWAITING_REVIEW"
  trail.updatedAt = Date.now()

  trailStore.set(trail.id, trail)
  return { trail, event }
}

export async function processVCAComplete(payload: VCACompletePayload): Promise<{ trail: Trail; event: TrailEvent }> {
  const trail = trailStore.get(payload.trailId)
  if (!trail) throw new Error(`Trail ${payload.trailId} nao encontrada`)
  if (trail.type !== "SOCIAL") throw new Error("Trail nao e do tipo SOCIAL")

  // Permite de AWAITING_REVIEW ou VCA_IN_PROGRESS
  if (trail.status === "AWAITING_REVIEW") {
    if (!canTransition(trail.status, "VCA_IN_PROGRESS")) {
      throw new Error(`Transicao invalida: ${trail.status} -> VCA_IN_PROGRESS`)
    }
    trail.status = "VCA_IN_PROGRESS"
  } else if (trail.status !== "VCA_IN_PROGRESS") {
    throw new Error(`Trail deve estar em AWAITING_REVIEW ou VCA_IN_PROGRESS, status atual: ${trail.status}`)
  }

  const event = await createEvent(trail, "VCA_COMPLETE", {
    score: payload.score,
    approved: payload.approved,
    checkers: payload.checkers,
    completedAt: payload.completedAt,
  }, {
    id: "vca_system",
    type: "CHECKER",
    name: "Checkers VCA",
  })

  trail.events.push(event)
  trail.social!.vcaScore = payload.score
  trail.social!.vcaApproved = payload.approved
  trail.status = payload.approved ? "VALIDATED" : "REJECTED"
  trail.updatedAt = Date.now()

  trailStore.set(trail.id, trail)
  return { trail, event }
}

// --- Operacoes Ambiental ---

export async function processIoTData(payload: IoTIngestPayload): Promise<{ trail: Trail; event: TrailEvent }> {
  let trail = payload.trailId ? trailStore.get(payload.trailId) : undefined

  // Se trailId foi fornecido mas nao existe, erro explicito
  if (payload.trailId && !trail) {
    throw new Error(`Trail ${payload.trailId} nao encontrada. Envie sem trailId para criar uma nova.`)
  }

  if (!trail) {
    trail = {
      id: generateId(),
      type: "ENVIRONMENTAL",
      projectId: payload.projectId,
      projectTitle: payload.projectTitle,
      organizationId: payload.companyId,
      organizationName: payload.companyName,
      status: "OPEN",
      events: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      environmental: {
        partnerIntegration: payload.partnerIntegration,
        sensorType: payload.sensorType,
        dataPoints: [],
        totalInput: 0,
        totalOutput: 0,
        inputUnit: payload.dataPoints[0]?.inputUnit ?? "",
        outputUnit: payload.dataPoints[0]?.outputUnit ?? "",
      },
    }

    const openEvent = await createEvent(trail, "CARD_OPENED", {
      partnerIntegration: payload.partnerIntegration,
      sensorType: payload.sensorType,
    }, {
      id: payload.companyId,
      type: "COMPANY",
      name: payload.companyName,
    })
    trail.events.push(openEvent)
    trail.status = "COLLECTING"
  }

  if (trail.status !== "COLLECTING" && trail.status !== "OPEN") {
    throw new Error(`Trail ${trail.id} nao esta coletando dados (status: ${trail.status})`)
  }

  // Acumula dados
  let batchInput = 0
  let batchOutput = 0
  for (const dp of payload.dataPoints) {
    trail.environmental!.dataPoints.push(dp)
    batchInput += dp.inputValue
    batchOutput += dp.outputValue
  }
  trail.environmental!.totalInput += batchInput
  trail.environmental!.totalOutput += batchOutput

  const event = await createEvent(trail, "IOT_DATA_RECEIVED", {
    dataPointsCount: payload.dataPoints.length,
    batchInput,
    batchOutput,
    partner: payload.partnerIntegration,
    sensor: payload.sensorType,
  }, {
    id: payload.dataPoints[0]?.deviceId ?? payload.companyId,
    type: "IOT_DEVICE",
    name: `${payload.partnerIntegration} - ${payload.sensorType}`,
  })

  trail.events.push(event)
  trail.status = "COLLECTING"
  trail.updatedAt = Date.now()

  trailStore.set(trail.id, trail)
  return { trail, event }
}

export async function finalizeEnvironmentalTrail(payload: FinalizePayload): Promise<{ trail: Trail; event: TrailEvent }> {
  const trail = trailStore.get(payload.trailId)
  if (!trail) throw new Error(`Trail ${payload.trailId} nao encontrada`)
  if (trail.type !== "ENVIRONMENTAL") throw new Error("Trail nao e do tipo ENVIRONMENTAL")
  if (!canTransition(trail.status, "AWAITING_REVIEW")) {
    throw new Error(`Transicao invalida: ${trail.status} -> AWAITING_REVIEW`)
  }

  const event = await createEvent(trail, "COLLECTION_COMPLETE", {
    totalInput: trail.environmental!.totalInput,
    totalOutput: trail.environmental!.totalOutput,
    dataPointsCount: trail.environmental!.dataPoints.length,
    notes: payload.notes,
  }, {
    id: payload.finalizedBy.id,
    type: "COMPANY",
    name: payload.finalizedBy.name,
  })

  trail.events.push(event)
  trail.status = "AWAITING_REVIEW"
  trail.updatedAt = Date.now()

  trailStore.set(trail.id, trail)
  return { trail, event }
}

export async function processCertification(payload: CertifyPayload): Promise<{ trail: Trail; event: TrailEvent }> {
  const trail = trailStore.get(payload.trailId)
  if (!trail) throw new Error(`Trail ${payload.trailId} nao encontrada`)
  if (trail.type !== "ENVIRONMENTAL") throw new Error("Trail nao e do tipo ENVIRONMENTAL")

  if (trail.status === "AWAITING_REVIEW") {
    if (!canTransition(trail.status, "CERT_IN_PROGRESS")) {
      throw new Error(`Transicao invalida: ${trail.status} -> CERT_IN_PROGRESS`)
    }
    trail.status = "CERT_IN_PROGRESS"
  } else if (trail.status !== "CERT_IN_PROGRESS") {
    throw new Error(`Trail deve estar em AWAITING_REVIEW ou CERT_IN_PROGRESS, status atual: ${trail.status}`)
  }

  const event = await createEvent(trail, "CERTIFIER_COMPLETE", {
    score: payload.score,
    approved: payload.approved,
    certifier: payload.certifier,
    report: payload.report,
    completedAt: payload.completedAt,
  }, {
    id: payload.certifier.id,
    type: "CERTIFIER",
    name: payload.certifier.name,
  })

  trail.events.push(event)
  trail.environmental!.certifierScore = payload.score
  trail.environmental!.certifierApproved = payload.approved
  trail.environmental!.certifiedBy = payload.certifier.name
  trail.status = payload.approved ? "VALIDATED" : "REJECTED"
  trail.updatedAt = Date.now()

  trailStore.set(trail.id, trail)
  return { trail, event }
}

// --- Registro Polygon (ambos os tipos) ---

export async function markRegistering(trailId: string): Promise<Trail> {
  const trail = trailStore.get(trailId)
  if (!trail) throw new Error(`Trail ${trailId} nao encontrada`)
  if (!canTransition(trail.status, "REGISTERING")) {
    throw new Error(`Transicao invalida: ${trail.status} -> REGISTERING`)
  }

  const event = await createEvent(trail, "POLYGON_SUBMITTED", {}, {
    id: "system",
    type: "SYSTEM",
    name: "Sthation Pipeline",
  })
  trail.events.push(event)
  trail.status = "REGISTERING"
  trail.updatedAt = Date.now()
  trailStore.set(trail.id, trail)
  return trail
}

export async function markRegistered(
  trailId: string,
  polygonData: Trail["polygon"],
): Promise<{ trail: Trail; event: TrailEvent }> {
  const trail = trailStore.get(trailId)
  if (!trail) throw new Error(`Trail ${trailId} nao encontrada`)
  if (trail.status !== "REGISTERING") {
    throw new Error(`Trail deve estar em REGISTERING para ser registrada, status atual: ${trail.status}`)
  }

  const event = await createEvent(trail, "POLYGON_CONFIRMED", {
    txHash: polygonData?.txHash,
    blockNumber: polygonData?.blockNumber,
    packetHash: polygonData?.packetHash,
  }, {
    id: "system",
    type: "SYSTEM",
    name: "Sthation Pipeline",
  })

  trail.events.push(event)
  trail.polygon = polygonData!
  trail.status = "REGISTERED"
  trail.updatedAt = Date.now()
  trailStore.set(trail.id, trail)
  return { trail, event }
}

// Converte payload Organa para IoTDataPoint
export function organaToDataPoint(organa: {
  device_id: string
  timestamp: string
  data: { kg_residuos_entrada: number; kg_compostagem_saida: number; temperatura_celsius: number; umidade_percent: number }
  gps: { lat: number; lon: number }
}): IoTDataPoint {
  return {
    deviceId: organa.device_id,
    sensorType: "composteira",
    inputValue: organa.data.kg_residuos_entrada,
    outputValue: organa.data.kg_compostagem_saida,
    inputUnit: "kg_residuos_organicos",
    outputUnit: "kg_compostagem",
    timestamp: new Date(organa.timestamp).getTime(),
    gps: organa.gps,
    rawData: {
      temperatura_celsius: organa.data.temperatura_celsius,
      umidade_percent: organa.data.umidade_percent,
    },
  }
}

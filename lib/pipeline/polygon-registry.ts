// Servico de registro na Polygon para a Pipeline
// Expande o blockchain/service.ts existente com logica especifica de Trail

import type { Trail } from "./types"
import { POLYGON_CONFIG } from "@/lib/blockchain/types"

// SHA-256 via Web Crypto
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const buffer = encoder.encode(data)
  const hash = await crypto.subtle.digest("SHA-256", buffer)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Gera o pacote completo de dados da trail para registro na Polygon
export async function buildRegistryPacket(trail: Trail): Promise<{
  packetHash: string
  payload: Record<string, unknown>
}> {
  // Monta payload com TODOS os dados da trail
  const payload: Record<string, unknown> = {
    trailId: trail.id,
    type: trail.type,
    projectId: trail.projectId,
    projectTitle: trail.projectTitle,
    organizationId: trail.organizationId,
    organizationName: trail.organizationName,
    createdAt: trail.createdAt,
    eventsCount: trail.events.length,
    eventHashes: trail.events.map((e) => e.dataHash),
    lastEventHash: trail.events[trail.events.length - 1]?.dataHash ?? "",
  }

  if (trail.type === "SOCIAL" && trail.social) {
    payload.social = {
      targetAmount: trail.social.targetAmount,
      currentAmount: trail.social.currentAmount,
      donationsCount: trail.social.donationsCount,
      deliverables: trail.social.deliverables,
      estimatedBeneficiaries: trail.social.estimatedBeneficiaries,
      vcaScore: trail.social.vcaScore,
      vcaApproved: trail.social.vcaApproved,
    }
  }

  if (trail.type === "ENVIRONMENTAL" && trail.environmental) {
    payload.environmental = {
      partnerIntegration: trail.environmental.partnerIntegration,
      sensorType: trail.environmental.sensorType,
      dataPointsCount: trail.environmental.dataPoints.length,
      totalInput: trail.environmental.totalInput,
      totalOutput: trail.environmental.totalOutput,
      inputUnit: trail.environmental.inputUnit,
      outputUnit: trail.environmental.outputUnit,
      certifierScore: trail.environmental.certifierScore,
      certifierApproved: trail.environmental.certifierApproved,
      certifiedBy: trail.environmental.certifiedBy,
    }
  }

  // Gera hash do pacote completo
  const packetHash = await sha256(JSON.stringify(payload) + trail.updatedAt)

  return { packetHash, payload }
}

// Registra o pacote na Polygon (simulado para MVP, em producao usa ethers.js)
export async function registerOnPolygon(
  trail: Trail,
  network: "mainnet" | "testnet" = "testnet",
): Promise<{
  txHash: string
  blockNumber: number
  packetHash: string
  explorerUrl: string
  contractAddress: string
  gasUsed: number
  registeredAt: number
}> {
  const { packetHash, payload } = await buildRegistryPacket(trail)

  // Simula chamada ao smart contract
  // Em producao:
  // const provider = new ethers.JsonRpcProvider(POLYGON_CONFIG[network].rpcUrl)
  // const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  // const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet)
  // const tx = await contract.registerImpact(packetHash, JSON.stringify(payload))
  // const receipt = await tx.wait()

  const timestamp = Date.now()
  const txHash = `0x${await sha256(`tx_${packetHash}_${timestamp}_${network}`)}`
  const contractAddress = `0x${await sha256(`contract_sthation_pipeline_${network}`).then((h) => h.slice(0, 40))}`
  const config = POLYGON_CONFIG[network]

  return {
    txHash,
    blockNumber: Math.floor(Math.random() * 2000000) + 55000000,
    packetHash: `0x${packetHash}`,
    explorerUrl: `${config.explorer}/tx/${txHash}`,
    contractAddress: `0x${contractAddress}`,
    gasUsed: Math.floor(Math.random() * 50000) + 80000,
    registeredAt: timestamp,
  }
}

// Verifica se uma trail pode ser registrada na Polygon
export function canRegister(trail: Trail): { allowed: boolean; reason?: string } {
  if (trail.status === "REGISTERED") {
    return { allowed: false, reason: "Trail ja registrada na Polygon" }
  }

  if (trail.status !== "VALIDATED") {
    return { allowed: false, reason: `Trail deve estar VALIDATED, status atual: ${trail.status}` }
  }

  if (trail.type === "SOCIAL") {
    if (!trail.social?.vcaApproved) {
      return { allowed: false, reason: "VCA nao aprovado" }
    }
  }

  if (trail.type === "ENVIRONMENTAL") {
    if (!trail.environmental?.certifierApproved) {
      return { allowed: false, reason: "Certificacao nao aprovada" }
    }
  }

  if (trail.events.length < 3) {
    return { allowed: false, reason: "Trail deve ter pelo menos 3 eventos" }
  }

  return { allowed: true }
}

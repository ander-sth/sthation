// Validadores de payload para a Pipeline API
import type {
  DonationPayload,
  IoTIngestPayload,
  OrganaWebhookPayload,
  FinalizePayload,
  VCACompletePayload,
  CertifyPayload,
  RegisterPayload,
} from "./types"

interface ValidationResult {
  valid: boolean
  errors: string[]
}

function createResult(errors: string[]): ValidationResult {
  return { valid: errors.length === 0, errors }
}

export function validateDonationPayload(data: unknown): ValidationResult {
  const errors: string[] = []
  const d = data as Partial<DonationPayload>

  if (!d.projectId) errors.push("projectId e obrigatorio")
  if (!d.projectTitle) errors.push("projectTitle e obrigatorio")
  if (!d.institutionId) errors.push("institutionId e obrigatorio")
  if (!d.institutionName) errors.push("institutionName e obrigatorio")
  if (!d.donor?.id) errors.push("donor.id e obrigatorio")
  if (!d.donor?.name && !d.donor?.anonymous) errors.push("donor.name e obrigatorio se nao anonimo")
  if (!d.donor?.email) errors.push("donor.email e obrigatorio")
  if (typeof d.amount !== "number" || d.amount <= 0) errors.push("amount deve ser maior que 0")
  if (!d.motivoCard) errors.push("motivoCard e obrigatorio")
  if (typeof d.estimatedTarget !== "number" || d.estimatedTarget <= 0) errors.push("estimatedTarget deve ser maior que 0")
  if (!Array.isArray(d.deliverables) || d.deliverables.length === 0) errors.push("deliverables deve ter pelo menos 1 item")
  if (typeof d.estimatedBeneficiaries !== "number" || d.estimatedBeneficiaries <= 0) errors.push("estimatedBeneficiaries deve ser maior que 0")

  return createResult(errors)
}

export function validateIoTIngestPayload(data: unknown): ValidationResult {
  const errors: string[] = []
  const d = data as Partial<IoTIngestPayload>

  if (!d.projectId) errors.push("projectId e obrigatorio")
  if (!d.projectTitle) errors.push("projectTitle e obrigatorio")
  if (!d.companyId) errors.push("companyId e obrigatorio")
  if (!d.companyName) errors.push("companyName e obrigatorio")
  if (!d.partnerIntegration) errors.push("partnerIntegration e obrigatorio")
  if (!d.sensorType) errors.push("sensorType e obrigatorio")
  if (!Array.isArray(d.dataPoints) || d.dataPoints.length === 0) errors.push("dataPoints deve ter pelo menos 1 ponto")

  if (Array.isArray(d.dataPoints)) {
    d.dataPoints.forEach((dp, i) => {
      if (!dp.deviceId) errors.push(`dataPoints[${i}].deviceId e obrigatorio`)
      if (typeof dp.inputValue !== "number") errors.push(`dataPoints[${i}].inputValue deve ser numerico`)
      if (typeof dp.outputValue !== "number") errors.push(`dataPoints[${i}].outputValue deve ser numerico`)
      if (!dp.inputUnit) errors.push(`dataPoints[${i}].inputUnit e obrigatorio`)
      if (!dp.outputUnit) errors.push(`dataPoints[${i}].outputUnit e obrigatorio`)
      if (typeof dp.timestamp !== "number" || dp.timestamp <= 0) errors.push(`dataPoints[${i}].timestamp deve ser um timestamp valido`)
    })
  }

  return createResult(errors)
}

export function validateOrganaPayload(data: unknown): ValidationResult {
  const errors: string[] = []
  const d = data as Partial<OrganaWebhookPayload>

  if (!d.device_id) errors.push("device_id e obrigatorio")
  if (!d.api_key) errors.push("api_key e obrigatorio")
  if (!d.timestamp) errors.push("timestamp e obrigatorio")
  if (!d.data) errors.push("data e obrigatorio")
  if (d.data) {
    if (typeof d.data.kg_residuos_entrada !== "number") errors.push("data.kg_residuos_entrada deve ser numerico")
    if (typeof d.data.kg_compostagem_saida !== "number") errors.push("data.kg_compostagem_saida deve ser numerico")
    if (typeof d.data.temperatura_celsius !== "number") errors.push("data.temperatura_celsius deve ser numerico")
    if (typeof d.data.umidade_percent !== "number") errors.push("data.umidade_percent deve ser numerico")
    if (!d.data.ciclo_id) errors.push("data.ciclo_id e obrigatorio")
  }
  if (typeof d.gps?.lat !== "number" || typeof d.gps?.lon !== "number") errors.push("gps (lat, lon) e obrigatorio e deve ser numerico")

  return createResult(errors)
}

export function validateFinalizePayload(data: unknown): ValidationResult {
  const errors: string[] = []
  const d = data as Partial<FinalizePayload>

  if (!d.trailId) errors.push("trailId e obrigatorio")
  if (!d.finalizedBy?.id) errors.push("finalizedBy.id e obrigatorio")
  if (!d.finalizedBy?.name) errors.push("finalizedBy.name e obrigatorio")
  if (!d.finalizedBy?.role) errors.push("finalizedBy.role e obrigatorio")

  return createResult(errors)
}

export function validateVCACompletePayload(data: unknown): ValidationResult {
  const errors: string[] = []
  const d = data as Partial<VCACompletePayload>

  if (!d.trailId) errors.push("trailId e obrigatorio")
  if (typeof d.score !== "number" || d.score < 0 || d.score > 100) errors.push("score deve ser entre 0 e 100")
  if (typeof d.approved !== "boolean") errors.push("approved deve ser boolean")
  if (!Array.isArray(d.checkers) || d.checkers.length === 0) errors.push("checkers deve ter pelo menos 1 checker")
  if (typeof d.completedAt !== "number") errors.push("completedAt e obrigatorio")

  return createResult(errors)
}

export function validateCertifyPayload(data: unknown): ValidationResult {
  const errors: string[] = []
  const d = data as Partial<CertifyPayload>

  if (!d.trailId) errors.push("trailId e obrigatorio")
  if (typeof d.score !== "number" || d.score < 0 || d.score > 100) errors.push("score deve ser entre 0 e 100")
  if (typeof d.approved !== "boolean") errors.push("approved deve ser boolean")
  if (!d.certifier?.id) errors.push("certifier.id e obrigatorio")
  if (!d.certifier?.name) errors.push("certifier.name e obrigatorio")
  if (!d.certifier?.certification) errors.push("certifier.certification e obrigatorio")
  if (!d.report?.methodology) errors.push("report.methodology e obrigatorio")
  if (!d.report?.findings) errors.push("report.findings e obrigatorio")

  return createResult(errors)
}

export function validateRegisterPayload(data: unknown): ValidationResult {
  const errors: string[] = []
  const d = data as Partial<RegisterPayload>

  if (!d.trailId) errors.push("trailId e obrigatorio")
  if (!d.network || !["mainnet", "testnet"].includes(d.network)) errors.push("network deve ser mainnet ou testnet")
  if (!d.registeredBy?.id) errors.push("registeredBy.id e obrigatorio")
  if (!d.registeredBy?.name) errors.push("registeredBy.name e obrigatorio")

  return createResult(errors)
}

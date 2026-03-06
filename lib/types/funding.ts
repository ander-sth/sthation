// Tipos de Captação/Funding conforme Documento Mestre v6.0
// Seção 4.1: Fase de Captação (Funding)

export enum FundingStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED", // No Marketplace de Captação
  FUNDING = "FUNDING", // Recebendo doações
  FUNDED = "FUNDED", // Meta atingida
  EXECUTING = "EXECUTING", // Em execução
  COMPLETED = "COMPLETED", // Concluído
  CANCELLED = "CANCELLED",
}

// Modelo de Custos conforme Seção 3.2
export interface CostModel {
  // COM - Custo Operacional Mensal da Instituição
  com: number
  // FRI - Fator de Rateio Institucional (10% a 50%)
  fri: number // Percentual (0.1 a 0.5)
  // PCO - Parcela de Custo Operacional (COM × FRI)
  pco: number
  // CDP - Custo Direto do Projeto
  cdp: number
  // Meta Total (CDP + PCO)
  metaTotal: number
}

export interface FundingProject {
  id: string
  iacId: string
  institutionId: string
  title: string
  description: string
  category: string
  tsbCategory: string
  location: {
    name: string
    state: string
    coordinates: { lat: number; lng: number }
  }
  // Metas e valores
  costModel: CostModel
  currentAmount: number // Valor arrecadado
  donorsCount: number
  // Proxy financeira (valor de impacto)
  proxyCategory: string
  proxyValuePerUnit: number
  proxyUnit: string
  estimatedBeneficiaries: number
  // Status e datas
  status: FundingStatus
  publishedAt?: Date
  fundedAt?: Date
  deadline?: Date
  // Imagens
  coverImage: string
  images: string[]
}

// Proxy Financeiras conforme Seção 3.3
export const FINANCIAL_PROXIES = {
  ALIMENTACAO: {
    category: "Alimentação e Segurança Alimentar",
    proxies: [
      { name: "Fornecimento de refeições", value: 1.07, unit: "por dia", source: "FNDE" },
      { name: "Cestas básicas", value: 805.84, unit: "por mês", source: "DIEESE" },
    ],
  },
  EDUCACAO: {
    category: "Educação e Qualificação Profissional",
    proxies: [
      { name: "Acesso à educação básica", value: 5648, unit: "por ano", source: "MEC - FUNDEB" },
      { name: "Curso profissionalizante", value: 500, unit: "por mês", source: "SENAI/SENAC" },
    ],
  },
  ASSISTENCIA_SOCIAL: {
    category: "Assistência Social e Combate à Pobreza",
    proxies: [
      { name: "Suporte à renda familiar", value: 685.61, unit: "por mês", source: "MDS - Bolsa Família" },
      { name: "Apoio à moradia", value: 375, unit: "por mês", source: "Aluguel Social" },
    ],
  },
  MEIO_AMBIENTE: {
    category: "Meio Ambiente e Sustentabilidade",
    proxies: [
      { name: "Reflorestamento", value: 20000, unit: "por hectare", source: "TNC, WRI" },
      { name: "PSA - Pagamento por Serviços Ambientais", value: 350, unit: "ha/ano", source: "WRI Brasil" },
    ],
  },
  PROTECAO_ANIMAL: {
    category: "Proteção Animal",
    proxies: [
      { name: "Resgate e cuidado", value: 225, unit: "por mês/animal", source: "ONGs" },
      { name: "Promoção de adoção", value: 90, unit: "por animal", source: "Referência" },
    ],
  },
  SAUDE: {
    category: "Saúde Pública e Bem-Estar",
    proxies: [
      { name: "Prevenção via vacinação", value: 19.88, unit: "por dose", source: "MS" },
      { name: "Saúde mental", value: 755, unit: "por mês", source: "Auxílio-reabilitação" },
    ],
  },
}

export const FUNDING_STATUS_CONFIG: Record<FundingStatus, { label: string; color: string }> = {
  [FundingStatus.DRAFT]: { label: "Rascunho", color: "bg-gray-500/10 text-gray-500" },
  [FundingStatus.PUBLISHED]: { label: "Publicado", color: "bg-blue-500/10 text-blue-500" },
  [FundingStatus.FUNDING]: { label: "Captando", color: "bg-emerald-500/10 text-emerald-500" },
  [FundingStatus.FUNDED]: { label: "Financiado", color: "bg-purple-500/10 text-purple-500" },
  [FundingStatus.EXECUTING]: { label: "Em Execução", color: "bg-amber-500/10 text-amber-500" },
  [FundingStatus.COMPLETED]: { label: "Concluído", color: "bg-emerald-500/10 text-emerald-500" },
  [FundingStatus.CANCELLED]: { label: "Cancelado", color: "bg-red-500/10 text-red-500" },
}

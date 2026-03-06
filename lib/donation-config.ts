// Configuracao de split de pagamentos para doacoes
// Define como o valor da doacao sera distribuido

export interface SplitConfig {
  // Percentual para a instituicao (destino da doacao)
  institutionPercent: number
  // Percentual para a plataforma STHATION
  platformPercent: number
  // Percentual para o Fundo de Gas (taxas blockchain Polygon)
  gasFundPercent: number
}

// Configuracao padrao de split
export const DEFAULT_SPLIT_CONFIG: SplitConfig = {
  institutionPercent: 80, // 80% vai para a instituicao
  platformPercent: 16,    // 16% para STHATION
  gasFundPercent: 4,      // 4% para Fundo de Gas (taxas blockchain)
}

// Export alternativo para compatibilidade
export const DONATION_SPLIT = {
  INSTITUTION: 0.80,  // 80%
  PLATFORM: 0.16,     // 16%
  GAS_FUND: 0.04,     // 4%
}

// Calcula a distribuicao de valores baseado no split
export function calculateSplit(amountInCents: number, config: SplitConfig = DEFAULT_SPLIT_CONFIG) {
  const institutionAmount = Math.floor(amountInCents * (config.institutionPercent / 100))
  const platformAmount = Math.floor(amountInCents * (config.platformPercent / 100))
  const gasFundAmount = amountInCents - institutionAmount - platformAmount // Resto vai pro gas fund

  return {
    total: amountInCents,
    institution: institutionAmount,
    platform: platformAmount,
    gasFund: gasFundAmount,
    // Para uso no Stripe (application_fee_amount = o que a plataforma retém)
    applicationFee: platformAmount + gasFundAmount, // 20% fica na STHATION
  }
}

// Valores pre-definidos de doacao (em centavos BRL)
export const DONATION_AMOUNTS = [
  { id: "donation-25", label: "R$ 25", amountInCents: 2500 },
  { id: "donation-50", label: "R$ 50", amountInCents: 5000 },
  { id: "donation-100", label: "R$ 100", amountInCents: 10000 },
  { id: "donation-250", label: "R$ 250", amountInCents: 25000 },
  { id: "donation-500", label: "R$ 500", amountInCents: 50000 },
  { id: "donation-1000", label: "R$ 1.000", amountInCents: 100000 },
]

// Formata valor em centavos para exibicao em BRL
export function formatBRL(amountInCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountInCents / 100)
}

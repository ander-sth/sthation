export interface DonationOption {
  id: string
  name: string
  description: string
  priceInCents: number
  priceBRL: string
}

// Opções de doação pré-definidas (em centavos de BRL)
export const DONATION_OPTIONS: DonationOption[] = [
  {
    id: "donation-25",
    name: "Doação R$ 25",
    description: "Contribuição de R$ 25,00 para o projeto ambiental",
    priceInCents: 2500,
    priceBRL: "R$ 25,00",
  },
  {
    id: "donation-50",
    name: "Doação R$ 50",
    description: "Contribuição de R$ 50,00 para o projeto ambiental",
    priceInCents: 5000,
    priceBRL: "R$ 50,00",
  },
  {
    id: "donation-100",
    name: "Doação R$ 100",
    description: "Contribuição de R$ 100,00 para o projeto ambiental",
    priceInCents: 10000,
    priceBRL: "R$ 100,00",
  },
  {
    id: "donation-250",
    name: "Doação R$ 250",
    description: "Contribuição de R$ 250,00 para o projeto ambiental",
    priceInCents: 25000,
    priceBRL: "R$ 250,00",
  },
  {
    id: "donation-500",
    name: "Doação R$ 500",
    description: "Contribuição de R$ 500,00 para o projeto ambiental",
    priceInCents: 50000,
    priceBRL: "R$ 500,00",
  },
  {
    id: "donation-1000",
    name: "Doação R$ 1.000",
    description: "Contribuição de R$ 1.000,00 para o projeto ambiental",
    priceInCents: 100000,
    priceBRL: "R$ 1.000,00",
  },
]

// Split de pagamentos conforme regra do sistema:
// 80% para a instituição
// 16% para a Sthation
// 4% para os Checkers
export const PAYMENT_SPLIT = {
  institution: 0.80,
  sthation: 0.16,
  checkers: 0.04,
}

export function calculateSplit(amountInCents: number) {
  return {
    institution: Math.floor(amountInCents * PAYMENT_SPLIT.institution),
    sthation: Math.floor(amountInCents * PAYMENT_SPLIT.sthation),
    checkers: Math.floor(amountInCents * PAYMENT_SPLIT.checkers),
    total: amountInCents,
  }
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

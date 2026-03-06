// Tipos para integração blockchain conforme documentos STHATION

export interface BlockchainTransaction {
  hash: string // Hash da transação
  blockNumber: number
  timestamp: Date
  from: string
  to: string
  value: number
  status: "PENDING" | "CONFIRMED" | "FAILED"
  network: "polygon" | "ethereum" | "bitcoin"
}

export interface DonationBlockchainData {
  donationId: string
  donorAddress: string
  amount: number // Em centavos
  projectId: string
  timestamp: number
  dataHash: string // SHA-256 dos dados
  txHash?: string // Hash da transação no blockchain
  blockNumber?: number
  confirmed: boolean
}

export interface ImpactBlockchainData {
  impactId: string
  companyAddress: string
  impactType: string
  quantity: number
  gpsLat: number
  gpsLon: number
  ipfsHash: string // Hash dos arquivos no IPFS
  dataHash: string // SHA-256 dos dados
  txHash?: string
  blockNumber?: number
  validated: boolean
  impactEstimate?: number // IE em centavos
}

export interface InscriptionData {
  inscriptionId: string
  txId: string
  blockHeight: number
  timestamp: Date
  content: {
    projectId: string
    title: string
    type: "SOCIAL" | "ENVIRONMENTAL"
    institution: string
    impactData: Record<string, unknown>
    validationScore: number
    certifiedBy: string
    certificationDate: string
    dataHash: string
  }
}

// Split de pagamento conforme documento
export interface PaymentSplit {
  total: number
  institution: number // 80%
  checkers: number // 2%
  certifiers: number // 2%
  gasInscription: number // 4%
  sthation: number // 12%
}

export const SPLIT_PERCENTAGES = {
  institution: 0.8,
  checkers: 0.02,
  certifiers: 0.02,
  gasInscription: 0.04,
  sthation: 0.12,
} as const

// Configuração de rede Polygon
export const POLYGON_CONFIG = {
  mainnet: {
    chainId: 137,
    name: "Polygon PoS",
    rpcUrl: "https://polygon-rpc.com",
    explorer: "https://polygonscan.com",
    currency: "POL",
  },
  testnet: {
    chainId: 80002,
    name: "Polygon Amoy",
    rpcUrl: "https://rpc-amoy.polygon.technology",
    explorer: "https://amoy.polygonscan.com",
    currency: "POL",
  },
} as const

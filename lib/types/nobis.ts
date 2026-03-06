// NOBIS Engine Types conforme Documento Mestre v6.0
// Seção 6.3.3: NOBIS Engine

export enum NobisStatus {
  MINTED = "MINTED", // Emitido após validação VCA
  FOR_SALE = "FOR_SALE", // Listado no Marketplace Primário
  SOLD = "SOLD", // Vendido
  INSCRIBED = "INSCRIBED", // Inscrito no Bitcoin (Ordinals)
  RETIRED = "RETIRED", // Aposentado/Cancelado
}

// Split de Pagamento conforme Seção 4.1 e 4.3
export const PAYMENT_SPLIT = {
  // Modelo Doação (Fase de Captação)
  DONATION: {
    INSTITUICAO: 0.8, // 80% -> Instituição (Executor)
    PLATAFORMA: 0.1, // 10% -> Sthation (Plataforma)
    FUNDO_VALIDACAO: 0.05, // 5% -> Fundo de Validação (Checkers)
    FUNDO_RECOMPENSA: 0.05, // 5% -> Fundo de Recompensa (Cashback/Nobis Cap)
  },
  // Modelo Venda (Marketplace Primário)
  SALE: {
    INSTITUICAO: 0.4, // 40% -> Instituição (Executor)
    PLATAFORMA: 0.4, // 40% -> Sthation (Plataforma)
    FUNDO_VALIDACAO: 0.15, // 15% -> Fundo de Validação
    FUNDO_RECOMPENSA: 0.05, // 5% -> Fundo de Recompensa
  },
}

export interface NobisAsset {
  id: string
  iacId: string // Referência ao IAC de origem
  title: string
  description: string
  category: string
  tsbCategory: string

  // Dados de Impacto
  carbonCredits: number // tCO2e
  impactMetrics: {
    beneficiaries?: number
    areaHectares?: number
    treesPlanted?: number
    waterSavedLiters?: number
  }

  // Comercialização
  status: NobisStatus
  price: number // Em BRL
  listedAt?: Date
  soldAt?: Date
  buyerId?: string

  // Inscrição Bitcoin
  inscriptionId?: string // ID do Ordinal
  inscriptionTxId?: string
  inscriptionFee?: number
  inscribedAt?: Date

  // Metadados
  institution: {
    id: string
    name: string
    logo?: string
  }
  location: {
    name: string
    coordinates: { lat: number; lng: number }
  }
  evidenceHashes: string[] // Hashes SHA-256 das evidências
  validationScore: number // Score VCA (0-100)
  createdAt: Date
  updatedAt: Date
}

// Status labels e cores para NOBIS
export const NOBIS_STATUS_CONFIG: Record<NobisStatus, { label: string; color: string; description: string }> = {
  [NobisStatus.MINTED]: {
    label: "Emitido",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    description: "NOBIS emitido após validação VCA",
  },
  [NobisStatus.FOR_SALE]: {
    label: "À Venda",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Disponível no Marketplace Primário",
  },
  [NobisStatus.SOLD]: {
    label: "Vendido",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    description: "Vendido, aguardando inscrição",
  },
  [NobisStatus.INSCRIBED]: {
    label: "Inscrito",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Inscrito permanentemente no Bitcoin",
  },
  [NobisStatus.RETIRED]: {
    label: "Aposentado",
    color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    description: "Ativo aposentado/cancelado",
  },
}

// Sistema de Ranking de Doadores
// Gamificação para incentivar doações por área social

export interface DonorBadge {
  id: string
  name: string
  description: string
  icon: string // nome do ícone Lucide
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond"
  requirement: {
    type: "total_donated" | "donations_count" | "categories_count" | "streak_months"
    value: number
  }
}

export interface DonorRanking {
  id: string
  name: string
  avatar?: string
  isAnonymous: boolean
  // Estatísticas gerais
  totalDonated: number
  donationsCount: number
  projectsSupported: number
  // Pontuação de impacto (baseada em doações + engajamento)
  impactScore: number
  // Ranking por categoria
  categoryDonations: {
    category: string
    totalDonated: number
    donationsCount: number
    rank: number
  }[]
  // Badges conquistados
  badges: DonorBadge[]
  // Data de entrada
  memberSince: Date
  // Sequência de doações
  currentStreak: number // meses consecutivos doando
  longestStreak: number
}

export interface CategoryRanking {
  category: string
  icon: string
  color: string
  totalDonated: number
  donorsCount: number
  topDonors: {
    id: string
    name: string
    avatar?: string
    isAnonymous: boolean
    totalDonated: number
    impactScore: number
    rank: number
  }[]
}

// Categorias sociais para ranking
export const SOCIAL_CATEGORIES = [
  { id: "alimentacao", name: "Alimentação", icon: "Utensils", color: "bg-orange-500" },
  { id: "educacao", name: "Educação", icon: "GraduationCap", color: "bg-blue-500" },
  { id: "saude", name: "Saúde", icon: "Heart", color: "bg-red-500" },
  { id: "moradia", name: "Moradia", icon: "Home", color: "bg-amber-500" },
  { id: "assistencia", name: "Assistência Social", icon: "HandHeart", color: "bg-purple-500" },
  { id: "animal", name: "Proteção Animal", icon: "PawPrint", color: "bg-green-500" },
  { id: "cultura", name: "Cultura", icon: "Palette", color: "bg-pink-500" },
  { id: "esporte", name: "Esporte", icon: "Trophy", color: "bg-cyan-500" },
] as const

// Níveis de doador
export const DONOR_TIERS = [
  { tier: "bronze", minScore: 0, maxScore: 999, label: "Apoiador Bronze", color: "bg-amber-700" },
  { tier: "silver", minScore: 1000, maxScore: 4999, label: "Apoiador Prata", color: "bg-slate-400" },
  { tier: "gold", minScore: 5000, maxScore: 14999, label: "Apoiador Ouro", color: "bg-yellow-500" },
  { tier: "platinum", minScore: 15000, maxScore: 49999, label: "Apoiador Platina", color: "bg-slate-300" },
  {
    tier: "diamond",
    minScore: 50000,
    maxScore: Number.POSITIVE_INFINITY,
    label: "Apoiador Diamante",
    color: "bg-cyan-400",
  },
] as const

// Badges disponíveis
export const AVAILABLE_BADGES: DonorBadge[] = [
  {
    id: "first-donation",
    name: "Primeira Doação",
    description: "Fez sua primeira doação na plataforma",
    icon: "Sparkles",
    tier: "bronze",
    requirement: { type: "donations_count", value: 1 },
  },
  {
    id: "supporter-10",
    name: "Apoiador Frequente",
    description: "Realizou 10 doações",
    icon: "Heart",
    tier: "silver",
    requirement: { type: "donations_count", value: 10 },
  },
  {
    id: "supporter-50",
    name: "Grande Apoiador",
    description: "Realizou 50 doações",
    icon: "HeartHandshake",
    tier: "gold",
    requirement: { type: "donations_count", value: 50 },
  },
  {
    id: "diversified",
    name: "Diversificado",
    description: "Doou para 5 categorias diferentes",
    icon: "LayoutGrid",
    tier: "silver",
    requirement: { type: "categories_count", value: 5 },
  },
  {
    id: "all-categories",
    name: "Impacto Total",
    description: "Doou para todas as categorias sociais",
    icon: "Globe",
    tier: "platinum",
    requirement: { type: "categories_count", value: 8 },
  },
  {
    id: "streak-3",
    name: "Constante",
    description: "Doou por 3 meses consecutivos",
    icon: "Flame",
    tier: "bronze",
    requirement: { type: "streak_months", value: 3 },
  },
  {
    id: "streak-12",
    name: "Dedicado",
    description: "Doou por 12 meses consecutivos",
    icon: "Award",
    tier: "gold",
    requirement: { type: "streak_months", value: 12 },
  },
  {
    id: "donor-1k",
    name: "Mil Razões",
    description: "Doou mais de R$ 1.000 no total",
    icon: "BadgeDollarSign",
    tier: "silver",
    requirement: { type: "total_donated", value: 1000 },
  },
  {
    id: "donor-10k",
    name: "Transformador",
    description: "Doou mais de R$ 10.000 no total",
    icon: "Gem",
    tier: "gold",
    requirement: { type: "total_donated", value: 10000 },
  },
  {
    id: "donor-100k",
    name: "Filantropo",
    description: "Doou mais de R$ 100.000 no total",
    icon: "Crown",
    tier: "diamond",
    requirement: { type: "total_donated", value: 100000 },
  },
]

export function getDonorTier(impactScore: number) {
  return DONOR_TIERS.find((t) => impactScore >= t.minScore && impactScore <= t.maxScore) || DONOR_TIERS[0]
}

export function calculateImpactScore(totalDonated: number, donationsCount: number, streakMonths: number): number {
  // Fórmula: base de doação + bônus de frequência + bônus de consistência
  const baseScore = Math.floor(totalDonated / 10) // R$10 = 1 ponto
  const frequencyBonus = donationsCount * 5 // 5 pontos por doação
  const streakBonus = streakMonths * 20 // 20 pontos por mês de sequência
  return baseScore + frequencyBonus + streakBonus
}

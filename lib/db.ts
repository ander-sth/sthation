import { neon } from '@neondatabase/serverless'

// Cliente SQL para queries
export const sql = neon(process.env.DATABASE_URL!)

// Tipos baseados no schema do banco
export type UserRole = 
  | 'ADMIN' 
  | 'DOADOR' 
  | 'INSTITUICAO_SOCIAL' 
  | 'EMPRESA_AMBIENTAL' 
  | 'CHECKER' 
  | 'ANALISTA_CERTIFICADOR' 
  | 'PREFEITURA'

export type IacStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'IN_VALIDATION' 
  | 'VALIDATED' 
  | 'REJECTED' 
  | 'DISPUTE' 
  | 'EXECUTING' 
  | 'MINTED'

export type IacType = 'SOCIAL' | 'AMBIENTAL'

export type FundingStatus = 
  | 'DRAFT' 
  | 'FUNDING' 
  | 'FUNDED' 
  | 'EXECUTING' 
  | 'COMPLETED' 
  | 'CANCELLED'

export type VcaStatus = 'OPEN' | 'CLOSED' | 'DISPUTE'
export type VcaResult = 'APPROVED' | 'REJECTED' | 'DISPUTE' | null

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED'

// Interfaces do banco
export interface DbUser {
  id: string
  email: string
  password_hash: string
  name: string
  role: UserRole
  document: string | null
  phone: string | null
  avatar_url: string | null
  wallet_address: string | null
  is_verified: boolean
  is_active: boolean
  checker_score: number
  checker_level: string | null
  validations_count: number
  created_at: Date
  updated_at: Date
}

export interface DbInstitution {
  id: string
  user_id: string
  name: string
  cnpj: string
  type: string
  description: string | null
  is_verified: boolean
  address: string | null
  city: string | null
  state: string | null
  logo_url: string | null
  website: string | null
  created_at: Date
  updated_at: Date
}

export interface DbImpactActionCard {
  id: string
  institution_id: string
  title: string
  description: string
  category: string
  tsb_category_id: string
  type: IacType
  status: IacStatus
  location_name: string
  location_state: string
  location_lat: number | null
  location_lng: number | null
  budget: number
  estimated_beneficiaries: number
  deadline: Date | null
  vca_score: number | null
  trail_id: string | null
  polygon_tx_hash: string | null
  polygon_block_number: number | null
  inscription_id: string | null
  submitted_at: Date | null
  validated_at: Date | null
  minted_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface DbFundingProject {
  id: string
  iac_id: string
  title: string
  description: string
  goal_amount: number
  current_amount: number
  donors_count: number
  deadline: Date | null
  status: FundingStatus
  cdp: number
  com: number
  fri: number
  pco: number
  created_at: Date
  updated_at: Date
}

export interface DbDonation {
  id: string
  donor_id: string
  funding_project_id: string
  amount: number
  payment_method: string
  payment_status: PaymentStatus
  transaction_id: string | null
  data_hash: string | null
  polygon_tx_hash: string | null
  polygon_block_number: number | null
  created_at: Date
  confirmed_at: Date | null
}

export interface DbVcaSession {
  id: string
  iac_id: string
  status: VcaStatus
  total_checkers: number
  votes_count: number
  approval_percentage: number | null
  final_score: number | null
  result: VcaResult
  started_at: Date
  deadline: Date
  closed_at: Date | null
}

export interface DbVcaVote {
  id: string
  session_id: string
  checker_id: string
  vote: 'APPROVE' | 'REJECT'
  criteria_scores: Record<string, number>
  weighted_score: number
  justification: string | null
  is_aligned: boolean | null
  voted_at: Date
}

// Helper para transformar rows do banco
export function rowToUser(row: Record<string, unknown>): DbUser {
  return {
    id: row.id as string,
    email: row.email as string,
    password_hash: row.password_hash as string,
    name: row.name as string,
    role: row.role as UserRole,
    document: row.document as string | null,
    phone: row.phone as string | null,
    avatar_url: row.avatar_url as string | null,
    wallet_address: row.wallet_address as string | null,
    is_verified: row.is_verified as boolean,
    is_active: row.is_active as boolean,
    checker_score: row.checker_score as number,
    checker_level: row.checker_level as string | null,
    validations_count: row.validations_count as number,
    created_at: new Date(row.created_at as string),
    updated_at: new Date(row.updated_at as string),
  }
}

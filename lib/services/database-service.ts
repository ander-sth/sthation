import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Types para os dados do banco
export interface DBProject {
  id: string
  title: string
  description: string
  category: string
  tsb_category_id: string
  type: "SOCIAL" | "AMBIENTAL"
  status: string
  location_name: string
  location_state: string
  budget: number
  estimated_beneficiaries: number
  vca_score: number | null
  institution_name: string
  institution_id: string
  created_at: string
}

export interface DBFundingProject {
  id: string
  iac_id: string
  title: string
  description: string
  category: string
  status: string
  goal_amount: number
  current_amount: number
  donors_count: number
  deadline: string | null
  location_name: string
  location_state: string
  institution_name: string
  vca_score: number | null
  created_at: string
}

export interface DBDonation {
  id: string
  funding_project_id: string
  donor_id: string
  donor_name: string
  amount: number
  status: string
  tx_hash: string | null
  created_at: string
}

// Buscar projetos de captacao (funding_projects) para a pagina publica
export async function getFundingProjects(options?: {
  status?: string
  category?: string
  limit?: number
}) {
  const { status, category, limit } = options || {}

  let query = `
    SELECT 
      fp.id,
      fp.iac_id,
      iac.title,
      iac.description,
      iac.category,
      fp.status,
      fp.goal_amount,
      fp.current_amount,
      fp.donors_count,
      fp.deadline,
      iac.location_name,
      iac.location_state,
      inst.name as institution_name,
      iac.vca_score,
      fp.created_at
    FROM funding_projects fp
    JOIN impact_action_cards iac ON fp.iac_id = iac.id
    JOIN institutions inst ON iac.institution_id = inst.id
    WHERE 1=1
  `

  if (status) {
    query += ` AND fp.status = '${status}'`
  }

  if (category) {
    query += ` AND iac.category ILIKE '%${category}%'`
  }

  query += ` ORDER BY fp.created_at DESC`

  if (limit) {
    query += ` LIMIT ${limit}`
  }

  const results = await sql(query)
  return results as DBFundingProject[]
}

// Buscar projetos ambientais certificados
export async function getEnvironmentalProjects(options?: {
  status?: string
  limit?: number
}) {
  const { status, limit } = options || {}

  let query = `
    SELECT 
      iac.id,
      iac.title,
      iac.description,
      iac.category,
      iac.tsb_category_id,
      iac.type,
      iac.status,
      iac.location_name,
      iac.location_state,
      iac.budget,
      iac.estimated_beneficiaries,
      iac.vca_score,
      inst.name as institution_name,
      iac.institution_id,
      iac.created_at
    FROM impact_action_cards iac
    JOIN institutions inst ON iac.institution_id = inst.id
    WHERE iac.type = 'AMBIENTAL'
  `

  if (status) {
    query += ` AND iac.status = '${status}'`
  }

  query += ` ORDER BY iac.created_at DESC`

  if (limit) {
    query += ` LIMIT ${limit}`
  }

  const results = await sql(query)
  return results as DBProject[]
}

// Buscar IACs (todos os projetos)
export async function getIACs(options?: {
  type?: "SOCIAL" | "AMBIENTAL"
  status?: string
  institution_id?: string
  limit?: number
}) {
  const { type, status, institution_id, limit } = options || {}

  let query = `
    SELECT 
      iac.id,
      iac.title,
      iac.description,
      iac.category,
      iac.tsb_category_id,
      iac.type,
      iac.status,
      iac.location_name,
      iac.location_state,
      iac.budget,
      iac.estimated_beneficiaries,
      iac.vca_score,
      inst.name as institution_name,
      iac.institution_id,
      iac.created_at
    FROM impact_action_cards iac
    JOIN institutions inst ON iac.institution_id = inst.id
    WHERE 1=1
  `

  if (type) {
    query += ` AND iac.type = '${type}'`
  }

  if (status) {
    query += ` AND iac.status = '${status}'`
  }

  if (institution_id) {
    query += ` AND iac.institution_id = '${institution_id}'`
  }

  query += ` ORDER BY iac.created_at DESC`

  if (limit) {
    query += ` LIMIT ${limit}`
  }

  const results = await sql(query)
  return results as DBProject[]
}

// Buscar estatisticas da plataforma
export async function getPlatformStats() {
  const stats = await sql`
    SELECT 
      (SELECT COUNT(*) FROM funding_projects WHERE status = 'FUNDING') as active_campaigns,
      (SELECT COUNT(*) FROM funding_projects WHERE status IN ('FUNDED', 'COMPLETED')) as completed_campaigns,
      (SELECT COALESCE(SUM(current_amount), 0) FROM funding_projects) as total_raised,
      (SELECT COALESCE(SUM(donors_count), 0) FROM funding_projects) as total_donors,
      (SELECT COUNT(*) FROM impact_action_cards WHERE type = 'AMBIENTAL' AND status IN ('CERTIFIED', 'VALIDATED')) as environmental_projects,
      (SELECT COUNT(*) FROM impact_action_cards WHERE type = 'SOCIAL' AND status = 'VALIDATED') as social_projects,
      (SELECT COUNT(*) FROM users WHERE role = 'DOADOR') as total_donors_registered,
      (SELECT COUNT(*) FROM institutions WHERE is_verified = true) as verified_institutions
  `
  return stats[0]
}

// Buscar doacoes de um projeto
export async function getProjectDonations(projectId: string) {
  const donations = await sql`
    SELECT 
      d.id,
      d.funding_project_id,
      d.donor_id,
      u.name as donor_name,
      d.amount,
      d.status,
      d.tx_hash,
      d.created_at
    FROM donations d
    JOIN users u ON d.donor_id = u.id
    WHERE d.funding_project_id = ${projectId}
    ORDER BY d.created_at DESC
  `
  return donations as DBDonation[]
}

// Buscar projeto por ID
export async function getProjectById(id: string) {
  const results = await sql`
    SELECT 
      fp.id,
      fp.iac_id,
      iac.title,
      iac.description,
      iac.category,
      fp.status,
      fp.goal_amount,
      fp.current_amount,
      fp.donors_count,
      fp.deadline,
      iac.location_name,
      iac.location_state,
      inst.name as institution_name,
      inst.id as institution_id,
      inst.description as institution_description,
      iac.vca_score,
      iac.budget,
      iac.estimated_beneficiaries,
      fp.created_at
    FROM funding_projects fp
    JOIN impact_action_cards iac ON fp.iac_id = iac.id
    JOIN institutions inst ON iac.institution_id = inst.id
    WHERE fp.id = ${id}
  `
  return results[0] as DBFundingProject | undefined
}

// Buscar IAC por ID
export async function getIACById(id: string) {
  const results = await sql`
    SELECT 
      iac.*,
      inst.name as institution_name,
      inst.description as institution_description
    FROM impact_action_cards iac
    JOIN institutions inst ON iac.institution_id = inst.id
    WHERE iac.id = ${id}
  `
  return results[0] as DBProject | undefined
}

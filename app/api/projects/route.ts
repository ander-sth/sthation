import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

// Schema real:
// funding_projects: id, title, description, status, goal_amount, current_amount, donors_count, deadline, iac_id
// impact_action_cards: id, title, description, category, type, institution_id, location_name, location_state, estimated_beneficiaries
// institutions: id, name, cnpj, type, is_verified

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ projects: [] })
  }

  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const category = searchParams.get('category')
  const status = searchParams.get('status')

  try {
    // Buscar funding_projects com IACs e institutions
    const projects = await sql`
      SELECT 
        fp.id,
        fp.title,
        fp.description,
        fp.status,
        fp.goal_amount,
        fp.current_amount,
        fp.donors_count,
        fp.deadline,
        fp.iac_id,
        fp.created_at,
        fp.updated_at,
        iac.category,
        iac.type as iac_type,
        iac.location_name,
        iac.location_state,
        iac.estimated_beneficiaries,
        i.id as inst_id,
        i.name as inst_name,
        i.is_verified as inst_verified,
        i.type as inst_type
      FROM funding_projects fp
      LEFT JOIN impact_action_cards iac ON fp.iac_id = iac.id
      LEFT JOIN institutions i ON iac.institution_id = i.id
      ORDER BY fp.created_at DESC
      LIMIT ${limit}
    `

    let filteredProjects = (projects || []) as any[]
    
    if (category) {
      filteredProjects = filteredProjects.filter(p => 
        p.category?.toLowerCase().includes(category.toLowerCase())
      )
    }
    
    if (status) {
      filteredProjects = filteredProjects.filter(p => 
        p.status?.toLowerCase() === status.toLowerCase()
      )
    }

    const formattedProjects = filteredProjects.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category || 'social',
      type: p.iac_type || 'SOCIAL',
      status: p.status,
      goalAmount: parseFloat(p.goal_amount) || 0,
      targetAmount: parseFloat(p.goal_amount) || 0,
      currentAmount: parseFloat(p.current_amount) || 0,
      donorsCount: p.donors_count || 0,
      deadline: p.deadline,
      beneficiaries: p.estimated_beneficiaries || 0,
      estimatedBeneficiaries: p.estimated_beneficiaries || 0,
      location_name: p.location_name,
      location_state: p.location_state,
      city: p.location_name,
      state: p.location_state,
      iacId: p.iac_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      institution_name: p.inst_name,
      institution_verified: p.inst_verified,
      institution: p.inst_id ? {
        id: p.inst_id,
        name: p.inst_name,
        isVerified: p.inst_verified,
        type: p.inst_type,
      } : null,
      // Calcular progresso
      progress: p.goal_amount > 0 ? Math.round((parseFloat(p.current_amount) / parseFloat(p.goal_amount)) * 100) : 0,
    }))

    return NextResponse.json({ projects: formattedProjects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects', projects: [] },
      { status: 500 }
    )
  }
}

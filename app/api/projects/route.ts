import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

// Usar tabela "projects" que existe no banco
// Schema: id, title, description, category, subcategory, status, targetAmount, currentAmount, 
// startDate, endDate, beneficiaries, city, state, imageUrl, odsGoals, organizationId, createdAt, updatedAt

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
    const projects = await sql`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.category,
        p.subcategory,
        p.status,
        p."targetAmount",
        p."currentAmount",
        p."startDate",
        p."endDate",
        p.beneficiaries,
        p.city,
        p.state,
        p."imageUrl",
        p."odsGoals",
        p."organizationId",
        p."createdAt",
        p."updatedAt",
        o.name as organization_name,
        o."isVerified" as organization_verified,
        o.type as organization_type
      FROM projects p
      LEFT JOIN organizations o ON p."organizationId" = o.id
      WHERE p.status != 'draft'
      ORDER BY p."createdAt" DESC
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
      category: p.category,
      subcategory: p.subcategory,
      status: p.status,
      targetAmount: parseFloat(p.targetAmount) || 0,
      currentAmount: parseFloat(p.currentAmount) || 0,
      goalAmount: parseFloat(p.targetAmount) || 0,
      startDate: p.startDate,
      endDate: p.endDate,
      beneficiaries: p.beneficiaries,
      estimatedBeneficiaries: p.beneficiaries,
      location_name: p.city,
      location_state: p.state,
      city: p.city,
      state: p.state,
      imageUrl: p.imageUrl,
      odsGoals: p.odsGoals || [],
      organizationId: p.organizationId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      institution_name: p.organization_name,
      institution_verified: p.organization_verified,
      organization: p.organizationId ? {
        id: p.organizationId,
        name: p.organization_name,
        isVerified: p.organization_verified,
        type: p.organization_type,
      } : null,
      // Calcular progresso
      progress: p.targetAmount > 0 ? Math.round((parseFloat(p.currentAmount) / parseFloat(p.targetAmount)) * 100) : 0,
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

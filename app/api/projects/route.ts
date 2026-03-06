import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ projects: [] })
  }

  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    const projects = await sql`
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
        iac.created_at,
        i.name as institution_name,
        i.is_verified as institution_verified,
        fp.id as funding_id,
        fp.goal_amount,
        fp.current_amount,
        fp.donors_count,
        fp.status as funding_status
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      LEFT JOIN funding_projects fp ON fp.iac_id = iac.id
      WHERE iac.status != 'DRAFT'
      ORDER BY iac.created_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json({ projects: projects || [] })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects', projects: [] },
      { status: 500 }
    )
  }
}

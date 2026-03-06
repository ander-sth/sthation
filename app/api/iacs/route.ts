import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ iacs: [] })
  }
  
  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const institutionUserId = searchParams.get("institution_user_id")

  try {
    // Buscar IACs - se tiver institution_user_id, filtra pela instituicao do usuario
    let iacs
    
    if (institutionUserId) {
      iacs = await sql`
        SELECT 
          iac.*,
          i.name as institution_name,
          i.id as institution_id,
          fp.current_amount,
          fp.donors_count,
          fp.goal_amount as funding_goal
        FROM impact_action_cards iac
        JOIN institutions i ON iac.institution_id = i.id
        LEFT JOIN funding_projects fp ON fp.iac_id = iac.id
        WHERE i.user_id = ${institutionUserId}
        ORDER BY iac.created_at DESC
      `
    } else {
      iacs = await sql`
        SELECT 
          iac.*,
          i.name as institution_name,
          i.id as institution_id,
          fp.current_amount,
          fp.donors_count,
          fp.goal_amount as funding_goal
        FROM impact_action_cards iac
        JOIN institutions i ON iac.institution_id = i.id
        LEFT JOIN funding_projects fp ON fp.iac_id = iac.id
        ORDER BY iac.created_at DESC
        LIMIT 50
      `
    }

    return NextResponse.json({ iacs })
  } catch (error) {
    console.error("Error fetching IACs:", error)
    return NextResponse.json({ iacs: [], error: "Failed to fetch IACs" })
  }
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }
  
  const sql = neon(process.env.DATABASE_URL)

  try {
    const body = await request.json()
    const { 
      title, 
      description, 
      category, 
      locationName, 
      locationState, 
      targetBeneficiaries, 
      fundingGoal, 
      startDate, 
      endDate, 
      objectives, 
      methodology,
      institutionId 
    } = body

    if (!title || !description || !category || !institutionId) {
      return NextResponse.json(
        { error: "Campos obrigatorios: title, description, category, institutionId" },
        { status: 400 }
      )
    }

    // Criar IAC
    const newIac = await sql`
      INSERT INTO impact_action_cards (
        institution_id, 
        title, 
        description, 
        category,
        tsb_category_id,
        location_name,
        location_state,
        estimated_beneficiaries,
        goal_amount,
        start_date,
        end_date,
        objectives,
        methodology,
        status,
        created_at,
        updated_at
      )
      VALUES (
        ${institutionId},
        ${title},
        ${description},
        ${category},
        ${category},
        ${locationName || null},
        ${locationState || null},
        ${parseInt(targetBeneficiaries) || 0},
        ${parseFloat(fundingGoal) || 0},
        ${startDate || null},
        ${endDate || null},
        ${objectives || null},
        ${methodology || null},
        'DRAFT',
        NOW(),
        NOW()
      )
      RETURNING *
    `

    // Criar funding_project automaticamente
    if (newIac.length > 0) {
      await sql`
        INSERT INTO funding_projects (
          iac_id,
          title,
          status,
          goal_amount,
          current_amount,
          donors_count,
          deadline,
          created_at,
          updated_at
        )
        VALUES (
          ${newIac[0].id},
          ${title},
          'FUNDING',
          ${parseFloat(fundingGoal) || 0},
          0,
          0,
          ${endDate || null},
          NOW(),
          NOW()
        )
      `
    }

    return NextResponse.json({ 
      success: true, 
      iac: newIac[0],
      message: "Projeto criado com sucesso!"
    })
  } catch (error) {
    console.error("Error creating IAC:", error)
    return NextResponse.json(
      { error: "Falha ao criar projeto" },
      { status: 500 }
    )
  }
}

import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// Usar tabelas corretas: impact_action_cards e organizations

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ iacs: [] })
  }
  
  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const institutionUserId = searchParams.get("institution_user_id")
  const organizationId = searchParams.get("organization_id")

  try {
    let iacs
    
    if (institutionUserId) {
      // Buscar IACs pelo usuario da organizacao
      iacs = await sql`
        SELECT 
          iac.*,
          o.name as organization_name,
          o.id as organization_id
        FROM impact_action_cards iac
        LEFT JOIN organizations o ON iac."organizationId" = o.id
        LEFT JOIN users u ON u."organizationId" = o.id
        WHERE u.id = ${institutionUserId}
        ORDER BY iac."createdAt" DESC
      `
    } else if (organizationId) {
      // Buscar IACs pela organizacao diretamente
      iacs = await sql`
        SELECT 
          iac.*,
          o.name as organization_name,
          o.id as organization_id
        FROM impact_action_cards iac
        LEFT JOIN organizations o ON iac."organizationId" = o.id
        WHERE iac."organizationId" = ${organizationId}
        ORDER BY iac."createdAt" DESC
      `
    } else {
      // Buscar todos
      iacs = await sql`
        SELECT 
          iac.*,
          o.name as organization_name,
          o.id as organization_id
        FROM impact_action_cards iac
        LEFT JOIN organizations o ON iac."organizationId" = o.id
        ORDER BY iac."createdAt" DESC
        LIMIT 50
      `
    }

    // Formatar resposta
    const formattedIacs = (iacs || []).map((iac: any) => ({
      ...iac,
      institution_name: iac.organization_name,
      institution_id: iac.organization_id,
    }))

    return NextResponse.json({ iacs: formattedIacs })
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
      city,
      state,
      locationName, 
      locationState, 
      targetBeneficiaries,
      beneficiaries, 
      fundingGoal,
      budget, 
      startDate, 
      endDate, 
      organizationId,
      institutionId,
      imageUrl,
      odsGoals,
    } = body

    const finalOrgId = organizationId || institutionId
    const finalCity = city || locationName
    const finalState = state || locationState
    const finalBeneficiaries = beneficiaries || targetBeneficiaries || 0
    const finalBudget = budget || fundingGoal || 0

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Campos obrigatorios: title, description, category" },
        { status: 400 }
      )
    }

    // Gerar codigo de verificacao
    const verificationCode = `IAC-${Date.now().toString(36).toUpperCase()}`

    // Criar IAC com colunas corretas
    const newIac = await sql`
      INSERT INTO impact_action_cards (
        "organizationId", 
        title, 
        description, 
        category,
        city,
        state,
        beneficiaries,
        budget,
        "startDate",
        "endDate",
        "imageUrl",
        "odsGoals",
        "verificationCode",
        status,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${finalOrgId || null},
        ${title},
        ${description},
        ${category},
        ${finalCity || null},
        ${finalState || null},
        ${parseInt(finalBeneficiaries) || 0},
        ${parseFloat(finalBudget) || 0},
        ${startDate || null},
        ${endDate || null},
        ${imageUrl || null},
        ${JSON.stringify(odsGoals || [])}::jsonb,
        ${verificationCode},
        'draft',
        NOW(),
        NOW()
      )
      RETURNING *
    `

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

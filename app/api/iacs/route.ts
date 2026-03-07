import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

// Schema real:
// impact_action_cards: id, title, description, category, type, status, institution_id, location_name, location_state, estimated_beneficiaries, budget
// institutions: id, name, cnpj, type, user_id, is_verified

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ iacs: [] })
  }
  
  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const institutionUserId = searchParams.get("institution_user_id")
  const institutionId = searchParams.get("institution_id") || searchParams.get("organization_id")

  try {
    let iacs
    
    if (institutionUserId) {
      // Buscar IACs pelo usuario da instituicao
      iacs = await sql`
        SELECT 
          iac.*,
          i.name as institution_name,
          i.id as inst_id
        FROM impact_action_cards iac
        LEFT JOIN institutions i ON iac.institution_id = i.id
        WHERE i.user_id = ${institutionUserId}
        ORDER BY iac.created_at DESC
      `
    } else if (institutionId) {
      // Buscar IACs pela instituicao diretamente
      iacs = await sql`
        SELECT 
          iac.*,
          i.name as institution_name,
          i.id as inst_id
        FROM impact_action_cards iac
        LEFT JOIN institutions i ON iac.institution_id = i.id
        WHERE iac.institution_id = ${institutionId}
        ORDER BY iac.created_at DESC
      `
    } else {
      // Buscar todos
      iacs = await sql`
        SELECT 
          iac.*,
          i.name as institution_name,
          i.id as inst_id
        FROM impact_action_cards iac
        LEFT JOIN institutions i ON iac.institution_id = i.id
        ORDER BY iac.created_at DESC
        LIMIT 50
      `
    }

    // Formatar resposta
    const formattedIacs = (iacs || []).map((iac: any) => ({
      id: iac.id,
      title: iac.title,
      description: iac.description,
      category: iac.category,
      type: iac.type,
      status: iac.status,
      institutionId: iac.institution_id,
      institution_id: iac.institution_id,
      institution_name: iac.institution_name,
      locationName: iac.location_name,
      locationState: iac.location_state,
      location_name: iac.location_name,
      location_state: iac.location_state,
      estimatedBeneficiaries: iac.estimated_beneficiaries,
      budget: iac.budget,
      deadline: iac.deadline,
      vcaScore: iac.vca_score,
      polygonTxHash: iac.polygon_tx_hash,
      inscriptionId: iac.inscription_id,
      trailId: iac.trail_id,
      createdAt: iac.created_at,
      updatedAt: iac.updated_at,
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
      type,
      locationName, 
      locationState, 
      estimatedBeneficiaries,
      budget, 
      deadline, 
      institutionId,
    } = body

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Campos obrigatorios: title, description, category" },
        { status: 400 }
      )
    }

    // Criar IAC com colunas corretas do schema real
    const newIac = await sql`
      INSERT INTO impact_action_cards (
        institution_id, 
        title, 
        description, 
        category,
        type,
        location_name,
        location_state,
        estimated_beneficiaries,
        budget,
        deadline,
        status,
        created_at,
        updated_at
      )
      VALUES (
        ${institutionId || null},
        ${title},
        ${description},
        ${category},
        ${type || 'SOCIAL'},
        ${locationName || null},
        ${locationState || null},
        ${parseInt(estimatedBeneficiaries) || 0},
        ${parseFloat(budget) || 0},
        ${deadline || null},
        'DRAFT',
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

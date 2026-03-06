import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ projects: [] })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    const rows = await sql`
      SELECT 
        iac.*,
        i.name as institution_name,
        i.user_id as owner_id
      FROM impact_action_cards iac
      LEFT JOIN institutions i ON iac.institution_id = i.id
      WHERE iac.type = 'AMBIENTAL'
      ORDER BY iac.created_at DESC
      LIMIT ${limit}
    `

    const projects = (rows || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      category: row.category,
      status: row.status,
      projectStatus: row.project_status || "EM_ANDAMENTO",
      dataCollectionType: row.data_collection_type || "MANUAL",
      location: {
        name: row.location_name,
        state: row.location_state,
        coordinates: row.coordinates,
      },
      metrics: {
        estimatedCO2: row.estimated_co2 || row.carbon_credits || 0,
        energyGenerated: row.energy_generated || 0,
        wasteProcessed: row.waste_processed || 0,
        areaSize: row.area_size || 0,
        sensorsCount: row.sensors_count || 0,
      },
      methodology: row.methodology,
      certificationStandard: row.certification_standard,
      startDate: row.start_date,
      endDate: row.end_date,
      institution: {
        id: row.institution_id,
        name: row.institution_name,
      },
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Error fetching environmental projects:", error)
    return NextResponse.json(
      { error: "Falha ao buscar projetos ambientais" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      category,
      projectStatus,
      dataCollectionType,
      locationName,
      locationState,
      coordinates,
      startDate,
      endDate,
      estimatedCO2,
      measurementUnit,
      energyGenerated,
      wasteProcessed,
      areaSize,
      methodology,
      certificationStandard,
      existingCertifications,
      sensorsCount,
      sensorTypes,
      institutionId,
      userId,
    } = body

    // Validacoes
    if (!title || !description || !category || !institutionId) {
      return NextResponse.json(
        { error: "Campos obrigatorios faltando" },
        { status: 400 }
      )
    }

    // Inserir no banco
    const result = await sql`
      INSERT INTO impact_action_cards (
        title,
        description,
        type,
        category,
        status,
        project_status,
        data_collection_type,
        location_name,
        location_state,
        coordinates,
        start_date,
        end_date,
        carbon_credits,
        measurement_unit,
        energy_generated,
        waste_processed,
        area_size,
        methodology,
        certification_standard,
        existing_certifications,
        sensors_count,
        sensor_types,
        institution_id,
        funding_goal,
        current_funding,
        target_beneficiaries,
        current_beneficiaries
      ) VALUES (
        ${title},
        ${description},
        'AMBIENTAL',
        ${category},
        'DRAFT',
        ${projectStatus || 'EM_ANDAMENTO'},
        ${dataCollectionType || 'MANUAL'},
        ${locationName},
        ${locationState},
        ${coordinates || null},
        ${startDate || null},
        ${endDate || null},
        ${parseFloat(estimatedCO2) || 0},
        ${measurementUnit || 'tCO2e'},
        ${parseFloat(energyGenerated) || 0},
        ${parseFloat(wasteProcessed) || 0},
        ${parseFloat(areaSize) || 0},
        ${methodology || null},
        ${certificationStandard || null},
        ${existingCertifications || null},
        ${parseInt(sensorsCount) || 0},
        ${sensorTypes || null},
        ${institutionId},
        0,
        0,
        0,
        0
      )
      RETURNING *
    `

    const project = result[0] || result.rows?.[0]

    return NextResponse.json({ 
      success: true, 
      project: {
        id: project.id,
        title: project.title,
        status: project.status,
      }
    })
  } catch (error) {
    console.error("Error creating environmental project:", error)
    return NextResponse.json(
      { error: "Falha ao criar projeto ambiental" },
      { status: 500 }
    )
  }
}

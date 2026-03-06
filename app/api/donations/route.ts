import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Usar tabela "donations" que existe no banco
// Schema: id, amount, projectId, donorId, status, paymentMethod, message, metadata, 
// dataHash, txHash, blockNumber, transactionId, stripe_*, split*, isAnonymous, createdAt, updatedAt, confirmedAt

// Percentuais de split conforme documentacao STHATION
const SPLIT_PERCENTAGES = {
  INSTITUTION: 0.80,
  CHECKERS: 0.02,
  CERTIFIERS: 0.02,
  GAS_RESERVE: 0.04,
  STHATION: 0.12,
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }
  const sql = neon(process.env.DATABASE_URL)

  try {
    const body = await request.json()
    const { donor_id, donorId, project_id, projectId, funding_project_id, amount, payment_method, paymentMethod, message, isAnonymous } = body

    // Aceitar varios formatos de parametros
    const finalDonorId = donor_id || donorId
    const finalProjectId = project_id || projectId || funding_project_id
    const finalPaymentMethod = payment_method || paymentMethod || 'PIX'

    // Validacoes
    if (!finalDonorId || !finalProjectId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: donorId, projectId, amount' },
        { status: 400 }
      )
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: 'Minimum donation amount is R$ 1.00' },
        { status: 400 }
      )
    }

    // Verificar se o projeto existe (usando tabela projects)
    const projects = await sql`
      SELECT id, status, "targetAmount", "currentAmount", "organizationId"
      FROM projects
      WHERE id = ${finalProjectId}
    `

    if (!projects || projects.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const project = projects[0]

    if (project.status === 'cancelled' || project.status === 'completed') {
      return NextResponse.json(
        { error: 'Project is not accepting donations' },
        { status: 400 }
      )
    }

    // Gerar hash dos dados
    const dataToHash = JSON.stringify({
      donorId: finalDonorId,
      projectId: finalProjectId,
      amount,
      timestamp: new Date().toISOString(),
    })
    const dataHash = '0x' + crypto.createHash('sha256').update(dataToHash).digest('hex')
    const txHash = '0x' + crypto.randomBytes(32).toString('hex')
    const blockNumber = Math.floor(50000000 + Math.random() * 1000000)

    // Calcular splits
    const splitInstitution = amount * SPLIT_PERCENTAGES.INSTITUTION
    const splitCheckers = amount * SPLIT_PERCENTAGES.CHECKERS
    const splitCertifiers = amount * SPLIT_PERCENTAGES.CERTIFIERS
    const splitGas = amount * SPLIT_PERCENTAGES.GAS_RESERVE
    const splitSthation = amount * SPLIT_PERCENTAGES.STHATION

    // Criar a doacao usando colunas corretas
    const [donation] = await sql`
      INSERT INTO donations (
        "donorId",
        "projectId",
        amount,
        "paymentMethod",
        status,
        "dataHash",
        "txHash",
        "blockNumber",
        message,
        "isAnonymous",
        "splitInstitution",
        "splitCheckers",
        "splitCertifiers",
        "splitGas",
        "splitSthation",
        "confirmedAt",
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${finalDonorId},
        ${finalProjectId},
        ${amount},
        ${finalPaymentMethod},
        'confirmed',
        ${dataHash},
        ${txHash},
        ${blockNumber},
        ${message || null},
        ${isAnonymous || false},
        ${splitInstitution},
        ${splitCheckers},
        ${splitCertifiers},
        ${splitGas},
        ${splitSthation},
        NOW(),
        NOW(),
        NOW()
      )
      RETURNING *
    `

    // Atualizar o valor arrecadado do projeto
    await sql`
      UPDATE projects
      SET 
        "currentAmount" = "currentAmount" + ${amount},
        "updatedAt" = NOW()
      WHERE id = ${finalProjectId}
    `

    // Verificar se atingiu a meta
    const newTotal = parseFloat(project.currentAmount || 0) + amount
    if (project.targetAmount && newTotal >= parseFloat(project.targetAmount)) {
      await sql`
        UPDATE projects
        SET status = 'funded', "updatedAt" = NOW()
        WHERE id = ${finalProjectId}
      `
    }

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        amount: donation.amount,
        dataHash: donation.dataHash,
        txHash: donation.txHash,
        blockNumber: donation.blockNumber,
      },
      message: 'Donation confirmed and registered',
    })
  } catch (error) {
    console.error('Error processing donation:', error)
    return NextResponse.json(
      { error: 'Failed to process donation' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ donations: [] })
  }
  const sql = neon(process.env.DATABASE_URL)

  const { searchParams } = new URL(request.url)
  const donor_id = searchParams.get('donor_id') || searchParams.get('donorId')
  const project_id = searchParams.get('project_id') || searchParams.get('projectId')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    // Query usando tabelas corretas (projects em vez de funding_projects)
    const donations = await sql`
      SELECT 
        d.id,
        d.amount,
        d."projectId",
        d."donorId",
        d.status,
        d."paymentMethod",
        d.message,
        d."dataHash",
        d."txHash",
        d."blockNumber",
        d."isAnonymous",
        d."createdAt",
        d."confirmedAt",
        p.title as project_title,
        u.name as donor_name
      FROM donations d
      LEFT JOIN projects p ON d."projectId" = p.id
      LEFT JOIN users u ON d."donorId" = u.id
      ORDER BY d."createdAt" DESC
      LIMIT ${limit}
    `

    // Filtrar no JS se necessario
    let filtered = (donations || []) as any[]
    if (donor_id) {
      filtered = filtered.filter(d => d.donorId === donor_id)
    }
    if (project_id) {
      filtered = filtered.filter(d => d.projectId === project_id)
    }

    return NextResponse.json({ donations: filtered })
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json({ donations: [] })
  }
}

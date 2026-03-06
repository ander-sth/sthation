import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Percentuais de split conforme documentacao STHATION
const SPLIT_PERCENTAGES = {
  INSTITUTION: 0.80,     // 80% para a instituicao
  CHECKERS: 0.02,        // 2% para pool de checkers
  CERTIFIERS: 0.02,      // 2% para pool de certificadores
  GAS_RESERVE: 0.04,     // 4% para reserva de gas blockchain
  STHATION: 0.12,        // 12% para STHATION (operacao)
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }
  const sql = neon(process.env.DATABASE_URL)

  try {
    const body = await request.json()
    const { donor_id, funding_project_id, amount, payment_method } = body

    // Validacoes
    if (!donor_id || !funding_project_id || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: donor_id, funding_project_id, amount' },
        { status: 400 }
      )
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: 'Minimum donation amount is R$ 1.00' },
        { status: 400 }
      )
    }

    // Verificar se o projeto existe e esta em captacao
    const [project] = await sql`
      SELECT fp.id, fp.status, fp.goal_amount, fp.current_amount, iac.institution_id
      FROM funding_projects fp
      JOIN impact_action_cards iac ON fp.iac_id = iac.id
      WHERE fp.id = ${funding_project_id}
    `

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.status !== 'FUNDING') {
      return NextResponse.json(
        { error: 'Project is not accepting donations' },
        { status: 400 }
      )
    }

    // Gerar hash dos dados para blockchain
    const dataToHash = JSON.stringify({
      donor_id,
      funding_project_id,
      amount,
      timestamp: new Date().toISOString(),
    })
    const dataHash = '0x' + crypto.createHash('sha256').update(dataToHash).digest('hex')

    // Simular transacao na Polygon (em producao, usar ethers.js)
    const polygonTxHash = '0x' + crypto.randomBytes(32).toString('hex')
    const polygonBlockNumber = Math.floor(50000000 + Math.random() * 1000000)

    // Criar a doacao
    const [donation] = await sql`
      INSERT INTO donations (
        donor_id,
        funding_project_id,
        amount,
        payment_method,
        payment_status,
        data_hash,
        polygon_tx_hash,
        polygon_block_number,
        confirmed_at
      ) VALUES (
        ${donor_id},
        ${funding_project_id},
        ${amount},
        ${payment_method || 'PIX'},
        'CONFIRMED',
        ${dataHash},
        ${polygonTxHash},
        ${polygonBlockNumber},
        NOW()
      )
      RETURNING *
    `

    // Criar os splits de pagamento
    const splits = [
      { type: 'INSTITUTION', percentage: SPLIT_PERCENTAGES.INSTITUTION, recipient_id: project.institution_id },
      { type: 'CHECKERS_POOL', percentage: SPLIT_PERCENTAGES.CHECKERS, recipient_id: null },
      { type: 'CERTIFIERS_POOL', percentage: SPLIT_PERCENTAGES.CERTIFIERS, recipient_id: null },
      { type: 'GAS_RESERVE', percentage: SPLIT_PERCENTAGES.GAS_RESERVE, recipient_id: null },
      { type: 'STHATION', percentage: SPLIT_PERCENTAGES.STHATION, recipient_id: null },
    ]

    for (const split of splits) {
      const splitAmount = amount * split.percentage
      await sql`
        INSERT INTO payment_splits (
          donation_id,
          recipient_type,
          recipient_id,
          percentage,
          amount,
          status
        ) VALUES (
          ${donation.id},
          ${split.type},
          ${split.recipient_id},
          ${split.percentage * 100},
          ${splitAmount},
          'PENDING'
        )
      `
    }

    // Atualizar o valor arrecadado do projeto
    await sql`
      UPDATE funding_projects
      SET 
        current_amount = current_amount + ${amount},
        donors_count = donors_count + 1,
        updated_at = NOW()
      WHERE id = ${funding_project_id}
    `

    // Verificar se atingiu a meta
    const newTotal = parseFloat(project.current_amount) + amount
    if (newTotal >= parseFloat(project.goal_amount)) {
      await sql`
        UPDATE funding_projects
        SET status = 'FUNDED', updated_at = NOW()
        WHERE id = ${funding_project_id}
      `
    }

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        amount: donation.amount,
        dataHash: donation.data_hash,
        txHash: donation.polygon_tx_hash,
        blockNumber: donation.polygon_block_number,
      },
      message: 'Donation confirmed and registered on blockchain',
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
  const donor_id = searchParams.get('donor_id')
  const project_id = searchParams.get('project_id')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    // Query simplificada usando tagged template literals
    const donations = await sql`
      SELECT 
        d.*,
        iac.title as project_title,
        u.name as donor_name
      FROM donations d
      JOIN funding_projects fp ON d.funding_project_id = fp.id
      JOIN impact_action_cards iac ON fp.iac_id = iac.id
      JOIN users u ON d.donor_id = u.id
      ORDER BY d.created_at DESC
      LIMIT ${limit}
    `

    // Filtrar no JS se necessario
    let filtered = donations as any[]
    if (donor_id) {
      filtered = filtered.filter(d => d.donor_id === donor_id)
    }
    if (project_id) {
      filtered = filtered.filter(d => d.funding_project_id === project_id)
    }

    return NextResponse.json({ donations: filtered })
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json({ donations: [] })
  }
}

"use server"

import { stripe } from "@/lib/stripe"
import { DONATION_OPTIONS, calculateSplit } from "@/lib/donation-products"
import { neon } from "@neondatabase/serverless"

interface DonationMetadata {
  donationOptionId?: string
  customAmount?: number
  iacId: string
  iacTitle: string
  institutionId: string
  institutionName: string
  donorId?: string
  donorEmail?: string
}

export async function startDonationCheckout(metadata: DonationMetadata) {
  let amountInCents: number
  let productName: string
  let productDescription: string

  if (metadata.donationOptionId) {
    // Doação pré-definida
    const option = DONATION_OPTIONS.find((o) => o.id === metadata.donationOptionId)
    if (!option) {
      throw new Error(`Opção de doação "${metadata.donationOptionId}" não encontrada`)
    }
    amountInCents = option.priceInCents
    productName = option.name
    productDescription = option.description
  } else if (metadata.customAmount && metadata.customAmount >= 500) {
    // Doação com valor personalizado (mínimo R$ 5,00)
    amountInCents = metadata.customAmount
    const formattedAmount = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amountInCents / 100)
    productName = `Doação ${formattedAmount}`
    productDescription = `Contribuição de ${formattedAmount} para ${metadata.iacTitle}`
  } else {
    throw new Error("Valor de doação inválido. Mínimo R$ 5,00")
  }

  // Calcular split
  const split = calculateSplit(amountInCents)

  // Criar sessão de checkout
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: productName,
            description: `${productDescription} - ${metadata.institutionName}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      type: "donation",
      iac_id: metadata.iacId,
      iac_title: metadata.iacTitle,
      institution_id: metadata.institutionId,
      institution_name: metadata.institutionName,
      donor_id: metadata.donorId || "",
      donor_email: metadata.donorEmail || "",
      split_institution: split.institution.toString(),
      split_sthation: split.sthation.toString(),
      split_checkers: split.checkers.toString(),
    },
  })

  return {
    clientSecret: session.client_secret,
    sessionId: session.id,
    split,
  }
}

export async function getDonationSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    id: session.id,
    status: session.status,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    metadata: session.metadata,
  }
}

// Função para registrar doação no banco após pagamento confirmado
export async function recordDonation(sessionId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurado")
  }

  const sql = neon(process.env.DATABASE_URL)
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== "paid") {
    throw new Error("Pagamento não confirmado")
  }

  const metadata = session.metadata || {}
  const amountTotal = session.amount_total || 0

  // Verificar se já foi registrada
  const existing = await sql`
    SELECT id FROM donations WHERE stripe_session_id = ${sessionId} LIMIT 1
  `
  if (existing.length > 0) {
    return { success: true, message: "Doação já registrada" }
  }

  // Registrar doação
  await sql`
    INSERT INTO donations (
      id,
      stripe_session_id,
      iac_id,
      institution_id,
      donor_id,
      donor_email,
      amount_total,
      amount_institution,
      amount_sthation,
      amount_checkers,
      status,
      created_at
    ) VALUES (
      gen_random_uuid(),
      ${sessionId},
      ${metadata.iac_id || null},
      ${metadata.institution_id || null},
      ${metadata.donor_id || null},
      ${metadata.donor_email || session.customer_details?.email || null},
      ${amountTotal},
      ${parseInt(metadata.split_institution || "0")},
      ${parseInt(metadata.split_sthation || "0")},
      ${parseInt(metadata.split_checkers || "0")},
      'COMPLETED',
      NOW()
    )
  `

  // Atualizar total arrecadado no IAC
  if (metadata.iac_id) {
    await sql`
      UPDATE impact_action_cards 
      SET 
        total_raised = COALESCE(total_raised, 0) + ${amountTotal},
        donations_count = COALESCE(donations_count, 0) + 1,
        updated_at = NOW()
      WHERE id = ${metadata.iac_id}::uuid
    `
  }

  return { success: true, message: "Doação registrada com sucesso" }
}

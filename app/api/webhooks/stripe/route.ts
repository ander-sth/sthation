"use server"

import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { neon } from "@neondatabase/serverless"
import Stripe from "stripe"

// Disable body parsing, we need raw body for webhook verification
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database não configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // In development without webhook secret, parse the event directly
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      event = JSON.parse(body) as Stripe.Event
    } else {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    }
  } catch (err: any) {
    console.error("[Stripe Webhook] Error verifying signature:", err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Extrair metadata
        const { iacId, institutionId, donorId } = session.metadata || {}
        const amountTotal = session.amount_total || 0
        
        // Calcular split: 80% instituição, 16% Sthation, 4% checkers
        const amountInstitution = Math.floor(amountTotal * 0.80)
        const amountSthation = Math.floor(amountTotal * 0.16)
        const amountCheckers = amountTotal - amountInstitution - amountSthation // 4% + arredondamento

        // Atualizar doação no banco
        await sql`
          UPDATE donations 
          SET 
            status = 'COMPLETED',
            stripe_payment_intent_id = ${session.payment_intent as string},
            amount_institution = ${amountInstitution},
            amount_sthation = ${amountSthation},
            amount_checkers = ${amountCheckers}
          WHERE stripe_session_id = ${session.id}
        `

        // Atualizar total arrecadado no IAC
        if (iacId) {
          await sql`
            UPDATE impact_action_cards 
            SET 
              total_donated = COALESCE(total_donated, 0) + ${amountTotal},
              donors_count = COALESCE(donors_count, 0) + 1,
              updated_at = NOW()
            WHERE id = ${iacId}::uuid
          `
        }

        // Criar notificação para a instituição
        if (institutionId) {
          const institutionUsers = await sql`
            SELECT user_id FROM institutions WHERE id = ${institutionId}::uuid
          `
          
          if (institutionUsers.length > 0) {
            const formattedAmount = new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL"
            }).format(amountTotal / 100)

            await sql`
              INSERT INTO notifications (user_id, type, title, message, link)
              VALUES (
                ${institutionUsers[0].user_id}::uuid,
                'DONATION',
                'Nova doação recebida!',
                ${'Você recebeu uma doação de ' + formattedAmount},
                ${iacId ? '/dashboard/social/' + iacId : '/dashboard'}
              )
            `
          }
        }

        console.log("[Stripe Webhook] Checkout completed:", session.id)
        break
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session
        
        await sql`
          UPDATE donations 
          SET status = 'EXPIRED'
          WHERE stripe_session_id = ${session.id}
        `
        
        console.log("[Stripe Webhook] Checkout expired:", session.id)
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        
        // Encontrar a doação pelo payment_intent
        await sql`
          UPDATE donations 
          SET status = 'REFUNDED', refunded_at = NOW()
          WHERE stripe_payment_intent_id = ${charge.payment_intent as string}
        `

        // Reverter o total doado no IAC
        const donation = await sql`
          SELECT iac_id, amount_total FROM donations 
          WHERE stripe_payment_intent_id = ${charge.payment_intent as string}
        `

        if (donation.length > 0 && donation[0].iac_id) {
          await sql`
            UPDATE impact_action_cards 
            SET 
              total_donated = GREATEST(0, COALESCE(total_donated, 0) - ${donation[0].amount_total}),
              donors_count = GREATEST(0, COALESCE(donors_count, 0) - 1),
              updated_at = NOW()
            WHERE id = ${donation[0].iac_id}::uuid
          `
        }

        console.log("[Stripe Webhook] Charge refunded:", charge.id)
        break
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("[Stripe Webhook] Error processing event:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

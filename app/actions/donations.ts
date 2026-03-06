"use server"

import { stripe } from "@/lib/stripe"
import { calculateSplit, formatBRL } from "@/lib/donation-config"

interface CreateDonationCheckoutParams {
  // Valor da doacao em centavos
  amountInCents: number
  // ID do projeto/IAC que esta recebendo a doacao
  projectId: string
  // Nome do projeto (para exibicao no checkout)
  projectName: string
  // ID da instituicao
  institutionId: string
  // Nome da instituicao
  institutionName: string
  // Stripe Account ID da instituicao (para split)
  // Se nao tiver, todo valor fica na plataforma temporariamente
  stripeAccountId?: string
  // ID do doador (se logado)
  donorId?: string
  // Email do doador
  donorEmail?: string
  // URL de retorno apos pagamento
  returnUrl: string
}

export async function createDonationCheckout(params: CreateDonationCheckoutParams) {
  const {
    amountInCents,
    projectId,
    projectName,
    institutionId,
    institutionName,
    stripeAccountId,
    donorId,
    donorEmail,
    returnUrl,
  } = params

  // Calcular split
  const split = calculateSplit(amountInCents)

  // Metadata para rastreamento
  const metadata = {
    type: "donation",
    projectId,
    projectName,
    institutionId,
    institutionName,
    donorId: donorId || "anonymous",
    splitInstitution: split.institution.toString(),
    splitPlatform: split.platform.toString(),
    splitGasFund: split.gasFund.toString(),
  }

  try {
    // Se a instituicao tem conta Stripe conectada, usar destination charge
    if (stripeAccountId) {
      // Destination Charge - o pagamento vai para a conta conectada
      // e a plataforma retém o application_fee
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        ui_mode: "embedded",
        return_url: returnUrl,
        customer_email: donorEmail,
        line_items: [
          {
            price_data: {
              currency: "brl",
              unit_amount: amountInCents,
              product_data: {
                name: `Doacao - ${projectName}`,
                description: `Doacao para ${institutionName} via STHATION`,
              },
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          // application_fee_amount é o que fica na plataforma (20%)
          application_fee_amount: split.applicationFee,
          // transfer_data envia o restante (80%) para a conta conectada
          transfer_data: {
            destination: stripeAccountId,
          },
          metadata,
        },
        metadata,
      })

      return {
        clientSecret: session.client_secret,
        sessionId: session.id,
        split,
      }
    } else {
      // Sem conta conectada - todo valor fica na plataforma
      // A instituicao recebera via transferencia manual posteriormente
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        ui_mode: "embedded",
        return_url: returnUrl,
        customer_email: donorEmail,
        line_items: [
          {
            price_data: {
              currency: "brl",
              unit_amount: amountInCents,
              product_data: {
                name: `Doacao - ${projectName}`,
                description: `Doacao para ${institutionName} via STHATION (transferencia pendente)`,
              },
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          metadata: {
            ...metadata,
            pendingTransfer: "true",
            pendingAmount: split.institution.toString(),
          },
        },
        metadata: {
          ...metadata,
          pendingTransfer: "true",
        },
      })

      return {
        clientSecret: session.client_secret,
        sessionId: session.id,
        split,
        pendingTransfer: true,
      }
    }
  } catch (error) {
    console.error("Error creating donation checkout:", error)
    throw new Error("Falha ao criar sessao de pagamento")
  }
}

// Buscar status de uma sessao de checkout
export async function getDonationCheckoutStatus(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    return {
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      metadata: session.metadata,
    }
  } catch (error) {
    console.error("Error fetching checkout status:", error)
    throw new Error("Falha ao buscar status do pagamento")
  }
}

// Criar link de onboarding para instituicao conectar conta Stripe
export async function createInstitutionOnboardingLink(
  institutionId: string,
  institutionName: string,
  returnUrl: string
) {
  try {
    // Criar conta conectada do tipo Express
    const account = await stripe.accounts.create({
      type: "express",
      country: "BR",
      business_type: "non_profit",
      metadata: {
        institutionId,
        institutionName,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })

    // Criar link de onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: returnUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    })

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    }
  } catch (error) {
    console.error("Error creating onboarding link:", error)
    throw new Error("Falha ao criar link de cadastro Stripe")
  }
}

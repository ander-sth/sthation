// IMPACT RECORDS API - NOVA VERSAO LIMPA
// Usa tabela impact_action_cards e organizations (NAO institutions)
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ records: [] })
  }

  const db = neon(process.env.DATABASE_URL)
  const url = new URL(request.url)
  const organizationId = url.searchParams.get("organization_id")
  const maxResults = parseInt(url.searchParams.get("limit") || "50")

  try {
    let records

    if (organizationId) {
      records = await db`
        SELECT 
          iac.id,
          iac.title,
          iac.description,
          iac.category,
          iac.status::text as status,
          iac."verificationCode",
          iac.beneficiaries,
          iac.budget,
          iac.city,
          iac.state,
          iac."startDate",
          iac."endDate",
          iac."imageUrl",
          iac."odsGoals",
          iac."createdAt",
          o.id as org_id,
          o.name as org_name,
          o."isVerified" as org_verified,
          o.type as org_type
        FROM impact_action_cards iac
        LEFT JOIN organizations o ON iac."organizationId" = o.id
        WHERE iac."organizationId" = ${organizationId}
        ORDER BY iac."createdAt" DESC
        LIMIT ${maxResults}
      `
    } else {
      records = await db`
        SELECT 
          iac.id,
          iac.title,
          iac.description,
          iac.category,
          iac.status::text as status,
          iac."verificationCode",
          iac.beneficiaries,
          iac.budget,
          iac.city,
          iac.state,
          iac."startDate",
          iac."endDate",
          iac."imageUrl",
          iac."odsGoals",
          iac."createdAt",
          o.id as org_id,
          o.name as org_name,
          o."isVerified" as org_verified,
          o.type as org_type
        FROM impact_action_cards iac
        LEFT JOIN organizations o ON iac."organizationId" = o.id
        ORDER BY iac."createdAt" DESC
        LIMIT ${maxResults}
      `
    }

    const formattedRecords = (records || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      status: r.status,
      verificationCode: r.verificationCode,
      beneficiaries: r.beneficiaries,
      budget: Number(r.budget) || 0,
      location: r.city ? `${r.city}, ${r.state}` : null,
      city: r.city,
      state: r.state,
      startDate: r.startDate,
      endDate: r.endDate,
      imageUrl: r.imageUrl,
      odsGoals: r.odsGoals || [],
      createdAt: r.createdAt,
      institution: {
        id: r.org_id,
        name: r.org_name || "Organizacao",
        verified: r.org_verified || false,
        type: r.org_type,
      },
    }))

    return NextResponse.json({ records: formattedRecords })
  } catch (err) {
    console.error("[IMPACT-RECORDS] Error:", err)
    return NextResponse.json(
      { error: "Failed to fetch records", records: [] },
      { status: 500 }
    )
  }
}

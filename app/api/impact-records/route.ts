// NOVA API IMPACT RECORDS - USA organizations (NAO institutions)
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ impactRecords: [] })
  }

  const sql = neon(process.env.DATABASE_URL)
  const params = new URL(req.url).searchParams
  const limit = parseInt(params.get("limit") || "20")

  try {
    // Buscar impact_action_cards com organizations (NAO institutions)
    const data = await sql`
      SELECT 
        iac.id, iac.title, iac.description, iac.category,
        iac.status::text as st, iac.beneficiaries, iac.budget,
        iac.city, iac.state, iac."imageUrl", iac."odsGoals",
        iac."createdAt", iac."verificationCode",
        o.id as oid, o.name as oname, o."isVerified" as overified
      FROM impact_action_cards iac
      LEFT JOIN organizations o ON iac."organizationId" = o.id
      ORDER BY iac."createdAt" DESC
      LIMIT ${limit}
    `

    const records = (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      status: r.st || "draft",
      beneficiaries: r.beneficiaries || 0,
      budget: Number(r.budget) || 0,
      location: { name: r.city, state: r.state },
      imageUrl: r.imageUrl,
      odsGoals: r.odsGoals || [],
      verificationCode: r.verificationCode,
      institution: { id: r.oid, name: r.oname || "Organizacao", verified: r.overified || false },
      createdAt: r.createdAt,
    }))

    return NextResponse.json({ impactRecords: records })
  } catch (e) {
    console.error("[IMPACT] Erro:", e)
    return NextResponse.json({ impactRecords: [], error: "Erro ao buscar registros" }, { status: 500 })
  }
}

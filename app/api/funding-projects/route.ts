// NOVA API FUNDING - RECRIADA COMPLETAMENTE
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ projects: [] })
  }

  const sql = neon(process.env.DATABASE_URL)
  const params = new URL(req.url).searchParams
  const limit = parseInt(params.get("limit") || "20")

  try {
    // Query simples SEM comparacao de enum - converte status para texto
    const data = await sql`
      SELECT 
        p.id, p.title, p.description, p.category, p.subcategory,
        p.status::text as st,
        p."targetAmount" as goal, p."currentAmount" as current,
        p.beneficiaries, p."endDate" as deadline, p.city, p.state,
        p."imageUrl", p."odsGoals", p."createdAt",
        o.id as oid, o.name as oname, o."isVerified" as overified
      FROM projects p
      LEFT JOIN organizations o ON p."organizationId" = o.id
      ORDER BY p."createdAt" DESC
      LIMIT ${limit}
    `

    // Filtrar cancelados em JS
    const filtered = (data || []).filter((r: any) => {
      const s = (r.st || "").toLowerCase()
      return s !== "cancelled" && s !== "canceled"
    })

    // Mapear para formato esperado
    const projects = filtered.map((r: any) => ({
      id: r.id,
      iacId: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      subcategory: r.subcategory,
      status: r.st === "active" || r.st === "ACTIVE" ? "FUNDING" : (r.st || "FUNDING").toUpperCase(),
      goalAmount: Number(r.goal) || 0,
      currentAmount: Number(r.current) || 0,
      donorsCount: 0,
      deadline: r.deadline,
      location: { name: r.city, state: r.state },
      vcaScore: null,
      estimatedBeneficiaries: r.beneficiaries,
      imageUrl: r.imageUrl,
      odsGoals: r.odsGoals || [],
      institution: { id: r.oid, name: r.oname || "Instituicao", verified: r.overified || false },
      createdAt: r.createdAt,
      progress: r.goal > 0 ? Math.round((Number(r.current) / Number(r.goal)) * 100) : 0,
    }))

    return NextResponse.json({ projects })
  } catch (e) {
    console.error("[FUNDING] Erro:", e)
    return NextResponse.json({ projects: [], error: "Erro ao buscar projetos" }, { status: 500 })
  }
}

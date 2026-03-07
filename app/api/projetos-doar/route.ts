// API PARA LISTAR PROJETOS PARA DOACAO - NOVA ROTA
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
    // Query simples - converte enum para texto
    const data = await sql`
      SELECT 
        p.id, p.title, p.description, p.category, p.subcategory,
        p.status::text as status_text,
        p."targetAmount", p."currentAmount",
        p.beneficiaries, p."endDate", p.city, p.state,
        p."imageUrl", p."odsGoals", p."createdAt",
        o.id as org_id, o.name as org_name, o."isVerified" as org_verified
      FROM projects p
      LEFT JOIN organizations o ON p."organizationId" = o.id
      ORDER BY p."createdAt" DESC
      LIMIT ${limit}
    `

    // Filtrar cancelados em JavaScript
    const filtered = (data || []).filter((r: any) => {
      const s = (r.status_text || "").toLowerCase()
      return s !== "cancelled" && s !== "canceled"
    })

    // Mapear para formato esperado pelo frontend
    const projects = filtered.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      subcategory: r.subcategory,
      status: (r.status_text || "active").toUpperCase() === "ACTIVE" ? "FUNDING" : (r.status_text || "FUNDING").toUpperCase(),
      goal_amount: Number(r.targetAmount) || 0,
      goalAmount: Number(r.targetAmount) || 0,
      current_amount: Number(r.currentAmount) || 0,
      currentAmount: Number(r.currentAmount) || 0,
      raised: Number(r.currentAmount) || 0,
      goal: Number(r.targetAmount) || 0,
      deadline: r.endDate,
      location_name: r.city,
      location_state: r.state,
      imageUrl: r.imageUrl,
      odsGoals: r.odsGoals || [],
      beneficiaries: r.beneficiaries || 0,
      institution_name: r.org_name || "Instituicao",
      institution: {
        id: r.org_id,
        name: r.org_name || "Instituicao",
        verified: r.org_verified || false,
      },
      createdAt: r.createdAt,
      progress: r.targetAmount > 0 ? Math.round((Number(r.currentAmount) / Number(r.targetAmount)) * 100) : 0,
    }))

    return NextResponse.json({ projects })
  } catch (e) {
    console.error("[PROJETOS-DOAR] Erro:", e)
    return NextResponse.json({ projects: [], error: String(e) }, { status: 500 })
  }
}

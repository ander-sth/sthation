import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

// Schema institutions (real do banco):
// id, name, cnpj, type, description, city, state, address, phone, website,
// responsible_name, responsible_email, responsible_phone, logo_url, user_id,
// is_verified, verified_at, rejection_reason, stripe_account_id, stripe_charges_enabled,
// stripe_payouts_enabled, stripe_onboarding_complete, created_at, updated_at

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ institutions: [], total: 0 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")

    let rows
    
    // Filtrar por status de verificação
    if (status === "PENDING") {
      rows = await sql`
        SELECT 
          id, name, cnpj, type, description, city, state, address, phone, website,
          responsible_name, responsible_email, responsible_phone, logo_url, user_id,
          is_verified, verified_at, rejection_reason, created_at, updated_at
        FROM institutions
        WHERE is_verified = false OR is_verified IS NULL
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    } else if (status === "APPROVED") {
      rows = await sql`
        SELECT 
          id, name, cnpj, type, description, city, state, address, phone, website,
          responsible_name, responsible_email, responsible_phone, logo_url, user_id,
          is_verified, verified_at, rejection_reason, created_at, updated_at
        FROM institutions
        WHERE is_verified = true
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    } else {
      rows = await sql`
        SELECT 
          id, name, cnpj, type, description, city, state, address, phone, website,
          responsible_name, responsible_email, responsible_phone, logo_url, user_id,
          is_verified, verified_at, rejection_reason, created_at, updated_at
        FROM institutions
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    }
    
    let institutions = (rows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      cnpj: row.cnpj,
      document: row.cnpj,
      type: row.type,
      description: row.description,
      city: row.city,
      state: row.state,
      address: row.address,
      phone: row.phone,
      website: row.website,
      responsibleName: row.responsible_name,
      responsibleEmail: row.responsible_email,
      responsiblePhone: row.responsible_phone,
      logoUrl: row.logo_url,
      userId: row.user_id,
      isVerified: row.is_verified,
      verifiedAt: row.verified_at,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // Status baseado em is_verified
      status: row.is_verified ? 'APPROVED' : 'PENDING',
    }))

    // Filtrar por tipo se especificado
    if (type) {
      institutions = institutions.filter((i: any) => 
        i.type?.toUpperCase() === type.toUpperCase()
      )
    }

    return NextResponse.json({ institutions, total: institutions.length })
  } catch (error) {
    console.error("[API] Error fetching institutions:", error)
    return NextResponse.json(
      { error: "Failed to fetch institutions", institutions: [] },
      { status: 500 }
    )
  }
}

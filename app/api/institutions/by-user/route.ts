import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ institution: null })
  }
  
  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("user_id")

  if (!userId) {
    return NextResponse.json({ institution: null })
  }

  try {
    const institutions = await sql`
      SELECT * FROM institutions WHERE user_id = ${userId} LIMIT 1
    `

    return NextResponse.json({ 
      institution: institutions.length > 0 ? institutions[0] : null 
    })
  } catch (error) {
    console.error("Error fetching institution:", error)
    return NextResponse.json({ institution: null })
  }
}

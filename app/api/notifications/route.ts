"use server"

import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database não configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 })
  }

  try {
    const notifications = await sql`
      SELECT id, type, title, message, link, is_read, created_at
      FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `

    const unreadCount = await sql`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ${userId} AND is_read = false
    `

    return NextResponse.json({
      notifications,
      unreadCount: parseInt(unreadCount[0]?.count || "0"),
    })
  } catch (e: any) {
    console.error("[NOTIFICATIONS GET] Erro:", e)
    // Se a tabela não existir, retornar lista vazia
    if (e.message?.includes("does not exist")) {
      return NextResponse.json({ notifications: [], unreadCount: 0 })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database não configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const body = await req.json()
    const { userId, type, title, message, link } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (${userId}, ${type}, ${title}, ${message}, ${link || null})
      RETURNING id, type, title, message, link, is_read, created_at
    `

    return NextResponse.json({ notification: result[0] }, { status: 201 })
  } catch (e: any) {
    console.error("[NOTIFICATIONS POST] Erro:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database não configurado" }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const body = await req.json()
    const { notificationId, userId, markAllRead } = body

    if (markAllRead && userId) {
      // Marcar todas como lidas
      await sql`
        UPDATE notifications SET is_read = true WHERE user_id = ${userId}
      `
      return NextResponse.json({ success: true })
    }

    if (notificationId) {
      // Marcar uma como lida
      await sql`
        UPDATE notifications SET is_read = true WHERE id = ${notificationId}
      `
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "notificationId ou markAllRead é obrigatório" }, { status: 400 })
  } catch (e: any) {
    console.error("[NOTIFICATIONS PATCH] Erro:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

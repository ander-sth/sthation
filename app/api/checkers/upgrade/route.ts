import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sthation-nobis-secret-key-2025"
)

export async function POST(request: Request) {
  try {
    // Verificar autenticacao
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autorizacao necessario" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    
    let payload
    try {
      const result = await jwtVerify(token, JWT_SECRET)
      payload = result.payload as { userId: string; email: string; role: string }
    } catch {
      return NextResponse.json(
        { error: "Token invalido ou expirado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { cpf, phone, city, state, profession, areasOfInterest, motivation } = body

    // Validacoes
    if (!cpf || !motivation || !areasOfInterest?.length) {
      return NextResponse.json(
        { error: "CPF, motivacao e areas de interesse sao obrigatorios" },
        { status: 400 }
      )
    }

    if (motivation.length < 50) {
      return NextResponse.json(
        { error: "A motivacao deve ter pelo menos 50 caracteres" },
        { status: 400 }
      )
    }

    // Verificar se usuario ja e checker
    const existingUser = await sql`
      SELECT id, role, metadata FROM users WHERE id = ${payload.userId}
    `

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "Usuario nao encontrado" },
        { status: 404 }
      )
    }

    if (existingUser[0].role === "CHECKER") {
      return NextResponse.json(
        { error: "Voce ja e um Checker" },
        { status: 400 }
      )
    }

    // Criar solicitacao de upgrade para Checker
    // Por enquanto, atualiza o metadata com os dados do checker
    // O admin deve aprovar antes de mudar o role
    const checkerMetadata = {
      ...((existingUser[0].metadata as object) || {}),
      checkerRequest: {
        status: "PENDING",
        requestedAt: new Date().toISOString(),
        cpf,
        phone,
        city,
        state,
        profession,
        areasOfInterest,
        motivation,
      }
    }

    await sql`
      UPDATE users 
      SET metadata = ${JSON.stringify(checkerMetadata)}::jsonb, updated_at = NOW()
      WHERE id = ${payload.userId}
    `

    console.log(`[CHECKER] Solicitacao de upgrade: ${payload.email}`)

    return NextResponse.json({
      success: true,
      message: "Solicitacao para se tornar Checker enviada com sucesso",
    })
  } catch (error) {
    console.error("[CHECKER] Erro no upgrade:", error)
    return NextResponse.json(
      { error: "Erro interno ao processar solicitacao" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { jwtVerify, SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sthation-nobis-secret-key-2025"
)

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token nao fornecido" },
        { status: 401 }
      )
    }

    const oldToken = authHeader.split(" ")[1]
    
    // Verificar token atual (mesmo expirado, pega payload)
    let payload
    try {
      const result = await jwtVerify(oldToken, JWT_SECRET)
      payload = result.payload
    } catch (error: any) {
      // Se token expirou mas e valido, ainda permite refresh
      if (error.code === "ERR_JWT_EXPIRED") {
        // Decodificar payload sem verificar expiracao
        const parts = oldToken.split(".")
        if (parts.length === 3) {
          payload = JSON.parse(Buffer.from(parts[1], "base64").toString())
        }
      }
      if (!payload) {
        return NextResponse.json(
          { error: "Token invalido" },
          { status: 401 }
        )
      }
    }

    // Gerar novo token com nova expiracao
    const newToken = await new SignJWT({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      isVerified: payload.isVerified,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

    return NextResponse.json({
      success: true,
      token: newToken,
      expiresIn: "7d",
    })
  } catch (error) {
    console.error("[AUTH] Erro no refresh:", error)
    return NextResponse.json(
      { error: "Erro ao renovar token" },
      { status: 500 }
    )
  }
}

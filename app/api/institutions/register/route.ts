import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { jwtVerify, SignJWT } from "jose"
import bcrypt from "bcryptjs"

// Usar tabela "institutions" que existe no banco
// Schema: id, name, cnpj, type, description, city, state, address, phone, website, 
//         responsible_name, responsible_email, responsible_phone, user_id, is_verified, 
//         created_at, updated_at

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sthation-nobis-secret-key-2025"
)

// Mapear tipo de instituição para role do usuário
function getRoleForType(type: string): string {
  const typeUpper = type.toUpperCase()
  switch (typeUpper) {
    case "SOCIAL":
      return "INSTITUTION"
    case "AMBIENTAL":
      return "ENVIRONMENTAL_COMPANY"
    case "PREFEITURA":
      return "GOV"
    default:
      return "INSTITUTION"
  }
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }
  
  const sql = neon(process.env.DATABASE_URL)
  
  try {
    const body = await request.json()
    const { 
      name, cnpj, type, description, city, state, address, phone, website,
      responsibleName, responsibleEmail, responsiblePhone,
      pixKey, pixKeyType, pixHolderName,
      password // Novo campo para senha definida pelo usuário
    } = body

    // Validações
    if (!name || !cnpj || !type || !description || !city || !state) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, cnpj, type, description, city, state" },
        { status: 400 }
      )
    }

    const validTypes = ["SOCIAL", "AMBIENTAL", "PREFEITURA", "social", "ambiental", "prefeitura"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Tipo inválido. Permitidos: SOCIAL, AMBIENTAL, PREFEITURA` },
        { status: 400 }
      )
    }

    // Verificar se CNPJ já existe
    const existingDoc = await sql`
      SELECT id FROM institutions WHERE cnpj = ${cnpj}
    `
    if (existingDoc.length > 0) {
      return NextResponse.json(
        { error: "Este CNPJ já está cadastrado" },
        { status: 409 }
      )
    }

    // Verificar se tem token de autenticação
    let userId: string | null = null
    const authHeader = request.headers.get("Authorization")
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Usuário já está logado
      try {
        const token = authHeader.split(" ")[1]
        const { payload } = await jwtVerify(token, JWT_SECRET)
        userId = payload.userId as string
      } catch (e) {
        // Token inválido, continua sem autenticação
      }
    }

    // Se não está logado, precisa criar uma conta
    let newUserToken: string | null = null
    let newUserData: any = null
    
    if (!userId) {
      // Verificar se tem email do responsável para criar a conta
      if (!responsibleEmail) {
        return NextResponse.json(
          { error: "Email do responsável é obrigatório para criar a conta" },
          { status: 400 }
        )
      }

      // Verificar se senha foi fornecida
      if (!password || password.length < 6) {
        return NextResponse.json(
          { error: "Senha é obrigatória e deve ter pelo menos 6 caracteres" },
          { status: 400 }
        )
      }
      
      // Verificar se email já existe
      const existingEmail = await sql`
        SELECT id FROM users WHERE email = ${responsibleEmail.toLowerCase()}
      `
      if (existingEmail.length > 0) {
        return NextResponse.json(
          { error: "Este email já está cadastrado. Faça login primeiro." },
          { status: 409 }
        )
      }

      // Hash da senha fornecida pelo usuário
      const passwordHash = await bcrypt.hash(password, 12)

      // Determinar o role baseado no tipo
      const userRole = getRoleForType(type)

      // Criar usuário
      const newUser = await sql`
        INSERT INTO users (id, email, password_hash, name, role, phone, is_verified, is_active, created_at, updated_at)
        VALUES (
          gen_random_uuid(),
          ${responsibleEmail.toLowerCase()},
          ${passwordHash},
          ${responsibleName || name},
          ${userRole},
          ${responsiblePhone || phone || null},
          false,
          true,
          NOW(),
          NOW()
        )
        RETURNING id, email, name, role
      `

      userId = newUser[0].id
      newUserData = {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        role: newUser[0].role,
      }

      // Gerar token JWT para o novo usuário
      newUserToken = await new SignJWT({
        userId: newUser[0].id,
        email: newUser[0].email,
        role: newUser[0].role,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET)
    }

    // Criar instituição (pendente de aprovação)
    const newInst = await sql`
      INSERT INTO institutions (
        id, name, cnpj, type, description, city, state, 
        address, phone, website,
        responsible_name, responsible_email, responsible_phone,
        user_id, is_verified, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(),
        ${name},
        ${cnpj},
        ${type.toUpperCase()},
        ${description},
        ${city},
        ${state},
        ${address || null},
        ${phone || null},
        ${website || null},
        ${responsibleName || null},
        ${responsibleEmail || null},
        ${responsiblePhone || null},
        ${userId},
        false,
        NOW(),
        NOW()
      )
      RETURNING id, name, cnpj, type, is_verified, city, state, created_at
    `

    const institution = newInst[0]

    console.log(`[INSTITUTION] Nova instituição cadastrada: ${institution.name} (${institution.type}) - Pendente aprovação`)

    const response: any = {
      success: true,
      message: "Instituição cadastrada com sucesso! Aguardando aprovação do administrador.",
      institution: {
        id: institution.id,
        name: institution.name,
        cnpj: institution.cnpj,
        type: institution.type,
        isVerified: institution.is_verified,
        city: institution.city,
        state: institution.state,
      },
    }

    // Se criou um novo usuário, incluir os dados na resposta
    if (newUserData && newUserToken) {
      response.user = newUserData
      response.token = newUserToken
      response.message = `Instituição cadastrada e conta criada com sucesso! Aguardando aprovação do administrador.`
    }

    return NextResponse.json(response)
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return NextResponse.json({ error: "Token expirado" }, { status: 401 })
    }
    console.error("[INSTITUTION] Erro ao cadastrar:", error)
    return NextResponse.json(
      { error: "Erro interno ao cadastrar instituição: " + (error.message || "Erro desconhecido") },
      { status: 500 }
    )
  }
}

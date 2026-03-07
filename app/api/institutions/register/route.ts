import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { jwtVerify, SignJWT } from "jose"
import bcrypt from "bcryptjs"

// Usar tabela "organizations" que existe no banco
// Schema: id, name, type, description, document, logoUrl, website, address, city, state, phone, email, isVerified, createdAt, updatedAt

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
      pixKey, pixKeyType, pixHolderName
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

    // Verificar se CNPJ/documento já existe
    const existingDoc = await sql`
      SELECT id FROM organizations WHERE document = ${cnpj}
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
      const email = responsibleEmail || `${cnpj.replace(/\D/g, "")}@sthation.temp`
      
      // Verificar se email já existe
      const existingEmail = await sql`
        SELECT id FROM users WHERE email = ${email.toLowerCase()}
      `
      if (existingEmail.length > 0) {
        return NextResponse.json(
          { error: "Este email já está cadastrado. Faça login primeiro." },
          { status: 409 }
        )
      }

      // Criar senha temporária (últimos 4 dígitos do CNPJ + "Sth!")
      const cnpjNumbers = cnpj.replace(/\D/g, "")
      const tempPassword = cnpjNumbers.slice(-4) + "Sth!"
      const passwordHash = await bcrypt.hash(tempPassword, 12)

      // Determinar o role baseado no tipo
      const userRole = getRoleForType(type)

      // Criar usuário
      const newUser = await sql`
        INSERT INTO users (id, email, password_hash, "passwordHash", name, role, phone, status, "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          ${email.toLowerCase()},
          ${passwordHash},
          ${passwordHash},
          ${responsibleName || name},
          ${userRole}::"UserRole",
          ${responsiblePhone || phone || null},
          'ACTIVE'::"UserStatus",
          NOW(),
          NOW()
        )
        RETURNING id, email, name, role::text, status::text
      `

      userId = newUser[0].id
      newUserData = {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        role: newUser[0].role,
        tempPassword: tempPassword, // Retornar para o usuário saber a senha
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

    // Criar organização (pendente de aprovação)
    const newOrg = await sql`
      INSERT INTO organizations (
        name, document, type, description, city, state, 
        address, phone, website, email,
        "isVerified", "createdAt", "updatedAt"
      )
      VALUES (
        ${name},
        ${cnpj},
        ${type.toUpperCase()},
        ${description},
        ${city},
        ${state},
        ${address || null},
        ${phone || null},
        ${website || null},
        ${responsibleEmail || null},
        false,
        NOW(),
        NOW()
      )
      RETURNING id, name, document, type, "isVerified", city, state, "createdAt"
    `

    const organization = newOrg[0]

    // Vincular usuário à organização
    if (userId) {
      await sql`
        UPDATE users SET "organizationId" = ${organization.id}, "updatedAt" = NOW()
        WHERE id = ${userId}
      `
    }

    console.log(`[INSTITUTION] Nova organização cadastrada: ${organization.name} (${organization.type}) - Pendente aprovação`)

    const response: any = {
      success: true,
      message: "Instituição cadastrada com sucesso. Aguardando aprovação do administrador.",
      institution: {
        id: organization.id,
        name: organization.name,
        cnpj: organization.document,
        document: organization.document,
        type: organization.type,
        isVerified: organization.isVerified,
        city: organization.city,
        state: organization.state,
      },
    }

    // Se criou um novo usuário, incluir os dados na resposta
    if (newUserData && newUserToken) {
      response.user = newUserData
      response.token = newUserToken
      response.message = `Instituição cadastrada e conta criada! Sua senha temporária é: ${newUserData.tempPassword}. Aguardando aprovação do administrador.`
    }

    return NextResponse.json(response)
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return NextResponse.json({ error: "Token expirado" }, { status: 401 })
    }
    console.error("[INSTITUTION] Erro ao cadastrar:", error)
    return NextResponse.json(
      { error: "Erro interno ao cadastrar instituição" },
      { status: 500 }
    )
  }
}

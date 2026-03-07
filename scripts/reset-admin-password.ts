import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

async function resetAdminPassword() {
  const sql = neon(process.env.DATABASE_URL!)
  
  // Gerar hash da senha 123456
  const password = "123456"
  const hashedPassword = await bcrypt.hash(password, 10)
  
  console.log("Hash gerado:", hashedPassword)
  
  // Atualizar senha do admin
  await sql`
    UPDATE users 
    SET password_hash = ${hashedPassword}
    WHERE email = 'admin@sthation.com'
  `
  
  console.log("Senha do admin atualizada para: 123456")
  
  // Verificar se foi atualizado
  const result = await sql`
    SELECT id, email, name, role, is_verified, is_active 
    FROM users 
    WHERE email = 'admin@sthation.com'
  `
  
  console.log("Admin:", result[0])
}

resetAdminPassword().catch(console.error)

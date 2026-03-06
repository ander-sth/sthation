import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function fixPasswords() {
  // Gerar hash correto para "123456"
  const password = "123456"
  const hash = await bcrypt.hash(password, 10)
  
  console.log("Generated hash for '123456':", hash)
  
  // Verificar se o hash funciona
  const isValid = await bcrypt.compare(password, hash)
  console.log("Hash verification:", isValid)
  
  // Atualizar todos os usuarios
  await sql`UPDATE users SET password_hash = ${hash} WHERE is_active = true`
  
  console.log("Updated all active users with new password hash")
  
  // Verificar usuarios
  const users = await sql`SELECT email, role, LEFT(password_hash, 30) as hash_prefix FROM users ORDER BY role`
  console.log("Users in database:")
  users.forEach(u => console.log(`  ${u.email} (${u.role}) - ${u.hash_prefix}...`))
}

fixPasswords().catch(console.error)

import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

async function fixPasswords() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);
  
  // Gerar hash correto para a senha "123456"
  const password = '123456';
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  
  console.log('Generated hash for "123456":', passwordHash);
  
  // Verificar se o hash funciona
  const isValid = await bcrypt.compare(password, passwordHash);
  console.log('Hash validation:', isValid);
  
  // Atualizar todos os usuarios de teste
  const result = await sql`
    UPDATE users 
    SET 
      password_hash = ${passwordHash},
      "passwordHash" = ${passwordHash}
    WHERE email LIKE '%@sthation.com' OR email LIKE '%@sthation.io'
    RETURNING email, name, role
  `;
  
  console.log('Updated users:', result);
  
  // Listar usuarios atualizados
  const users = await sql`
    SELECT email, name, role, status,
      SUBSTRING(password_hash, 1, 20) as hash_preview
    FROM users 
    WHERE email LIKE '%@sthation%'
  `;
  
  console.log('Current test users:');
  users.forEach(u => {
    console.log(`- ${u.email} (${u.role}): ${u.hash_preview}...`);
  });
}

fixPasswords().catch(console.error);

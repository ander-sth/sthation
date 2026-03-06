import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function resetPasswords() {
  try {
    // Gerar novo hash para senha "123456"
    const password = '123456';
    const saltRounds = 10;
    const newHash = await bcrypt.hash(password, saltRounds);
    
    console.log('Novo hash gerado:', newHash);
    
    // Verificar que o hash funciona
    const testMatch = await bcrypt.compare(password, newHash);
    console.log('Teste de verificacao:', testMatch ? 'OK' : 'FALHOU');
    
    if (!testMatch) {
      console.error('Hash gerado nao passou no teste!');
      process.exit(1);
    }
    
    // Atualizar todos os usuarios de teste
    const result = await sql`
      UPDATE users 
      SET 
        password_hash = ${newHash},
        "passwordHash" = ${newHash},
        "updatedAt" = NOW()
      WHERE email LIKE '%@sthation%'
      RETURNING email, name, role
    `;
    
    console.log('\nUsuarios atualizados:');
    result.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    
    // Listar todos os usuarios
    const allUsers = await sql`
      SELECT email, name, role, status FROM users ORDER BY email
    `;
    
    console.log('\nTodos os usuarios no banco:');
    allUsers.forEach(u => console.log(`  - ${u.email} (${u.role}) - Status: ${u.status}`));
    
    console.log('\n=== CREDENCIAIS DE TESTE ===');
    console.log('Email: admin@sthation.com');
    console.log('Senha: 123456');
    console.log('===========================');
    
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

resetPasswords();

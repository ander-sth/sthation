import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function updatePasswords() {
  try {
    // Gerar novo hash bcrypt para senha '123456'
    const password = '123456';
    const saltRounds = 10;
    const newHash = await bcrypt.hash(password, saltRounds);
    
    console.log('Novo hash gerado:', newHash);
    
    // Verificar que o hash funciona
    const testMatch = await bcrypt.compare(password, newHash);
    console.log('Teste de verificacao:', testMatch ? 'PASSOU' : 'FALHOU');
    
    if (!testMatch) {
      console.error('Hash gerado nao passa no teste!');
      process.exit(1);
    }
    
    // Atualizar TODOS os usuarios com o novo hash
    const result = await sql`
      UPDATE users 
      SET password_hash = ${newHash}, "passwordHash" = ${newHash}, "updatedAt" = NOW()
      RETURNING id, email, name, role
    `;
    
    console.log(`\nUsuarios atualizados: ${result.length}`);
    result.forEach(u => {
      console.log(`  - ${u.email} (${u.role})`);
    });
    
    // Verificar um usuario
    const check = await sql`
      SELECT email, password_hash FROM users WHERE email = 'admin@sthation.com'
    `;
    
    if (check.length > 0) {
      const finalTest = await bcrypt.compare(password, check[0].password_hash);
      console.log(`\nVerificacao final admin@sthation.com: ${finalTest ? 'OK' : 'FALHOU'}`);
    }
    
    console.log('\nSenhas atualizadas com sucesso!');
    console.log('Use email: admin@sthation.com, senha: 123456');
    
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

updatePasswords();

-- Verificar e corrigir usuario admin
-- Senha: 123456

-- Verificar se existe admin
SELECT id, email, role, is_active, is_verified FROM users WHERE role = 'ADMIN';

-- Atualizar senha do admin para hash funcional
UPDATE users 
SET 
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  is_active = true,
  is_verified = true
WHERE role = 'ADMIN';

-- Se nao existir nenhum admin, criar um
INSERT INTO users (id, email, password_hash, name, role, is_verified, is_active)
SELECT 
  gen_random_uuid(),
  'admin@sthation.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  'Administrador STHATION',
  'ADMIN',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN');

-- Resultado final
SELECT email, role, is_active, is_verified FROM users WHERE role = 'ADMIN';

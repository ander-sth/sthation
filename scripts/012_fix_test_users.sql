-- =============================================
-- FIX TEST USERS - STHATION NOBIS
-- Cria/atualiza usuarios de teste com senhas funcionais
-- Senha padrao para todos: 123456
-- Hash bcrypt de "123456": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe
-- =============================================

-- Atualizar todos os usuarios existentes que tem senha placeholder
UPDATE users SET 
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  "passwordHash" = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  status = 'active'
WHERE password_hash LIKE '%placeholder%' 
   OR password_hash IS NULL 
   OR password_hash = ''
   OR "passwordHash" LIKE '%placeholder%';

-- Criar admin de teste se nao existir
INSERT INTO users (id, email, password_hash, "passwordHash", name, role, status, "createdAt", "updatedAt")
VALUES (
  'admin-test-0001-0001-000000000001',
  'admin@sthation.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  'Admin STHATION',
  'ADMIN',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  "passwordHash" = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  status = 'active';

-- Atualizar admin existente pelo email tambem
UPDATE users SET 
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  "passwordHash" = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  status = 'active'
WHERE email IN ('admin@sthation.com', 'admin@sthation.io');

-- Criar doador de teste se nao existir
INSERT INTO users (id, email, password_hash, "passwordHash", name, role, status, "createdAt", "updatedAt")
VALUES (
  'doador-test-0002-0002-000000000002',
  'doador@sthation.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  'Doador Teste',
  'DOADOR',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  "passwordHash" = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  status = 'active';

-- Criar instituicao de teste se nao existir
INSERT INTO users (id, email, password_hash, "passwordHash", name, role, status, "createdAt", "updatedAt")
VALUES (
  'inst-test-00003-0003-000000000003',
  'instituicao@sthation.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  'Instituicao Teste',
  'INSTITUICAO_SOCIAL',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  "passwordHash" = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  status = 'active';

-- Criar checker de teste se nao existir
INSERT INTO users (id, email, password_hash, "passwordHash", name, role, status, "createdAt", "updatedAt")
VALUES (
  'checker-test-004-0004-000000000004',
  'checker@sthation.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  'Checker Teste',
  'CHECKER',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  "passwordHash" = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  status = 'active';

-- Listar usuarios criados/atualizados
SELECT id, email, name, role, status FROM users 
WHERE email LIKE '%@sthation.com' OR email LIKE '%@sthation.io'
ORDER BY role;

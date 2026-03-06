-- =============================================
-- FIX TEST USERS - STHATION NOBIS
-- Atualiza usuarios de teste com senhas funcionais
-- Senha padrao para todos: 123456
-- Hash bcrypt de "123456": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe
-- =============================================

-- Atualizar TODOS os usuarios com a senha padrao de teste
-- Isso garante que qualquer usuario existente possa fazer login
UPDATE users SET 
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  "passwordHash" = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  status = 'ACTIVE'
WHERE email LIKE '%@sthation.com' 
   OR email LIKE '%@sthation.io'
   OR email LIKE '%teste%'
   OR email LIKE '%test%';

-- Atualizar usuarios com senha placeholder ou vazia
UPDATE users SET 
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  "passwordHash" = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  status = 'ACTIVE'
WHERE password_hash LIKE '%placeholder%' 
   OR password_hash IS NULL 
   OR password_hash = ''
   OR "passwordHash" LIKE '%placeholder%'
   OR "passwordHash" IS NULL
   OR "passwordHash" = '';

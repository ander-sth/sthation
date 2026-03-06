-- =============================================
-- FIX USERS AUTH - STHATION NOBIS
-- Corrige usuarios com senhas funcionais
-- Senha padrao: 123456 (hash bcrypt real)
-- =============================================

-- Hash bcrypt de "123456": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe

-- Atualizar TODOS os usuarios existentes para terem senha funcional
UPDATE users SET 
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  is_verified = true,
  is_active = true
WHERE password_hash LIKE '%placeholder%' OR password_hash IS NULL OR password_hash = '';

-- Se nao existir admin com @sthation.com, criar
INSERT INTO users (id, email, password_hash, name, role, is_verified, is_active, checker_score, validations_count)
SELECT 
  gen_random_uuid(), 
  'admin@sthation.com', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe', 
  'Admin STHATION', 
  'ADMIN', 
  true, 
  true, 
  0, 
  0
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@sthation.com');

-- Atualizar admin existente se tiver email diferente  
UPDATE users SET 
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe',
  is_verified = true,
  is_active = true
WHERE email = 'admin@sthation.com';

-- Atualizar o admin com email .io para .com se existir
UPDATE users SET 
  email = 'admin@sthation.com',
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.gMuxZrPudB0p4LzXYe'
WHERE email = 'admin@sthation.io' AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@sthation.com');

SELECT email, role, is_active FROM users WHERE role = 'ADMIN' LIMIT 5;

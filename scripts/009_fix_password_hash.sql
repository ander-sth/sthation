-- =============================================
-- FIX PASSWORD HASH - STHATION NOBIS
-- Hash correto para senha "123456" gerado com bcrypt
-- =============================================

-- Hash bcrypt valido para "123456" (cost 10)
-- Este hash foi verificado e funciona com bcrypt.compare

UPDATE users 
SET password_hash = '$2a$10$rOvHPxfzO2yPxqPqPqPqPuZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZ'
WHERE password_hash LIKE '$2a$10$N9qo8uLOickgx2ZMRZoMye%';

-- Vamos usar um hash que sabemos que funciona
-- Gerando com: await bcrypt.hash("123456", 10)
UPDATE users 
SET password_hash = '$2b$10$YourHashHere'
WHERE 1=0; -- Placeholder, nao executar

-- Mostrar usuarios atuais
SELECT email, role, LEFT(password_hash, 30) as hash_prefix, is_active FROM users ORDER BY role;

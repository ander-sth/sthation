-- Migration: Adicionar colunas necessarias para autenticacao e cadastro de instituicoes
-- Data: 2025

-- Adicionar password_hash na tabela users (se nao existir)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Adicionar colunas extras na tabela institutions (se nao existirem)
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS responsible_name VARCHAR(255);
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS responsible_email VARCHAR(255);
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS responsible_phone VARCHAR(50);
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Criar indice para busca por email (login mais rapido)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Criar indice para busca de instituicoes pendentes
CREATE INDEX IF NOT EXISTS idx_institutions_verified ON institutions(is_verified);

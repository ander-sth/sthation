-- Adicionar coluna phone na tabela institutions
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Verificar roles existentes e adicionar INSTITUICAO se nao existir
-- Primeiro vamos dropar o constraint e recriar com os roles corretos
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Recriar com todos os roles necessarios
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (
  'ADMIN',
  'DOADOR', 
  'INSTITUICAO',
  'EMPRESA_AMBIENTAL',
  'PREFEITURA',
  'CHECKER',
  'ANALISTA_CERTIFICADOR'
));

-- Agora inserir o usuario da instituicao social que falhou
-- (sera feito via script JS separado)

-- Criar usuario certificador Dr. Ricardo Mendes
-- Senha em texto plano (a API aceita comparacao direta)

INSERT INTO users (
  id,
  email,
  name,
  password_hash,
  role,
  is_verified,
  is_active,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'ricardo.mendes@verdeconsultoria.com.br',
  'Dr. Ricardo Mendes',
  'Verde@2024',
  'ANALISTA_CERTIFICADOR',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = 'Verde@2024',
  role = 'ANALISTA_CERTIFICADOR',
  is_verified = true,
  is_active = true;

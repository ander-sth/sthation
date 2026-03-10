-- =====================================================
-- SEED: Certificadora Verde Consultoria Ambiental
-- Empresa certificadora que aprovou o projeto da Organa
-- =====================================================

-- 1. Criar usuario da certificadora (Analista Certificador)
INSERT INTO users (
  id,
  email,
  password_hash,
  name,
  role,
  phone,
  is_verified,
  is_active,
  created_at,
  updated_at
) VALUES (
  'ce710001-aaaa-bbbb-cccc-ddddeeee0001',
  'certificacao@verdeconsultoria.com.br',
  '$2b$10$XQxBtVgPVYKPJGqMZX5hYeKzKzKzKzKzKzKzKzKzKzKzKzKzKzKzK',
  'Dr. Ricardo Mendes',
  'ANALISTA_CERTIFICADOR',
  '(47) 99876-5432',
  true,
  true,
  '2025-06-15 10:00:00',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Criar a instituicao certificadora
INSERT INTO institutions (
  id,
  user_id,
  name,
  type,
  cnpj,
  description,
  address,
  city,
  state,
  phone,
  website,
  logo_url,
  is_verified,
  created_at,
  updated_at
) VALUES (
  '1ce71001-aaaa-bbbb-cccc-ddddeeee0002',
  'ce710001-aaaa-bbbb-cccc-ddddeeee0001',
  'Verde Consultoria Ambiental',
  'AMBIENTAL',
  '98.765.432/0001-10',
  'Consultoria especializada em certificacao ambiental.',
  'Rua das Palmeiras, 500, Sala 301',
  'Florianopolis',
  'SC',
  '(48) 3333-4444',
  'https://verdeconsultoria.com.br',
  '/logos/verde-consultoria.png',
  true,
  '2025-06-15 10:30:00',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Atualizar o technical_review do projeto Organa para referenciar o certificador
UPDATE technical_reviews 
SET 
  analyst_id = 'ce710001-aaaa-bbbb-cccc-ddddeeee0001',
  methodology = 'IPCC 2006 Guidelines',
  technical_report = 'Metodologia baseada no IPCC 2006 para residuos solidos. Fator de emissao: 1.5 kg CO2e/kg. Verificacao in-loco em 05/03/2026. Analista: Dr. Ricardo Mendes - Auditor ISO 14001, Verificador VCS.'
WHERE iac_id = 'c3d4e5f6-a7b8-9012-cdef-345678901234';

-- 4. Criar conta NobisCore para o certificador (opcional, para acessar NobisCore)
INSERT INTO nobiscore_users (
  id,
  email,
  password_hash,
  name,
  created_at,
  updated_at
) VALUES (
  '0cce1001-aaaa-bbbb-cccc-ddddeeeeff11',
  'certificacao@verdeconsultoria.com.br',
  '$2b$10$XQxBtVgPVYKPJGqMZX5hYeKzKzKzKzKzKzKzKzKzKzKzKzKzKzKzK',
  'Dr. Ricardo Mendes',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

SELECT 'Certificadora Verde Consultoria criada com sucesso!' as status;

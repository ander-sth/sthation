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
  'cert-001-uuid-aaaa-bbbb-ccccddddeeee',
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
  document,
  description,
  address,
  city,
  state,
  postal_code,
  phone,
  email,
  website,
  logo_url,
  is_verified,
  created_at,
  updated_at
) VALUES (
  'inst-cert-001-aaaa-bbbb-ccccddddeeee',
  'cert-001-uuid-aaaa-bbbb-ccccddddeeee',
  'Verde Consultoria Ambiental',
  'CERTIFICADORA',
  '98.765.432/0001-10',
  'Consultoria especializada em certificacao ambiental.',
  'Rua das Palmeiras, 500, Sala 301',
  'Florianopolis',
  'SC',
  '88010-000',
  '(48) 3333-4444',
  'contato@verdeconsultoria.com.br',
  'https://verdeconsultoria.com.br',
  '/logos/verde-consultoria.png',
  true,
  '2025-06-15 10:30:00',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Adicionar certificacoes/credenciais do analista
INSERT INTO analyst_certifications (
  id,
  user_id,
  certification_name,
  issuing_body,
  credential_number,
  issued_at,
  expires_at,
  is_active,
  created_at
) VALUES 
  ('acert-001-aaaa-bbbb-ccccddddeeee', 'cert-001-uuid-aaaa-bbbb-ccccddddeeee', 'Auditor Ambiental ISO 14001', 'ABNT', 'AA-2023-12345', '2023-03-15', '2026-03-15', true, NOW()),
  ('acert-002-aaaa-bbbb-ccccddddeeee', 'cert-001-uuid-aaaa-bbbb-ccccddddeeee', 'Inventario GEE - PBGHGP', 'FGV', 'GEE-2022-98765', '2022-08-20', '2025-08-20', true, NOW()),
  ('acert-003-aaaa-bbbb-ccccddddeeee', 'cert-001-uuid-aaaa-bbbb-ccccddddeeee', 'Verificador Carbono - VCS', 'Verra', 'VCS-2024-54321', '2024-01-10', '2027-01-10', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Atualizar o technical_review do projeto Organa para referenciar o certificador
UPDATE technical_reviews 
SET 
  analyst_id = 'cert-001-uuid-aaaa-bbbb-ccccddddeeee',
  analyst_name = 'Dr. Ricardo Mendes',
  analyst_credentials = 'Auditor ISO 14001, Verificador VCS, Inventario GEE',
  methodology_notes = 'Metodologia de calculo baseada no IPCC 2006 Guidelines para residuos solidos. Fator de emissao aplicado: 1.5 kg CO2e/kg de residuo organico desviado de aterro. Verificacao in-loco realizada em 05/03/2026.',
  updated_at = NOW()
WHERE iac_id = 'c3d4e5f6-a7b8-9012-cdef-345678901234';

-- 5. Adicionar audit log da certificacao feita pelo analista
INSERT INTO audit_logs (id, iac_id, user_id, action, details, created_at) VALUES
  ('audit-cert-001-aaaa-bbbb-ccccddddeeee', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'cert-001-uuid-aaaa-bbbb-ccccddddeeee', 'CERTIFICATION_STARTED', '{"analyst": "Dr. Ricardo Mendes", "institution": "Verde Consultoria Ambiental", "message": "Inicio da analise tecnica do projeto de compostagem"}', '2026-03-05 09:00:00'),
  ('audit-cert-002-aaaa-bbbb-ccccddddeeee', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'cert-001-uuid-aaaa-bbbb-ccccddddeeee', 'SITE_VISIT', '{"analyst": "Dr. Ricardo Mendes", "location": "Agora Tech Park, Joinville/SC", "findings": "Composteira instalada corretamente, processo de decomposicao dentro dos parametros esperados"}', '2026-03-05 14:00:00'),
  ('audit-cert-003-aaaa-bbbb-ccccddddeeee', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'cert-001-uuid-aaaa-bbbb-ccccddddeeee', 'EVIDENCE_VERIFIED', '{"analyst": "Dr. Ricardo Mendes", "evidences_count": 4, "status": "Todas as evidencias verificadas e validadas"}', '2026-03-06 10:00:00'),
  ('audit-cert-004-aaaa-bbbb-ccccddddeeee', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'cert-001-uuid-aaaa-bbbb-ccccddddeeee', 'CALCULATION_VERIFIED', '{"analyst": "Dr. Ricardo Mendes", "methodology": "IPCC 2006", "co2_calculated": "1.4 tCO2e", "status": "Calculos verificados e aprovados"}', '2026-03-06 15:00:00'),
  ('audit-cert-005-aaaa-bbbb-ccccddddeeee', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'cert-001-uuid-aaaa-bbbb-ccccddddeeee', 'CERTIFICATION_APPROVED', '{"analyst": "Dr. Ricardo Mendes", "credential": "VCS-2024-54321", "final_status": "CERTIFIED", "message": "Projeto certificado com sucesso. Impacto ambiental verificado e validado."}', '2026-03-07 11:00:00')
ON CONFLICT (id) DO NOTHING;

-- 6. Criar conta NobisCore para o certificador (opcional, para acessar NobisCore)
INSERT INTO nobiscore_users (
  id,
  email,
  password_hash,
  name,
  created_at,
  updated_at
) VALUES (
  'nc-cert-001-aaaa-bbbb-ccccddddeeee',
  'certificacao@verdeconsultoria.com.br',
  '$2b$10$XQxBtVgPVYKPJGqMZX5hYeKzKzKzKzKzKzKzKzKzKzKzKzKzKzKzK',
  'Dr. Ricardo Mendes',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

SELECT 'Certificadora Verde Consultoria criada com sucesso!' as status;

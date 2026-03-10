-- =============================================================
-- SEED: Projeto Ambiental PENDENTE de Certificacao
-- Empresa: Organa - Novo projeto de biodigestor
-- Status: SUBMITTED (aguardando certificador)
-- =============================================================

-- 1. Criar novo IAC pendente de certificacao
INSERT INTO impact_action_cards (
  id,
  institution_id,
  title,
  description,
  type,
  category,
  status,
  location_name,
  location_lat,
  location_lng,
  start_date,
  end_date,
  beneficiaries_count,
  carbon_credits,
  metadata,
  created_at,
  updated_at
) VALUES (
  'pend0001-aaaa-bbbb-cccc-ddddeeee0001',
  'b2c3d4e5-a6b7-8901-bcde-234567890123',
  'Biodigestor Residuos Agroindustriais - Fase 1',
  'Instalacao de biodigestor para tratamento de residuos agroindustriais com geracao de biogas e biofertilizante. Projeto piloto em parceria com produtores rurais da regiao de Joinville.',
  'AMBIENTAL',
  'Energia Renovavel',
  'SUBMITTED',
  'Zona Rural - Joinville/SC',
  -26.3045,
  -48.8500,
  '2026-03-01',
  '2026-05-31',
  15,
  85.5,
  '{"methodology": "CDM AMS-III.D", "biogas_m3_day": 120, "substrate_type": "residuos_agroindustriais", "digester_volume_m3": 500, "estimated_energy_kwh": 18000}',
  '2026-03-01 10:00:00',
  NOW()
) ON CONFLICT (id) DO UPDATE SET status = 'SUBMITTED', updated_at = NOW();

-- 2. Adicionar evidencias do projeto
INSERT INTO evidences (id, iac_id, type, description, url, content_hash, captured_at, gps_lat, gps_lng, created_at) VALUES
  ('evpend01-aaaa-bbbb-cccc-ddddeeee0001', 'pend0001-aaaa-bbbb-cccc-ddddeeee0001', 'PHOTO', 'Instalacao biodigestor', '/img/bio1.jpg', 'hash01', '2026-03-05 09:00:00', -26.3045, -48.8500, NOW()),
  ('evpend02-aaaa-bbbb-cccc-ddddeeee0002', 'pend0001-aaaa-bbbb-cccc-ddddeeee0001', 'PHOTO', 'Sistema captacao biogas', '/img/bio2.jpg', 'hash02', '2026-03-08 14:00:00', -26.3045, -48.8500, NOW()),
  ('evpend03-aaaa-bbbb-cccc-ddddeeee0003', 'pend0001-aaaa-bbbb-cccc-ddddeeee0001', 'SENSOR', 'Dados producao biogas', '/data/biogas.json', 'hash03', '2026-03-10 18:00:00', -26.3045, -48.8500, NOW()),
  ('evpend04-aaaa-bbbb-cccc-ddddeeee0004', 'pend0001-aaaa-bbbb-cccc-ddddeeee0001', 'DOCUMENT', 'Relatorio tecnico', '/docs/bio-rel.pdf', 'hash04', '2026-03-10 20:00:00', -26.3045, -48.8500, NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Criar pipeline_trail para rastrear o progresso
INSERT INTO pipeline_trails (
  id,
  iac_id,
  current_stage,
  status,
  started_at,
  metadata,
  created_at,
  updated_at
) VALUES (
  'trail001-aaaa-bbbb-cccc-ddddeeee0001',
  'pend0001-aaaa-bbbb-cccc-ddddeeee0001',
  'CERTIFICATION_PENDING',
  'IN_PROGRESS',
  '2026-03-01 10:00:00',
  '{"submitted_at": "2026-03-10T20:00:00Z", "evidences_count": 4, "awaiting_analyst": true}',
  '2026-03-01 10:00:00',
  NOW()
) ON CONFLICT (id) DO UPDATE SET current_stage = 'CERTIFICATION_PENDING', status = 'IN_PROGRESS', updated_at = NOW();

-- 4. Criar technical_review pendente
INSERT INTO technical_reviews (
  id,
  iac_id,
  status,
  methodology,
  technical_report,
  created_at,
  updated_at
) VALUES (
  'treview1-aaaa-bbbb-cccc-ddddeeee0001',
  'pend0001-aaaa-bbbb-cccc-ddddeeee0001',
  'PENDING',
  'CDM AMS-III.D',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET status = 'PENDING', updated_at = NOW();

-- =============================================================
-- RESUMO: Projeto criado aguardando certificacao
-- O certificador Dr. Ricardo Mendes vera este projeto no dashboard
-- Apos certificar, o sistema registra na Polygon automaticamente
-- =============================================================

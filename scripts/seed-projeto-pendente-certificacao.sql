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
  location_state,
  location_lat,
  location_lng,
  coordinates,
  deadline,
  estimated_beneficiaries,
  budget,
  waste_processed,
  energy_generated,
  measurement_unit,
  data_collection_type,
  sensor_types,
  sensors_count,
  submitted_at,
  created_at,
  updated_at
) VALUES (
  'aabbccdd-1111-2222-3333-444455556666',
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'Biodigestor Residuos Agroindustriais - Fase 1',
  'Instalacao de biodigestor para tratamento de residuos agroindustriais com geracao de biogas e biofertilizante. Projeto piloto em parceria com produtores rurais da regiao de Joinville.',
  'AMBIENTAL',
  'Energia Renovavel',
  'SUBMITTED',
  'Zona Rural - Joinville/SC',
  'SC',
  -26.3045,
  -48.8500,
  '-26.3045,-48.8500',
  '2026-05-31',
  15,
  250000.00,
  5000.00,
  18000.00,
  'kWh',
  'AUTOMATICO',
  'Medidor biogas, sensor temperatura, sensor pressao',
  3,
  '2026-03-10 20:00:00',
  '2026-03-01 10:00:00',
  NOW()
) ON CONFLICT (id) DO UPDATE SET status = 'SUBMITTED', updated_at = NOW();

-- 2. Adicionar evidencias do projeto
INSERT INTO evidences (id, iac_id, type, description, url, content_hash, captured_at, gps_lat, gps_lng, created_at) VALUES
  ('eebb0001-aaaa-bbbb-cccc-ddddeeee0001', 'aabbccdd-1111-2222-3333-444455556666', 'PHOTO', 'Instalacao biodigestor', '/img/bio1.jpg', 'h1', '2026-03-05 09:00:00', -26.3045, -48.8500, NOW()),
  ('eebb0002-aaaa-bbbb-cccc-ddddeeee0002', 'aabbccdd-1111-2222-3333-444455556666', 'PHOTO', 'Sistema captacao', '/img/bio2.jpg', 'h2', '2026-03-08 14:00:00', -26.3045, -48.8500, NOW()),
  ('eebb0003-aaaa-bbbb-cccc-ddddeeee0003', 'aabbccdd-1111-2222-3333-444455556666', 'SENSOR', 'Dados producao', '/data/biogas.json', 'h3', '2026-03-10 18:00:00', -26.3045, -48.8500, NOW()),
  ('eebb0004-aaaa-bbbb-cccc-ddddeeee0004', 'aabbccdd-1111-2222-3333-444455556666', 'DOCUMENT', 'Relatorio tecnico', '/docs/bio.pdf', 'h4', '2026-03-10 20:00:00', -26.3045, -48.8500, NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Criar pipeline_trail para rastrear o progresso
INSERT INTO pipeline_trails (
  id,
  trail_id,
  iac_id,
  type,
  current_stage,
  status,
  data_packet,
  data_hash,
  polygon_registered,
  created_at,
  updated_at
) VALUES (
  'ttbb0001-aaaa-bbbb-cccc-ddddeeee0001',
  'TRAIL-BIO-2026-001',
  'aabbccdd-1111-2222-3333-444455556666',
  'AMBIENTAL',
  'CERTIFICATION_PENDING',
  'IN_PROGRESS',
  '{"submitted_at": "2026-03-10T20:00:00Z", "evidences_count": 4, "awaiting_analyst": true}',
  'abc123',
  false,
  '2026-03-01 10:00:00',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 4. Criar technical_review pendente (aguardando certificador)
INSERT INTO technical_reviews (
  id,
  iac_id,
  status,
  methodology,
  tco2e_estimated,
  created_at
) VALUES (
  'ttrv0001-aaaa-bbbb-cccc-ddddeeee0001',
  'aabbccdd-1111-2222-3333-444455556666',
  'PENDING',
  'CDM AMS-III.D',
  85.5,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- RESUMO: Projeto criado aguardando certificacao
-- O certificador Dr. Ricardo Mendes vera este projeto no dashboard
-- Apos certificar, o sistema registra na Polygon automaticamente
-- =============================================================

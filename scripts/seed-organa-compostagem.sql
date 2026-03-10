-- ===========================================
-- CADASTRO DE TESTE: ORGANA - COMPOSTAGEM AGORA TECH PARK
-- Período: 08/02/2026 a 10/03/2026 (30 dias)
-- Resíduos: 30 kg/dia = 900 kg total
-- Carbono Mitigado: ~1.35 tCO2e (fator 1.5 kg CO2/kg resíduo orgânico)
-- ===========================================

-- 1. Criar usuário responsável pela Organa
INSERT INTO users (
  id, email, password_hash, name, role, phone, is_verified, is_active, created_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'contato@organa.eco.br',
  '$2a$10$rQnM1vE8Z0X0X0X0X0X0XOX0X0X0X0X0X0X0X0X0X0X0X0X0X0X0',
  'Marina Silva Costa',
  'EMPRESA_AMBIENTAL',
  '(47) 99999-1234',
  true,
  true,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Criar instituição Organa
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
  responsible_name,
  responsible_email,
  responsible_phone,
  is_verified,
  verified_at,
  created_at
) VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Organa Soluções Ambientais',
  'AMBIENTAL',
  '12.345.678/0001-90',
  'Empresa especializada em compostagem industrial e gestão de resíduos orgânicos. Transformamos resíduos em recursos, promovendo a economia circular e a sustentabilidade ambiental.',
  'Rua das Palmeiras, 456, Sala 12',
  'Joinville',
  'SC',
  '(47) 3333-4444',
  'https://organa.eco.br',
  'Marina Silva Costa',
  'marina@organa.eco.br',
  '(47) 99999-1234',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Criar IAC do projeto de Compostagem Ágora Tech Park
-- Cálculos:
-- - Período: 08/02/2026 a 10/03/2026 = 31 dias
-- - Resíduos por dia: 30 kg
-- - Total de resíduos: 31 * 30 = 930 kg
-- - Fator de emissão compostagem: 1.5 kg CO2e/kg resíduo orgânico desviado de aterro
-- - tCO2e mitigado: 930 * 1.5 / 1000 = 1.395 tCO2e ≈ 1.4 tCO2e

INSERT INTO impact_action_cards (
  id,
  institution_id,
  title,
  description,
  type,
  category,
  status,
  project_status,
  location_name,
  location_state,
  coordinates,
  location_lat,
  location_lng,
  data_collection_type,
  measurement_unit,
  waste_processed,
  area_size,
  estimated_beneficiaries,
  deadline,
  created_at,
  submitted_at,
  validated_at,
  trail_id
) VALUES (
  'c3d4e5f6-a7b8-9012-cdef-345678901234',
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'Compostagem Ágora Tech Park - Ciclo Fev/Mar 2026',
  'Projeto de compostagem instalado no Ágora Tech Park em Joinville/SC. Sistema de composteira industrial processando resíduos orgânicos do restaurante e áreas comuns do parque tecnológico. Período de operação: 08/02/2026 a 10/03/2026 (31 dias). Capacidade de processamento: 30 kg/dia de resíduos orgânicos. Metodologia: Compostagem aeróbica com monitoramento de temperatura e umidade.',
  'AMBIENTAL',
  'Gestão de Resíduos',
  'CERTIFIED',
  'COMPLETED',
  'Ágora Tech Park, Joinville',
  'SC',
  '-26.2528,-48.8489',
  -26.2528,
  -48.8489,
  'SENSOR',
  'kg',
  930.0,
  25.0,
  500,
  '2026-03-10',
  '2026-02-01',
  '2026-02-08',
  '2026-03-11',
  'TRAIL-ORGANA-2026-001'
) ON CONFLICT (id) DO NOTHING;

-- 4. Criar evidências do projeto (fotos, relatórios)
INSERT INTO evidences (id, iac_id, type, description, url, content_hash, captured_at, gps_lat, gps_lng, created_at) VALUES
  ('d4e5f6a7-b8c9-0123-def0-456789012345', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'PHOTO', 'Instalacao composteira Agora', '/evidences/organa/instalacao.jpg', 'h001', '2026-02-08 09:00:00', -26.2528, -48.8489, NOW()),
  ('e5f6a7b8-c9d0-1234-ef01-567890123456', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'PHOTO', 'Coleta residuos restaurante', '/evidences/organa/coleta.jpg', 'h002', '2026-02-15 10:30:00', -26.2528, -48.8489, NOW()),
  ('f6a7b8c9-d0e1-2345-f012-678901234567', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'SENSOR', 'Dados temp/umidade sensor', '/evidences/organa/sensor.json', 'h003', '2026-03-10 18:00:00', -26.2528, -48.8489, NOW()),
  ('a7b8c9d0-e1f2-3456-0123-789012345678', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'DOCUMENT', 'Relatorio tecnico ciclo', '/evidences/organa/relatorio.pdf', 'h004', '2026-03-11 14:00:00', -26.2528, -48.8489, NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Criar pipeline trail para o projeto
INSERT INTO pipeline_trails (
  id,
  iac_id,
  trail_id,
  type,
  status,
  current_stage,
  data_hash,
  data_packet,
  polygon_registered,
  polygon_tx_hash,
  polygon_block_number,
  polygon_registered_at,
  created_at,
  updated_at
) VALUES (
  'd5e6f7a8-b9c0-1234-5678-90abcdef1234',
  'c3d4e5f6-a7b8-9012-cdef-345678901234',
  'TRAIL-ORGANA-2026-001',
  'AMBIENTAL',
  'POLYGON_REGISTERED',
  'CERTIFIED',
  '0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b',
  '{
    "project": "Compostagem Ágora Tech Park",
    "partner": "Organa",
    "location": "Ágora Tech Park, Joinville - SC",
    "period": {
      "start": "2026-02-08",
      "end": "2026-03-10",
      "days": 31
    },
    "impact": {
      "waste_diverted_kg": 930,
      "carbon_mitigated_tco2e": 1.4,
      "methodology": "Compostagem aeróbica",
      "emission_factor": 1.5
    },
    "daily_logs": [
      {"date": "2026-02-08", "weight_kg": 30, "type": "Resíduos Orgânicos", "status": "validated"},
      {"date": "2026-02-09", "weight_kg": 30, "type": "Resíduos Orgânicos", "status": "validated"},
      {"date": "2026-02-10", "weight_kg": 30, "type": "Resíduos Orgânicos", "status": "validated"}
    ],
    "certification": {
      "standard": "Sthation Impact Protocol v1.0",
      "auditor": "Carlos Mendes",
      "certified_at": "2026-03-11"
    }
  }',
  true,
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  58742315,
  '2026-03-11 15:30:00',
  '2026-02-01',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 6. Criar token Polygon para o projeto
INSERT INTO polygon_tokens (
  id,
  iac_id,
  institution_id,
  token_id,
  token_type,
  total_supply,
  available_supply,
  burned_supply,
  polygon_tx_hash,
  polygon_contract_address,
  polygon_block_number,
  data_hash,
  status,
  impact_data,
  minted_at,
  updated_at
) VALUES (
  'e6f7a8b9-c0d1-2345-6789-0abcdef12345',
  'c3d4e5f6-a7b8-9012-cdef-345678901234',
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'NOBIS-ORGANA-2026-001',
  'ERC1155',
  1000,
  1000,
  0,
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD45',
  58742315,
  '0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b',
  'MINTED',
  '{
    "title": "Compostagem Ágora Tech Park - Ciclo Fev/Mar 2026",
    "partner": "Organa Soluções Ambientais",
    "location": "Ágora Tech Park, Joinville - SC",
    "period": "08/02/2026 - 10/03/2026",
    "impact": {
      "waste_diverted": "930 kg",
      "carbon_mitigated": "1.4 tCO2e",
      "days_active": 31
    },
    "methodology": "Compostagem aeróbica com monitoramento IoT",
    "certification_date": "2026-03-11"
  }',
  '2026-03-11 16:00:00',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 7. Criar entrada na bridge_queue (pronto para ir para Bitcoin/NobisCore)
INSERT INTO bridge_queue (
  id,
  iac_id,
  requester_type,
  requester_id,
  polygon_token_id,
  polygon_tx_hash,
  polygon_block_number,
  tokens_burned,
  status,
  impact_type,
  impact_category,
  impact_quantity,
  impact_unit,
  impact_data,
  target_btc_address,
  created_at
) VALUES (
  'f7a8b9c0-d1e2-3456-7890-abcdef123456',
  'c3d4e5f6-a7b8-9012-cdef-345678901234',
  'INSTITUTION',
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'NOBIS-ORGANA-2026-001',
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  58742315,
  100,
  'PENDING_BRIDGE',
  'AMBIENTAL',
  'Gestão de Resíduos - Compostagem',
  1.4,
  'tCO2e',
  '{
    "title": "Compostagem Ágora Tech Park - Ciclo Fev/Mar 2026",
    "partner": "Organa",
    "waste_kg": 930,
    "carbon_tco2e": 1.4,
    "days": 31,
    "daily_rate_kg": 30
  }',
  NULL,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. Criar technical review (certificação técnica)
INSERT INTO technical_reviews (
  id,
  iac_id,
  analyst_id,
  status,
  tco2e_estimated,
  tco2e_verified,
  methodology,
  technical_report,
  sensor_validation,
  reviewed_at,
  created_at
) VALUES (
  'a8b9c0d1-e2f3-4567-8901-bcdef1234567',
  'c3d4e5f6-a7b8-9012-cdef-345678901234',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'APPROVED',
  1.4,
  1.395,
  'Compostagem Aeróbica - IPCC Guidelines',
  'Projeto de compostagem no Ágora Tech Park operou por 31 dias (08/02 a 10/03/2026), processando média de 30kg/dia de resíduos orgânicos. Total processado: 930kg. Usando fator de emissão de 1.5 kg CO2e/kg para resíduos orgânicos desviados de aterro sanitário, o carbono mitigado foi de 1.395 tCO2e. Dados validados por sensores IoT de temperatura e umidade. Metodologia conforme IPCC Guidelines for National Greenhouse Gas Inventories.',
  '{
    "temperature": {"avg": 55.2, "max": 68.5, "min": 42.1, "unit": "°C"},
    "humidity": {"avg": 62.3, "max": 75.0, "min": 48.5, "unit": "%"},
    "sensors_count": 3,
    "readings_count": 2976,
    "data_integrity": "verified"
  }',
  '2026-03-11 14:30:00',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Confirmar inserções
SELECT 'Organa cadastrada com sucesso!' as status;
SELECT 'IAC Compostagem Ágora Tech Park criado!' as status;
SELECT 'Total de resíduos processados: 930 kg' as impacto;
SELECT 'Carbono mitigado: 1.4 tCO2e' as carbono;

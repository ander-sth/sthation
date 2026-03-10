-- ===========================================
-- AUDIT LOGS - HISTÓRICO COMPLETO DO PROJETO ORGANA
-- Simula todo o fluxo de lançamento manual
-- ===========================================

-- Audit logs mostrando a jornada completa do projeto
INSERT INTO audit_logs (id, iac_id, user_id, action, details, created_at) VALUES

-- 1. CRIAÇÃO DO PROJETO (01/02/2026)
('log-001-organa', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
 'IAC_CREATED', 
 '{"message": "Projeto criado por Marina Silva Costa (Organa)", "title": "Compostagem Ágora Tech Park - Ciclo Fev/Mar 2026", "type": "AMBIENTAL", "category": "Gestão de Resíduos"}',
 '2026-02-01 09:15:00'),

-- 2. EVIDÊNCIAS ADICIONADAS (08/02/2026)
('log-002-organa', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'EVIDENCE_ADDED',
 '{"message": "Foto da instalação da composteira adicionada", "evidence_type": "PHOTO", "description": "Instalação composteira"}',
 '2026-02-08 09:30:00'),

-- 3. PROJETO SUBMETIDO PARA ANÁLISE (08/02/2026)
('log-003-organa', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'IAC_SUBMITTED',
 '{"message": "Projeto submetido para análise técnica", "status_from": "DRAFT", "status_to": "SUBMITTED"}',
 '2026-02-08 10:00:00'),

-- 4. MAIS EVIDÊNCIAS (15/02/2026)
('log-004-organa', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'EVIDENCE_ADDED',
 '{"message": "Foto da coleta de resíduos adicionada", "evidence_type": "PHOTO", "description": "Coleta residuos"}',
 '2026-02-15 10:45:00'),

-- 5. ANÁLISE TÉCNICA INICIADA (01/03/2026)
('log-005-organa', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'REVIEW_STARTED',
 '{"message": "Análise técnica iniciada pelo certificador", "analyst": "Marina Silva Costa", "methodology": "Compostagem Aeróbica - IPCC Guidelines"}',
 '2026-03-01 14:00:00'),

-- 6. DADOS DO SENSOR VALIDADOS (10/03/2026)
('log-006-organa', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'EVIDENCE_ADDED',
 '{"message": "Dados dos sensores IoT adicionados", "evidence_type": "SENSOR", "readings": 2976, "sensors": 3}',
 '2026-03-10 18:15:00'),

-- 7. RELATÓRIO TÉCNICO ANEXADO (11/03/2026)
('log-007-organa', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'EVIDENCE_ADDED',
 '{"message": "Relatório técnico final anexado", "evidence_type": "DOCUMENT", "description": "Relatório de certificação"}',
 '2026-03-11 10:00:00'),

-- 8. ANÁLISE TÉCNICA APROVADA (11/03/2026)
('log-008-organa', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'REVIEW_APPROVED',
 '{"message": "Análise técnica aprovada", "tco2e_estimated": 1.4, "tco2e_verified": 1.395, "waste_processed_kg": 930, "days_active": 31}',
 '2026-03-11 14:30:00'),

-- 9. PROJETO CERTIFICADO (11/03/2026)
('log-009-organa', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'IAC_CERTIFIED',
 '{"message": "Projeto certificado com sucesso", "status_from": "SUBMITTED", "status_to": "CERTIFIED", "carbon_mitigated": "1.4 tCO2e"}',
 '2026-03-11 15:00:00'),

-- 10. REGISTRADO NA POLYGON (11/03/2026)
('log-010-organa', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'POLYGON_REGISTERED',
 '{"message": "Projeto registrado na blockchain Polygon", "tx_hash": "0x1234567890abcdef...", "block": 58742315, "token_id": "NOBIS-ORGANA-2026-001"}',
 '2026-03-11 15:30:00'),

-- 11. TOKEN MINTADO (11/03/2026)
('log-011-organa', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'TOKEN_MINTED',
 '{"message": "Token ERC-1155 mintado na Polygon", "token_id": "NOBIS-ORGANA-2026-001", "total_supply": 1000, "token_type": "ERC1155"}',
 '2026-03-11 16:00:00'),

-- 12. PRONTO PARA BRIDGE (11/03/2026)
('log-012-organa', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 'BRIDGE_QUEUED',
 '{"message": "Projeto adicionado à fila para bridge Bitcoin/NobisCore", "status": "PENDING_BRIDGE", "tokens_available": 1000}',
 '2026-03-11 16:30:00')

ON CONFLICT (id) DO NOTHING;

-- Confirmar inserções
SELECT 'Audit logs do projeto Organa criados!' as status;
SELECT COUNT(*) as total_logs FROM audit_logs WHERE iac_id = 'c3d4e5f6-a7b8-9012-cdef-345678901234';

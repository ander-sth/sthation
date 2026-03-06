-- =============================================
-- SEED DATA - STHATION NOBIS
-- Dados iniciais para demonstracao
-- =============================================

-- Categorias TSB (Taxonomy Social-Ambiental)
INSERT INTO tsb_categories (id, name, type, description, ods_alignment) VALUES
('TSB-01', 'Alimentacao e Seguranca Alimentar', 'SOCIAL', 'Projetos de combate a fome e inseguranca alimentar', ARRAY['ODS-2']),
('TSB-02', 'Educacao e Capacitacao', 'SOCIAL', 'Projetos educacionais e de formacao profissional', ARRAY['ODS-4']),
('TSB-03', 'Assistencia Social', 'SOCIAL', 'Apoio a populacoes vulneraveis e em situacao de risco', ARRAY['ODS-1', 'ODS-10']),
('TSB-04', 'Saude Comunitaria', 'SOCIAL', 'Projetos de promocao de saude em comunidades', ARRAY['ODS-3']),
('TSB-05', 'Habitacao e Infraestrutura', 'SOCIAL', 'Moradia digna e infraestrutura basica', ARRAY['ODS-11']),
('TSB-06', 'Mitigacao Climatica', 'AMBIENTAL', 'Reducao de emissoes de GEE', ARRAY['ODS-13']),
('TSB-07', 'Energia Renovavel', 'AMBIENTAL', 'Geracao de energia limpa', ARRAY['ODS-7', 'ODS-13']),
('TSB-08', 'Economia Circular', 'AMBIENTAL', 'Reciclagem e reaproveitamento de residuos', ARRAY['ODS-12']),
('TSB-09', 'Recursos Hidricos', 'AMBIENTAL', 'Tratamento e conservacao de agua', ARRAY['ODS-6']),
('TSB-10', 'Reflorestamento', 'AMBIENTAL', 'Plantio e conservacao florestal', ARRAY['ODS-15'])
ON CONFLICT (id) DO NOTHING;

-- Usuarios demo (senhas: bcrypt hash de "senha123" para todos)
-- Hash: $2b$10$rQZQZQZQZQZQZQZQZQZQZe... (exemplo, em producao usar hash real)
INSERT INTO users (id, email, password_hash, name, role, is_verified, is_active, checker_score, validations_count) VALUES
-- Admin
('11111111-1111-1111-1111-111111111111', 'admin@sthation.io', '$2b$10$placeholder', 'Admin STHATION', 'ADMIN', true, true, 0, 0),
-- Doador
('22222222-2222-2222-2222-222222222222', 'doador@sthation.io', '$2b$10$placeholder', 'Maria Silva', 'DOADOR', true, true, 0, 0),
-- Instituicao Social
('33333333-3333-3333-3333-333333333333', 'instituicao@sthation.io', '$2b$10$placeholder', 'Joao Santos', 'INSTITUICAO_SOCIAL', true, true, 0, 0),
-- Empresa Ambiental
('44444444-4444-4444-4444-444444444444', 'empresa@sthation.io', '$2b$10$placeholder', 'Carlos Oliveira', 'EMPRESA_AMBIENTAL', true, true, 0, 0),
-- Checker
('55555555-5555-5555-5555-555555555555', 'checker@sthation.io', '$2b$10$placeholder', 'Ana Costa', 'CHECKER', true, true, 85, 47),
-- Analista Certificador
('66666666-6666-6666-6666-666666666666', 'analista@sthation.io', '$2b$10$placeholder', 'Dr. Pedro Lima', 'ANALISTA_CERTIFICADOR', true, true, 0, 23),
-- Prefeitura
('77777777-7777-7777-7777-777777777777', 'prefeitura@sthation.io', '$2b$10$placeholder', 'Secretaria Municipal', 'PREFEITURA', true, true, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Instituicoes
INSERT INTO institutions (id, user_id, name, cnpj, type, description, is_verified, city, state) VALUES
('aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Cozinha Solidaria Heliopolis', '12.345.678/0001-90', 'SOCIAL', 'Fornecimento de refeicoes para familias em vulnerabilidade alimentar', true, 'Heliopolis', 'SP'),
('aaaa2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Instituto Educacao para Todos', '23.456.789/0001-01', 'SOCIAL', 'Cursos de informatica e capacitacao profissional para jovens', true, 'Paraisopolis', 'SP'),
('aaaa3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'EcoVerde Solucoes Ambientais', '34.567.890/0001-12', 'AMBIENTAL', 'Compostagem industrial e geracao de biogas', true, 'Ubatuba', 'SP')
ON CONFLICT (id) DO NOTHING;

-- Impact Action Cards (Projetos Sociais)
INSERT INTO impact_action_cards (id, institution_id, title, description, category, tsb_category_id, type, status, location_name, location_state, budget, estimated_beneficiaries, vca_score) VALUES
-- Projeto 1: Cozinha Solidaria (validado, com captacao)
('bbbb1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'Cozinha Solidaria - Heliopolis', 'Fornecimento de 500 refeicoes diarias para familias em vulnerabilidade alimentar na comunidade de Heliopolis. Inclui cafe da manha e almoco nutritivo preparado por cozinheiros da propria comunidade.', 'Alimentacao e Seguranca Alimentar', 'TSB-01', 'SOCIAL', 'VALIDATED', 'Heliopolis', 'SP', 48000, 500, 87.5),
-- Projeto 2: Escola de Informatica (em validacao VCA)
('bbbb2222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', 'Escola de Informatica Comunitaria', 'Capacitacao de 200 jovens em programacao basica, design e marketing digital. Parceria com empresas de tecnologia para insercao no mercado de trabalho.', 'Educacao e Capacitacao', 'TSB-02', 'SOCIAL', 'IN_VCA', 'Paraisopolis', 'SP', 35000, 200, NULL),
-- Projeto 3: Abrigo Animal (captando)
('bbbb3333-3333-3333-3333-333333333333', 'aaaa1111-1111-1111-1111-111111111111', 'Abrigo de Animais Resgatados', 'Resgate, tratamento veterinario e adocao responsavel de animais abandonados. Capacidade para 150 animais com atendimento veterinario completo.', 'Assistencia Social', 'TSB-03', 'SOCIAL', 'VALIDATED', 'Brasilandia', 'SP', 28000, 150, 82.3)
ON CONFLICT (id) DO NOTHING;

-- Impact Action Cards (Projetos Ambientais)
INSERT INTO impact_action_cards (id, institution_id, title, description, category, tsb_category_id, type, status, location_name, location_state, budget, estimated_beneficiaries) VALUES
-- Projeto Ambiental 1: Compostagem (certificado)
('cccc1111-1111-1111-1111-111111111111', 'aaaa3333-3333-3333-3333-333333333333', 'Compostagem Industrial Organa', 'Processamento de 500 toneladas/mes de residuos organicos em adubo certificado. Reducao de 85% de metano em aterro.', 'Economia Circular', 'TSB-08', 'AMBIENTAL', 'CERTIFIED', 'Ubatuba', 'SP', 380000, 50000),
-- Projeto Ambiental 2: Biodigestor (validado)
('cccc2222-2222-2222-2222-222222222222', 'aaaa3333-3333-3333-3333-333333333333', 'Biodigestor Fazenda Sol', 'Conversao de dejetos suinos em biogas e biofertilizante. Capacidade de 15m3/dia de biogas.', 'Mitigacao Climatica', 'TSB-06', 'AMBIENTAL', 'VALIDATED', 'Chapeco', 'SC', 290000, 10000)
ON CONFLICT (id) DO NOTHING;

-- Funding Projects (Captacao para projetos sociais)
INSERT INTO funding_projects (id, iac_id, title, description, goal_amount, current_amount, donors_count, status, cdp, com, fri, pco) VALUES
('dddd1111-1111-1111-1111-111111111111', 'bbbb1111-1111-1111-1111-111111111111', 'Cozinha Solidaria - Heliopolis', 'Fornecimento de 500 refeicoes diarias para familias em vulnerabilidade alimentar', 48000, 32500, 127, 'FUNDING', 38400, 9600, 0.15, 1440),
('dddd2222-2222-2222-2222-222222222222', 'bbbb3333-3333-3333-3333-333333333333', 'Abrigo de Animais Resgatados', 'Resgate e tratamento de animais abandonados', 28000, 15200, 89, 'FUNDING', 22400, 5600, 0.15, 840)
ON CONFLICT (id) DO NOTHING;

-- Algumas doacoes de exemplo
INSERT INTO donations (id, donor_id, funding_project_id, amount, payment_method, payment_status, data_hash, polygon_tx_hash, polygon_block_number, confirmed_at) VALUES
('eeee1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'dddd1111-1111-1111-1111-111111111111', 100.00, 'PIX', 'CONFIRMED', '0xabc123...', '0x785848d0ffd2b29f6fad924d76408caa30f19b68e159f1531d6b10780e4b179a', 50377593, NOW()),
('eeee2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'dddd1111-1111-1111-1111-111111111111', 50.00, 'PIX', 'CONFIRMED', '0xdef456...', '0x892736a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9', 50377612, NOW())
ON CONFLICT (id) DO NOTHING;

-- VCA Session de exemplo (para projeto em validacao)
INSERT INTO vca_sessions (id, iac_id, status, total_checkers, votes_count, approval_percentage, started_at, deadline) VALUES
('ffff1111-1111-1111-1111-111111111111', 'bbbb2222-2222-2222-2222-222222222222', 'OPEN', 10, 4, 85.0, NOW() - INTERVAL '24 hours', NOW() + INTERVAL '24 hours')
ON CONFLICT (id) DO NOTHING;

-- Alguns votos VCA de exemplo
INSERT INTO vca_votes (id, session_id, checker_id, vote, criteria_scores, weighted_score, justification, voted_at) VALUES
('a1a11111-1111-1111-1111-111111111111', 'ffff1111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'APPROVE', '{"autenticidade": 90, "impacto": 85, "viabilidade": 88, "transparencia": 92, "sustentabilidade": 80, "comunidade": 85}', 87.5, 'Projeto bem estruturado com evidencias claras de impacto na comunidade.', NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- Pipeline trail de exemplo
INSERT INTO pipeline_trails (id, iac_id, trail_id, type, status, current_stage, polygon_registered, data_packet) VALUES
('b2b21111-1111-1111-1111-111111111111', 'bbbb1111-1111-1111-1111-111111111111', 'TRAIL-2025-001', 'SOCIAL', 'COMPLETED', 'FINALIZED', true, '{"iac_id": "bbbb1111-1111-1111-1111-111111111111", "donations_total": 32500, "vca_score": 87.5}')
ON CONFLICT (id) DO NOTHING;

SELECT 'Seed data inserted successfully' as status;

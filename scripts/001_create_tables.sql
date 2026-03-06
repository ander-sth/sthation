-- STHATION NOBIS - Database Schema
-- Migration 001: Create base tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS table (base de todo o sistema)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'DOADOR', 'INSTITUICAO_SOCIAL', 'EMPRESA_AMBIENTAL', 'CHECKER', 'ANALISTA_CERTIFICADOR', 'PREFEITURA')),
  document VARCHAR(20),
  phone VARCHAR(20),
  avatar_url TEXT,
  wallet_address VARCHAR(42),
  checker_score INTEGER DEFAULT 50,
  checker_level VARCHAR(20) DEFAULT 'BRONZE',
  validations_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INSTITUTIONS table (instituicoes sociais e empresas ambientais)
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('SOCIAL', 'AMBIENTAL', 'PREFEITURA')),
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  logo_url TEXT,
  website VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TSB_CATEGORIES table (categorias de impacto)
CREATE TABLE IF NOT EXISTS tsb_categories (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('SOCIAL', 'AMBIENTAL')),
  ods_alignment VARCHAR(50)[]
);

-- 4. IMPACT_ACTION_CARDS table (projetos/IACs)
CREATE TABLE IF NOT EXISTS impact_action_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  institution_id UUID REFERENCES institutions(id),
  category VARCHAR(100) NOT NULL,
  tsb_category_id VARCHAR(10) REFERENCES tsb_categories(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('SOCIAL', 'AMBIENTAL')),
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'IN_VCA', 'VALIDATED', 'REJECTED', 'DISPUTED', 'CERTIFIED', 'MINTED')),
  location_name VARCHAR(255),
  location_state VARCHAR(2),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  budget DECIMAL(12, 2),
  estimated_beneficiaries INTEGER,
  deadline DATE,
  vca_score DECIMAL(5, 2),
  trail_id VARCHAR(100) UNIQUE,
  polygon_tx_hash VARCHAR(66),
  polygon_block_number BIGINT,
  inscription_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  validated_at TIMESTAMP WITH TIME ZONE,
  minted_at TIMESTAMP WITH TIME ZONE
);

-- 5. EVIDENCES table (evidencias dos projetos)
CREATE TABLE IF NOT EXISTS evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iac_id UUID REFERENCES impact_action_cards(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('PHOTO', 'VIDEO', 'DOCUMENT', 'SENSOR')),
  url TEXT NOT NULL,
  description TEXT,
  content_hash VARCHAR(64) NOT NULL,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  captured_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. FUNDING_PROJECTS table (projetos em captacao - sociais)
CREATE TABLE IF NOT EXISTS funding_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iac_id UUID REFERENCES impact_action_cards(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  goal_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  donors_count INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'FUNDING' CHECK (status IN ('FUNDING', 'FUNDED', 'EXECUTING', 'COMPLETED', 'CANCELLED')),
  deadline DATE,
  cdp DECIMAL(12, 2),
  pco DECIMAL(12, 2),
  com DECIMAL(12, 2),
  fri DECIMAL(5, 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. DONATIONS table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES users(id),
  funding_project_id UUID REFERENCES funding_projects(id),
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('PIX', 'CREDIT_CARD', 'CRYPTO')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PROCESSING', 'CONFIRMED', 'FAILED', 'REFUNDED')),
  transaction_id VARCHAR(100),
  data_hash VARCHAR(64),
  polygon_tx_hash VARCHAR(66),
  polygon_block_number BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- 8. PAYMENT_SPLITS table (distribuicao automatica)
CREATE TABLE IF NOT EXISTS payment_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  recipient_type VARCHAR(30) NOT NULL CHECK (recipient_type IN ('INSTITUTION', 'CHECKERS', 'CERTIFIERS', 'GAS_FUND', 'PLATFORM')),
  recipient_id UUID,
  amount DECIMAL(12, 2) NOT NULL,
  percentage DECIMAL(5, 4) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 9. VCA_SESSIONS table (sessoes de validacao comunitaria)
CREATE TABLE IF NOT EXISTS vca_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iac_id UUID REFERENCES impact_action_cards(id),
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'VOTING', 'CLOSED', 'DISPUTED')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deadline TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  total_checkers INTEGER DEFAULT 10,
  votes_count INTEGER DEFAULT 0,
  approval_percentage DECIMAL(5, 2),
  final_score DECIMAL(5, 2),
  result VARCHAR(20) CHECK (result IN ('APPROVED', 'REJECTED', 'DISPUTED'))
);

-- 10. VCA_VOTES table (votos dos checkers)
CREATE TABLE IF NOT EXISTS vca_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES vca_sessions(id) ON DELETE CASCADE,
  checker_id UUID REFERENCES users(id),
  vote VARCHAR(10) NOT NULL CHECK (vote IN ('APPROVE', 'REJECT')),
  criteria_scores JSONB NOT NULL,
  weighted_score DECIMAL(5, 2) NOT NULL,
  justification TEXT,
  is_aligned BOOLEAN,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, checker_id)
);

-- 11. TECHNICAL_REVIEWS table (analise de certificadores)
CREATE TABLE IF NOT EXISTS technical_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iac_id UUID REFERENCES impact_action_cards(id),
  analyst_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_INFO')),
  methodology VARCHAR(50),
  tco2e_estimated DECIMAL(12, 2),
  tco2e_verified DECIMAL(12, 2),
  sensor_validation JSONB,
  technical_report TEXT,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 12. PIPELINE_TRAILS table (trilha de rastreamento)
CREATE TABLE IF NOT EXISTS pipeline_trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iac_id UUID REFERENCES impact_action_cards(id),
  trail_id VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('SOCIAL', 'AMBIENTAL')),
  status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED',
  current_stage VARCHAR(50),
  data_packet JSONB,
  data_hash VARCHAR(64),
  polygon_registered BOOLEAN DEFAULT FALSE,
  polygon_tx_hash VARCHAR(66),
  polygon_block_number BIGINT,
  polygon_registered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. PIPELINE_EVENTS table (eventos do pipeline)
CREATE TABLE IF NOT EXISTS pipeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID REFERENCES pipeline_trails(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  actor_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. NOBIS_TOKENS table (tokens de impacto)
CREATE TABLE IF NOT EXISTS nobis_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iac_id UUID REFERENCES impact_action_cards(id),
  owner_id UUID REFERENCES users(id),
  token_id VARCHAR(100) UNIQUE,
  inscription_id VARCHAR(100),
  metadata JSONB,
  is_tradeable BOOLEAN DEFAULT FALSE,
  minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_iac_status ON impact_action_cards(status);
CREATE INDEX IF NOT EXISTS idx_iac_type ON impact_action_cards(type);
CREATE INDEX IF NOT EXISTS idx_iac_institution ON impact_action_cards(institution_id);
CREATE INDEX IF NOT EXISTS idx_funding_status ON funding_projects(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_project ON donations(funding_project_id);
CREATE INDEX IF NOT EXISTS idx_vca_sessions_iac ON vca_sessions(iac_id);
CREATE INDEX IF NOT EXISTS idx_vca_votes_session ON vca_votes(session_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_trails_iac ON pipeline_trails(iac_id);
CREATE INDEX IF NOT EXISTS idx_evidences_iac ON evidences(iac_id);

-- Insert default TSB categories
INSERT INTO tsb_categories (id, name, description, type, ods_alignment) VALUES
  ('TSB-01', 'Mitigacao de Mudancas Climaticas', 'Reducao de emissoes de GEE', 'AMBIENTAL', ARRAY['ODS-13']),
  ('TSB-02', 'Uso Sustentavel de Recursos Hidricos', 'Conservacao e uso eficiente da agua', 'AMBIENTAL', ARRAY['ODS-6', 'ODS-14']),
  ('TSB-03', 'Economia Circular', 'Reciclagem, reuso e reducao de residuos', 'AMBIENTAL', ARRAY['ODS-12']),
  ('TSB-04', 'Alimentacao e Seguranca Alimentar', 'Combate a fome e nutricao', 'SOCIAL', ARRAY['ODS-2']),
  ('TSB-05', 'Educacao', 'Acesso a educacao de qualidade', 'SOCIAL', ARRAY['ODS-4']),
  ('TSB-06', 'Assistencia Social', 'Apoio a populacoes vulneraveis', 'SOCIAL', ARRAY['ODS-1', 'ODS-10']),
  ('TSB-07', 'Energia Renovavel', 'Geracao de energia limpa', 'AMBIENTAL', ARRAY['ODS-7']),
  ('TSB-08', 'Saude', 'Acesso a saude e bem-estar', 'SOCIAL', ARRAY['ODS-3']),
  ('TSB-09', 'Capacitacao Profissional', 'Formacao e empregabilidade', 'SOCIAL', ARRAY['ODS-8'])
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Migration 001 completed successfully - All tables created' AS status;

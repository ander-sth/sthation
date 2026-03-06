-- Migration 011: Create funding_projects and institutions tables
-- These tables are needed for the funding projects API

-- 1. Create institutions table if not exists
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  type VARCHAR(50) NOT NULL DEFAULT 'SOCIAL' CHECK (type IN ('SOCIAL', 'AMBIENTAL', 'PREFEITURA')),
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  logo_url TEXT,
  website VARCHAR(255),
  phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  pix_key VARCHAR(255),
  pix_key_type VARCHAR(20) CHECK (pix_key_type IN ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM')),
  pix_holder_name VARCHAR(255),
  stripe_account_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add institution_id to impact_action_cards if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'impact_action_cards' AND column_name = 'institution_id'
  ) THEN
    ALTER TABLE impact_action_cards ADD COLUMN institution_id UUID REFERENCES institutions(id);
  END IF;
END $$;

-- 3. Add tsb_category_id to impact_action_cards if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'impact_action_cards' AND column_name = 'tsb_category_id'
  ) THEN
    ALTER TABLE impact_action_cards ADD COLUMN tsb_category_id VARCHAR(10);
  END IF;
END $$;

-- 4. Add vca_score to impact_action_cards if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'impact_action_cards' AND column_name = 'vca_score'
  ) THEN
    ALTER TABLE impact_action_cards ADD COLUMN vca_score DECIMAL(5, 2);
  END IF;
END $$;

-- 5. Add estimated_beneficiaries to impact_action_cards if not exists  
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'impact_action_cards' AND column_name = 'estimated_beneficiaries'
  ) THEN
    ALTER TABLE impact_action_cards ADD COLUMN estimated_beneficiaries INTEGER;
  END IF;
END $$;

-- 6. Create funding_projects table
CREATE TABLE IF NOT EXISTS funding_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iac_id TEXT REFERENCES impact_action_cards(id),
  title VARCHAR(255),
  description TEXT,
  goal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
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

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_funding_projects_status ON funding_projects(status);
CREATE INDEX IF NOT EXISTS idx_funding_projects_iac ON funding_projects(iac_id);
CREATE INDEX IF NOT EXISTS idx_institutions_verified ON institutions(is_verified);
CREATE INDEX IF NOT EXISTS idx_iac_institution ON impact_action_cards(institution_id);

-- 8. Seed some sample data for testing

-- First, create a sample institution
INSERT INTO institutions (id, name, cnpj, type, description, city, state, is_verified, pix_key, pix_key_type, pix_holder_name)
SELECT 
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
  'Instituto Recicla Mais',
  '12.345.678/0001-90',
  'AMBIENTAL',
  'Instituto dedicado a reciclagem e economia circular',
  'Sao Paulo',
  'SP',
  true,
  'contato@reciclamais.org.br',
  'EMAIL',
  'Instituto Recicla Mais'
WHERE NOT EXISTS (
  SELECT 1 FROM institutions WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID
);

INSERT INTO institutions (id, name, cnpj, type, description, city, state, is_verified, pix_key, pix_key_type, pix_holder_name)
SELECT 
  'b2c3d4e5-f6a7-8901-bcde-f12345678901'::UUID,
  'ONG Mãos que Ajudam',
  '23.456.789/0001-01',
  'SOCIAL',
  'ONG focada em assistencia social e alimentacao',
  'Rio de Janeiro',
  'RJ',
  true,
  '23456789000101',
  'CNPJ',
  'ONG Mãos que Ajudam'
WHERE NOT EXISTS (
  SELECT 1 FROM institutions WHERE id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'::UUID
);

-- Update existing IACs with institution_id if they don't have one
UPDATE impact_action_cards 
SET institution_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID
WHERE id IN (
  SELECT id FROM impact_action_cards
  WHERE institution_id IS NULL 
  AND (category ILIKE '%ambiental%' OR category ILIKE '%reciclagem%' OR category ILIKE '%compostagem%')
  LIMIT 3
);

UPDATE impact_action_cards 
SET institution_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'::UUID
WHERE id IN (
  SELECT id FROM impact_action_cards
  WHERE institution_id IS NULL 
  AND (category ILIKE '%social%' OR category ILIKE '%alimentacao%' OR category ILIKE '%educacao%')
  LIMIT 3
);

-- Create funding projects from existing IACs that are validated/certified
INSERT INTO funding_projects (id, iac_id, goal_amount, current_amount, donors_count, status, deadline)
SELECT 
  gen_random_uuid(),
  iac.id,
  COALESCE(iac."targetAmount", 50000),
  COALESCE(iac."currentAmount", 0),
  0,
  'FUNDING',
  CURRENT_DATE + INTERVAL '90 days'
FROM impact_action_cards iac
WHERE iac.institution_id IS NOT NULL
AND iac.status IN ('VALIDATED', 'CERTIFIED', 'MINTED', 'validated', 'certified', 'minted')
AND NOT EXISTS (
  SELECT 1 FROM funding_projects fp WHERE fp.iac_id = iac.id
)
LIMIT 5;

-- If no IACs are validated, create funding projects from any IACs with institution
INSERT INTO funding_projects (id, iac_id, goal_amount, current_amount, donors_count, status, deadline)
SELECT 
  gen_random_uuid(),
  iac.id,
  COALESCE(iac."targetAmount", 50000),
  COALESCE(iac."currentAmount", 0),
  0,
  'FUNDING',
  CURRENT_DATE + INTERVAL '90 days'
FROM impact_action_cards iac
WHERE iac.institution_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM funding_projects fp WHERE fp.iac_id = iac.id
)
LIMIT 5;

-- Success message
SELECT 'Migration 011 completed - funding_projects and institutions tables created' AS status;

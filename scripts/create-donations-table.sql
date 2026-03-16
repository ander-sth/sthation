-- Tabela de doações
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  iac_id UUID REFERENCES impact_action_cards(id),
  institution_id UUID REFERENCES institutions(id),
  donor_id UUID REFERENCES users(id),
  donor_email VARCHAR(255),
  donor_name VARCHAR(255),
  amount_total INTEGER NOT NULL,
  amount_institution INTEGER NOT NULL,
  amount_sthation INTEGER NOT NULL,
  amount_checkers INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_donations_iac_id ON donations(iac_id);
CREATE INDEX IF NOT EXISTS idx_donations_institution_id ON donations(institution_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);

-- Adicionar colunas de arrecadação no IAC
ALTER TABLE impact_action_cards 
ADD COLUMN IF NOT EXISTS total_raised INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS donations_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS funding_goal INTEGER DEFAULT 10000000;

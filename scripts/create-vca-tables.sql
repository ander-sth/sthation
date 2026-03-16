-- Tabela de sessões VCA (Validação Comunitária Ativa)
CREATE TABLE IF NOT EXISTS vca_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iac_id UUID NOT NULL REFERENCES impact_action_cards(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'OPEN',
  min_checkers INTEGER DEFAULT 3,
  max_checkers INTEGER DEFAULT 7,
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  final_score DECIMAL(5,2),
  consensus_reached BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de votos dos checkers
CREATE TABLE IF NOT EXISTS vca_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES vca_sessions(id) ON DELETE CASCADE,
  checker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  comment TEXT,
  evidence_verified BOOLEAN DEFAULT false,
  visit_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, checker_id)
);

-- Tabela de ranking de checkers
CREATE TABLE IF NOT EXISTS checker_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_validations INTEGER DEFAULT 0,
  accuracy_score DECIMAL(5,2) DEFAULT 50.00,
  avg_response_time INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 50,
  level VARCHAR(20) DEFAULT 'BRONZE',
  rewards_earned INTEGER DEFAULT 0,
  last_validation_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vca_sessions_iac ON vca_sessions(iac_id);
CREATE INDEX IF NOT EXISTS idx_vca_sessions_status ON vca_sessions(status);
CREATE INDEX IF NOT EXISTS idx_vca_votes_session ON vca_votes(session_id);
CREATE INDEX IF NOT EXISTS idx_vca_votes_checker ON vca_votes(checker_id);
CREATE INDEX IF NOT EXISTS idx_checker_rankings_score ON checker_rankings(reputation_score DESC);

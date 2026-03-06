-- Adicionar suporte a Stripe Connect para instituicoes
-- Permite que instituicoes recebam pagamentos diretamente

-- Adicionar campos Stripe na tabela institutions
ALTER TABLE institutions 
ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE;

-- Adicionar campos de split na tabela donations existente
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS amount_institution INTEGER,
ADD COLUMN IF NOT EXISTS amount_platform INTEGER,
ADD COLUMN IF NOT EXISTS amount_gas_fund INTEGER,
ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_transfer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS transfer_pending BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS transfer_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Criar tabela de configuracao de split
CREATE TABLE IF NOT EXISTS split_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Nome da configuracao
  name VARCHAR(100) NOT NULL,
  
  -- Percentuais (devem somar 100)
  institution_percent DECIMAL(5,2) NOT NULL DEFAULT 80.00,
  platform_percent DECIMAL(5,2) NOT NULL DEFAULT 16.00,
  gas_fund_percent DECIMAL(5,2) NOT NULL DEFAULT 4.00,
  
  -- Se e a configuracao ativa
  is_active BOOLEAN DEFAULT FALSE,
  
  -- Quem criou
  created_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuracao padrao de split
INSERT INTO split_config (name, institution_percent, platform_percent, gas_fund_percent, is_active)
VALUES ('Padrao', 80.00, 16.00, 4.00, true)
ON CONFLICT DO NOTHING;

-- Criar tabela para Fundo de Gas
CREATE TABLE IF NOT EXISTS gas_fund (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de transacao
  transaction_type VARCHAR(50) NOT NULL,
  -- CREDIT (entrada de 4% das doacoes), DEBIT (gasto com gas)
  
  -- Valor em centavos
  amount INTEGER NOT NULL,
  
  -- Saldo apos transacao
  balance_after INTEGER NOT NULL,
  
  -- Referencia a doacao (se for credito)
  donation_id UUID REFERENCES donations(id),
  
  -- Referencia ao registro blockchain (se for debito)
  blockchain_tx_hash VARCHAR(255),
  
  -- Descricao
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_institutions_stripe_account ON institutions(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_gas_fund_created_at ON gas_fund(created_at);

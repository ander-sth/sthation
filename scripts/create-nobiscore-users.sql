-- Tabela de usuarios do NobisCore (independente da Sthation)
CREATE TABLE IF NOT EXISTS nobiscore_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Carteiras conectadas
  evm_wallet_address VARCHAR(255),
  btc_wallet_address VARCHAR(255),
  
  -- Metadata
  avatar_url TEXT,
  bio TEXT,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice para busca por email
CREATE INDEX IF NOT EXISTS idx_nobiscore_users_email ON nobiscore_users(email);

-- Indice para busca por carteiras
CREATE INDEX IF NOT EXISTS idx_nobiscore_users_evm_wallet ON nobiscore_users(evm_wallet_address);
CREATE INDEX IF NOT EXISTS idx_nobiscore_users_btc_wallet ON nobiscore_users(btc_wallet_address);

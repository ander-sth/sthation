-- Tabela para fila de bridge Polygon -> Bitcoin
-- Armazena tokens queimados na Polygon aguardando inscription no Bitcoin

CREATE TABLE IF NOT EXISTS bridge_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referência ao IAC que gerou os tokens
  iac_id UUID REFERENCES impact_action_cards(id),
  
  -- Usuário que solicitou o bridge (pode ser da Sthation ou NobisCore)
  requester_id UUID,
  requester_type VARCHAR(20) DEFAULT 'sthation', -- 'sthation' ou 'nobiscore'
  
  -- Dados do token na Polygon
  polygon_token_id VARCHAR(255),
  polygon_tx_hash VARCHAR(255),
  polygon_block_number BIGINT,
  tokens_burned INTEGER DEFAULT 1,
  
  -- Dados agregados do impacto
  impact_type VARCHAR(50), -- SOCIAL, AMBIENTAL
  impact_category VARCHAR(100),
  impact_quantity NUMERIC,
  impact_unit VARCHAR(50),
  impact_data JSONB, -- Dados completos do impacto
  
  -- Hashes de rastreabilidade
  original_hashes TEXT[], -- Lista de hashes das micro-ações
  aggregated_hash VARCHAR(255), -- Hash consolidado
  sthation_signature VARCHAR(500), -- Assinatura criptográfica da Sthation
  
  -- Status do bridge
  status VARCHAR(30) DEFAULT 'PENDING',
  -- PENDING -> VALIDATING -> PREPARING -> INSCRIBING -> COMPLETED -> FAILED
  
  -- Carteira Bitcoin destino
  target_btc_address VARCHAR(100),
  
  -- Resultado da inscription
  inscription_id VARCHAR(255),
  ordinal_id VARCHAR(255),
  bitcoin_tx_hash VARCHAR(255),
  bitcoin_block_number BIGINT,
  
  -- Custos
  gas_cost_polygon NUMERIC,
  inscription_cost_btc NUMERIC,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validated_at TIMESTAMP WITH TIME ZONE,
  prepared_at TIMESTAMP WITH TIME ZONE,
  inscribed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Tabela para tokens ERC-1155 mintados na Polygon (representação)
CREATE TABLE IF NOT EXISTS polygon_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referência ao IAC
  iac_id UUID REFERENCES impact_action_cards(id),
  institution_id UUID REFERENCES institutions(id),
  
  -- Dados do token
  token_id VARCHAR(255) UNIQUE,
  token_type VARCHAR(50), -- SOCIAL_IMPACT, ENVIRONMENTAL_IMPACT
  
  -- Quantidade de tokens (fracionados)
  total_supply INTEGER DEFAULT 1,
  available_supply INTEGER DEFAULT 1,
  burned_supply INTEGER DEFAULT 0,
  
  -- Dados na Polygon
  polygon_tx_hash VARCHAR(255),
  polygon_block_number BIGINT,
  polygon_contract_address VARCHAR(100),
  
  -- Metadados do impacto
  impact_data JSONB,
  data_hash VARCHAR(255),
  
  -- Status
  status VARCHAR(30) DEFAULT 'MINTED', -- MINTED, PARTIALLY_BURNED, FULLY_BURNED
  
  -- Timestamps
  minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para log de eventos do bridge
CREATE TABLE IF NOT EXISTS bridge_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id UUID REFERENCES bridge_queue(id),
  event_type VARCHAR(50),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_bridge_queue_status ON bridge_queue(status);
CREATE INDEX IF NOT EXISTS idx_bridge_queue_iac ON bridge_queue(iac_id);
CREATE INDEX IF NOT EXISTS idx_bridge_queue_requester ON bridge_queue(requester_id, requester_type);
CREATE INDEX IF NOT EXISTS idx_polygon_tokens_iac ON polygon_tokens(iac_id);
CREATE INDEX IF NOT EXISTS idx_polygon_tokens_institution ON polygon_tokens(institution_id);
CREATE INDEX IF NOT EXISTS idx_polygon_tokens_status ON polygon_tokens(status);

-- Atualizar tabela nobis_tokens para incluir referência ao bridge
ALTER TABLE nobis_tokens ADD COLUMN IF NOT EXISTS bridge_id UUID REFERENCES bridge_queue(id);
ALTER TABLE nobis_tokens ADD COLUMN IF NOT EXISTS polygon_token_id UUID REFERENCES polygon_tokens(id);

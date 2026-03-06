-- =============================================
-- ADD ENVIRONMENTAL PROJECT FIELDS
-- Adiciona campos especificos para projetos ambientais
-- =============================================

-- Adicionar novos campos na tabela impact_action_cards
ALTER TABLE impact_action_cards 
ADD COLUMN IF NOT EXISTS project_status VARCHAR(50) DEFAULT 'EM_ANDAMENTO',
ADD COLUMN IF NOT EXISTS data_collection_type VARCHAR(50) DEFAULT 'MANUAL',
ADD COLUMN IF NOT EXISTS coordinates VARCHAR(100),
ADD COLUMN IF NOT EXISTS measurement_unit VARCHAR(20) DEFAULT 'tCO2e',
ADD COLUMN IF NOT EXISTS energy_generated DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS waste_processed DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS area_size DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS certification_standard VARCHAR(100),
ADD COLUMN IF NOT EXISTS existing_certifications TEXT,
ADD COLUMN IF NOT EXISTS sensors_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sensor_types TEXT;

-- Verificar se os campos foram adicionados
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'impact_action_cards' 
AND column_name IN ('project_status', 'data_collection_type', 'coordinates', 'sensors_count')
ORDER BY column_name;

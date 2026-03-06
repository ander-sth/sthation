# STHATION - Documentacao Tecnica dos Modulos Criticos

## Documento de Referencia para Desenvolvimento Backend

---

# INDICE

1. [Visao Geral do Fluxo](#1-visao-geral-do-fluxo)
2. [Modulo 1: Validacao VCA (Validation Community Audit)](#2-modulo-1-validacao-vca)
3. [Modulo 2: Analise Tecnica (Certificacao)](#3-modulo-2-analise-tecnica)
4. [Modulo 3: Inscription (Registro Blockchain)](#4-modulo-3-inscription)
5. [Split de Pagamento](#5-split-de-pagamento)
6. [Banco de Dados - Tabelas Necessarias](#6-banco-de-dados)
7. [Endpoints da API](#7-endpoints-da-api)
8. [Regras de Negocio Criticas](#8-regras-de-negocio)

---

# 1. VISAO GERAL DO FLUXO

O ciclo de vida de um projeto na Sthation segue esta sequencia:

```
INSTITUICAO CRIA PROJETO (IAC)
        |
        v
   CAPTACAO DE DOACOES (crowdfunding)
        |
        v
   EXECUCAO DO PROJETO (coleta de evidencias: fotos, videos, GPS, IoT)
        |
        v
   SUBMISSAO PARA VALIDACAO (minimo 3 evidencias)
        |
        v
  +-----+-----+
  |             |
  v             v
SOCIAL       AMBIENTAL
  |             |
  v             v
VCA           ANALISE TECNICA
(Checkers)    (Certificadores)
  |             |
  v             v
  +-----+-----+
        |
        v
RESULTADO DA VALIDACAO
  |         |          |
  v         v          v
APROVADO  DISPUTA    REJEITADO
(>80%)    (60-80%)   (<60%)
  |         |
  v         v
  |    ANALISE TECNICA
  |    (desempate)
  |         |
  +----+----+
       |
       v
  INSCRIPTION (Bitcoin Ordinals)
       |
       v
  HALL DE IMPACTO (registro publico permanente)
       |
       v
  NOBIS (ativo digital negociavel - opcional)
```

### Dois Fluxos Distintos

**Fluxo Social (com doacoes):**
Captacao -> Doacao -> Execucao -> VCA (Checkers) -> Certificacao -> Inscription -> Hall de Impacto

**Fluxo Ambiental (sem doacoes):**
Execucao -> Certificacao Tecnica Direta -> Inscription -> Hall de Impacto

---

# 2. MODULO 1: VALIDACAO VCA (Validation Community Audit)

## 2.1 O que e

O VCA e o sistema de validacao descentralizada da Sthation. Quando uma instituicao social conclui a execucao de um projeto e submete as evidencias, o sistema sorteia 10 Checkers independentes para analisar e votar.

## 2.2 Quem participa

- **Checkers**: Usuarios certificados pela Sthation Academy (role: `CHECKER`)
- Precisam ter score minimo de 70 para participar
- Sao sorteados aleatoriamente (excluindo conflitos de interesse)
- Recebem remuneracao do Fundo de Validacao (2% das doacoes)

## 2.3 Regras do Protocolo

```typescript
const VCA_RULES = {
  MIN_CHECKERS: 10,           // Minimo de 10 Checkers por validacao
  APPROVAL_THRESHOLD: 0.80,   // Consenso > 80% para aprovar
  DISPUTE_THRESHOLD: 0.60,    // Entre 60-80% vai para disputa (analise tecnica)
  MIN_SCORE_TO_VALIDATE: 70,  // Score minimo do Checker para participar
  COOLDOWN_HOURS: 24,         // Tempo minimo entre validacoes do mesmo projeto
  VOTING_DEADLINE_HOURS: 48,  // Prazo de 48h para votacao
}
```

## 2.4 Checklist de Validacao (6 criterios ponderados)

Cada Checker avalia o projeto em 6 criterios, cada um com peso diferente:

| Criterio | Peso | Descricao |
|----------|------|-----------|
| Qualidade das Evidencias | 25% | Fotos/videos sao claros, nitidos e verificaveis |
| Verificacao GPS | 20% | Coordenadas correspondem a localizacao declarada |
| Consistencia de Timestamps | 15% | Datas e horarios sao consistentes com o cronograma |
| Impacto Mensuravel | 20% | Resultados declarados sao quantificaveis e verificaveis |
| Documentacao Completa | 10% | Todos os documentos necessarios estao presentes |
| Aderencia a Metodologia TSB | 10% | Projeto segue a metodologia TSB declarada |

**Calculo do Score Final:**
```
score_final = SUM(score_criterio * peso_criterio) / SUM(pesos)
```

## 2.5 Estados do VCA

```typescript
enum VcaStatus {
  PENDING = "PENDING",         // Aguardando inicio (checkers sendo sorteados)
  IN_PROGRESS = "IN_PROGRESS", // Votacoes em andamento (prazo 48h)
  APPROVED = "APPROVED",       // Consenso > 80%
  REJECTED = "REJECTED",       // Consenso < 60%
  DISPUTE = "DISPUTE",         // Entre 60-80% -> vai para Analise Tecnica
}
```

## 2.6 Fluxo Tecnico Detalhado

```
1. Instituicao submete IAC para validacao (status: SUBMITTED)
   - Backend verifica: minimo 3 evidencias
   - Backend verifica: todas evidencias tem GPS, timestamp, hash

2. Sistema sorteia 10 Checkers
   - Query: SELECT checkers WHERE score >= 70 AND id NOT IN (conflitos)
   - Excluir: checkers da mesma cidade, mesma instituicao
   - Ordenar aleatoriamente, pegar os 10 primeiros

3. Notificar Checkers (email/push)
   - Deadline: 48h a partir da abertura

4. Cada Checker vota:
   - Preenche checklist (6 criterios, score 0-100 cada)
   - Voto: APPROVE / REJECT / ABSTAIN
   - Comentario opcional
   - Backend calcula score ponderado automaticamente

5. Quando todos votam (ou prazo expira):
   - Calcular taxa de aprovacao:
     approval_rate = votos_approve / (votos_approve + votos_reject) * 100
   - Se >= 80%: APPROVED -> segue para Inscription
   - Se < 60%: REJECTED -> instituicao pode recorrer
   - Se 60-80%: DISPUTE -> segue para Analise Tecnica
```

## 2.7 Estrutura de Dados

```typescript
interface VcaSession {
  id: string
  iacId: string                    // IAC sendo validado
  iacTitle: string
  institutionId: string
  status: VcaStatus
  assignedCheckers: string[]       // IDs dos 10 checkers sorteados
  excludedCheckers: string[]       // IDs excluidos por conflito
  votes: VcaVote[]
  approvalRate?: number            // Percentual final (0-100)
  averageScore?: number            // Score medio
  startedAt: Date
  deadline: Date                   // startedAt + 48h
  completedAt?: Date
  requiresTechnicalReview?: boolean
  technicalReviewerId?: string
  technicalReviewComment?: string
}

interface VcaVote {
  id: string
  checkerId: string
  checkerName: string
  checkerScore: number             // Score de reputacao do checker
  vote: "APPROVE" | "REJECT" | "ABSTAIN"
  checklistScores: Record<string, number>  // Score por criterio (0-100)
  overallScore: number             // Score final ponderado
  comments?: string
  votedAt: Date
}
```

## 2.8 Impacto no Score do Checker

Apos cada validacao, o score do Checker e atualizado:
- Se o voto do Checker esta alinhado com o resultado final: score +2
- Se o voto do Checker esta desalinhado: score -1
- Abstencoes: sem impacto
- Score minimo: 0, maximo: 100

---

# 3. MODULO 2: ANALISE TECNICA (Certificacao)

## 3.1 O que e

A Analise Tecnica e feita por profissionais especializados (Analistas Certificadores) que emitem parecer tecnico sobre projetos. E acionada em dois cenarios:

1. **Projetos Ambientais**: Certificacao tecnica direta (sem VCA)
2. **Disputas VCA**: Quando consenso fica entre 60-80%, o certificador desempata

## 3.2 Quem participa

- **Analistas Certificadores**: Profissionais com registro profissional (CREA, CRA, etc.)
- Role: `ANALISTA_CERTIFICADOR`
- Precisam ter certificacao especializada na area do projeto
- Recebem remuneracao do Fundo de Certificacao (2% das doacoes)

## 3.3 O que o Certificador analisa

| Aspecto | Descricao |
|---------|-----------|
| Score Tecnico | Nota de 0-100 sobre a qualidade tecnica do projeto |
| Metodologia Valida | Se a metodologia declarada (TSB) foi seguida corretamente |
| Evidencias Validas | Se as evidencias sao autenticas e suficientes |
| Metricas Precisas | Se os numeros de impacto sao realistas e verificaveis |
| Comentarios do VCA | Revisao dos comentarios dos Checkers (em caso de disputa) |
| Parecer Final | APPROVED / REJECTED / NEEDS_INFO |

## 3.4 Estados da Analise Tecnica

```typescript
type TechnicalReviewStatus =
  | "PENDING"     // Na fila aguardando certificador
  | "IN_REVIEW"   // Certificador analisando
  | "APPROVED"    // Aprovado -> segue para Inscription
  | "REJECTED"    // Rejeitado -> instituicao pode recorrer
  | "NEEDS_INFO"  // Faltam documentos -> devolver para instituicao
```

## 3.5 Fluxo Tecnico Detalhado

```
CENARIO 1: Projeto Ambiental (sem VCA)
=========================================
1. Empresa ambiental submete IAC com evidencias
2. Sistema atribui a um Certificador especializado na area
3. Certificador analisa:
   - Evidencias (fotos, documentos, dados IoT)
   - Metricas de impacto (tCO2, hectares, etc.)
   - Conformidade com TSB declarado
4. Emite parecer: APPROVED / REJECTED / NEEDS_INFO
5. Se APPROVED -> segue para Inscription

CENARIO 2: Disputa VCA (Social)
=========================================
1. VCA termina com consenso entre 60-80% (DISPUTE)
2. Sistema atribui um Certificador
3. Certificador recebe:
   - Todas evidencias originais
   - Todos votos e comentarios dos Checkers
   - Scores individuais e gerais
4. Certificador faz analise de desempate
5. Parecer final e definitivo (sem recurso)
```

## 3.6 Estrutura de Dados

```typescript
interface TechnicalReview {
  id: string
  projectId: string
  projectTitle: string
  organizationType: "SOCIAL" | "AMBIENTAL"
  // Quem analisa
  certifierId: string
  certifierName: string
  certifierRegistration: string  // Ex: "CREA 123456"
  // Dados do VCA (se disputa)
  vcaSessionId?: string
  vcaScore?: number
  vcaApprovals?: number
  vcaTotal?: number
  checkerComments?: {
    checker: string
    comment: string
    score: number
    date: string
  }[]
  // Evidencias do projeto
  evidences: {
    type: "PHOTO" | "VIDEO" | "DOCUMENT" | "IOT"
    url: string
    description: string
    timestamp: string
    hash: string
  }[]
  // Metricas
  metrics: {
    beneficiaries?: number
    carbonCredits?: number
    totalInvested: number
    impactScore: number
  }
  // Resultado da analise
  technicalScore: number        // 0-100
  methodologyValid: boolean
  evidencesValid: boolean
  metricsAccurate: boolean
  comments: string
  decision: "APPROVED" | "REJECTED" | "NEEDS_INFO"
  // Timestamps
  submittedAt: Date
  startedAt?: Date
  completedAt?: Date
}
```

---

# 4. MODULO 3: INSCRIPTION (Registro Blockchain)

## 4.1 O que e

Inscription e o processo de gravar permanentemente os dados de impacto validados no blockchain do Bitcoin usando o protocolo Ordinals. Uma vez inscrito, o registro e imutavel e verificavel por qualquer pessoa.

## 4.2 Pre-requisitos para Inscription

Um projeto so pode ser inscrito se:
- Status: VALIDATED (aprovado pelo VCA) ou APPROVED (aprovado por Certificador)
- Todos os dados de impacto estao completos
- Hash SHA-256 dos dados foi gerado
- O Admin autorizou a inscription

## 4.3 Arquitetura: Polygon + Bitcoin

A Sthation usa duas redes blockchain complementares:

```
DADOS DO PROJETO VALIDADO
        |
        v
  GERAR HASH SHA-256 (integridade dos dados)
        |
        v
  REGISTRAR NA POLYGON (rapido e barato)
  - Custo: R$ 0,01 a R$ 0,10
  - Tempo: ~2 segundos
  - Armazena: hash, metadados, timestamp
        |
        v
  INSCREVER NO BITCOIN (permanente e imutavel)
  - Protocolo: Ordinals
  - Custo: variavel (pago pelo Fundo de Gas - 4% das doacoes)
  - Tempo: ~10-60 minutos (1 confirmacao)
  - Armazena: inscription com dados completos
        |
        v
  REGISTRO DISPONIVEL NO HALL DE IMPACTO
```

## 4.4 O que e gravado na Inscription

```typescript
interface InscriptionContent {
  // Identificacao
  projectId: string
  title: string
  type: "SOCIAL" | "ENVIRONMENTAL"
  institution: string
  // Dados de impacto
  impactData: {
    // Social
    mealsServed?: number
    familiesHelped?: number
    beneficiaries?: number
    // Ambiental
    treeCount?: number
    areaHectares?: number
    co2Captured?: string
    capacityKW?: number
    // Generico
    [key: string]: unknown
  }
  // Validacao
  validationScore: number        // Score final (VCA ou Certificador)
  certifiedBy: string            // Nome e registro do certificador
  certificationDate: string      // Data ISO
  // Integridade
  dataHash: string               // SHA-256 de todos os dados acima
  evidenceHashes: string[]       // SHA-256 de cada evidencia individual
}
```

## 4.5 Processo de Inscription (passo a passo)

```
PASSO 1: VALIDAR DADOS
- Verificar que projeto tem status VALIDATED/APPROVED
- Verificar que todos campos obrigatorios estao preenchidos
- Verificar que certificador assinou

PASSO 2: GERAR HASH SHA-256
- Concatenar todos os dados do projeto em string deterministica
- Gerar hash: SHA-256(dados_concatenados)
- Este hash garante que qualquer alteracao nos dados invalida o registro

  Codigo:
  async function createSHA256Hash(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
  }

PASSO 3: REGISTRAR NA POLYGON
- Conectar a rede Polygon (mainnet ou Mumbai testnet)
- Chamar smart contract com: hash, projectId, timestamp
- Aguardar confirmacao (2 seg)
- Salvar txHash e blockNumber

  Configuracao Polygon:
  mainnet: chainId 137, rpc: https://polygon-rpc.com
  testnet: chainId 80001, rpc: https://rpc-mumbai.maticvigil.com

PASSO 4: PREPARAR INSCRIPTION BITCOIN
- Montar payload JSON com todos os dados de impacto
- Usar protocolo Ordinals para criar inscription
- O payload e inscrito em um satoshi (menor unidade do Bitcoin)

PASSO 5: ENVIAR TRANSACAO BITCOIN
- Broadcast da transacao com a inscription
- Pagar taxa de mineracao (do Fundo de Gas)
- Aguardar pelo menos 1 confirmacao

PASSO 6: REGISTRAR RESULTADO
- Salvar: inscriptionId, txId, blockHeight, timestamp
- Atualizar status do projeto para "INSCRITO"
- Publicar no Hall de Impacto
```

## 4.6 Estrutura de Dados

```typescript
interface InscriptionRecord {
  id: string
  projectId: string
  projectTitle: string
  projectType: "SOCIAL" | "ENVIRONMENTAL"
  institution: string
  // Polygon
  polygonTxHash: string
  polygonBlockNumber: number
  // Bitcoin
  inscriptionId: string          // ID do Ordinal
  bitcoinTxId: string
  bitcoinBlockHeight: number
  // Dados
  dataHash: string               // SHA-256
  inscriptionContent: InscriptionContent
  // Custos
  polygonGasCost: number         // Em BRL
  bitcoinFeeCost: number         // Em BRL
  // Timestamps
  initiatedAt: Date
  polygonConfirmedAt: Date
  bitcoinConfirmedAt: Date
  // Links
  polygonExplorerUrl: string     // https://polygonscan.com/tx/{hash}
  ordinalsExplorerUrl: string    // https://ordinals.com/inscription/{id}
}
```

## 4.7 Verificacao Publica

Qualquer pessoa pode verificar uma inscription:

1. **Via Polygonscan**: Acessar `https://polygonscan.com/tx/{txHash}` para ver o registro na Polygon
2. **Via Ordinals**: Acessar `https://ordinals.com/inscription/{inscriptionId}` para ver no Bitcoin
3. **Via Hash**: Recalcular o SHA-256 dos dados e comparar com o hash registrado

---

# 5. SPLIT DE PAGAMENTO

## 5.1 Como o dinheiro e distribuido

Cada doacao e dividida automaticamente:

```
DOACAO DE R$ 1.000,00
|
+-- R$ 800,00 (80%) -> Instituicao de Impacto (executor do projeto)
+-- R$  20,00 ( 2%) -> Checkers (Fundo de Validacao VCA)
+-- R$  20,00 ( 2%) -> Certificadores (Fundo de Certificacao)
+-- R$  40,00 ( 4%) -> Fundo de Gas (taxas blockchain)
+-- R$ 120,00 (12%) -> STHATION (plataforma)
= R$ 1.000,00 (100%)
```

## 5.2 Configuracao em Codigo

```typescript
const SPLIT_PERCENTAGES = {
  instituicao: 0.80,      // 80%
  checkers: 0.02,          // 2%
  certificadores: 0.02,    // 2%
  gasInscription: 0.04,    // 4%
  sthation: 0.12,          // 12%
}

function calculatePaymentSplit(amount: number) {
  return {
    total: amount,
    instituicao: amount * 0.80,
    checkers: amount * 0.02,
    certificadores: amount * 0.02,
    gasInscription: amount * 0.04,
    sthation: amount * 0.12,
  }
}
```

## 5.3 Tabela de Exemplos

| Doacao | Instituicao (80%) | Checkers (2%) | Certificadores (2%) | Gas (4%) | Sthation (12%) |
|--------|-------------------|---------------|---------------------|----------|----------------|
| R$ 100 | R$ 80 | R$ 2 | R$ 2 | R$ 4 | R$ 12 |
| R$ 500 | R$ 400 | R$ 10 | R$ 10 | R$ 20 | R$ 60 |
| R$ 1.000 | R$ 800 | R$ 20 | R$ 20 | R$ 40 | R$ 120 |
| R$ 5.000 | R$ 4.000 | R$ 100 | R$ 100 | R$ 200 | R$ 600 |
| R$ 10.000 | R$ 8.000 | R$ 200 | R$ 200 | R$ 400 | R$ 1.200 |

---

# 6. BANCO DE DADOS - TABELAS NECESSARIAS

## 6.1 Tabela: vca_sessions

```sql
CREATE TABLE vca_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iac_id UUID NOT NULL REFERENCES impact_action_cards(id),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  -- CHECK (status IN ('PENDING','IN_PROGRESS','APPROVED','REJECTED','DISPUTE'))
  assigned_checkers UUID[] NOT NULL,     -- Array de IDs dos checkers
  excluded_checkers UUID[],              -- Checkers excluidos por conflito
  approval_rate DECIMAL(5,2),            -- Percentual final
  average_score DECIMAL(5,2),            -- Score medio
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deadline TIMESTAMP NOT NULL,           -- started_at + 48h
  completed_at TIMESTAMP,
  requires_technical_review BOOLEAN DEFAULT FALSE,
  technical_reviewer_id UUID REFERENCES users(id),
  technical_review_comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 6.2 Tabela: vca_votes

```sql
CREATE TABLE vca_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vca_session_id UUID NOT NULL REFERENCES vca_sessions(id),
  checker_id UUID NOT NULL REFERENCES users(id),
  vote VARCHAR(10) NOT NULL,
  -- CHECK (vote IN ('APPROVE','REJECT','ABSTAIN'))
  checklist_scores JSONB NOT NULL,       -- {"evidence_quality": 85, "gps_verification": 90, ...}
  overall_score DECIMAL(5,2) NOT NULL,   -- Score ponderado calculado
  comments TEXT,
  voted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(vca_session_id, checker_id)     -- Um checker, um voto por sessao
);
```

## 6.3 Tabela: technical_reviews

```sql
CREATE TABLE technical_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  project_type VARCHAR(10) NOT NULL,     -- 'SOCIAL' ou 'AMBIENTAL'
  certifier_id UUID NOT NULL REFERENCES users(id),
  certifier_registration VARCHAR(50),    -- Ex: "CREA 123456"
  -- Referencia ao VCA (se disputa)
  vca_session_id UUID REFERENCES vca_sessions(id),
  -- Resultado
  technical_score DECIMAL(5,2),
  methodology_valid BOOLEAN,
  evidences_valid BOOLEAN,
  metrics_accurate BOOLEAN,
  comments TEXT,
  decision VARCHAR(15),
  -- CHECK (decision IN ('APPROVED','REJECTED','NEEDS_INFO'))
  status VARCHAR(15) NOT NULL DEFAULT 'PENDING',
  -- CHECK (status IN ('PENDING','IN_REVIEW','APPROVED','REJECTED','NEEDS_INFO'))
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 6.4 Tabela: inscriptions

```sql
CREATE TABLE inscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  project_title VARCHAR(255) NOT NULL,
  project_type VARCHAR(15) NOT NULL,
  institution_name VARCHAR(255) NOT NULL,
  -- Hashes
  data_hash VARCHAR(66) NOT NULL,        -- SHA-256 (0x + 64 chars)
  evidence_hashes TEXT[],                -- Array de hashes das evidencias
  -- Polygon
  polygon_tx_hash VARCHAR(66),
  polygon_block_number BIGINT,
  polygon_confirmed_at TIMESTAMP,
  polygon_gas_cost DECIMAL(10,4),
  -- Bitcoin
  inscription_id VARCHAR(100),
  bitcoin_tx_id VARCHAR(66),
  bitcoin_block_height BIGINT,
  bitcoin_confirmed_at TIMESTAMP,
  bitcoin_fee_cost DECIMAL(10,4),
  -- Conteudo inscrito
  inscription_content JSONB NOT NULL,    -- JSON completo dos dados de impacto
  -- Validacao
  validation_score DECIMAL(5,2) NOT NULL,
  certified_by VARCHAR(255) NOT NULL,
  certification_date DATE NOT NULL,
  -- Status
  status VARCHAR(15) NOT NULL DEFAULT 'PENDING',
  -- CHECK (status IN ('PENDING','POLYGON_CONFIRMED','BITCOIN_PENDING','COMPLETED','FAILED'))
  initiated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  -- Links
  polygon_explorer_url TEXT,
  ordinals_explorer_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 6.5 Tabela: payment_splits

```sql
CREATE TABLE payment_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id),
  total_amount DECIMAL(12,2) NOT NULL,
  institution_amount DECIMAL(12,2) NOT NULL,   -- 80%
  checkers_amount DECIMAL(12,2) NOT NULL,      -- 2%
  certifiers_amount DECIMAL(12,2) NOT NULL,    -- 2%
  gas_amount DECIMAL(12,2) NOT NULL,           -- 4%
  sthation_amount DECIMAL(12,2) NOT NULL,      -- 12%
  -- Percentuais usados (para auditoria)
  institution_pct DECIMAL(5,2) NOT NULL DEFAULT 80.00,
  checkers_pct DECIMAL(5,2) NOT NULL DEFAULT 2.00,
  certifiers_pct DECIMAL(5,2) NOT NULL DEFAULT 2.00,
  gas_pct DECIMAL(5,2) NOT NULL DEFAULT 4.00,
  sthation_pct DECIMAL(5,2) NOT NULL DEFAULT 12.00,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 7. ENDPOINTS DA API

## 7.1 VCA

```
POST   /api/vca/sessions                  -- Criar sessao VCA (quando IAC e submetido)
GET    /api/vca/sessions                  -- Listar sessoes (filtros: status, checkerId)
GET    /api/vca/sessions/:id              -- Detalhes de uma sessao
GET    /api/vca/sessions/:id/evidences    -- Listar evidencias do IAC
POST   /api/vca/sessions/:id/vote         -- Registrar voto de um checker
GET    /api/vca/my-pending                -- Validacoes pendentes do checker logado
GET    /api/vca/my-history                -- Historico de validacoes do checker

Body do voto:
{
  "vote": "APPROVE" | "REJECT" | "ABSTAIN",
  "checklistScores": {
    "evidence_quality": 85,
    "gps_verification": 90,
    "timestamp_consistency": 80,
    "impact_measurable": 75,
    "documentation_complete": 95,
    "methodology_adherence": 88
  },
  "comments": "Evidencias consistentes..."
}

Response apos voto:
{
  "voteId": "uuid",
  "overallScore": 85.5,
  "sessionStatus": "IN_PROGRESS",
  "votesReceived": 7,
  "votesTotal": 10,
  "currentApprovalRate": 85.7
}
```

## 7.2 Analise Tecnica

```
GET    /api/technical-reviews              -- Listar projetos para analise
GET    /api/technical-reviews/:id          -- Detalhes de um projeto
POST   /api/technical-reviews/:id/start    -- Iniciar analise (muda status para IN_REVIEW)
POST   /api/technical-reviews/:id/submit   -- Submeter parecer

Body do parecer:
{
  "technicalScore": 92,
  "methodologyValid": true,
  "evidencesValid": true,
  "metricsAccurate": true,
  "comments": "Projeto apresenta metodologia solida...",
  "decision": "APPROVED" | "REJECTED" | "NEEDS_INFO"
}
```

## 7.3 Inscriptions

```
GET    /api/inscriptions/pending           -- Projetos aguardando inscription
GET    /api/inscriptions/completed         -- Inscriptions realizadas
POST   /api/inscriptions/:projectId/start  -- Iniciar processo de inscription
GET    /api/inscriptions/:id/status        -- Status da inscription em andamento
GET    /api/inscriptions/:id/verify        -- Verificar integridade (recalcula hash)

Body para iniciar inscription:
{
  "projectId": "uuid",
  "notes": "Observacoes opcionais do admin"
}

Response durante processamento:
{
  "inscriptionId": "uuid",
  "status": "POLYGON_CONFIRMED",
  "steps": [
    { "step": "validate_data", "status": "completed" },
    { "step": "generate_hash", "status": "completed" },
    { "step": "polygon_submit", "status": "completed" },
    { "step": "polygon_confirm", "status": "completed" },
    { "step": "bitcoin_submit", "status": "in_progress" },
    { "step": "bitcoin_confirm", "status": "pending" },
    { "step": "finalize", "status": "pending" }
  ],
  "polygonTxHash": "0x...",
  "dataHash": "0x..."
}
```

---

# 8. REGRAS DE NEGOCIO CRITICAS

## 8.1 Validacoes Obrigatorias

1. **IAC so pode ser submetido com minimo 3 evidencias** (cada com GPS, timestamp, hash)
2. **Checker nao pode votar em projeto da propria cidade ou instituicao** (conflito de interesse)
3. **Checker precisa score >= 70** para participar de VCA
4. **Prazo de 48h** para votacao VCA (apos isso, calcula com votos recebidos)
5. **Inscription so pode ser feita por ADMIN**
6. **Hash SHA-256 deve ser recalculavel** (dados deterministicos)
7. **Split de pagamento e automatico e imediato** na confirmacao da doacao

## 8.2 Permissoes por Role

| Acao | Doador | Inst. Social | Emp. Ambiental | Checker | Certificador | Admin |
|------|--------|-------------|----------------|---------|-------------|-------|
| Doar | Sim | Nao | Nao | Sim | Nao | Sim |
| Criar IAC | Nao | Sim | Sim | Nao | Nao | Sim |
| Votar VCA | Nao | Nao | Nao | Sim | Nao | Sim |
| Analise Tecnica | Nao | Nao | Nao | Nao | Sim | Sim |
| Inscription | Nao | Nao | Nao | Nao | Nao | Sim |
| Gerenciar Users | Nao | Nao | Nao | Nao | Nao | Sim |

## 8.3 Categorias TSB (Taxonomia Sustentavel Brasileira)

```
TSB-01: Mitigacao de Mudancas Climaticas
TSB-02: Adaptacao as Mudancas Climaticas
TSB-03: Uso Sustentavel de Recursos Hidricos
TSB-04: Economia Circular
TSB-05: Prevencao da Poluicao
TSB-06: Biodiversidade e Ecossistemas
TSB-07: Energia Renovavel
TSB-08: Agricultura Regenerativa
```

## 8.4 Estados do IAC (Impact Action Card)

```
DRAFT -> EXECUTING -> SUBMITTED -> VALIDATED -> MINTED
                          |
                          v
                      REJECTED
```

- DRAFT: Pode editar livremente
- EXECUTING: Coletando evidencias
- SUBMITTED: Bloqueado, em validacao VCA ou Analise Tecnica
- VALIDATED: Aprovado, pronto para Inscription
- REJECTED: Reprovado (pode recorrer)
- MINTED: Inscrito no Bitcoin, transformado em NOBIS

---

# RESUMO PARA O DESENVOLVEDOR

**Prioridade de implementacao sugerida:**

1. **Banco de Dados**: Criar as tabelas acima (vca_sessions, vca_votes, technical_reviews, inscriptions, payment_splits)
2. **VCA**: Implementar sorteio de checkers, sistema de votacao, calculo de consenso
3. **Analise Tecnica**: Implementar fila de projetos, formulario de parecer, logica de decisao
4. **Inscription**: Implementar geracao de hash SHA-256, integracao Polygon (ethers.js), integracao Bitcoin Ordinals
5. **Split**: Implementar calculo automatico na confirmacao de doacao
6. **Notificacoes**: Email/push para checkers quando sorteados, para instituicoes quando resultado sai

**Bibliotecas recomendadas:**
- `ethers.js` ou `viem` para Polygon
- `bitcoinjs-lib` para Bitcoin/Ordinals
- `bcrypt` para hashing de senhas
- `jsonwebtoken` para JWT
- `multer` ou `sharp` para upload de evidencias
- `node-cron` para jobs agendados (ex: fechar VCA apos 48h)

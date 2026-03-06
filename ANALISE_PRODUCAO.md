# Analise para Producao - STHATION NOBIS

## Estado Atual da Plataforma

### Infraestrutura Conectada
- **Banco de Dados**: Neon PostgreSQL (14 tabelas criadas e funcionando)
- **Backend API**: Railway (https://sthation-api-production.up.railway.app)
- **Frontend**: v0/Vercel

### Tabelas no Banco (Neon)
| Tabela | Status | Descricao |
|--------|--------|-----------|
| users | OK | Usuarios (todos os tipos) |
| institutions | OK | ONGs, Empresas Ambientais, Prefeituras |
| impact_action_cards | OK | Projetos sociais e ambientais |
| funding_projects | OK | Campanhas de captacao |
| donations | OK | Doacoes realizadas |
| payment_splits | OK | Divisao de pagamentos (70/20/10) |
| vca_sessions | OK | Sessoes de validacao comunitaria |
| vca_votes | OK | Votos dos checkers |
| technical_reviews | OK | Analises de certificadores |
| evidences | OK | Evidencias (fotos, docs, sensores) |
| pipeline_trails | OK | Trilhas de rastreabilidade |
| pipeline_events | OK | Eventos da pipeline |
| nobis_tokens | OK | Tokens NOBIS emitidos |
| tsb_categories | OK | Categorias TSB |

---

## O QUE PRECISA SER FEITO PARA PRODUCAO

### FASE 1: Autenticacao Real (PRIORIDADE ALTA)

**Problema Atual**: O sistema usa `DEMO_USERS` hardcoded e fallback para modo demo.

**Solucao**:
1. Criar API `/api/auth/register` que salva usuarios no Neon com senha hash (bcrypt)
2. Criar API `/api/auth/login` que valida credenciais e retorna JWT
3. Remover fallback para DEMO_USERS em producao
4. Adicionar verificacao de email (opcional para MVP)

**Arquivos a modificar**:
- `/app/api/auth/register/route.ts` (criar)
- `/app/api/auth/login/route.ts` (criar)
- `/lib/auth-context.tsx` (remover DEMO_USERS em prod)

---

### FASE 2: Cadastro Real de Entidades (PRIORIDADE ALTA)

**Fluxo de Cadastro**:

#### 2.1 Instituicoes Sociais (ONGs)
```
Formulario:
- Nome da instituicao
- CNPJ
- Endereco completo
- Responsavel legal
- Email e telefone
- Documentos (estatuto, CNPJ card)
- Categorias de atuacao (TSB)

Status: PENDENTE > EM_ANALISE > APROVADA/REJEITADA
```

#### 2.2 Empresas Ambientais
```
Formulario:
- Razao social
- CNPJ
- Endereco
- Tipo de atividade ambiental
- Certificacoes existentes
- Integracao IoT/API (opcional)

Status: PENDENTE > EM_ANALISE > APROVADA/REJEITADA
```

#### 2.3 Prefeituras
```
Formulario:
- Nome do municipio
- UF
- Responsavel (secretaria)
- Email institucional
- Documentos de autorizacao

Status: PENDENTE > APROVADA
```

#### 2.4 Doadores
```
Cadastro simplificado:
- Nome
- Email
- CPF (opcional)
- Preferencias de categoria

Status: ATIVO imediato
```

#### 2.5 Checkers
```
Cadastro + Certificacao:
- Dados pessoais
- Completar curso na Academy
- Passar na avaliacao
- Receber certificacao VCA-CHECKER

Status: PENDENTE > EM_TREINAMENTO > CERTIFICADO
```

#### 2.6 Analistas Certificadores
```
Cadastro restrito:
- Credenciais academicas/profissionais
- Certificacoes (GHG Protocol, etc)
- Aprovacao manual pelo admin

Status: PENDENTE > APROVADO
```

**APIs necessarias**:
- `POST /api/institutions` - Cadastrar instituicao
- `GET /api/institutions/pending` - Listar pendentes (admin)
- `PATCH /api/institutions/:id/approve` - Aprovar instituicao
- `POST /api/users/register-checker` - Cadastrar checker
- `POST /api/users/register-analyst` - Cadastrar analista

---

### FASE 3: Fluxo de Projetos Real (PRIORIDADE ALTA)

#### 3.1 Projetos Sociais (IAC)
```
1. Instituicao cria IAC (DRAFT)
2. Submete para validacao (SUBMITTED)
3. Entra em VCA (IN_VCA)
4. Checkers votam
5. Se aprovado > VALIDATED
6. Cria campanha de captacao
7. Recebe doacoes
8. Finaliza captacao > executa projeto
9. Registra na Polygon (CERTIFIED)
10. Emite NOBIS tokens
```

#### 3.2 Projetos Ambientais
```
1. Empresa cadastra projeto (DRAFT)
2. Conecta sensores/API (se aplicavel)
3. Submete para analise (SUBMITTED)
4. Certificadores analisam dados
5. Se aprovado > CERTIFIED
6. Registra na Polygon
7. Emite NOBIS tokens
```

**APIs ja existentes (verificar se funcionam)**:
- `/api/pipeline/social/*` - 4 endpoints
- `/api/pipeline/environmental/*` - 4 endpoints

---

### FASE 4: Pagamentos Reais (PRIORIDADE MEDIA)

**Integracao necessaria**: Stripe ou similar

**Fluxo**:
1. Doador seleciona projeto e valor
2. Processa pagamento
3. Aplica split automatico (70% projeto, 20% STHATION, 10% NOBIS)
4. Registra doacao no banco
5. Ancora dados na pipeline
6. Envia recibo por email

**APIs**:
- `POST /api/payments/create-intent` - Criar intencao de pagamento
- `POST /api/payments/webhook` - Receber confirmacao
- `GET /api/payments/receipt/:id` - Gerar recibo

---

### FASE 5: Integracao Polygon Real (PRIORIDADE MEDIA)

**Atual**: Simulado (gera hash mas nao registra de verdade)

**Para producao**:
1. Configurar wallet da plataforma
2. Deploy do smart contract na Polygon
3. Configurar RPC endpoint (Infura/Alchemy)
4. Implementar registro real de hashes

**Variaveis de ambiente**:
```
POLYGON_RPC_URL=
POLYGON_PRIVATE_KEY=
POLYGON_CONTRACT_ADDRESS=
```

---

### FASE 6: Integracoes IoT/API (PRIORIDADE BAIXA)

**Webhook Organa** ja existe: `/api/pipeline/webhooks/organa`

**Outras integracoes futuras**:
- Sensores de biodigestores
- Medidores de energia solar
- Sistemas de compostagem

---

## PAGINAS QUE USAM MOCK DATA (REMOVER)

| Pagina | Mock usado | Acao |
|--------|------------|------|
| /dashboard/donate | fundingProjects hardcoded | Ja usa API, remover fallback |
| /dashboard/iac | mockIACs | Migrar para API |
| /dashboard/vca | dados estaticos | Migrar para API |
| /dashboard/pipeline | dados estaticos | Migrar para API |
| /projetos | mockFundingProjects | Ja usa API, remover fallback |
| /hall-de-impacto | mockImpactRecords | Ja usa API, remover fallback |
| /doadores | mockDonors | Migrar para API |

---

## ORDEM DE IMPLEMENTACAO RECOMENDADA

### Sprint 1 (Essencial para ir ao ar)
1. [x] Banco de dados criado (Neon)
2. [ ] Autenticacao real (register/login com bcrypt)
3. [ ] Cadastro de instituicoes sociais
4. [ ] Criacao de projetos IAC
5. [ ] Listagem publica de projetos

### Sprint 2 (Fluxo completo social)
6. [ ] Sistema VCA funcionando
7. [ ] Campanhas de captacao
8. [ ] Pagamentos (mock ou Stripe sandbox)
9. [ ] Pipeline de rastreabilidade

### Sprint 3 (Expansao)
10. [ ] Cadastro empresas ambientais
11. [ ] Cadastro prefeituras
12. [ ] Certificadores
13. [ ] Registro real Polygon

### Sprint 4 (Polimento)
14. [ ] Academy para checkers
15. [ ] Dashboard de metricas
16. [ ] Notificacoes por email
17. [ ] Integracoes IoT

---

## VARIAVEIS DE AMBIENTE NECESSARIAS

```env
# Banco de dados (ja configurado)
DATABASE_URL=

# Backend Railway (ja configurado)
NEXT_PUBLIC_API_URL=https://sthation-api-production.up.railway.app

# Autenticacao
JWT_SECRET=
BCRYPT_SALT_ROUNDS=10

# Pagamentos (futuro)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Blockchain (futuro)
POLYGON_RPC_URL=
POLYGON_PRIVATE_KEY=
POLYGON_CONTRACT_ADDRESS=

# Email (futuro)
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

---

## PROXIMOS PASSOS IMEDIATOS

1. **Criar API de autenticacao real** (`/api/auth/register` e `/api/auth/login`)
2. **Criar formulario de cadastro de instituicoes** (com upload de documentos)
3. **Criar painel admin** para aprovar instituicoes pendentes
4. **Testar fluxo completo**: cadastro > criar IAC > VCA > captacao

Quer que eu comece implementando a autenticacao real?

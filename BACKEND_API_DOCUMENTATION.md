# STHATION - Documentação da API Backend

Este documento descreve todos os endpoints necessários para o backend da plataforma STHATION.

## Configuração

A URL base da API é definida pela variável de ambiente:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Autenticação

Todos os endpoints (exceto login/register) requerem o header:
```
Authorization: Bearer <token>
```

---

## 1. Autenticação (`/api/auth`)

### POST `/api/auth/login`
Login do usuário.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "ADMIN" | "DOADOR" | "INSTITUICAO_SOCIAL" | "EMPRESA_AMBIENTAL" | "CHECKER" | "ANALISTA_CERTIFICADOR",
    "isVerified": "boolean",
    "certifications": ["string"], // opcional, para CHECKER e ANALISTA
    "checkerScore": "number" // opcional, para CHECKER
  },
  "token": "string"
}
```

### POST `/api/auth/register`
Registro de novo usuário.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "role": "DOADOR" | "INSTITUICAO_SOCIAL" | "EMPRESA_AMBIENTAL" | "CHECKER" | "ANALISTA_CERTIFICADOR"
}
```

**Response (201):**
```json
{
  "user": { /* mesmo formato do login */ },
  "token": "string"
}
```

---

## 2. Usuários (`/api/users`)

### GET `/api/users`
Lista todos os usuários (admin only).

**Response:**
```json
[
  {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string",
    "isVerified": "boolean",
    "createdAt": "ISO date string"
  }
]
```

### GET `/api/users/me`
Retorna o usuário autenticado.

---

## 3. Impact Action Cards - IAC (`/api/iac`)

### GET `/api/iac`
Lista todos os IACs.

**Query Params:**
- `status`: filtrar por status (DRAFT, EXECUTING, SUBMITTED, VALIDATED, MINTED)
- `institutionId`: filtrar por instituição

**Response:**
```json
[
  {
    "id": "string",
    "institutionId": "string",
    "projectId": "string",
    "title": "string",
    "description": "string",
    "tsbCategory": "TSB-01" | "TSB-02" | ... | "TSB-17",
    "location": {
      "name": "string",
      "coordinates": { "lat": "number", "lng": "number" }
    },
    "targetImpact": "string",
    "startDate": "ISO date",
    "endDate": "ISO date",
    "budget": "number",
    "status": "DRAFT" | "EXECUTING" | "SUBMITTED" | "VALIDATED" | "MINTED",
    "evidences": [
      {
        "id": "string",
        "url": "string",
        "type": "PHOTO" | "VIDEO" | "IOT_LOG" | "DOCUMENT",
        "timestamp": "ISO date",
        "gpsCoordinates": { "lat": "number", "lng": "number" },
        "deviceSignature": "string",
        "contentHash": "string",
        "description": "string"
      }
    ],
    "auditLog": [
      {
        "timestamp": "ISO date",
        "action": "string",
        "userId": "string",
        "details": "string" // opcional
      }
    ],
    "createdAt": "ISO date",
    "updatedAt": "ISO date",
    "submittedAt": "ISO date", // opcional
    "validatedAt": "ISO date", // opcional
    "mintedAt": "ISO date", // opcional
    "institution": {
      "id": "string",
      "name": "string",
      "logo": "string"
    }
  }
]
```

### GET `/api/iac/:id`
Retorna um IAC específico.

### POST `/api/iac`
Cria um novo IAC.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "tsbCategory": "string",
  "location": {
    "name": "string",
    "coordinates": { "lat": "number", "lng": "number" }
  },
  "targetImpact": "string",
  "startDate": "ISO date",
  "endDate": "ISO date",
  "budget": "number" // opcional
}
```

### PATCH `/api/iac/:id`
Atualiza um IAC.

### POST `/api/iac/:id/evidence`
Adiciona evidência ao IAC.

**Request Body:**
```json
{
  "url": "string",
  "type": "PHOTO" | "VIDEO" | "IOT_LOG" | "DOCUMENT",
  "timestamp": "ISO date",
  "gps": { "lat": "number", "lng": "number" },
  "deviceSignature": "string",
  "contentHash": "string",
  "description": "string" // opcional
}
```

### POST `/api/iac/:id/submit`
Submete IAC para validação (VCA).

### GET `/api/iac/:id/audit-log`
Retorna histórico de auditoria do IAC.

---

## 4. Validação Comunitária - VCA (`/api/vca`)

### GET `/api/vca/pending`
Lista IACs pendentes de validação.

### POST `/api/vca/start/:iacId`
Inicia processo de VCA para um IAC.

### POST `/api/vca/:vcaId/vote`
Registra voto de um checker.

**Request Body:**
```json
{
  "vote": "approve" | "reject",
  "comments": "string"
}
```

### GET `/api/vca/:vcaId/results`
Retorna resultados da votação.

**Response:**
```json
{
  "vcaId": "string",
  "iacId": "string",
  "status": "PENDING" | "APPROVED" | "REJECTED",
  "totalVotes": "number",
  "approveVotes": "number",
  "rejectVotes": "number",
  "consensusPercentage": "number",
  "votes": [
    {
      "checkerId": "string",
      "checkerName": "string",
      "vote": "approve" | "reject",
      "comments": "string",
      "votedAt": "ISO date"
    }
  ]
}
```

---

## 5. NOBIS Token (`/api/nobis`)

### GET `/api/nobis`
Lista todos os NOBIS mintados.

### POST `/api/nobis/mint/:iacId`
Minta NOBIS para IAC validado.

**Response:**
```json
{
  "id": "string",
  "iacId": "string",
  "inscriptionId": "string", // ID na blockchain Bitcoin
  "inscribedAt": "ISO date",
  "status": "VALIDATED" | "INSCRIBED"
}
```

### GET `/api/nobis/iac/:iacId`
Retorna NOBIS associado a um IAC.

---

## 6. Projetos de Captação (`/api/projects`)

### GET `/api/projects`
Lista projetos de captação.

**Query Params:**
- `status`: FUNDING, FUNDED, EXECUTING, COMPLETED
- `category`: categoria TSB

**Response:**
```json
[
  {
    "id": "string",
    "iacId": "string", // opcional, se já tem IAC vinculado
    "institutionId": "string",
    "title": "string",
    "description": "string",
    "category": "string",
    "tsbCategory": "string",
    "location": {
      "name": "string",
      "state": "string",
      "coordinates": { "lat": "number", "lng": "number" }
    },
    "costModel": {
      "com": "number", // Custo operacional mínimo
      "fri": "number", // Fração reserva institucional (0-1)
      "pco": "number", // Pagamento checkers/operadores
      "cdp": "number", // Custo direto projeto
      "metaTotal": "number" // Meta total de captação
    },
    "currentAmount": "number",
    "donorsCount": "number",
    "proxyCategory": "string",
    "proxyValuePerUnit": "number",
    "proxyUnit": "string",
    "estimatedBeneficiaries": "number",
    "status": "FUNDING" | "FUNDED" | "EXECUTING" | "COMPLETED",
    "publishedAt": "ISO date",
    "fundedAt": "ISO date", // opcional
    "deadline": "ISO date",
    "coverImage": "string",
    "images": ["string"]
  }
]
```

### GET `/api/projects/:id`
Retorna projeto específico.

### POST `/api/projects`
Cria novo projeto (instituição).

### PATCH `/api/projects/:id`
Atualiza projeto.

---

## 7. Doações (`/api/donations`)

### POST `/api/donations`
Registra nova doação.

**Request Body:**
```json
{
  "projectId": "string",
  "amount": "number",
  "isAnonymous": "boolean",
  "message": "string" // opcional
}
```

**Response:**
```json
{
  "id": "string",
  "donorId": "string",
  "projectId": "string",
  "amount": "number",
  "status": "PENDING" | "CONFIRMED" | "FAILED",
  "blockchain": {
    "txHash": "string",
    "blockNumber": "number",
    "dataHash": "string"
  },
  "createdAt": "ISO date"
}
```

### GET `/api/donations/my`
Lista doações do usuário autenticado.

### GET `/api/donations/project/:projectId`
Lista doações de um projeto.

---

## 8. Ranking de Doadores (`/api/donors`)

### GET `/api/donors/ranking`
Retorna ranking geral de doadores.

**Query Params:**
- `limit`: número de resultados (default: 10)
- `category`: filtrar por categoria

**Response:**
```json
{
  "rankings": [
    {
      "id": "string",
      "name": "string",
      "avatar": "string",
      "isAnonymous": "boolean",
      "totalDonated": "number",
      "donationsCount": "number",
      "projectsSupported": "number",
      "impactScore": "number",
      "badges": [
        {
          "id": "string",
          "name": "string",
          "description": "string",
          "icon": "string"
        }
      ],
      "memberSince": "ISO date",
      "currentStreak": "number"
    }
  ],
  "stats": {
    "totalDonated": "number",
    "totalDonors": "number",
    "totalDonations": "number",
    "totalProjectsSupported": "number"
  }
}
```

### GET `/api/donors/ranking/category/:category`
Ranking por categoria específica.

---

## 9. Hall de Impacto (`/api/impact`)

### GET `/api/impact/records`
Lista registros de impacto validados.

**Response:**
```json
[
  {
    "id": "string",
    "type": "SOCIAL" | "AMBIENTAL",
    "title": "string",
    "description": "string",
    "category": "string",
    "organization": {
      "id": "string",
      "name": "string",
      "logo": "string",
      "type": "string"
    },
    "location": {
      "name": "string",
      "state": "string",
      "coordinates": { "lat": "number", "lng": "number" }
    },
    "coverImage": "string",
    "timeline": [
      {
        "id": "string",
        "phase": "CAPTACAO" | "DOACAO" | "EXECUCAO" | "VALIDACAO" | "MINT",
        "title": "string",
        "description": "string",
        "timestamp": "ISO date",
        "actor": {
          "id": "string",
          "name": "string",
          "role": "string"
        },
        "data": {} // dados específicos da fase
      }
    ],
    "metrics": {
      "totalRaised": "number",
      "donorsCount": "number",
      "beneficiaries": "number",
      "evidencesCount": "number",
      "vcaScore": "number"
    },
    "blockchain": {
      "txHash": "string",
      "inscriptionId": "string",
      "explorerUrl": "string"
    }
  }
]
```

---

## 10. Upload de Arquivos (`/api/upload`)

### POST `/api/upload`
Upload de imagens/documentos.

**Request:** `multipart/form-data`
- `file`: arquivo
- `type`: "evidence" | "cover" | "document"

**Response:**
```json
{
  "url": "string",
  "contentHash": "string"
}
```

---

## Categorias TSB (Taxonomia Social Brasileira)

| Código | Categoria |
|--------|-----------|
| TSB-01 | Alimentação e Segurança Alimentar |
| TSB-02 | Educação e Qualificação Profissional |
| TSB-03 | Assistência Social |
| TSB-04 | Proteção Animal |
| TSB-05 | Recursos Hídricos |
| TSB-06 | Biodiversidade e Reflorestamento |
| TSB-07 | Energia Renovável |
| TSB-08 | Agricultura Regenerativa |
| TSB-09 | Saúde Comunitária |
| TSB-10 | Moradia |
| TSB-11 | Cultura |
| TSB-12 | Esporte |
| TSB-13 | Direitos Humanos |
| TSB-14 | Economia Solidária |
| TSB-15 | Tecnologia Social |
| TSB-16 | Mobilidade Urbana |
| TSB-17 | Resíduos e Economia Circular |

---

## Roles de Usuário

| Role | Descrição | Permissões |
|------|-----------|------------|
| ADMIN | Administrador | Todas |
| DOADOR | Pessoa física/jurídica doadora | Doar, ver projetos, ver ranking |
| INSTITUICAO_SOCIAL | ONG/Instituição social | Criar projetos sociais, criar IACs |
| EMPRESA_AMBIENTAL | Empresa ambiental | Criar projetos ambientais, criar IACs |
| CHECKER | Validador comunitário | Votar em VCAs |
| ANALISTA_CERTIFICADOR | Certificador técnico | Análise técnica de projetos |

---

## Blockchain

A plataforma usa:
- **Polygon** para transações de doação e registro de impacto
- **Bitcoin (Ordinals)** para inscrição permanente do NOBIS

### Configuração Polygon
```
Mainnet:
  chainId: 137
  rpcUrl: https://polygon-rpc.com
  explorer: https://polygonscan.com

Testnet (Mumbai):
  chainId: 80001
  rpcUrl: https://rpc-mumbai.maticvigil.com
  explorer: https://mumbai.polygonscan.com
```

### Split de Pagamento
```
80% → Instituição executora
5%  → Checkers (validadores)
5%  → Certificadores
5%  → Gas + Inscrição Bitcoin
5%  → STHATION (operação)

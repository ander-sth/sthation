# Sthation - Guia Backend: Passo a Passo

## FASE 1 -- Infraestrutura Base

### 1. Banco de Dados (PostgreSQL)

Criar as tabelas nesta ordem de dependencia:

```sql
-- 1. users (base de tudo)
-- 2. impact_action_cards (projetos/IACs)
-- 3. funding_projects (captacao de doacoes)
-- 4. donations + payment_splits (doacoes + split automatico)
-- 5. vca_sessions + vca_votes (validacao social)
-- 6. technical_reviews (certificacao ambiental)
-- 7. inscriptions (registro blockchain)
-- 8. pipeline_trails + pipeline_events (trilha de lastro)
```

Os schemas SQL completos estao no arquivo `STHATION_MODULOS_TECNICOS.md` (secao 6). Use PostgreSQL com a extensao `pgcrypto` para `gen_random_uuid()`.

### 2. Autenticacao

- `bcrypt` para hash de senhas
- `jsonwebtoken` (JWT) com refresh tokens
- Middleware de roles (`ADMIN`, `DOADOR`, `INSTITUICAO_SOCIAL`, `EMPRESA_AMBIENTAL`, `CHECKER`, `ANALISTA_CERTIFICADOR`)
- Os endpoints estao documentados em `BACKEND_API_DOCUMENTATION.md` (secao 1)

### 3. Upload de Evidencias

- Usar Vercel Blob, S3 ou Cloudinary
- Gerar `contentHash` (SHA-256) de cada arquivo no upload
- Armazenar GPS, timestamp e hash junto com a URL

---

## FASE 2 -- Modulos de Negocio

### 4. Modulo IAC (Impact Action Cards)

Endpoints CRUD: `GET/POST/PATCH /api/iac`. Regras:

- Instituicao Social cria IACs sociais (com captacao)
- Empresa Ambiental cria IACs ambientais (sem captacao)
- Minimo 3 evidencias para submeter para validacao
- Cada evidencia precisa: GPS, timestamp, hash SHA-256

### 5. Modulo de Doacoes + Split

Cada doacao executa o split automaticamente conforme `SPLIT_PERCENTAGES`:

```
80% -> Instituicao
 2% -> Checkers
 2% -> Certificadores
 4% -> Gas (taxas blockchain)
12% -> Sthation
```

O calculo ja esta implementado em `lib/blockchain/service.ts` (`calculatePaymentSplit`). Integrar com gateway de pagamento (Stripe, Mercado Pago, ou PIX).

### 6. Modulo VCA (Validacao Social)

Ordem de implementacao:

1. Sorteio de 10 Checkers (excluir conflitos de interesse: mesma cidade/instituicao)
2. Sistema de votacao com 6 criterios ponderados (25%, 20%, 15%, 20%, 10%, 10%)
3. Calculo de consenso: >80% aprovado, <60% rejeitado, 60-80% disputa
4. Job agendado (cron) para fechar votacoes apos 48h
5. Atualizacao de score do Checker (+2 alinhado, -1 desalinhado)

### 7. Modulo Analise Tecnica (Certificacao Ambiental)

- Projetos ambientais vao direto para certificador (sem VCA)
- Disputas VCA (60-80%) tambem vao para certificador
- Certificador emite parecer: `APPROVED` / `REJECTED` / `NEEDS_INFO`

---

## FASE 3 -- Blockchain (Polygon)

### 8. Smart Contract na Polygon

Criar um contrato Solidity simples para armazenar hashes:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SthationRegistry {
    struct ImpactRecord {
        string trailId;
        string dataHash;      // SHA-256 de todos os dados
        string projectType;   // "SOCIAL" ou "ENVIRONMENTAL"
        uint256 timestamp;
        bool exists;
    }

    mapping(string => ImpactRecord) public records;
    event ImpactRegistered(string indexed trailId, string dataHash, uint256 timestamp);

    function registerImpact(
        string calldata trailId,
        string calldata dataHash,
        string calldata projectType
    ) external {
        require(!records[trailId].exists, "Trail already registered");
        records[trailId] = ImpactRecord(trailId, dataHash, projectType, block.timestamp, true);
        emit ImpactRegistered(trailId, dataHash, block.timestamp);
    }

    function verify(string calldata trailId) external view returns (string memory, uint256) {
        require(records[trailId].exists, "Record not found");
        return (records[trailId].dataHash, records[trailId].timestamp);
    }
}
```

### 9. Integracao Backend com Polygon

Usar `ethers.js` v6 (ja referenciado no `lib/pipeline/polygon-registry.ts`):

```bash
npm install ethers
```

O codigo em `polygon-registry.ts` ja tem a estrutura completa com `buildRegistryPacket()` e `registerOnPolygon()` -- basta substituir a simulacao pelo codigo real:

```typescript
// Substituir simulacao por:
const provider = new ethers.JsonRpcProvider(POLYGON_CONFIG[network].rpcUrl)
const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY!, provider)
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet)
const tx = await contract.registerImpact(trail.id, packetHash, trail.type)
const receipt = await tx.wait()
```

Configuracao de rede:

- **Testnet (Amoy):** chainId 80002, RPC: `https://rpc-amoy.polygon.technology`
- **Mainnet:** chainId 137, RPC: `https://polygon-rpc.com`

### 10. Fluxo Pipeline Completo

A trilha de dados ja esta estruturada nos route handlers (`/api/pipeline/`):

**Social:** `register` -> `donate` -> `vca-complete` -> `finalize` (hash + registro Polygon)

**Ambiental:** `register` -> `ingest` (dados IoT) -> `certify` -> `finalize` (hash + registro Polygon)

---

## FASE 4 -- Pos-Polygon (Futuro)

### 11. Transferencia para Inscription BTC

Isso so acontece DEPOIS que o registro esta confirmado na Polygon. E um processo separado, provavelmente feito por outra plataforma parceira. O backend da Sthation apenas:

- Exporta o pacote completo de dados (JSON + hash) via API
- Marca o status como `EXPORTED_FOR_INSCRIPTION`
- A plataforma parceira faz a inscription via Ordinals

---

## Stack Recomendada

| Camada          | Tecnologia                              |
| --------------- | --------------------------------------- |
| Runtime         | Node.js 20+ com TypeScript              |
| Framework       | NestJS ou Express + Prisma              |
| Banco           | PostgreSQL 15+ (Supabase ou Neon)       |
| Auth            | JWT + bcrypt + refresh tokens           |
| Blockchain      | ethers.js v6 + Polygon Amoy/Mainnet    |
| Smart Contract  | Solidity 0.8.19 + Hardhat para deploy   |
| Storage         | Vercel Blob ou AWS S3                   |
| Pagamento       | Stripe ou Mercado Pago (PIX)            |
| Jobs            | node-cron (fechar VCA 48h, splits)      |
| Cache           | Redis (ranking, sessions)               |

---

## Variaveis de Ambiente Necessarias

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_PRIVATE_KEY=... (wallet do admin para gas)
POLYGON_CONTRACT_ADDRESS=... (apos deploy do contrato)
STORAGE_URL=... (Vercel Blob ou S3)
PAYMENT_GATEWAY_KEY=... (Stripe ou MercadoPago)
```

---

## Nota Final

O frontend ja esta 100% preparado com mock data. O desenvolvedor backend precisa implementar os endpoints documentados em `BACKEND_API_DOCUMENTATION.md`, e quando cada API estiver pronta, basta trocar os mocks nos componentes pelas chamadas reais via `fetch` ou `SWR`.

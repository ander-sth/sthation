// Biblioteca para integracao com Polygon blockchain
// Funciona em modo simulacao quando as variaveis de ambiente nao estao configuradas

import crypto from "crypto"

// Tipos
export interface CertificateData {
  projectId: string
  title: string
  institutionId: string
  co2Equivalent: number
  wasteProcessed: number
  certifiedAt: string
  certifierName: string
}

export interface BlockchainResult {
  txHash: string
  blockNumber: number
}

export interface CertificateOnChain {
  certHash: string
  co2Avoided: string
  wasteProcessed: string
  timestamp: number
  registeredBy: string
}

// ABI simplificado para o contrato de certificados
const CERTIFICATE_ABI = [
  "function registerCertificate(string memory projectId, string memory certHash, uint256 co2Avoided, uint256 wasteProcessed) public returns (uint256)",
  "function getCertificate(string memory projectId) public view returns (string memory certHash, uint256 co2Avoided, uint256 wasteProcessed, uint256 timestamp, address registeredBy)",
  "function verifyCertificate(string memory projectId, string memory certHash) public view returns (bool)",
  "event CertificateRegistered(string indexed projectId, string certHash, uint256 co2Avoided, uint256 timestamp)"
]

// Gerar hash do certificado usando crypto nativo (nao depende do ethers)
export function generateCertificateHash(data: CertificateData): string {
  const message = JSON.stringify({
    projectId: data.projectId,
    title: data.title,
    institutionId: data.institutionId,
    co2Equivalent: data.co2Equivalent,
    wasteProcessed: data.wasteProcessed,
    certifiedAt: data.certifiedAt,
    certifierName: data.certifierName,
    platform: "STHation",
    version: "1.0"
  })
  
  // Usar SHA256 e formatar como hex com prefixo 0x (compativel com keccak256)
  const hash = crypto.createHash("sha256").update(message).digest("hex")
  return `0x${hash}`
}

// Funcao lazy para carregar ethers
async function loadEthers() {
  const ethers = await import("ethers")
  return ethers
}

// Registrar certificado na blockchain
export async function registerCertificateOnChain(
  projectId: string,
  certHash: string,
  co2Avoided: number,
  wasteProcessed: number,
  testnet = true
): Promise<BlockchainResult> {
  const config = {
    POLYGON_TESTNET_RPC_URL: process.env.POLYGON_TESTNET_RPC_URL || "https://rpc-amoy.polygon.technology",
    POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    CONTRACT_ADDRESS: process.env.STHATION_CONTRACT_ADDRESS,
    PRIVATE_KEY: process.env.STHATION_WALLET_PRIVATE_KEY
  }

  // Se nao tiver configuracao, retornar hash simulado
  if (!config.CONTRACT_ADDRESS || !config.PRIVATE_KEY) {
    console.log("[BLOCKCHAIN] Modo simulacao - sem contract/wallet configurado")
    const simulatedHash = `0x${crypto.randomBytes(32).toString("hex")}`
    return {
      txHash: simulatedHash,
      blockNumber: Math.floor(Date.now() / 1000)
    }
  }

  try {
    const { ethers } = await loadEthers()
    const rpcUrl = testnet ? config.POLYGON_TESTNET_RPC_URL : config.POLYGON_RPC_URL
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const wallet = new ethers.Wallet(config.PRIVATE_KEY, provider)
    const contract = new ethers.Contract(config.CONTRACT_ADDRESS, CERTIFICATE_ABI, wallet)
    
    const co2Wei = ethers.parseUnits(co2Avoided.toString(), 18)
    const wasteWei = ethers.parseUnits(wasteProcessed.toString(), 18)
    
    const tx = await contract.registerCertificate(projectId, certHash, co2Wei, wasteWei)
    const receipt = await tx.wait()
    
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("[BLOCKCHAIN] Erro ao registrar:", errorMessage)
    throw new Error(`Falha ao registrar na blockchain: ${errorMessage}`)
  }
}

// Verificar certificado na blockchain
export async function verifyCertificateOnChain(
  projectId: string,
  certHash: string,
  testnet = true
): Promise<boolean> {
  const config = {
    POLYGON_TESTNET_RPC_URL: process.env.POLYGON_TESTNET_RPC_URL || "https://rpc-amoy.polygon.technology",
    POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    CONTRACT_ADDRESS: process.env.STHATION_CONTRACT_ADDRESS
  }

  if (!config.CONTRACT_ADDRESS) {
    return true // Modo simulacao
  }

  try {
    const { ethers } = await loadEthers()
    const rpcUrl = testnet ? config.POLYGON_TESTNET_RPC_URL : config.POLYGON_RPC_URL
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const contract = new ethers.Contract(config.CONTRACT_ADDRESS, CERTIFICATE_ABI, provider)
    
    return await contract.verifyCertificate(projectId, certHash)
  } catch (error) {
    console.error("[BLOCKCHAIN] Erro ao verificar:", error)
    return false
  }
}

// Obter detalhes do certificado na blockchain
export async function getCertificateFromChain(
  projectId: string,
  testnet = true
): Promise<CertificateOnChain | null> {
  const config = {
    POLYGON_TESTNET_RPC_URL: process.env.POLYGON_TESTNET_RPC_URL || "https://rpc-amoy.polygon.technology",
    POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    CONTRACT_ADDRESS: process.env.STHATION_CONTRACT_ADDRESS
  }

  if (!config.CONTRACT_ADDRESS) {
    return null // Modo simulacao
  }

  try {
    const { ethers } = await loadEthers()
    const rpcUrl = testnet ? config.POLYGON_TESTNET_RPC_URL : config.POLYGON_RPC_URL
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const contract = new ethers.Contract(config.CONTRACT_ADDRESS, CERTIFICATE_ABI, provider)
    
    const result = await contract.getCertificate(projectId)
    
    return {
      certHash: result[0],
      co2Avoided: ethers.formatUnits(result[1], 18),
      wasteProcessed: ethers.formatUnits(result[2], 18),
      timestamp: Number(result[3]),
      registeredBy: result[4]
    }
  } catch (error) {
    console.error("[BLOCKCHAIN] Erro ao obter certificado:", error)
    return null
  }
}

// Obter link do explorer
export function getExplorerLink(txHash: string, testnet = true): string {
  const baseUrl = testnet 
    ? "https://amoy.polygonscan.com" 
    : "https://polygonscan.com"
  return `${baseUrl}/tx/${txHash}`
}

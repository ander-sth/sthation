// Biblioteca para integracao com Polygon blockchain
// Funciona em modo simulacao quando as variaveis de ambiente nao estao configuradas

// Configuracao Polygon - lidas em runtime
const getConfig = () => ({
  POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
  POLYGON_TESTNET_RPC_URL: process.env.POLYGON_TESTNET_RPC_URL || "https://rpc-amoy.polygon.technology",
  CONTRACT_ADDRESS: process.env.STHATION_CONTRACT_ADDRESS || "",
  PRIVATE_KEY: process.env.STHATION_WALLET_PRIVATE_KEY || ""
})

// ABI simplificado para o contrato de certificados
const CERTIFICATE_ABI = [
  "function registerCertificate(string memory projectId, string memory certHash, uint256 co2Avoided, uint256 wasteProcessed) public returns (uint256)",
  "function getCertificate(string memory projectId) public view returns (string memory certHash, uint256 co2Avoided, uint256 wasteProcessed, uint256 timestamp, address registeredBy)",
  "function verifyCertificate(string memory projectId, string memory certHash) public view returns (bool)",
  "event CertificateRegistered(string indexed projectId, string certHash, uint256 co2Avoided, uint256 timestamp)"
]

// Funcao para obter provider - importa ethers dinamicamente
export async function getProvider(testnet = true) {
  const { ethers } = await import("ethers")
  const config = getConfig()
  const rpcUrl = testnet ? config.POLYGON_TESTNET_RPC_URL : config.POLYGON_RPC_URL
  return new ethers.JsonRpcProvider(rpcUrl)
}

// Funcao para obter wallet
export async function getWallet(testnet = true) {
  const { ethers } = await import("ethers")
  const config = getConfig()
  if (!config.PRIVATE_KEY) {
    throw new Error("STHATION_WALLET_PRIVATE_KEY nao configurada")
  }
  const provider = await getProvider(testnet)
  return new ethers.Wallet(config.PRIVATE_KEY, provider)
}

// Funcao para obter contrato
export async function getContract(testnet = true) {
  const { ethers } = await import("ethers")
  const config = getConfig()
  if (!config.CONTRACT_ADDRESS) {
    throw new Error("STHATION_CONTRACT_ADDRESS nao configurado")
  }
  const wallet = await getWallet(testnet)
  return new ethers.Contract(config.CONTRACT_ADDRESS, CERTIFICATE_ABI, wallet)
}

// Gerar hash do certificado
export async function generateCertificateHash(data: {
  projectId: string
  title: string
  institutionId: string
  co2Equivalent: number
  wasteProcessed: number
  certifiedAt: string
  certifierName: string
}): Promise<string> {
  const { ethers } = await import("ethers")
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
  
  return ethers.keccak256(ethers.toUtf8Bytes(message))
}

// Registrar certificado na blockchain
export async function registerCertificateOnChain(
  projectId: string,
  certHash: string,
  co2Avoided: number,
  wasteProcessed: number,
  testnet = true
): Promise<{ txHash: string; blockNumber: number }> {
  try {
    const { ethers } = await import("ethers")
    const contract = await getContract(testnet)
    
    // Converter valores para wei/unidades do contrato
    const co2Wei = ethers.parseUnits(co2Avoided.toString(), 18)
    const wasteWei = ethers.parseUnits(wasteProcessed.toString(), 18)
    
    // Enviar transacao
    const tx = await contract.registerCertificate(projectId, certHash, co2Wei, wasteWei)
    
    // Aguardar confirmacao
    const receipt = await tx.wait()
    
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    }
  } catch (error: any) {
    console.error("[BLOCKCHAIN] Erro ao registrar certificado:", error)
    throw new Error(`Falha ao registrar na blockchain: ${error.message}`)
  }
}

// Verificar certificado na blockchain
export async function verifyCertificateOnChain(
  projectId: string,
  certHash: string,
  testnet = true
): Promise<boolean> {
  try {
    const contract = await getContract(testnet)
    return await contract.verifyCertificate(projectId, certHash)
  } catch (error) {
    console.error("[BLOCKCHAIN] Erro ao verificar certificado:", error)
    return false
  }
}

// Obter detalhes do certificado na blockchain
export async function getCertificateFromChain(
  projectId: string,
  testnet = true
): Promise<{
  certHash: string
  co2Avoided: string
  wasteProcessed: string
  timestamp: number
  registeredBy: string
} | null> {
  try {
    const { ethers } = await import("ethers")
    const contract = await getContract(testnet)
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

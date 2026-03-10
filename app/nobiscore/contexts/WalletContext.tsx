"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface WalletContextType {
  // EVM (Polygon)
  evmAddress: string | null
  evmConnected: boolean
  evmConnecting: boolean
  connectEvm: () => Promise<void>
  disconnectEvm: () => void
  
  // Bitcoin
  btcAddress: string | null
  btcConnected: boolean
  btcConnecting: boolean
  connectBtc: (wallet: "unisat" | "xverse") => Promise<void>
  disconnectBtc: () => void
  
  // Utils
  formatAddress: (address: string) => string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  // EVM State
  const [evmAddress, setEvmAddress] = useState<string | null>(null)
  const [evmConnected, setEvmConnected] = useState(false)
  const [evmConnecting, setEvmConnecting] = useState(false)
  
  // BTC State
  const [btcAddress, setBtcAddress] = useState<string | null>(null)
  const [btcConnected, setBtcConnected] = useState(false)
  const [btcConnecting, setBtcConnecting] = useState(false)

  // Formatar endereço para exibição
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Verificar conexão existente ao carregar
  useEffect(() => {
    const checkExistingConnection = async () => {
      // Verificar EVM
      const storedEvmAddress = localStorage.getItem("nobiscore_evm_address")
      if (storedEvmAddress && typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: "eth_accounts" })
          if (accounts && accounts.length > 0) {
            const currentAddress = accounts[0].toLowerCase()
            if (currentAddress === storedEvmAddress.toLowerCase()) {
              setEvmAddress(storedEvmAddress)
              setEvmConnected(true)
            } else {
              localStorage.removeItem("nobiscore_evm_address")
            }
          }
        } catch (error) {
          console.error("Erro ao verificar conexão EVM:", error)
        }
      }

      // Verificar BTC
      const storedBtcAddress = localStorage.getItem("nobiscore_btc_address")
      if (storedBtcAddress) {
        setBtcAddress(storedBtcAddress)
        setBtcConnected(true)
      }
    }

    checkExistingConnection()

    // Listener para mudanças de conta MetaMask
    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectEvm()
        } else {
          setEvmAddress(accounts[0])
          localStorage.setItem("nobiscore_evm_address", accounts[0])
        }
      })

      (window as any).ethereum.on("chainChanged", () => {
        window.location.reload()
      })
    }
  }, [])

  // Conectar MetaMask (EVM)
  const connectEvm = async () => {
    setEvmConnecting(true)
    try {
      // Verificar se está no mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )

      if (typeof window !== "undefined" && (window as any).ethereum) {
        // MetaMask disponível (desktop ou mobile in-app browser)
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })

        if (accounts && accounts[0]) {
          // Verificar/mudar para Polygon
          try {
            await (window as any).ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x89" }], // Polygon Mainnet
            })
          } catch (switchError: any) {
            // Se a rede não existe, adicionar
            if (switchError.code === 4902) {
              await (window as any).ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x89",
                    chainName: "Polygon Mainnet",
                    nativeCurrency: {
                      name: "MATIC",
                      symbol: "MATIC",
                      decimals: 18,
                    },
                    rpcUrls: ["https://polygon-rpc.com/"],
                    blockExplorerUrls: ["https://polygonscan.com/"],
                  },
                ],
              })
            }
          }

          setEvmAddress(accounts[0])
          setEvmConnected(true)
          localStorage.setItem("nobiscore_evm_address", accounts[0])
        }
      } else if (isMobile) {
        // Mobile sem MetaMask instalada - abrir deep link
        const dappUrl = window.location.href
        const metamaskDeepLink = `https://metamask.app.link/dapp/${dappUrl.replace("https://", "")}`
        window.open(metamaskDeepLink, "_blank")
      } else {
        // Desktop sem MetaMask
        window.open("https://metamask.io/download/", "_blank")
      }
    } catch (error: any) {
      console.error("Erro ao conectar MetaMask:", error)
      throw new Error(error?.message || "Erro ao conectar carteira")
    } finally {
      setEvmConnecting(false)
    }
  }

  // Desconectar EVM
  const disconnectEvm = () => {
    setEvmAddress(null)
    setEvmConnected(false)
    localStorage.removeItem("nobiscore_evm_address")
  }

  // Conectar Bitcoin Wallet
  const connectBtc = async (wallet: "unisat" | "xverse") => {
    setBtcConnecting(true)
    try {
      if (wallet === "unisat") {
        if (typeof window !== "undefined" && (window as any).unisat) {
          const accounts = await (window as any).unisat.requestAccounts()
          if (accounts && accounts[0]) {
            setBtcAddress(accounts[0])
            setBtcConnected(true)
            localStorage.setItem("nobiscore_btc_address", accounts[0])
            localStorage.setItem("nobiscore_btc_wallet", "unisat")
          }
        } else {
          window.open("https://unisat.io/download", "_blank")
        }
      } else if (wallet === "xverse") {
        if (typeof window !== "undefined" && (window as any).XverseProviders) {
          const response = await (window as any).XverseProviders.request("getAccounts", {
            purposes: ["ordinals", "payment"],
          })
          if (response?.result?.[0]?.address) {
            setBtcAddress(response.result[0].address)
            setBtcConnected(true)
            localStorage.setItem("nobiscore_btc_address", response.result[0].address)
            localStorage.setItem("nobiscore_btc_wallet", "xverse")
          }
        } else {
          window.open("https://www.xverse.app/download", "_blank")
        }
      }
    } catch (error: any) {
      console.error("Erro ao conectar Bitcoin wallet:", error)
      throw new Error(error?.message || "Erro ao conectar carteira Bitcoin")
    } finally {
      setBtcConnecting(false)
    }
  }

  // Desconectar Bitcoin
  const disconnectBtc = () => {
    setBtcAddress(null)
    setBtcConnected(false)
    localStorage.removeItem("nobiscore_btc_address")
    localStorage.removeItem("nobiscore_btc_wallet")
  }

  return (
    <WalletContext.Provider
      value={{
        evmAddress,
        evmConnected,
        evmConnecting,
        connectEvm,
        disconnectEvm,
        btcAddress,
        btcConnected,
        btcConnecting,
        connectBtc,
        disconnectBtc,
        formatAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

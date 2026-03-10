"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "../contexts/WalletContext"
import { Wallet, Check, X, Loader2, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Ícone Polygon
function PolygonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 38 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28.7 12.5C28 12.1 27.1 12.1 26.3 12.5L20.8 15.7L17.1 17.8L11.6 21C10.9 21.4 10 21.4 9.2 21L5 18.5C4.3 18.1 3.8 17.3 3.8 16.5V11.5C3.8 10.7 4.2 10 5 9.5L9.2 7.1C9.9 6.7 10.8 6.7 11.6 7.1L15.8 9.6C16.5 10 17 10.8 17 11.6V14.8L20.7 12.6V9.3C20.7 8.5 20.3 7.8 19.5 7.3L11.7 2.7C11 2.3 10.1 2.3 9.3 2.7L1.3 7.4C0.5 7.9 0.1 8.6 0.1 9.4V18.6C0.1 19.4 0.5 20.1 1.3 20.6L9.3 25.3C10 25.7 10.9 25.7 11.7 25.3L17.2 22.2L20.9 20L26.4 16.9C27.1 16.5 28 16.5 28.8 16.9L33 19.3C33.7 19.7 34.2 20.5 34.2 21.3V26.3C34.2 27.1 33.8 27.8 33 28.3L28.8 30.8C28.1 31.2 27.2 31.2 26.4 30.8L22.2 28.4C21.5 28 21 27.2 21 26.4V23.3L17.3 25.5V28.7C17.3 29.5 17.7 30.2 18.5 30.7L26.5 35.4C27.2 35.8 28.1 35.8 28.9 35.4L36.9 30.7C37.6 30.3 38.1 29.5 38.1 28.7V19.4C38.1 18.6 37.7 17.9 36.9 17.4L28.7 12.5Z" fill="#8247E5"/>
    </svg>
  )
}

// Ícone Bitcoin
function BitcoinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F7931A"/>
      <path d="M22.5 13.6C22.8 11.5 21.2 10.4 19 9.6L19.7 6.9L18 6.5L17.4 9.1C16.9 9 16.5 8.9 16 8.8L16.6 6.2L14.9 5.8L14.2 8.5C13.8 8.4 13.4 8.3 13 8.2V8.2L10.7 7.6L10.2 9.4C10.2 9.4 11.5 9.7 11.4 9.7C12.1 9.9 12.2 10.3 12.2 10.7L11.4 13.8C11.5 13.8 11.5 13.8 11.6 13.9L11.4 13.8L10.3 18.2C10.2 18.4 10 18.8 9.4 18.6C9.4 18.7 8.2 18.4 8.2 18.4L7.3 20.4L9.5 20.9C9.9 21 10.4 21.1 10.8 21.2L10.1 24L11.8 24.4L12.5 21.7C13 21.8 13.5 21.9 14 22L13.3 24.7L15 25.1L15.7 22.4C18.5 22.9 20.6 22.7 21.5 20.2C22.2 18.2 21.5 17 20 16.3C21.1 16 21.9 15.3 22.1 14C22.5 14.1 22.5 13.6 22.5 13.6ZM18.3 19.3C17.8 21.3 14.4 20.2 13.3 19.9L14.2 16.5C15.3 16.8 18.8 17.2 18.3 19.3ZM18.8 13.6C18.4 15.4 15.5 14.5 14.6 14.2L15.4 11.1C16.3 11.4 19.3 11.7 18.8 13.6Z" fill="white"/>
    </svg>
  )
}

export function EvmWalletConnect() {
  const { evmAddress, evmConnected, evmConnecting, connectEvm, disconnectEvm, formatAddress } = useWallet()

  if (evmConnected && evmAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-white/5 border-purple-500/30 hover:bg-white/10 text-white">
            <PolygonIcon className="h-4 w-4 mr-2" />
            <span className="text-purple-400">{formatAddress(evmAddress)}</span>
            <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
          <DropdownMenuItem className="text-zinc-400 text-xs">
            {evmAddress}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem 
            onClick={() => navigator.clipboard.writeText(evmAddress)}
            className="text-white cursor-pointer"
          >
            Copiar Endereço
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => window.open(`https://polygonscan.com/address/${evmAddress}`, "_blank")}
            className="text-white cursor-pointer"
          >
            Ver no Explorer
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem onClick={disconnectEvm} className="text-red-400 cursor-pointer">
            <X className="h-4 w-4 mr-2" />
            Desconectar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      onClick={connectEvm}
      disabled={evmConnecting}
      className="bg-purple-600 hover:bg-purple-700 text-white"
    >
      {evmConnecting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <PolygonIcon className="h-4 w-4 mr-2" />
          Polygon
        </>
      )}
    </Button>
  )
}

export function BtcWalletConnect() {
  const { btcAddress, btcConnected, btcConnecting, connectBtc, disconnectBtc, formatAddress } = useWallet()
  const [showOptions, setShowOptions] = useState(false)

  if (btcConnected && btcAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-white/5 border-orange-500/30 hover:bg-white/10 text-white">
            <BitcoinIcon className="h-4 w-4 mr-2" />
            <span className="text-orange-400">{formatAddress(btcAddress)}</span>
            <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
          <DropdownMenuItem className="text-zinc-400 text-xs">
            {btcAddress}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem 
            onClick={() => navigator.clipboard.writeText(btcAddress)}
            className="text-white cursor-pointer"
          >
            Copiar Endereço
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => window.open(`https://ordinals.com/address/${btcAddress}`, "_blank")}
            className="text-white cursor-pointer"
          >
            Ver no Explorer
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem onClick={disconnectBtc} className="text-red-400 cursor-pointer">
            <X className="h-4 w-4 mr-2" />
            Desconectar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (showOptions) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => connectBtc("unisat")}
          disabled={btcConnecting}
          variant="outline"
          size="sm"
          className="bg-white/5 border-orange-500/30 hover:bg-white/10 text-white"
        >
          {btcConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unisat"}
        </Button>
        <Button
          onClick={() => connectBtc("xverse")}
          disabled={btcConnecting}
          variant="outline"
          size="sm"
          className="bg-white/5 border-orange-500/30 hover:bg-white/10 text-white"
        >
          {btcConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xverse"}
        </Button>
        <Button
          onClick={() => setShowOptions(false)}
          variant="ghost"
          size="sm"
          className="text-zinc-500"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={() => setShowOptions(true)}
      className="bg-orange-600 hover:bg-orange-700 text-white"
    >
      <BitcoinIcon className="h-4 w-4 mr-2" />
      Bitcoin
    </Button>
  )
}

export function WalletStatus() {
  const { evmConnected, btcConnected } = useWallet()

  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500">
      <div className="flex items-center gap-1">
        <div className={`h-2 w-2 rounded-full ${evmConnected ? "bg-purple-500" : "bg-zinc-600"}`} />
        <span>Polygon</span>
      </div>
      <div className="flex items-center gap-1">
        <div className={`h-2 w-2 rounded-full ${btcConnected ? "bg-orange-500" : "bg-zinc-600"}`} />
        <span>Bitcoin</span>
      </div>
    </div>
  )
}

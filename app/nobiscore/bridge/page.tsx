"use client"

import { useState } from "react"
import { 
  Flame, 
  ArrowRight, 
  Check, 
  Loader2, 
  Hexagon,
  Bitcoin,
  Shield,
  Sparkles,
  Copy,
  ExternalLink,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Mock impact tokens
const impactTokens = [
  { id: "plastic-001", name: "Plastic Recycled", symbol: "PLST", balance: "2.5", unit: "Tons", contractAddress: "0x7a25...F2488D" },
  { id: "organic-002", name: "Organic Waste", symbol: "ORGW", balance: "1.8", unit: "Tons", contractAddress: "0x3c44...a0F2e5" },
  { id: "ewaste-003", name: "E-Waste Processed", symbol: "EWST", balance: "320", unit: "kg", contractAddress: "0x90F7...D38c4b" },
  { id: "carbon-004", name: "Carbon Offset", symbol: "CO2E", balance: "5.2", unit: "tCO2e", contractAddress: "0x15d3...8E91a2" },
]

type BridgeStep = "select" | "confirm" | "burning" | "generating" | "minting" | "complete"

const steps = [
  { id: "burning", label: "Burning Polygon Tokens", description: "Destroying tokens on source chain" },
  { id: "generating", label: "Generating Proof", description: "Creating cryptographic attestation" },
  { id: "minting", label: "Minting Inscription", description: "Recording on Bitcoin blockchain" },
]

export default function TheBridgePage() {
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [step, setStep] = useState<BridgeStep>("select")
  const [currentProcessStep, setCurrentProcessStep] = useState(0)

  const selectedTokenData = impactTokens.find(t => t.id === selectedToken)
  const maxAmount = selectedTokenData ? parseFloat(selectedTokenData.balance) : 0

  const handleStartBridge = async () => {
    if (!selectedToken || !amount) return
    
    setStep("burning")
    setCurrentProcessStep(0)
    
    // Simulate burning process
    await new Promise(resolve => setTimeout(resolve, 3000))
    setCurrentProcessStep(1)
    setStep("generating")
    
    // Simulate proof generation
    await new Promise(resolve => setTimeout(resolve, 2500))
    setCurrentProcessStep(2)
    setStep("minting")
    
    // Simulate minting
    await new Promise(resolve => setTimeout(resolve, 4000))
    setStep("complete")
  }

  const resetBridge = () => {
    setStep("select")
    setSelectedToken("")
    setAmount("")
    setCurrentProcessStep(0)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">The Bridge</h1>
        <p className="text-neutral-400 mt-2">
          Transform your Polygon impact tokens into permanent Bitcoin Inscriptions
        </p>
      </div>

      {/* Main Bridge Interface */}
      <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
        <CardContent className="p-0">
          {/* Progress Steps Header */}
          {(step === "burning" || step === "generating" || step === "minting" || step === "complete") && (
            <div className="bg-neutral-950 border-b border-neutral-800 p-6">
              <div className="flex items-center justify-between">
                {steps.map((s, index) => (
                  <div key={s.id} className="flex items-center">
                    <div className="flex items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                        currentProcessStep > index 
                          ? "bg-green-500 border-green-500" 
                          : currentProcessStep === index 
                            ? "border-white bg-white/10" 
                            : "border-neutral-700 bg-neutral-900"
                      )}>
                        {currentProcessStep > index ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : currentProcessStep === index ? (
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <span className="text-neutral-500 font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="ml-3 hidden md:block">
                        <p className={cn(
                          "text-sm font-medium",
                          currentProcessStep >= index ? "text-white" : "text-neutral-500"
                        )}>
                          {s.label}
                        </p>
                        <p className="text-xs text-neutral-500">{s.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "w-12 md:w-24 h-0.5 mx-4",
                        currentProcessStep > index ? "bg-green-500" : "bg-neutral-800"
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Step 1: Select Token */}
            {step === "select" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Source Chain */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Hexagon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Source Chain</p>
                        <p className="text-xs text-neutral-500">Polygon Network</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-neutral-400">Select Impact Token</Label>
                      <Select value={selectedToken} onValueChange={setSelectedToken}>
                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white h-14">
                          <SelectValue placeholder="Choose a token to bridge" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-700">
                          {impactTokens.map((token) => (
                            <SelectItem 
                              key={token.id} 
                              value={token.id}
                              className="text-white focus:bg-neutral-700 focus:text-white"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                  <Hexagon className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{token.name}</p>
                                  <p className="text-xs text-neutral-400">
                                    Balance: {token.balance} {token.unit}
                                  </p>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedTokenData && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-neutral-400">Amount</Label>
                          <button 
                            onClick={() => setAmount(selectedTokenData.balance)}
                            className="text-xs text-purple-400 hover:text-purple-300"
                          >
                            MAX
                          </button>
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                            max={maxAmount}
                            className="bg-neutral-800 border-neutral-700 text-white text-xl h-14 pr-20"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                            {selectedTokenData.unit}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">
                          Available: {selectedTokenData.balance} {selectedTokenData.unit}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center justify-center">
                    <div className="p-4 bg-neutral-800 rounded-full">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Destination Chain */}
                  <div className="space-y-4 md:-ml-16">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Bitcoin className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Destination Chain</p>
                        <p className="text-xs text-neutral-500">Bitcoin Ordinals</p>
                      </div>
                    </div>

                    <Card className="bg-neutral-800/50 border-neutral-700">
                      <CardContent className="p-4">
                        <p className="text-neutral-400 text-sm mb-3">You will receive:</p>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Impact Inscription</p>
                            <p className="text-xs text-neutral-500">
                              {selectedTokenData 
                                ? `${amount || "0"} ${selectedTokenData.unit} ${selectedTokenData.name}` 
                                : "Select a token above"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex items-start gap-2 p-3 bg-neutral-800/30 rounded-lg border border-neutral-800">
                      <Shield className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-neutral-400">
                        Your impact data will be permanently recorded on Bitcoin with cryptographic proof of authenticity.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleStartBridge}
                  disabled={!selectedToken || !amount || parseFloat(amount) <= 0}
                  className="w-full h-14 bg-white text-black hover:bg-neutral-200 font-medium text-base"
                >
                  <Flame className="w-5 h-5 mr-2" />
                  Burn & Mint Inscription
                </Button>
              </div>
            )}

            {/* Processing Steps */}
            {(step === "burning" || step === "generating" || step === "minting") && (
              <div className="text-center py-12">
                <div className="relative inline-flex">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center animate-pulse">
                    <Flame className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -inset-4 border-2 border-orange-500/30 rounded-3xl animate-ping" />
                </div>
                <h2 className="text-2xl font-bold text-white mt-8">
                  {step === "burning" && "Burning Polygon Tokens..."}
                  {step === "generating" && "Generating Proof..."}
                  {step === "minting" && "Minting Bitcoin Inscription..."}
                </h2>
                <p className="text-neutral-400 mt-2">
                  {step === "burning" && "Destroying ERC-1155 tokens on Polygon network"}
                  {step === "generating" && "Creating cryptographic attestation of impact data"}
                  {step === "minting" && "Recording inscription on Bitcoin blockchain"}
                </p>
                <div className="flex items-center justify-center gap-2 mt-6 text-neutral-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Do not close this window</span>
                </div>
              </div>
            )}

            {/* Complete */}
            {step === "complete" && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mt-6">Inscription Created!</h2>
                <p className="text-neutral-400 mt-2">
                  Your impact data has been permanently recorded on Bitcoin
                </p>

                {/* Result Card */}
                <Card className="bg-neutral-800/50 border-neutral-700 mt-8 max-w-md mx-auto">
                  <CardContent className="p-6">
                    <div className="w-full aspect-square bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center mb-4 border border-neutral-700">
                      <div className="text-center">
                        <Sparkles className="w-16 h-16 text-orange-400 mx-auto" />
                        <p className="text-white font-medium mt-4">
                          {selectedTokenData?.name}
                        </p>
                        <p className="text-neutral-400 text-sm">
                          {amount} {selectedTokenData?.unit}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg">
                        <span className="text-neutral-400 text-sm">Inscription ID</span>
                        <div className="flex items-center gap-2">
                          <code className="text-orange-400 text-sm font-mono">#67482901</code>
                          <button className="text-neutral-500 hover:text-white">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg">
                        <span className="text-neutral-400 text-sm">Ordinal ID</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-neutral-300 font-mono">bc1p...9rus</code>
                          <button className="text-neutral-500 hover:text-white">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3 justify-center mt-8">
                  <Button 
                    variant="outline" 
                    onClick={resetBridge}
                    className="border-neutral-700 text-white hover:bg-neutral-800"
                  >
                    Bridge More
                  </Button>
                  <Button className="bg-white text-black hover:bg-neutral-200">
                    View in Marketplace
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      {step === "select" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-5">
              <div className="p-2 bg-purple-500/10 rounded-lg w-fit mb-3">
                <Hexagon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-medium">ERC-1155 Tokens</h3>
              <p className="text-neutral-500 text-sm mt-1">
                Your verified impact tokens on Polygon are burned permanently
              </p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-5">
              <div className="p-2 bg-green-500/10 rounded-lg w-fit mb-3">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-white font-medium">Cryptographic Proof</h3>
              <p className="text-neutral-500 text-sm mt-1">
                Zero-knowledge attestation ensures data integrity
              </p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-5">
              <div className="p-2 bg-orange-500/10 rounded-lg w-fit mb-3">
                <Bitcoin className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-white font-medium">Bitcoin Inscription</h3>
              <p className="text-neutral-500 text-sm mt-1">
                Immutable record on the most secure blockchain
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

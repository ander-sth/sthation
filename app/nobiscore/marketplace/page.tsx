"use client"

import { useState } from "react"
import { 
  Search, 
  Filter, 
  Bitcoin, 
  Sparkles, 
  Heart,
  ExternalLink,
  Grid3X3,
  List,
  ArrowUpDown,
  Leaf,
  Recycle,
  Droplets,
  Zap
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Mock marketplace data
const inscriptions = [
  {
    id: "INS-001",
    ordinalId: "bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297",
    inscriptionNumber: 67482901,
    title: "500kg Plastic Recycled",
    description: "Verified plastic recycling from municipal waste program in São Paulo, Brazil",
    category: "plastic",
    impactValue: "500",
    impactUnit: "kg",
    price: "0.0125",
    seller: "0x7a25...2488D",
    verified: true,
    featured: true,
    createdAt: "2024-01-15",
    location: "São Paulo, Brazil",
    carbonEquivalent: "0.45 tCO2e"
  },
  {
    id: "INS-002",
    ordinalId: "bc1p8x3nfk2m4qw9z5c6v7b8n9m0a1s2d3f4g5h6j7k8l9p0q1r2s3t4u5v6w7x8y9z",
    inscriptionNumber: 67483102,
    title: "1 Ton Organic Waste",
    description: "Composted organic waste from urban farming initiative in Curitiba",
    category: "organic",
    impactValue: "1000",
    impactUnit: "kg",
    price: "0.0089",
    seller: "0x3c44...F2e5",
    verified: true,
    featured: false,
    createdAt: "2024-01-14",
    location: "Curitiba, Brazil",
    carbonEquivalent: "0.32 tCO2e"
  },
  {
    id: "INS-003",
    ordinalId: "bc1p2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4",
    inscriptionNumber: 67483245,
    title: "Carbon Offset Credit",
    description: "Verified carbon offset from reforestation project in Amazon",
    category: "carbon",
    impactValue: "2.5",
    impactUnit: "tCO2e",
    price: "0.0342",
    seller: "0x15d3...91a2",
    verified: true,
    featured: true,
    createdAt: "2024-01-13",
    location: "Amazonas, Brazil",
    carbonEquivalent: "2.5 tCO2e"
  },
  {
    id: "INS-004",
    ordinalId: "bc1p9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3z2y1x0w9v8",
    inscriptionNumber: 67483567,
    title: "320kg E-Waste Processed",
    description: "Electronic waste properly recycled and certified in authorized facility",
    category: "ewaste",
    impactValue: "320",
    impactUnit: "kg",
    price: "0.0178",
    seller: "0x90F7...8c4b",
    verified: true,
    featured: false,
    createdAt: "2024-01-12",
    location: "Campinas, Brazil",
    carbonEquivalent: "0.89 tCO2e"
  },
  {
    id: "INS-005",
    ordinalId: "bc1p1q2w3e4r5t6y7u8i9o0p1a2s3d4f5g6h7j8k9l0z1x2c3v4b5n6m7q8w9e0r1t2y",
    inscriptionNumber: 67483789,
    title: "Water Purification Credits",
    description: "Clean water provided to communities through filtration systems",
    category: "water",
    impactValue: "50000",
    impactUnit: "liters",
    price: "0.0056",
    seller: "0x22B4...7F3a",
    verified: true,
    featured: false,
    createdAt: "2024-01-11",
    location: "Recife, Brazil",
    carbonEquivalent: "0.12 tCO2e"
  },
  {
    id: "INS-006",
    ordinalId: "bc1p0p9o8i7u6y5t4r3e2w1q0a9s8d7f6g5h4j3k2l1z0x9c8v7b6n5m4q3w2e1r0t9y",
    inscriptionNumber: 67484012,
    title: "Renewable Energy Certificate",
    description: "Solar energy generation certificate from community solar farm",
    category: "energy",
    impactValue: "1500",
    impactUnit: "kWh",
    price: "0.0234",
    seller: "0x55C1...9D2b",
    verified: true,
    featured: true,
    createdAt: "2024-01-10",
    location: "Fortaleza, Brazil",
    carbonEquivalent: "0.67 tCO2e"
  },
]

const categories = [
  { value: "all", label: "All Categories", icon: Grid3X3 },
  { value: "plastic", label: "Plastic Recycling", icon: Recycle },
  { value: "organic", label: "Organic Waste", icon: Leaf },
  { value: "carbon", label: "Carbon Credits", icon: Sparkles },
  { value: "ewaste", label: "E-Waste", icon: Zap },
  { value: "water", label: "Water", icon: Droplets },
]

function getCategoryIcon(category: string) {
  switch (category) {
    case "plastic": return Recycle
    case "organic": return Leaf
    case "carbon": return Sparkles
    case "ewaste": return Zap
    case "water": return Droplets
    default: return Sparkles
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case "plastic": return "from-blue-600 to-blue-800"
    case "organic": return "from-green-600 to-green-800"
    case "carbon": return "from-emerald-600 to-emerald-800"
    case "ewaste": return "from-yellow-600 to-yellow-800"
    case "water": return "from-cyan-600 to-cyan-800"
    case "energy": return "from-orange-600 to-orange-800"
    default: return "from-purple-600 to-purple-800"
  }
}

function InscriptionCard({ inscription, onBuy }: { inscription: typeof inscriptions[0], onBuy: () => void }) {
  const [liked, setLiked] = useState(false)
  const CategoryIcon = getCategoryIcon(inscription.category)

  return (
    <Card className="bg-neutral-900 border-neutral-800 overflow-hidden group hover:border-neutral-700 transition-all">
      {/* Image/Preview Area */}
      <div className={cn(
        "aspect-square relative bg-gradient-to-br",
        getCategoryColor(inscription.category)
      )}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <CategoryIcon className="w-16 h-16 text-white/80 mx-auto" />
            <p className="text-white font-bold text-2xl mt-4">{inscription.impactValue}</p>
            <p className="text-white/70 text-sm">{inscription.impactUnit}</p>
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {inscription.featured && (
            <Badge className="bg-orange-500 text-white border-0 text-xs">
              Featured
            </Badge>
          )}
          {inscription.verified && (
            <Badge className="bg-green-500/90 text-white border-0 text-xs">
              Verified
            </Badge>
          )}
        </div>

        {/* Like Button */}
        <button 
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
        >
          <Heart className={cn("w-4 h-4", liked ? "fill-red-500 text-red-500" : "text-white")} />
        </button>

        {/* Inscription Number */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="outline" className="bg-black/50 backdrop-blur-sm border-white/20 text-white text-xs font-mono">
            #{inscription.inscriptionNumber}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="text-white font-medium truncate">{inscription.title}</h3>
        <p className="text-neutral-500 text-sm mt-1 line-clamp-2">{inscription.description}</p>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-800">
          <div>
            <p className="text-neutral-500 text-xs">Price</p>
            <div className="flex items-center gap-1">
              <Bitcoin className="w-4 h-4 text-orange-400" />
              <span className="text-white font-medium">{inscription.price} BTC</span>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-white text-black hover:bg-neutral-200"
              >
                Buy Now
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>Purchase Inscription</DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Review the details before purchasing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className={cn(
                  "aspect-video rounded-lg bg-gradient-to-br flex items-center justify-center",
                  getCategoryColor(inscription.category)
                )}>
                  <div className="text-center">
                    <CategoryIcon className="w-12 h-12 text-white/80 mx-auto" />
                    <p className="text-white font-bold text-xl mt-2">{inscription.impactValue} {inscription.impactUnit}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Title</span>
                    <span className="text-white">{inscription.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Carbon Equivalent</span>
                    <span className="text-white">{inscription.carbonEquivalent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Location</span>
                    <span className="text-white">{inscription.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Inscription #</span>
                    <span className="text-white font-mono">#{inscription.inscriptionNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-3 border-t border-neutral-800">
                    <span className="text-neutral-400">Total Price</span>
                    <div className="flex items-center gap-1">
                      <Bitcoin className="w-4 h-4 text-orange-400" />
                      <span className="text-white font-bold">{inscription.price} BTC</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-white text-black hover:bg-neutral-200">
                  Confirm Purchase
                </Button>
                <p className="text-xs text-neutral-500 text-center">
                  Make sure your BTC wallet is connected
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MarketplacePage() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [category, setCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  const filteredInscriptions = inscriptions.filter(ins => {
    if (category !== "all" && ins.category !== category) return false
    if (search && !ins.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Marketplace</h1>
        <p className="text-neutral-400 mt-2">
          Discover and acquire verified Impact Inscriptions on Bitcoin
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <p className="text-neutral-500 text-sm">Total Inscriptions</p>
            <p className="text-2xl font-bold text-white">12,847</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <p className="text-neutral-500 text-sm">24h Volume</p>
            <p className="text-2xl font-bold text-white">2.45 BTC</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <p className="text-neutral-500 text-sm">Floor Price</p>
            <p className="text-2xl font-bold text-white">0.0012 BTC</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <p className="text-neutral-500 text-sm">Carbon Offset</p>
            <p className="text-2xl font-bold text-white">5,420 tCO2e</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input
              placeholder="Search inscriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500"
            />
          </div>

          {/* Category Filter */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px] bg-neutral-900 border-neutral-800 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              {categories.map((cat) => (
                <SelectItem 
                  key={cat.value} 
                  value={cat.value}
                  className="text-white focus:bg-neutral-800 focus:text-white"
                >
                  <div className="flex items-center gap-2">
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-neutral-900 border-neutral-800 text-white">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="recent" className="text-white focus:bg-neutral-800">Recent</SelectItem>
              <SelectItem value="price-low" className="text-white focus:bg-neutral-800">Price: Low to High</SelectItem>
              <SelectItem value="price-high" className="text-white focus:bg-neutral-800">Price: High to Low</SelectItem>
              <SelectItem value="impact" className="text-white focus:bg-neutral-800">Highest Impact</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-2 rounded-md transition-colors",
              view === "grid" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-2 rounded-md transition-colors",
              view === "list" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-neutral-500 text-sm">
        Showing {filteredInscriptions.length} inscriptions
      </p>

      {/* Grid */}
      <div className={cn(
        "grid gap-4",
        view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
      )}>
        {filteredInscriptions.map((inscription) => (
          <InscriptionCard 
            key={inscription.id} 
            inscription={inscription} 
            onBuy={() => {}}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-8">
        <Button variant="outline" className="border-neutral-800 text-white hover:bg-neutral-800">
          Load More
        </Button>
      </div>
    </div>
  )
}

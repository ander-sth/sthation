"use client"

import { useState } from "react"
import { 
  Search, 
  Filter, 
  Bitcoin, 
  Sparkles, 
  Heart,
  Grid3X3,
  List,
  ArrowUpDown,
  Leaf,
  Recycle,
  Droplets,
  Zap,
  Loader2
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
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

const categories = [
  { value: "all", label: "Todas Categorias", icon: Grid3X3 },
  { value: "plastic", label: "Reciclagem", icon: Recycle },
  { value: "organic", label: "Orgânicos", icon: Leaf },
  { value: "carbon", label: "Carbono", icon: Sparkles },
  { value: "ewaste", label: "E-Waste", icon: Zap },
  { value: "water", label: "Água", icon: Droplets },
]

function getCategoryIcon(category: string) {
  const cat = category?.toLowerCase() || ""
  if (cat.includes("plastic") || cat.includes("recicl")) return Recycle
  if (cat.includes("organic") || cat.includes("compost")) return Leaf
  if (cat.includes("carbon") || cat.includes("co2")) return Sparkles
  if (cat.includes("ewaste") || cat.includes("eletro")) return Zap
  if (cat.includes("water") || cat.includes("água")) return Droplets
  return Sparkles
}

function getCategoryColor(type: string, category?: string) {
  if (type === "SOCIAL") return "from-pink-600 to-pink-800"
  if (type === "AMBIENTAL") {
    const cat = category?.toLowerCase() || ""
    if (cat.includes("plastic") || cat.includes("recicl")) return "from-blue-600 to-blue-800"
    if (cat.includes("organic")) return "from-green-600 to-green-800"
    if (cat.includes("carbon")) return "from-emerald-600 to-emerald-800"
    return "from-green-600 to-green-800"
  }
  return "from-purple-600 to-purple-800"
}

function InscriptionCard({ listing }: { listing: any }) {
  const [liked, setLiked] = useState(false)
  const CategoryIcon = listing.type === "SOCIAL" ? Heart : getCategoryIcon(listing.category)

  return (
    <Card className="bg-neutral-900 border-neutral-800 overflow-hidden group hover:border-neutral-700 transition-all">
      {/* Image/Preview Area */}
      <div className={cn(
        "aspect-square relative bg-gradient-to-br",
        getCategoryColor(listing.type, listing.category)
      )}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <CategoryIcon className="w-16 h-16 text-white/80 mx-auto" />
            <p className="text-white font-bold text-lg mt-4 px-4 line-clamp-2">{listing.title}</p>
            {listing.vca_score && (
              <p className="text-white/70 text-sm mt-1">Score: {listing.vca_score}</p>
            )}
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={cn(
            "text-white border-0 text-xs",
            listing.type === "SOCIAL" ? "bg-pink-500" : "bg-green-500"
          )}>
            {listing.type}
          </Badge>
        </div>

        {/* Like Button */}
        <button 
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
        >
          <Heart className={cn("w-4 h-4", liked ? "fill-red-500 text-red-500" : "text-white")} />
        </button>

        {/* Inscription ID */}
        {listing.inscription_id && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className="bg-black/50 backdrop-blur-sm border-white/20 text-white text-xs font-mono">
              {listing.inscription_id.slice(0, 12)}...
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="text-white font-medium truncate">{listing.title}</h3>
        <p className="text-neutral-500 text-sm mt-1 line-clamp-2">
          {listing.description || `${listing.institution_name} - ${listing.location_name || listing.location_state}`}
        </p>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-800">
          <div>
            <p className="text-neutral-500 text-xs">Beneficiários</p>
            <span className="text-white font-medium">
              {listing.estimated_beneficiaries?.toLocaleString() || "N/A"}
            </span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-white text-black hover:bg-neutral-200"
              >
                Ver Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>{listing.title}</DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Detalhes da Impact Inscription
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className={cn(
                  "aspect-video rounded-lg bg-gradient-to-br flex items-center justify-center",
                  getCategoryColor(listing.type, listing.category)
                )}>
                  <div className="text-center">
                    <CategoryIcon className="w-12 h-12 text-white/80 mx-auto" />
                    <p className="text-white font-bold text-xl mt-2">{listing.type}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Instituição</span>
                    <span className="text-white">{listing.institution_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Categoria</span>
                    <span className="text-white">{listing.category || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Local</span>
                    <span className="text-white">{listing.location_name || listing.location_state || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Beneficiários</span>
                    <span className="text-white">{listing.estimated_beneficiaries?.toLocaleString() || "N/A"}</span>
                  </div>
                  {listing.vca_score && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">VCA Score</span>
                      <span className="text-white font-mono">{listing.vca_score}</span>
                    </div>
                  )}
                  {listing.inscription_id && (
                    <div className="flex justify-between text-sm pt-3 border-t border-neutral-800">
                      <span className="text-neutral-400">Inscription ID</span>
                      <code className="text-white font-mono text-xs">
                        {listing.inscription_id.slice(0, 20)}...
                      </code>
                    </div>
                  )}
                </div>

                <Button className="w-full bg-white text-black hover:bg-neutral-200" disabled>
                  Negociação em Breve
                </Button>
                <p className="text-xs text-neutral-500 text-center">
                  Marketplace de negociação será habilitado em breve
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
  const [type, setType] = useState("all")

  const { data, isLoading } = useSWR(
    `/api/nobiscore/marketplace?type=${type}&category=${category !== 'all' ? category : ''}&search=${search}&sortBy=${sortBy}`,
    fetcher
  )

  const listings = data?.listings || []
  const stats = data?.stats || {}
  const dbCategories = data?.categories || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Marketplace</h1>
        <p className="text-neutral-400 mt-2">
          Descubra Impact Inscriptions verificadas no Bitcoin
        </p>
      </div>

      {/* Stats Bar - Dados Reais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <p className="text-neutral-500 text-sm">Total Inscriptions</p>
            <p className="text-2xl font-bold text-white">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.total_listings || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <p className="text-neutral-500 text-sm">Impacto Social</p>
            <p className="text-2xl font-bold text-white">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.social_count || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <p className="text-neutral-500 text-sm">Impacto Ambiental</p>
            <p className="text-2xl font-bold text-white">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.environmental_count || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4">
            <p className="text-neutral-500 text-sm">Categorias</p>
            <p className="text-2xl font-bold text-white">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : dbCategories.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full md:w-auto flex-wrap">
          {/* Search */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input
              placeholder="Buscar inscriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500"
            />
          </div>

          {/* Type Filter */}
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[140px] bg-neutral-900 border-neutral-800 text-white">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem value="all" className="text-white focus:bg-neutral-800">Todos</SelectItem>
              <SelectItem value="SOCIAL" className="text-white focus:bg-neutral-800">Social</SelectItem>
              <SelectItem value="AMBIENTAL" className="text-white focus:bg-neutral-800">Ambiental</SelectItem>
            </SelectContent>
          </Select>

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
              <SelectItem value="recent" className="text-white focus:bg-neutral-800">Recentes</SelectItem>
              <SelectItem value="impact" className="text-white focus:bg-neutral-800">Maior Impacto</SelectItem>
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
        {isLoading ? "Carregando..." : `Mostrando ${listings.length} inscriptions`}
      </p>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <Bitcoin className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-white text-lg font-medium">Nenhuma Inscription disponível</h3>
          <p className="text-neutral-500 mt-2">
            Inscriptions aparecerão aqui quando forem mintadas e listadas para venda
          </p>
        </div>
      ) : (
        <div className={cn(
          "grid gap-4",
          view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
          {listings.map((listing: any) => (
            <InscriptionCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Load More */}
      {listings.length > 0 && (
        <div className="flex justify-center pt-8">
          <Button variant="outline" className="border-neutral-800 text-white hover:bg-neutral-800">
            Carregar Mais
          </Button>
        </div>
      )}
    </div>
  )
}

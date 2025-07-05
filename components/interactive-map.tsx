"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Star, Mountain, Layers, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface InteractiveMapProps {
  onLandSelect?: (land: any) => void
}

export function InteractiveMap({ onLandSelect }: InteractiveMapProps) {
  const [zoom, setZoom] = useState(1)
  const [selectedLand, setSelectedLand] = useState<any>(null)
  const [mapLayer, setMapLayer] = useState<"ownership" | "rarity" | "terrain" | "income">("ownership")

  // 简化的地图数据
  const mapData = [
    { id: 1, x: 0, y: 0, rarity: "神话", terrain: "圣地", income: 180, isOwned: true, owner: "你", price: null },
    { id: 2, x: 1, y: 0, rarity: "传说", terrain: "山峰", income: 150, isOwned: false, owner: null, price: 3000 },
    { id: 3, x: 0, y: 1, rarity: "史诗", terrain: "森林", income: 120, isOwned: true, owner: "其他用户", price: null },
    { id: 4, x: 1, y: 1, rarity: "稀有", terrain: "湖泊", income: 90, isOwned: false, owner: null, price: 1500 },
  ]

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta))
    setZoom(newZoom)
  }

  const resetMap = () => {
    setZoom(1)
    setSelectedLand(null)
  }

  const handleLandClick = (land: any) => {
    setSelectedLand(land)
    onLandSelect?.(land)
  }

  const getLandColor = (land: any) => {
    switch (mapLayer) {
      case "ownership":
        if (land.owner === "你") return "bg-green-500 border-green-400"
        if (land.isOwned) return "bg-gray-500 border-gray-400"
        return "bg-slate-600 border-slate-500 border-dashed"
      case "rarity":
        switch (land.rarity) {
          case "神话": return "bg-purple-600 border-purple-400"
          case "传说": return "bg-yellow-500 border-yellow-400"
          case "史诗": return "bg-blue-500 border-blue-400"
          case "稀有": return "bg-green-500 border-green-400"
          default: return "bg-gray-500 border-gray-400"
        }
      case "terrain":
        switch (land.terrain) {
          case "森林": return "bg-green-600 border-green-400"
          case "山峰": return "bg-stone-600 border-stone-400"
          case "湖泊": return "bg-blue-600 border-blue-400"
          case "圣地": return "bg-yellow-600 border-yellow-400"
          default: return "bg-amber-600 border-amber-400"
        }
      case "income":
        if (land.income > 150) return "bg-red-500 border-red-400"
        if (land.income > 100) return "bg-orange-500 border-orange-400"
        if (land.income > 50) return "bg-yellow-500 border-yellow-400"
        return "bg-green-500 border-green-400"
      default:
        return "bg-gray-500 border-gray-400"
    }
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">天堂土地地图</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-700/50 text-gray-300 text-xs">
              缩放: {(zoom * 100).toFixed(0)}%
            </Badge>
            <Badge variant="secondary" className="bg-slate-700/50 text-gray-300 text-xs">
              2x2
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoom(0.2)}
              className="border-slate-600/50 text-gray-300 hover:bg-white/5 h-8 w-8 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoom(-0.2)}
              className="border-slate-600/50 text-gray-300 hover:bg-white/5 h-8 w-8 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetMap}
              className="border-slate-600/50 text-gray-300 hover:bg-white/5 h-8 w-8 p-0 bg-transparent"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-1">
            {[
              { key: "ownership", label: "所有权", icon: MapPin },
              { key: "rarity", label: "稀有度", icon: Star },
              { key: "terrain", label: "地形", icon: Mountain },
              { key: "income", label: "收益", icon: Layers },
            ].map((layer) => (
              <Button
                key={layer.key}
                size="sm"
                variant={mapLayer === layer.key ? "default" : "outline"}
                onClick={() => setMapLayer(layer.key as any)}
                className={`h-8 px-3 text-xs ${
                  mapLayer === layer.key 
                    ? "bg-purple-500 hover:bg-purple-600" 
                    : "border-slate-600/50 text-gray-300 hover:bg-white/5"
                }`}
              >
                <layer.icon className="w-3 h-3 mr-1" />
                {layer.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {mapData.map((land) => (
            <div
              key={land.id}
              className={`aspect-square rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${getLandColor(land)} ${
                selectedLand?.id === land.id ? "ring-2 ring-yellow-400 ring-offset-2" : ""
              }`}
              onClick={() => handleLandClick(land)}
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-2">
                <span className="text-white text-xs font-bold mb-1">{land.x},{land.y}</span>
                <span className="text-white text-xs">{land.rarity}</span>
                <span className="text-white text-xs">{land.terrain}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedLand && (
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold">
                土地 ({selectedLand.x}, {selectedLand.y})
              </h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedLand(null)}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">稀有度</p>
                <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {selectedLand.rarity}
                </Badge>
              </div>
              <div>
                <p className="text-gray-400 mb-1">地形</p>
                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {selectedLand.terrain}
                </Badge>
              </div>
              <div>
                <p className="text-gray-400 mb-1">日收益</p>
                <p className="text-yellow-400 font-bold">{selectedLand.income} ANGEL</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">状态</p>
                <p className="text-white font-semibold">
                  {selectedLand.isOwned ? selectedLand.owner : `${selectedLand.price} ANGEL`}
                </p>
              </div>
            </div>

            {!selectedLand.isOwned && (
              <Button className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white h-9">
                购买土地 - {selectedLand.price} ANGEL
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
} 
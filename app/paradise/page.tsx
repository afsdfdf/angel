"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Map, ImageIcon, Heart, Share2, Eye, ShoppingCart, Sparkles } from "lucide-react"
import Image from "next/image"

import { PageHeader } from "@/components/page-header"
import { MemeBackground, MemeCard, MemeButton } from "@/components/meme-background"

// 土地类型定义
const landTypes = [
  {
    id: 1,
    name: "天界花园",
    type: "治愈·灵植",
    image: "/CelestialGarden.png",
    description: "由蓝白光晕与花林圣泉组成，符文能量环绕，象征生命复苏与灵性繁荣，是治愈之力源泉",
    rarity: "传奇",
    rarityColor: "from-purple-500 to-pink-500",
    basePrice: "800 ANGEL",
    baseIncome: "45-65 ANGEL/天",
    attributes: ["治愈加成 +25%", "灵植产量 +30%", "符文能量 +20%"]
  },
  {
    id: 2,
    name: "神圣矿山",
    type: "探索·资源",
    image: "/SacredMine.png",
    description: "巨岩与雷能矿脉交错，机械符文流转，矿石微光闪烁，隐匿强大能量等待开采",
    rarity: "史诗",
    rarityColor: "from-orange-500 to-red-500",
    basePrice: "1200 ANGEL",
    baseIncome: "65-85 ANGEL/天",
    attributes: ["挖矿效率 +40%", "雷能矿脉 +35%", "机械符文 +25%"]
  },
  {
    id: 3,
    name: "星光湖泊",
    type: "静修·净化",
    image: "/StarlakeDomain.png",
    description: "银蓝湖面映射星辉，宁静中涌动灵魂之力，是净化与觉醒的冥想圣地",
    rarity: "稀有",
    rarityColor: "from-blue-500 to-cyan-500",
    basePrice: "600 ANGEL",
    baseIncome: "35-50 ANGEL/天",
    attributes: ["净化效果 +30%", "星辉能量 +25%", "冥想加成 +20%"]
  },
  {
    id: 4,
    name: "光明圣所",
    type: "信仰·能量",
    image: "/LightSanctuary.png",
    description: "净化光柱穿透神圣建筑，智慧之流贯通大地，是神性链接之处，供给信仰力量与觉知启示",
    rarity: "神话",
    rarityColor: "from-yellow-400 to-amber-500",
    basePrice: "2000 ANGEL",
    baseIncome: "85-120 ANGEL/天",
    attributes: ["信仰力量 +50%", "神性链接 +40%", "智慧之流 +35%"]
  }
]

export default function ParadisePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLand, setSelectedLand] = useState<any>(null)

  // 用户拥有的土地（示例数据）
  const myLands = [
    { 
      ...landTypes[0], 
      id: 101,
      level: 15, 
      income: "58.47 ANGEL/天",
      owned: true,
      purchaseDate: "2024-01-15"
    },
    { 
      ...landTypes[1], 
      id: 102,
      level: 12, 
      income: "72.23 ANGEL/天",
      owned: true,
      purchaseDate: "2024-01-20"
    },
    { 
      ...landTypes[2], 
      id: 103,
      level: 8, 
      income: "41.67 ANGEL/天",
      owned: true,
      purchaseDate: "2024-02-01"
    },
  ]

  // 市场上的土地
  const marketplace = [
    { 
      ...landTypes[3], 
      id: 201,
      level: 20, 
      price: "2,150 ANGEL",
      seller: "0x1234...5678",
      available: true
    },
    { 
      ...landTypes[0], 
      id: 202,
      level: 18, 
      price: "950 ANGEL",
      seller: "0x9876...4321",
      available: true
    },
    { 
      ...landTypes[1], 
      id: 203,
      level: 16, 
      price: "1,350 ANGEL",
      seller: "0x5555...9999",
      available: true
    },
  ]

  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader title="天使乐园" emoji="🏝️" />

      <div className="px-4 pb-4 pt-20 space-y-6">
        {/* 统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: "🗺️", label: "拥有土地", value: "3" },
            { emoji: "💰", label: "总收益", value: "172.37" },
            { emoji: "💎", label: "总价值", value: "$3.2K" },
            { emoji: "⭐", label: "等级", value: "35" },
          ].map((stat, index) => (
            <MemeCard key={index} className="p-4 text-center bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <div className="text-2xl mb-2">{stat.emoji}</div>
              <p className="font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </MemeCard>
          ))}
        </div>

        <Tabs defaultValue="myLands" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 rounded-xl p-1">
            <TabsTrigger value="myLands" className="rounded-lg data-[state=active]:bg-green-500 data-[state=active]:text-white">
              🏝️ 我的土地
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="rounded-lg data-[state=active]:bg-green-500 data-[state=active]:text-white">
              🛒 土地市场
            </TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-lg data-[state=active]:bg-green-500 data-[state=active]:text-white">
              🖼️ 土地图鉴
            </TabsTrigger>
          </TabsList>

          <TabsContent value="myLands" className="space-y-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索我的土地..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80 border-gray-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {myLands.map((land) => (
                <MemeCard key={land.id} className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={land.image}
                        alt={land.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">{land.name}</h3>
                        <Badge className={`bg-gradient-to-r ${land.rarityColor} text-white`}>
                          {land.rarity} Lv.{land.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{land.type}</p>
                      <p className="font-bold text-green-600 mb-3">{land.income}</p>
                      <div className="flex gap-2">
                        <MemeButton variant="meme" className="flex-1">
                          ⚡ 收获
                        </MemeButton>
                        <MemeButton variant="default" className="flex-1">
                          👁️ 查看
                        </MemeButton>
                      </div>
                    </div>
                  </div>
                </MemeCard>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索土地市场..."
                className="pl-10 bg-white/80 border-gray-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {marketplace.map((land) => (
                <MemeCard key={land.id} className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={land.image}
                        alt={land.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">{land.name}</h3>
                        <Badge className={`bg-gradient-to-r ${land.rarityColor} text-white`}>
                          {land.rarity} Lv.{land.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{land.type}</p>
                      <p className="text-xs text-gray-500 mb-2">卖家: {land.seller}</p>
                      <p className="text-lg font-bold text-gray-800 mb-3">{land.price}</p>
                      <div className="flex gap-2">
                        <MemeButton variant="meme" className="flex-1">
                          🛒 立即购买
                        </MemeButton>
                        <MemeButton variant="default" className="px-3">
                          👁️
                        </MemeButton>
                      </div>
                    </div>
                  </div>
                </MemeCard>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {landTypes.map((land) => (
                <MemeCard key={land.id} className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-100">
                    <Image
                      src={land.image}
                      alt={land.name}
                      width={400}
                      height={300}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-800">{land.name}</h3>
                      <Badge className={`bg-gradient-to-r ${land.rarityColor} text-white`}>
                        {land.rarity}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-blue-600">{land.type}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{land.description}</p>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">基础属性:</p>
                      <div className="flex flex-wrap gap-1">
                        {land.attributes.map((attr, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {attr}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm">
                        <p className="text-gray-600">基础价格: <span className="font-bold text-gray-800">{land.basePrice}</span></p>
                        <p className="text-gray-600">收益范围: <span className="font-bold text-green-600">{land.baseIncome}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <MemeButton variant="default" className="px-3">
                          <Heart className="w-4 h-4" />
                        </MemeButton>
                        <MemeButton variant="default" className="px-3">
                          <Share2 className="w-4 h-4" />
                        </MemeButton>
                      </div>
                    </div>
                  </div>
                </MemeCard>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MemeBackground>
  )
}

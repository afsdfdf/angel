"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { MemeBackground, MemeCard, MemeButton } from "@/components/meme-background"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sparkles, TrendingUp, Users, Gift, Star, Zap, Shield, Crown } from "lucide-react"
import type { User } from "@/lib/database"

export default function NFTPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [selectedTab, setSelectedTab] = useState("marketplace")

  // NFT数据 - 在实际应用中应从 API 获取
  const [nftCollections, setNftCollections] = useState([
    {
      id: 1,
      name: "天使守护者",
      englishName: "GuardianAngel",
      description: "金色羽翼在宇宙中展开，符文圣袍与圣剑象征神圣使命，额头浮雕BSC Logo体现信仰的核心力量",
      image: "/GuardianAngel.png",
      price: "1000 ANGEL",
      rarity: "神话",
      rarityColor: "from-yellow-400 via-orange-500 to-red-500",
      rarityIcon: "👑",
      attributes: [
        { name: "力量", value: "99" },
        { name: "防御", value: "98" },
        { name: "速度", value: "95" },
        { name: "魔法", value: "100" }
      ]
    },
    {
      id: 2,
      name: "光明使者",
      englishName: "LightBringer",
              description: "白光羽翼照亮净化之路，圣剑铭刻\"净化\"字样，胸口圣徽嵌入Logo，守护光明的意志坚定不移",
      image: "/LightBringer.png",
      price: "500 ANGEL",
      rarity: "传奇",
      rarityColor: "from-purple-500 via-purple-600 to-indigo-600",
      rarityIcon: "⭐",
      attributes: [
        { name: "力量", value: "90" },
        { name: "防御", value: "88" },
        { name: "速度", value: "92" },
        { name: "魔法", value: "95" }
      ]
    },
    {
      id: 3,
      name: "战斗天使",
      englishName: "BattleSeraph",
      description: "暗银机械翅膀振动雷霆战场，烈焰战刃蕴藏BSC核心能量，圣剑中央精雕Logo，如史诗般燃烧",
      image: "/battleseraph.png",
      price: "200 ANGEL",
      rarity: "史诗",
      rarityColor: "from-blue-500 via-cyan-500 to-teal-500",
      rarityIcon: "⚔️",
      attributes: [
        { name: "力量", value: "95" },
        { name: "防御", value: "85" },
        { name: "速度", value: "88" },
        { name: "魔法", value: "82" }
      ]
    },
    {
      id: 4,
      name: "治愈天使",
      englishName: "HealingCelestia",
      description: "蓝色轻羽舞动花林圣泉，治愈圣袍环绕生命之光，法杖光球脉动中，背景符文映出Logo疗愈之力",
      image: "/HealingCelestia.png",
      price: "100 ANGEL",
      rarity: "普通",
      rarityColor: "from-green-400 via-emerald-500 to-teal-500",
      rarityIcon: "��",
      attributes: [
        { name: "力量", value: "70" },
        { name: "防御", value: "80" },
        { name: "速度", value: "75" },
        { name: "魔法", value: "90" }
      ]
    }
  ])

  const [userNFTs, setUserNFTs] = useState([
    {
      id: 1,
      name: "我的守护天使",
      description: "您的第一个天使NFT",
      image: "/GuardianAngel.png",
      level: 5,
      experience: 750,
      maxExperience: 1000
    },
    {
      id: 2,
      name: "光芒战士",
      description: "在战斗中获得的珍贵天使",
      image: "/LightBringer.png",
      level: 3,
      experience: 420,
      maxExperience: 600
    }
  ])

  // 从 API 加载 NFT 数据
  useEffect(() => {
    const loadNFTData = async () => {
      try {
        // TODO: 实现从 API 获取 NFT 数据
        // const collectionsResponse = await fetch('/api/nft/collections')
        // const collectionsData = await collectionsResponse.json()
        // setNftCollections(collectionsData)
        
        // const userNFTsResponse = await fetch('/api/nft/user')
        // const userNFTsData = await userNFTsResponse.json()
        // setUserNFTs(userNFTsData)
      } catch (error) {
        console.error('加载 NFT 数据失败:', error)
      }
    }
    
    loadNFTData()
  }, [])

  const getRarityTextColor = (rarity: string) => {
    switch(rarity) {
      case "神话": return "text-yellow-600"
      case "传奇": return "text-purple-600"
      case "史诗": return "text-blue-600"
      case "普通": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader 
        title="天使NFT" 
        emoji="🎨" 
        notifications={1}
        onUserChange={setUser}
      />
      
      <div className="container mx-auto px-4 pb-4 max-w-md pt-20">
        <div className="space-y-6">
          {/* 页面标题和统计 */}
          <MemeCard className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">天使NFT市场</h2>
              <p className="text-gray-600 text-sm">收集、交易和升级您的天使NFT</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div className="text-2xl mb-1">🎨</div>
                <div className="text-lg font-bold text-purple-600">4</div>
                <div className="text-xs text-purple-500">总收藏</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="text-2xl mb-1">💎</div>
                <div className="text-lg font-bold text-blue-600">2</div>
                <div className="text-xs text-blue-500">稀有NFT</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-lg font-bold text-green-600">1,800</div>
                <div className="text-xs text-green-500">总价值</div>
              </div>
            </div>
          </MemeCard>

          {/* 标签页 */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-1">
              <TabsTrigger 
                value="marketplace" 
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                市场
              </TabsTrigger>
              <TabsTrigger 
                value="collection" 
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                收藏
              </TabsTrigger>
              <TabsTrigger 
                value="create" 
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                创建
              </TabsTrigger>
            </TabsList>

            {/* 市场标签页 */}
            <TabsContent value="marketplace" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 gap-4">
                {nftCollections.map((nft) => (
                  <MemeCard key={nft.id} className="p-3 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                    <div className="flex flex-col gap-3" onClick={() => router.push(`/nft/${nft.id}`)}>
                      {/* NFT图片 */}
                      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg">
                        <Image
                          src={nft.image}
                          alt={nft.name}
                          fill
                          className="object-contain"
                          priority
                        />
                        {/* 稀有度标签 */}
                        <div className="absolute top-2 right-2">
                          <Badge className={`bg-gradient-to-r ${nft.rarityColor} text-white border-0 text-xs font-bold shadow-lg`}>
                            {nft.rarityIcon} {nft.rarity}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {/* 标题和英文名 */}
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{nft.name}</h3>
                          <p className="text-sm text-gray-500">{nft.englishName}</p>
                        </div>
                        
                        {/* 简介 */}
                        <p className="text-sm text-gray-600 leading-relaxed">{nft.description}</p>
                        
                        {/* 属性 */}
                        <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-xl">
                          {nft.attributes.map((attr, index) => (
                            <div key={index} className="text-center">
                              <div className="text-xs text-gray-500 mb-1">{attr.name}</div>
                              <div className="text-sm font-bold text-gray-800">{attr.value}</div>
                            </div>
                          ))}
                        </div>
                        
                        {/* 价格和购买按钮 */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {nft.price}
                          </div>
                          <MemeButton 
                            size="sm" 
                            className={`bg-gradient-to-r ${nft.rarityColor} hover:opacity-90 text-white font-bold shadow-lg`}
                          >
                            购买NFT
                          </MemeButton>
                        </div>
                      </div>
                    </div>
                  </MemeCard>
                ))}
              </div>
            </TabsContent>

            {/* 收藏标签页 */}
            <TabsContent value="collection" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 gap-4">
                {userNFTs.map((nft) => (
                  <MemeCard key={nft.id} className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 overflow-hidden rounded-lg">
                        <Image
                          src={nft.image}
                          alt={nft.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-800">{nft.name}</h3>
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-xs">
                            Lv.{nft.level}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{nft.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">经验值</span>
                            <span className="text-gray-800">{nft.experience}/{nft.maxExperience}</span>
                          </div>
                          <Progress 
                            value={(nft.experience / nft.maxExperience) * 100} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <MemeButton size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                            升级
                          </MemeButton>
                          <MemeButton size="sm" className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                            交易
                          </MemeButton>
                        </div>
                      </div>
                    </div>
                  </MemeCard>
                ))}
              </div>
            </TabsContent>

            {/* 创建标签页 */}
            <TabsContent value="create" className="space-y-4 mt-6">
              <MemeCard className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">创建您的天使NFT</h3>
                    <p className="text-gray-600 text-sm">
                      使用您的创意和想象力，创造独一无二的天使NFT
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Crown className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-800">创建费用</div>
                          <div className="text-sm text-gray-600">50 ANGEL</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Zap className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-800">铸造时间</div>
                          <div className="text-sm text-gray-600">约5-10分钟</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <MemeButton className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    开始创建
                  </MemeButton>
                </div>
              </MemeCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MemeBackground>
  )
}

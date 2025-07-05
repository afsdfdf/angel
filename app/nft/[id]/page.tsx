"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import Image from "next/image"
import { MemeBackground, MemeCard, MemeButton } from "@/components/meme-background"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Heart, Share2, ExternalLink, TrendingUp, Users, Clock, Star } from "lucide-react"
import type { User } from "@/lib/database"

interface NFTData {
  id: number
  name: string
  englishName: string
  description: string
  image: string
  price: string
  rarity: string
  rarityColor: string
  rarityIcon: string
  attributes: { name: string; value: string }[]
  owner?: string
  creator?: string
  createdAt?: string
  views?: number
  likes?: number
  history?: Array<{
    event: string
    price?: string
    from?: string
    to?: string
    date: string
  }>
}

export default function NFTDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [nft, setNft] = useState<NFTData | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(true)

  // NFT数据
  const nftData: Record<string, NFTData> = {
    "1": {
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
      ],
      owner: "0x1234...5678",
      creator: "Angel Team",
      createdAt: "2024-01-15",
      views: 1234,
      likes: 89,
      history: [
        { event: "创建", from: "Angel Team", date: "2024-01-15" },
        { event: "上架", price: "1000 ANGEL", date: "2024-01-15" }
      ]
    },
    "2": {
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
      ],
      owner: "0x2345...6789",
      creator: "Angel Team",
      createdAt: "2024-01-20",
      views: 892,
      likes: 67,
      history: [
        { event: "创建", from: "Angel Team", date: "2024-01-20" },
        { event: "上架", price: "500 ANGEL", date: "2024-01-20" }
      ]
    },
    "3": {
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
      ],
      owner: "0x3456...7890",
      creator: "Angel Team",
      createdAt: "2024-01-25",
      views: 654,
      likes: 45,
      history: [
        { event: "创建", from: "Angel Team", date: "2024-01-25" },
        { event: "上架", price: "200 ANGEL", date: "2024-01-25" }
      ]
    },
    "4": {
      id: 4,
      name: "治愈天使",
      englishName: "HealingCelestia",
      description: "蓝色轻羽舞动花林圣泉，治愈圣袍环绕生命之光，法杖光球脉动中，背景符文映出Logo疗愈之力",
      image: "/HealingCelestia.png",
      price: "100 ANGEL",
      rarity: "普通",
      rarityColor: "from-green-400 via-emerald-500 to-teal-500",
      rarityIcon: "💚",
      attributes: [
        { name: "力量", value: "70" },
        { name: "防御", value: "80" },
        { name: "速度", value: "75" },
        { name: "魔法", value: "90" }
      ],
      owner: "0x4567...8901",
      creator: "Angel Team",
      createdAt: "2024-02-01",
      views: 432,
      likes: 28,
      history: [
        { event: "创建", from: "Angel Team", date: "2024-02-01" },
        { event: "上架", price: "100 ANGEL", date: "2024-02-01" }
      ]
    }
  }

  useEffect(() => {
    const id = params.id as string
    if (id && nftData[id]) {
      setNft(nftData[id])
    }
    setLoading(false)
  }, [params.id])

  const handleLike = () => {
    setIsLiked(!isLiked)
    if (nft) {
      setNft({
        ...nft,
        likes: isLiked ? (nft.likes || 0) - 1 : (nft.likes || 0) + 1
      })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: nft?.name,
        text: nft?.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("链接已复制到剪贴板")
    }
  }

  if (loading) {
    return (
      <MemeBackground variant="premium" overlay={true}>
        <div className="container mx-auto px-4 pb-4 max-w-md">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        </div>
      </MemeBackground>
    )
  }

  if (!nft) {
    return (
      <MemeBackground variant="premium" overlay={true}>
        <div className="container mx-auto px-4 pb-4 max-w-md">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-4">😢</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">NFT不存在</h2>
              <p className="text-gray-600 mb-4">抱歉，找不到您要查看的NFT</p>
              <MemeButton onClick={() => router.push("/nft")}>
                返回NFT市场
              </MemeButton>
            </div>
          </div>
        </div>
      </MemeBackground>
    )
  }

  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader 
        title="NFT详情" 
        emoji="🎨" 
        notifications={1}
        onUserChange={setUser}
      />
      
      <div className="container mx-auto px-4 pb-4 max-w-md pt-20">
        <div className="space-y-4">
          {/* 返回按钮 */}
          <MemeButton
            variant="default"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </MemeButton>

          {/* NFT主图 */}
          <MemeCard className="p-3 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg mb-4">
              <Image
                src={nft.image}
                alt={nft.name}
                fill
                className="object-contain"
                priority
              />
              {/* 稀有度标签 */}
              <div className="absolute top-2 right-2">
                <Badge className={`bg-gradient-to-r ${nft.rarityColor} text-white border-0 text-sm font-bold shadow-lg`}>
                  {nft.rarityIcon} {nft.rarity}
                </Badge>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 mb-4">
              <MemeButton
                variant="default"
                size="sm"
                onClick={handleLike}
                className={`flex-1 ${isLiked ? 'bg-red-50 border-red-200' : ''}`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                {nft.likes}
              </MemeButton>
              <MemeButton
                variant="default"
                size="sm"
                onClick={handleShare}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </MemeButton>
              <MemeButton
                variant="default"
                size="sm"
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                区块链
              </MemeButton>
            </div>

            {/* 基本信息 */}
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{nft.name}</h1>
                <p className="text-gray-500">{nft.englishName}</p>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed">{nft.description}</p>

              {/* 统计信息 */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {nft.views} 查看
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {nft.createdAt}
                </div>
              </div>
            </div>
          </MemeCard>

          {/* 属性 */}
          <MemeCard className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <h3 className="font-bold text-gray-800 mb-3">属性</h3>
            <div className="grid grid-cols-2 gap-3">
              {nft.attributes.map((attr, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">{attr.name}</div>
                  <div className="text-lg font-bold text-gray-800">{attr.value}</div>
                  <Progress value={parseInt(attr.value)} className="h-2 mt-2" />
                </div>
              ))}
            </div>
          </MemeCard>

          {/* 所有者信息 */}
          <MemeCard className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <h3 className="font-bold text-gray-800 mb-3">所有者信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">当前所有者</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {nft.owner}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">创建者</span>
                <span className="font-semibold text-gray-800">{nft.creator}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">创建时间</span>
                <span className="text-gray-800">{nft.createdAt}</span>
              </div>
            </div>
          </MemeCard>

          {/* 历史记录 */}
          <MemeCard className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <h3 className="font-bold text-gray-800 mb-3">历史记录</h3>
            <div className="space-y-3">
              {nft.history?.map((record, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{record.event}</div>
                    <div className="text-sm text-gray-600">
                      {record.from && `来自: ${record.from}`}
                      {record.price && ` • 价格: ${record.price}`}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{record.date}</div>
                </div>
              ))}
            </div>
          </MemeCard>

          {/* 购买/出价 */}
          <MemeCard className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <div className="text-center space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">当前价格</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {nft.price}
                </div>
              </div>
              
              <div className="flex gap-3">
                <MemeButton 
                  className={`flex-1 bg-gradient-to-r ${nft.rarityColor} hover:opacity-90 text-white font-bold shadow-lg`}
                >
                  立即购买
                </MemeButton>
                <MemeButton 
                  variant="default" 
                  className="flex-1"
                >
                  出价
                </MemeButton>
              </div>
            </div>
          </MemeCard>
        </div>
      </div>
    </MemeBackground>
  )
} 
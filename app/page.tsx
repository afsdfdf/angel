"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, TrendingUp, Users, Gift, ArrowUpDown, Zap, Shield, Star } from "lucide-react"
import Link from "next/link"
import { WalletConnect } from "@/components/wallet-connect"
import { MemeBackground, MemeCard, MemeButton } from "@/components/meme-background"
import { AngelDecorations } from "@/components/angel-decorations"
import { InteractiveMap } from "@/components/interactive-map"
import { TokenLogo } from "@/components/token-logo"
import { PageHeader } from "@/components/page-header"
import { AngelBrand } from "@/components/angel-logo"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)

  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader 
        title="天使加密" 
        emoji="😇" 
        notifications={3}
        showBalance={true}
        angelBalance={user?.angel_balance || 0}
      />
      
      <div className="container mx-auto px-4 pb-4 max-w-md pt-20">
        <div className="space-y-6">
          <AngelDecorations />
          
          {/* 欢迎横幅 - WEB3 风格 */}
          <MemeCard className="p-6 bg-gradient-primary text-white border-0 shadow-angel-primary rounded-3xl hover-glow-primary">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">欢迎来到天使世界！</h2>
                <p className="text-white/90 text-sm">
                  {user ? `欢迎回来，${user.wallet_address?.slice(0, 6)}...` : "连接钱包开始您的天使之旅"}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <AngelBrand size="sm" showText={false} />
              </div>
            </div>
          </MemeCard>

          {/* 预售按钮 - 醒目位置 */}
          <Link href="/presale">
            <MemeCard className="p-6 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white border-0 shadow-2xl rounded-3xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer hover-glow-primary animate-pulse">
              <div className="text-center">
                <div className="text-4xl mb-3">🚀</div>
                <h2 className="text-2xl font-bold mb-2">ANGEL 代币预售</h2>
                <p className="text-white/90 text-sm mb-4">
                  限时预售中 • 早鸟优惠 • 立即参与
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-bold">立即购买</span>
                  <span className="text-2xl">→</span>
                </div>
              </div>
            </MemeCard>
          </Link>

          {/* 钱包连接提示（如果未连接） */}
          {!isAuthenticated && (
            <MemeCard className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
              <div className="text-center">
                <div className="text-3xl mb-3">👛</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">连接钱包开始</h3>
                <p className="text-gray-600 mb-4">
                  连接您的钱包以查看余额、邀请朋友和获得奖励
                </p>
                <WalletConnect />
              </div>
            </MemeCard>
          )}

          {/* 快速统计 - WEB3 风格 */}
          <div className="grid grid-cols-2 gap-4">
            <MemeCard className="p-4 glass-card border-0 shadow-angel-accent rounded-2xl touch-feedback hover-glow-accent">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-gold rounded-xl flex items-center justify-center shadow-angel-gold">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-foreground">
                  {loading ? "..." : (user?.angel_balance?.toFixed(2) || "0.00")}
                </div>
                <div className="text-xs text-muted-foreground">ANGEL 余额</div>
              </div>
            </MemeCard>
            
            <MemeCard className="p-4 glass-card border-0 shadow-angel-secondary rounded-2xl touch-feedback hover-glow-secondary">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-angel-secondary">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-foreground">
                  {user?.total_referrals || 0}
                </div>
                <div className="text-xs text-muted-foreground">推荐好友</div>
              </div>
            </MemeCard>
          </div>

          {/* 今日任务 */}
          <MemeCard className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">✨</span>
              今日任务
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">每日签到</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">+10 ANGEL</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">2</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">完成交易</span>
                </div>
                <Badge variant="outline" className="border-blue-200 text-blue-700">+50 ANGEL</Badge>
              </div>
            </div>
          </MemeCard>

          {/* 功能导航 - WEB3 风格 */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { 
                icon: ArrowUpDown, 
                label: "交换", 
                desc: "买卖ANGEL", 
                href: "/swap", 
                color: "bg-gradient-secondary",
                shadow: "shadow-angel-accent",
                hover: "hover-glow-accent"
              },
              { 
                icon: Sparkles, 
                label: "NFT", 
                desc: "天使卡牌", 
                href: "/nft", 
                color: "bg-gradient-primary",
                shadow: "shadow-angel-primary",
                hover: "hover-glow-primary"
              },
              { 
                icon: Zap, 
                label: "乐园", 
                desc: "天使土地", 
                href: "/paradise", 
                color: "bg-angel-success",
                shadow: "shadow-angel-accent",
                hover: "hover-glow-accent"
              },
              { 
                icon: TrendingUp, 
                label: "质押", 
                desc: "赚取收益", 
                href: "/staking", 
                color: "bg-gradient-gold",
                shadow: "shadow-angel-gold",
                hover: "hover-glow-gold"
              },
            ].map((item, index) => {
              const IconComponent = item.icon
              return (
                <Link key={index} href={item.href}>
                  <MemeCard className={`p-5 glass-card border-0 ${item.shadow} rounded-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer min-h-[120px] flex flex-col justify-center ${item.hover}`}>
                    <div className="text-center">
                      <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3 ${item.shadow}`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-bold text-foreground mb-1 text-sm">{item.label}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </MemeCard>
                </Link>
              )
            })}
          </div>

          {/* 用户资产（如果已连接钱包） */}
          {user && (
            <MemeCard className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">💎</span>
                我的资产
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <TokenLogo symbol="ANGEL" size={32} />
                    <div>
                      <div className="font-medium text-gray-800">ANGEL</div>
                      <div className="text-xs text-gray-600">天使代币</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">{user?.angel_balance?.toFixed(2) || "0.00"}</div>
                    <div className="text-xs text-gray-600">≈ ${((user?.angel_balance || 0) * 0.1).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </MemeCard>
          )}

          {/* 最新动态 */}
          <MemeCard className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">📢</span>
              最新动态
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">NFT 市场上线</p>
                    <p className="text-xs text-gray-600 mt-1">独家天使卡牌现已开放交易</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">质押奖励提升</p>
                    <p className="text-xs text-gray-600 mt-1">年化收益率现已提升至 15%</p>
                  </div>
                </div>
              </div>
            </div>
          </MemeCard>

          {/* 邀请好友 */}
          <MemeCard className="p-6 bg-gradient-to-r from-pink-500/90 to-purple-500/90 text-white border-0 shadow-xl rounded-3xl">
            <div className="text-center">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="text-lg font-bold mb-2">邀请好友赚奖励</h3>
              <p className="text-pink-100 text-sm mb-4">
                每邀请一位好友，您和好友都可获得 100 ANGEL 奖励
              </p>
              <Link href="/profile">
                <MemeButton 
                  variant="glass" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  立即邀请
                </MemeButton>
              </Link>
            </div>
          </MemeCard>

        </div>
      </div>
    </MemeBackground>
  )
}

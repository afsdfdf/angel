"use client"

import { useState } from "react"
import React from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TrendingUp, Lock, Coins, Droplets, Zap, Shield, Star, Timer, Gift, Calculator } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { MemeBackground } from "@/components/meme-background"
import { TokenLogo } from "@/components/token-logo"
import { LPTokenLogo } from "@/components/lp-token-logo"

export default function StakingPage() {
  const [stakeAmount, setStakeAmount] = useState("")
  const [activeTab, setActiveTab] = useState("token")

  // 单币质押池
  const tokenStakingPools = [
    { 
      name: "ANGEL 灵活质押", 
      apy: "12.5%", 
      token: "ANGEL",
      myStaked: "0 ANGEL", 
      rewards: "0 ANGEL",
      type: "flexible",
      description: "随时存取，灵活便捷"
    },
    { 
      name: "ANGEL 30天锁定", 
      apy: "25.8%", 
      token: "ANGEL",
      myStaked: "0 ANGEL", 
      rewards: "0 ANGEL",
      type: "30day",
      description: "30天锁定期，更高收益"
    },
    { 
      name: "ANGEL 90天锁定", 
      apy: "45.2%", 
      token: "ANGEL",
      myStaked: "0 ANGEL", 
      rewards: "0 ANGEL",
      type: "90day",
      description: "90天锁定期，最高收益"
    },
  ]

  // NFT质押池
  const nftStakingPools = [
    {
      name: "天使NFT质押",
      apy: "35.0%",
      emoji: "😇",
      myStaked: "0 NFTs",
      rewards: "0 ANGEL",
      description: "质押天使NFT获得丰厚奖励",
      nftCount: 0,
      totalPower: 0
    },
    {
      name: "传说NFT质押",
      apy: "55.0%",
      emoji: "👑",
      myStaked: "0 NFT",
      rewards: "0 ANGEL",
      description: "传说级NFT专属质押池",
      nftCount: 0,
      totalPower: 0
    },
    {
      name: "史诗NFT质押",
      apy: "42.0%",
      emoji: "⚔️",
      myStaked: "0 NFTs",
      rewards: "0 ANGEL",
      description: "史诗级NFT质押获得额外收益",
      nftCount: 0,
      totalPower: 0
    }
  ]

  // 土地质押池
  const landStakingPools = [
    {
      name: "天堂花园质押",
      apy: "28.0%",
      emoji: "🌸",
      myStaked: "0 lands",
      rewards: "0 ANGEL",
      description: "质押天堂花园获得稳定收益",
      landCount: 0,
      landType: "Garden"
    },
    {
      name: "神圣山峰质押",
      apy: "38.0%",
      emoji: "⛰️",
      myStaked: "0 land",
      rewards: "0 ANGEL",
      description: "神圣山峰带来更高收益",
      landCount: 0,
      landType: "Mountain"
    },
    {
      name: "天使城堡质押",
      apy: "65.0%",
      emoji: "🏰",
      myStaked: "0 lands",
      rewards: "0 ANGEL",
      description: "最稀有的天使城堡，最高收益",
      landCount: 0,
      landType: "Castle"
    }
  ]

  // 基金会质押池
  const foundationStakingPools = [
    {
      name: "天使基金会质押",
      apy: "18.0%",
      emoji: "🏛️",
      myStaked: "0 ANGEL",
      rewards: "0 ANGEL",
      description: "支持天使生态发展，获得稳定收益",
      minStake: "10,000 ANGEL",
      lockPeriod: "365天"
    },
    {
      name: "社区治理质押",
      apy: "22.0%",
      emoji: "🗳️",
      myStaked: "0 ANGEL",
      rewards: "0 ANGEL",
      description: "参与社区治理，享受治理权益",
      minStake: "5,000 ANGEL",
      lockPeriod: "180天"
    }
  ]

  // LP质押池
  const lpStakingPools = [
    {
      name: "ANGEL-BNB LP",
      apy: "68.5%",
      token1: "ANGEL",
      token2: "BNB",
      myStaked: "0 LP",
      rewards: "0 ANGEL",
      description: "提供流动性获得最高收益",
      tvl: "$0",
      apr: "68.5%"
    },
    {
      name: "ANGEL-USDT LP",
      apy: "52.0%",
      token1: "ANGEL",
      token2: "USDT",
      myStaked: "0 LP",
      rewards: "0 ANGEL",
      description: "稳定币LP质押，风险较低",
      tvl: "$0",
      apr: "52.0%"
    },
    {
      name: "ANGEL-BUSD LP",
      apy: "48.0%",
      token1: "ANGEL",
      token2: "BUSD",
      myStaked: "0 LP",
      rewards: "0 ANGEL",
      description: "BUSD LP质押，稳定收益",
      tvl: "$0",
      apr: "48.0%"
    }
  ]

  const getPoolsByType = (type: string) => {
    switch (type) {
      case "token": return tokenStakingPools
      case "nft": return nftStakingPools
      case "land": return landStakingPools
      case "foundation": return foundationStakingPools
      case "lp": return lpStakingPools
      default: return tokenStakingPools
    }
  }

  const getTabTitle = (type: string) => {
    switch (type) {
      case "token": return "💰 单币质押"
      case "nft": return "🎨 NFT质押"
      case "land": return "🏝️ 土地质押"
      case "foundation": return "🏛️ 基金会质押"
      case "lp": return "💧 LP质押"
      default: return "💰 单币质押"
    }
  }

  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader title="质押挖矿" emoji="💰" />

      <div className="container mx-auto px-4 pb-4 max-w-md pt-20">
        <div className="space-y-6">
          
          {/* 统计概览 */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Coins, label: "总质押", value: "0", color: "bg-gradient-primary", shadow: "shadow-angel-primary" },
              { icon: TrendingUp, label: "总APY", value: "0%", color: "bg-gradient-secondary", shadow: "shadow-angel-secondary" },
              { icon: Gift, label: "待领取", value: "0", color: "bg-gradient-gold", shadow: "shadow-angel-gold" },
              { icon: Star, label: "我的质押", value: "0", color: "bg-angel-success", shadow: "shadow-angel-accent" },
            ].map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <Card key={index} className="glass-card border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${stat.color} ${stat.shadow} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-bold text-foreground text-lg">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* 质押类型切换 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-effect rounded-xl p-1">
              <TabsTrigger
                value="token"
                className="rounded-lg data-[state=active]:bg-gradient-primary data-[state=active]:text-white text-sm font-medium"
              >
                <Coins className="w-4 h-4 mr-2" />
                单币质押
              </TabsTrigger>
              <TabsTrigger
                value="lp"
                className="rounded-lg data-[state=active]:bg-gradient-secondary data-[state=active]:text-white text-sm font-medium"
              >
                <Droplets className="w-4 h-4 mr-2" />
                LP质押
              </TabsTrigger>
            </TabsList>

            {/* 单币质押 */}
            <TabsContent value="token" className="space-y-4 mt-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Coins className="w-6 h-6 text-angel-primary" />
                  单币质押池
                </h3>
                {tokenStakingPools.map((pool, index) => (
                  <Card key={index} className="glass-card border-0 shadow-angel-primary">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-angel-primary">
                          <TokenLogo symbol={pool.token} size={56} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground">{pool.name}</h4>
                          <p className="text-sm text-muted-foreground">{pool.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-angel-success/20 text-angel-success border-angel-success/30">
                              APY {pool.apy}
                            </Badge>
                            <Badge className="bg-secondary text-muted-foreground">
                              {pool.type === "flexible" ? "灵活" : pool.type === "30day" ? "30天" : "90天"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-secondary/30 rounded-xl border border-border">
                          <p className="text-sm text-muted-foreground mb-1">我的质押</p>
                          <p className="font-bold text-foreground">{pool.myStaked}</p>
                        </div>
                        <div className="text-center p-3 bg-secondary/30 rounded-xl border border-border">
                          <p className="text-sm text-muted-foreground mb-1">待领取</p>
                          <p className="font-bold text-angel-success">{pool.rewards}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 bg-gradient-primary text-white hover:opacity-90 touch-feedback">
                          <Zap className="w-4 h-4 mr-2" />
                          质押
                        </Button>
                        <Button variant="outline" className="flex-1 border-border hover:bg-secondary touch-feedback">
                          <Gift className="w-4 h-4 mr-2" />
                          领取
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* LP质押 */}
            <TabsContent value="lp" className="space-y-4 mt-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Droplets className="w-6 h-6 text-angel-secondary" />
                  LP质押池
                </h3>
                {lpStakingPools.map((pool, index) => (
                  <Card key={index} className="glass-card border-0 shadow-angel-secondary">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-angel-secondary">
                          <LPTokenLogo token1={pool.token1} token2={pool.token2} size={56} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground">{pool.name}</h4>
                          <p className="text-sm text-muted-foreground">{pool.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-angel-secondary/20 text-angel-secondary border-angel-secondary/30">
                              APY {pool.apy}
                            </Badge>
                            <Badge className="bg-angel-accent/20 text-angel-accent border-angel-accent/30">
                              TVL {pool.tvl}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-secondary/30 rounded-xl border border-border">
                          <p className="text-sm text-muted-foreground mb-1">我的LP</p>
                          <p className="font-bold text-foreground">{pool.myStaked}</p>
                        </div>
                        <div className="text-center p-3 bg-secondary/30 rounded-xl border border-border">
                          <p className="text-sm text-muted-foreground mb-1">待领取</p>
                          <p className="font-bold text-angel-success">{pool.rewards}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 bg-gradient-secondary text-white hover:opacity-90 touch-feedback">
                          <Droplets className="w-4 h-4 mr-2" />
                          质押LP
                        </Button>
                        <Button variant="outline" className="flex-1 border-border hover:bg-secondary touch-feedback">
                          <Gift className="w-4 h-4 mr-2" />
                          领取奖励
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* 质押计算器 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-angel-primary" />
                收益计算器
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-foreground font-medium mb-2">质押数量</label>
                  <Input
                    type="number"
                    placeholder="输入质押数量"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="bg-angel-success/10 rounded-xl p-4 border border-angel-success/20">
                  <h4 className="font-bold text-foreground mb-3">预期收益 (基于12.5% APY)</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">日收益</p>
                      <p className="font-bold text-angel-success">
                        {stakeAmount ? ((parseFloat(stakeAmount) * 0.125) / 365).toFixed(2) : "0.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">月收益</p>
                      <p className="font-bold text-angel-success">
                        {stakeAmount ? ((parseFloat(stakeAmount) * 0.125) / 12).toFixed(2) : "0.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">年收益</p>
                      <p className="font-bold text-angel-success">
                        {stakeAmount ? (parseFloat(stakeAmount) * 0.125).toFixed(2) : "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 质押攻略 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-angel-accent" />
                质押攻略
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-32 bg-gradient-to-br from-angel-primary/20 to-angel-secondary/20 rounded-xl flex items-center justify-center mb-4 border border-border">
                <div className="text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-angel-accent" />
                  <p className="text-angel-accent font-medium">质押教程</p>
                  <p className="text-sm text-muted-foreground">如何最大化质押收益</p>
                </div>
              </div>
              <Button className="w-full bg-gradient-primary text-white hover:opacity-90 touch-feedback">
                查看质押教程
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </MemeBackground>
  )
}

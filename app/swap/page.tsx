"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MemeBackground } from "@/components/meme-background"
import { SwapInterface } from "@/components/swap-interface"
import { ArrowUpDown, TrendingUp, Shield, Zap } from "lucide-react"
import type { User } from "@/lib/database"

export default function SwapPage() {
  const [user, setUser] = useState<User | null>(null)

  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader 
        title="代币交换" 
        emoji="💱" 
        notifications={2}
        onUserChange={setUser}
      />
      
      <div className="container mx-auto px-4 pb-4 max-w-md pt-20">
        <div className="space-y-6">
          
          {/* 交换简介卡片 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowUpDown className="w-5 h-5 text-angel-primary" />
                天使交换
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm mb-4">
                安全、快速、低费用的去中心化代币交换平台。支持多种主流代币与 ANGEL 的无缝兑换。
              </p>
              
              {/* 特性介绍 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground">安全可靠</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-gradient-gold rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground">闪电交换</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground">最优价格</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 交换界面 */}
          <SwapInterface />
          
          {/* 交易统计 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3">交易统计</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-angel-primary">$2.1M</div>
                  <div className="text-xs text-muted-foreground">24h 交易量</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-angel-secondary">156</div>
                  <div className="text-xs text-muted-foreground">24h 交易数</div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </MemeBackground>
  )
}

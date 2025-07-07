"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Gift, Sparkles, CheckCircle, Loader2 } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"
import { MemeCard, MemeButton } from "@/components/meme-background"
import { DatabaseClientApi } from "@/lib/database-client-api"
import { useAuth } from "@/lib/auth-context"

// Define reward config directly in this client component
const REWARD_CONFIG = {
  WELCOME_BONUS: 10000,
  REFERRAL_L1: 3000,
  REFERRAL_L2: 1500,
  REFERRAL_L3: 500
};

interface AirdropClaimProps {
  onClaimed?: () => void
}

export function AirdropClaim({ onClaimed }: AirdropClaimProps) {
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isClaimed, setIsClaimed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClaim = async () => {
    if (!user || !user.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // 检查是否已经领取过
      const rewardRecords = await DatabaseClientApi.getUserRewards(user.id)
      const hasWelcomeReward = rewardRecords.some(record => record.reward_type === 'welcome')
      
      if (hasWelcomeReward) {
        setError("您已经领取过新用户空投奖励")
        return
      }
      
      // 记录欢迎奖励
      const success = await DatabaseClientApi.recordWelcomeReward(user.id)
      
      if (success) {
        setIsClaimed(true)
        onClaimed?.()
      } else {
        setError("数据库暂时不可用，请稍后重试")
      }
    } catch (err) {
      console.error("空投领取失败:", err)
      setError("数据库连接失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  // 如果用户未连接钱包，显示连接提示
  if (!isAuthenticated) {
    return (
      <MemeCard className="p-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white border-0 shadow-xl rounded-3xl animate-pulse">
        <div className="text-center">
          <div className="text-4xl mb-3">🎁</div>
          <h3 className="text-xl font-bold mb-2">新用户空投</h3>
          <p className="text-white/90 text-sm mb-4">
            连接钱包立即领取 {(REWARD_CONFIG.WELCOME_BONUS || 0).toLocaleString()} ANGEL 代币
          </p>
          <WalletConnect />
        </div>
      </MemeCard>
    )
  }

  // 如果已经领取，显示成功状态
  if (isClaimed) {
    return (
      <MemeCard className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-xl rounded-3xl">
        <div className="text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-xl font-bold mb-2">空投领取成功</h3>
          <p className="text-white/90 text-sm mb-4">
            恭喜您获得 {(REWARD_CONFIG.WELCOME_BONUS || 0).toLocaleString()} ANGEL 代币！
          </p>
          <Badge variant="secondary" className="bg-white/20 text-white">
            <CheckCircle className="w-4 h-4 mr-1" />
            已领取
          </Badge>
        </div>
      </MemeCard>
    )
  }

  // 显示领取按钮
  return (
    <MemeCard className="p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white border-0 shadow-xl rounded-3xl hover:scale-105 transition-transform">
      <div className="text-center">
        <div className="text-4xl mb-3">🎁</div>
        <h3 className="text-xl font-bold mb-2">新用户空投</h3>
        <p className="text-white/90 text-sm mb-4">
          欢迎加入天使世界！立即领取您的专属空投奖励
        </p>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5" />
          <span className="text-2xl font-bold">
            {(REWARD_CONFIG.WELCOME_BONUS || 0).toLocaleString()} ANGEL
          </span>
          <Sparkles className="w-5 h-5" />
        </div>

        {error && (
          <Alert className="mb-4 bg-red-500/20 border-red-400 text-white">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleClaim}
          disabled={isLoading}
          className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-bold px-8 py-3 text-lg rounded-xl"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              领取中...
            </>
          ) : (
            <>
              <Gift className="w-5 h-5 mr-2" />
              立即领取
            </>
          )}
        </Button>
      </div>
    </MemeCard>
  )
} 
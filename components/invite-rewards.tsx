"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Copy, Share2, Users, Gift, TrendingUp, 
  UserPlus, Award, Sparkles, ChevronRight 
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { DatabaseClientApi } from "@/lib/database-client-api"
import { MemeCard } from "@/components/meme-background"

// Define reward config directly in this client component
const REWARD_CONFIG = {
  WELCOME_BONUS: 10000,
  REFERRAL_L1: 3000,
  REFERRAL_L2: 1500,
  REFERRAL_L3: 500
};

interface InviteStats {
  level1Count: number
  level2Count: number
  level3Count: number
  totalRewards: number
  pendingRewards: number
  claimedRewards: number
}

export function InviteRewards() {
  const { user, isAuthenticated } = useAuth()
  const [inviteLink, setInviteLink] = useState("")
  const [invitations, setInvitations] = useState<any[]>([])
  const [stats, setStats] = useState<InviteStats>({
    level1Count: 0,
    level2Count: 0,
    level3Count: 0,
    totalRewards: 0,
    pendingRewards: 0,
    claimedRewards: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // 生成邀请链接
  const generateInviteLink = async () => {
    if (!user) return
    const link = await DatabaseClientApi.generateInviteLink(user.wallet_address)
    setInviteLink(link)
  }

  // 加载邀请数据和统计
  const loadInviteData = async () => {
    if (!user || !user.id) return
    
    setIsLoading(true)
    try {
      // 获取邀请记录
      const inviteData = await DatabaseClientApi.getUserInvitations(user.id)
      setInvitations(inviteData)
      
      // 计算统计数据
      const newStats: InviteStats = {
        level1Count: 0,
        level2Count: 0,
        level3Count: 0,
        totalRewards: 0,
        pendingRewards: 0,
        claimedRewards: 0,
      }
      
      inviteData.forEach((invite: any) => {
        // 简单处理：所有邀请都算作一级邀请
        newStats.level1Count++;
        
        // 统计奖励
        if (invite.status === 'accepted') {
          newStats.totalRewards += invite.reward_amount || 0;
          // 简化处理：所有接受的邀请都算作已领取
          newStats.claimedRewards += invite.reward_amount || 0;
          } else {
          // 未接受的邀请算作待领取
          newStats.pendingRewards += invite.reward_amount || 0;
        }
      })
      
      setStats(newStats)
    } catch (error) {
      console.error("加载邀请数据失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 复制邀请链接
  const copyInviteLink = async () => {
    if (!inviteLink) return
    
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast.success("邀请链接已复制到剪贴板")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("复制失败，请手动复制")
    }
  }

  // 分享邀请链接
  const shareInviteLink = async () => {
    if (!inviteLink) return
    
    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: '加入天使加密',
            text: `邀请您加入天使加密，获得${REWARD_CONFIG.WELCOME_BONUS}枚天使代币！`,
            url: inviteLink,
          })
        } catch (error) {
          console.error("分享失败:", error)
          // 如果分享API失败，回退到复制链接
          await copyInviteLink()
          toast.success("已复制邀请链接到剪贴板")
        }
      } else {
        // 降级到复制
        await copyInviteLink()
        toast.success("已复制邀请链接到剪贴板")
      }
    } catch (error) {
      console.error("操作失败:", error)
      toast.error("操作失败，请手动复制链接")
    }
  }

  // 定时刷新数据
  useEffect(() => {
    if (isAuthenticated && user) {
      generateInviteLink()
      loadInviteData()
      
      // 每30秒刷新一次数据
      const interval = setInterval(loadInviteData, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* 邀请奖励概览卡片 */}
      <MemeCard className="p-6 bg-gradient-to-r from-purple-500/90 via-pink-500/90 to-orange-500/90 text-white border-0 shadow-xl rounded-3xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">邀请奖励系统</h3>
                <p className="text-white/80 text-sm">邀请好友，共享财富</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{(stats.totalRewards || 0).toLocaleString()}</p>
              <p className="text-white/80 text-sm">总奖励 ANGEL</p>
            </div>
          </div>

          {/* 实时统计 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <UserPlus className="w-4 h-4" />
                <span className="text-lg font-bold">{stats.level1Count}</span>
              </div>
              <p className="text-xs text-white/80">一级邀请</p>
              <p className="text-xs text-yellow-300">+{REWARD_CONFIG.REFERRAL_L1}/人</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-lg font-bold">{stats.level2Count}</span>
              </div>
              <p className="text-xs text-white/80">二级邀请</p>
              <p className="text-xs text-yellow-300">+{REWARD_CONFIG.REFERRAL_L2}/人</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-lg font-bold">{stats.level3Count}</span>
              </div>
              <p className="text-xs text-white/80">三级邀请</p>
              <p className="text-xs text-yellow-300">+{REWARD_CONFIG.REFERRAL_L3}/人</p>
            </div>
          </div>

          {/* 待领取奖励提示 */}
          {stats.pendingRewards > 0 && (
            <div className="bg-yellow-400/20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm">您有待领取的奖励</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{stats.pendingRewards} ANGEL</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </MemeCard>

      {/* 一键分享邀请链接 */}
      <MemeCard className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-500" />
              我的邀请链接
            </h4>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              实时更新
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={inviteLink}
              readOnly
              className="flex-1 font-mono text-xs bg-gray-50 text-black"
              placeholder="生成邀请链接中..."
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyInviteLink}
              className="flex-shrink-0"
            >
              {copied ? (
                <Badge className="bg-green-500 text-white px-2">✓</Badge>
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={shareInviteLink}
              className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-600 text-center">
            每邀请一位好友，您和好友都将获得奖励！
          </p>
        </div>
      </MemeCard>

      {/* 最近邀请记录 */}
      {invitations.length > 0 && (
        <MemeCard className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            最近邀请 ({invitations.length})
          </h4>
          <div className="space-y-2">
            {invitations.slice(0, 3).map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    invite.status === 'accepted' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm text-gray-600">
                    邀请 · {invite.created_at ? new Date(invite.created_at).toLocaleDateString() : '未知日期'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    +{invite.reward_amount || 0} ANGEL
                  </span>
                  {invite.status === 'accepted' ? (
                    <Badge variant="secondary" className="text-xs">已接受</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">待接受</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </MemeCard>
      )}
    </div>
  )
} 
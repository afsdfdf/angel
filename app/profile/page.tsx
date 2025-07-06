"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, ImageIcon, Copy, Share2, Gift, Users } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/page-header"
import { MemeBackground, MemeCard, MemeButton } from "@/components/meme-background"
import { WalletConnect } from "@/components/wallet-connect"
import { useAuth } from "@/lib/auth-context"
import { DatabaseService, type Invitation } from "@/lib/database"

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [inviteLink, setInviteLink] = useState('')
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 生成邀请链接
  const generateLink = async () => {
    if (!user) return
    const link = await DatabaseService.generateInviteLink(user.wallet_address)
    setInviteLink(link)
  }

  // 加载邀请记录
  const loadInvitations = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const data = await DatabaseService.getInvitationsByUser(user.id)
      setInvitations(data)
    } catch (error) {
      console.error('加载邀请记录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    if (!isClient || typeof window === 'undefined') return
    
    try {
      await navigator.clipboard.writeText(text)
      toast.success('已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
      toast.error('复制失败')
    }
  }

  // 分享邀请链接
  const shareInviteLink = async () => {
    if (!inviteLink || !isClient || typeof window === 'undefined') return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Angel Crypto App 邀请',
          text: '加入我的团队，一起探索天使加密世界！',
          url: inviteLink,
        })
      } catch (error) {
        console.error('分享失败:', error)
        copyToClipboard(inviteLink)
      }
    } else {
      copyToClipboard(inviteLink)
    }
  }

  // 创建新邀请
  const createInvitation = async () => {
    if (!user || !isClient) return

    try {
      setIsLoading(true)
      const newInviteLink = await DatabaseService.generateInviteLink(user.wallet_address)

      if (newInviteLink) {
        setInviteLink(newInviteLink)
        toast.success('邀请链接创建成功')
        loadInvitations()
      }
    } catch (error) {
      console.error('创建邀请失败:', error)
      toast.error('创建邀请失败')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user && isClient) {
      generateLink()
      loadInvitations()
    }
  }, [isAuthenticated, user, isClient])

  const achievements = [
    { name: "首次质押", description: "完成第一次代币质押", emoji: "⭐", earned: true },
    { name: "NFT收藏家", description: "拥有10张以上NFT卡牌", emoji: "👑", earned: true },
    { name: "土地大亨", description: "拥有5块以上土地", emoji: "🎯", earned: false },
    { name: "推荐达人", description: "成功推荐20名用户", emoji: "👥", earned: true },
  ]

  const activities = [
    { action: "质押代币", amount: "5,000 ANGEL", time: "2小时前", emoji: "⚡" },
    { action: "购买NFT", amount: "炽天使守护者", time: "1天前", emoji: "🎨" },
    { action: "推荐奖励", amount: "100 ANGEL", time: "2天前", emoji: "🎁" },
    { action: "土地收益", amount: "125.47 ANGEL", time: "3天前", emoji: "🏝️" },
  ]

  if (!isClient) {
    return (
      <MemeBackground variant="premium" overlay={true}>
        <PageHeader title="个人资料" emoji="👤" />
        <div className="px-4 pb-4 pt-20">
          <div className="text-center">加载中...</div>
        </div>
      </MemeBackground>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <MemeBackground variant="premium" overlay={true}>
        <PageHeader title="个人资料" emoji="👤" />
        <div className="px-4 pb-4 pt-20 space-y-6">
          <MemeCard className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">请先连接钱包</h3>
            <p className="text-gray-600 mb-6">连接钱包后查看您的个人资料</p>
            <WalletConnect />
          </MemeCard>
        </div>
      </MemeBackground>
    )
  }

  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader title="个人资料" emoji="👤" />

      <div className="px-4 pb-4 pt-20 space-y-6">
        {/* 用户信息卡片 */}
        <MemeCard variant="primary" className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                😇
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-white text-xs font-bold text-white">
                {user.level || 1}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {user.username || `用户${user.id?.slice(0, 6)}`}
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-gray-600 font-mono text-sm">
                  {user.wallet_address?.slice(0, 6)}...{user.wallet_address?.slice(-4)}
                </p>
                <button 
                  onClick={() => copyToClipboard(user.wallet_address || '')} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                🗓️ 加入 {new Date(user.created_at || '').toLocaleDateString()}
              </Badge>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "天使代币", value: `${user.angel_balance?.toLocaleString() || 0}`, emoji: "💰" },
              { label: "总收益", value: `${user.total_earned?.toLocaleString() || 0}`, emoji: "🎯" },
              { label: "推荐数", value: user.total_referrals?.toString() || "0", emoji: "👥" },
              { label: "等级", value: `L${user.level || 1}`, emoji: "🏆" },
            ].map((stat, index) => (
              <div key={index} className="text-center p-3 bg-white/50 rounded-lg">
                <div className="text-xl mb-1">{stat.emoji}</div>
                <p className="font-bold text-gray-800 text-sm">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </MemeCard>

        {/* 主要内容 */}
        <Tabs defaultValue="invite" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 rounded-xl p-1">
            <TabsTrigger value="invite" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              🎁 邀请
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              🏆 成就
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              📋 活动
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              ⚙️ 设置
            </TabsTrigger>
          </TabsList>

          {/* 邀请系统 */}
          <TabsContent value="invite" className="space-y-4 mt-6">
            <MemeCard className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-blue-500" />
                我的推荐
              </h3>
              
              {/* 钱包地址 */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">我的钱包地址</label>
                  <div className="flex gap-2">
                    <Input
                      value={user.wallet_address || ''}
                      readOnly
                      className="flex-1 font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(user.wallet_address || '')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 邀请链接 */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">邀请链接</label>
                  <div className="flex gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="flex-1 font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(inviteLink)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={shareInviteLink}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button 
                    onClick={createInvitation} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "创建中..." : "创建新邀请"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => isClient && window.open(inviteLink, '_blank')}
                  >
                    预览
                  </Button>
                </div>
              </div>

              {/* 邀请记录 */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  邀请记录 ({invitations.length})
                </h4>
                {invitations.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">暂无邀请记录</p>
                ) : (
                  <div className="space-y-2">
                    {invitations.slice(0, 3).map((invitation) => (
                      <div key={invitation.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={invitation.status === 'accepted' ? 'default' : 'secondary'}>
                              {invitation.status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {new Date(invitation.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {invitation.reward_amount} ANGEL
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </MemeCard>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 gap-4">
              {achievements.map((achievement, index) => (
                <MemeCard key={index} className={`p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl ${achievement.earned ? "border-yellow-200" : "opacity-60"}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center text-2xl">
                      {achievement.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-800">{achievement.name}</h3>
                        {achievement.earned && (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            ✅ 已获得
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                </MemeCard>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-6">
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <MemeCard key={index} className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-lg">
                        {activity.emoji}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{activity.amount}</p>
                    </div>
                  </div>
                </MemeCard>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-6">
            <div className="space-y-4">
              {/* 通知设置 */}
              <MemeCard className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">🔔</span>
                  通知设置
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">推送通知</p>
                    <p className="text-sm text-gray-600">接收重要消息推送</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
              </MemeCard>

              {/* 安全设置 */}
              <MemeCard className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  安全设置
                </h3>
                <div className="space-y-3">
                  <MemeButton variant="default" className="w-full justify-start">
                    🔑 更换密码
                  </MemeButton>
                  <MemeButton variant="default" className="w-full justify-start">
                    🔗 连接钱包
                  </MemeButton>
                </div>
              </MemeCard>

              {/* 关于 */}
              <MemeCard className="p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">ℹ️</span>
                  关于
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">版本</span>
                    <span className="font-medium text-gray-800">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">官网</span>
                    <span className="font-medium text-blue-600">angelcoin.app</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">社区</span>
                    <span className="font-medium text-purple-600">Telegram</span>
                  </div>
                </div>
              </MemeCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MemeBackground>
  )
}

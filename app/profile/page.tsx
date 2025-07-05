"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { User, ImageIcon, Copy } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { MemeBackground, MemeCard, MemeButton } from "@/components/meme-background"

export default function ProfilePage() {
  const [notifications, setNotifications] = useState(true)

  const userProfile = {
    username: "AngelMaster",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    level: 35,
    totalEarnings: "47,892.45 ANGEL",
    totalValue: "$4,059.82",
    referrals: 23,
    achievements: 12,
  }

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

  const copyAddress = () => {
    navigator.clipboard.writeText(userProfile.walletAddress)
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
                {userProfile.level}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-1">{userProfile.username}</h2>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-gray-600 font-mono text-sm">
                  {userProfile.walletAddress.slice(0, 6)}...{userProfile.walletAddress.slice(-4)}
                </p>
                <button onClick={copyAddress} className="text-gray-400 hover:text-gray-600">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                🗓️ 加入 2024-01-01
              </Badge>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "总收益", value: userProfile.totalEarnings, emoji: "💰" },
              { label: "总价值", value: userProfile.totalValue, emoji: "🎯" },
              { label: "推荐数", value: userProfile.referrals.toString(), emoji: "👥" },
              { label: "成就数", value: userProfile.achievements.toString(), emoji: "🏆" },
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
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 rounded-xl p-1">
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
                    <span className="font-medium text-blue-600">angelcoin.io</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">社区</span>
                    <span className="font-medium text-purple-600">Discord</span>
                  </div>
                </div>
              </MemeCard>
            </div>
          </TabsContent>
        </Tabs>

        {/* 个人头像图片区 */}
        <MemeCard className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🖼️</span>
            个人头像
          </h3>
          <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-blue-400" />
              <p className="text-blue-600 font-medium">上传头像图片</p>
              <p className="text-sm text-blue-400">展示你的天使形象</p>
            </div>
          </div>
          <MemeButton variant="primary" className="w-full">
            📸 上传头像
          </MemeButton>
        </MemeCard>
      </div>


    </MemeBackground>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { MemeBackground } from "@/components/meme-background"
import { WalletConnect } from "@/components/wallet-connect"
import { DatabaseService, type User, type Invitation, type RewardRecord, REWARD_CONFIG } from "@/lib/database"
import { Copy, Share2, Users, Gift, CheckCircle, XCircle, Coins, Link as LinkIcon, RefreshCw } from "lucide-react"

export default function TestInvitePage() {
  const [user, setUser] = useState<User | null>(null)
  const [inviteLink, setInviteLink] = useState<string>("")
  const [testWalletAddress, setTestWalletAddress] = useState<string>("")
  const [testResults, setTestResults] = useState<{
    linkGenerated: boolean
    inviterFound: boolean
    rewardsProcessed: boolean
    error?: string
  }>({
    linkGenerated: false,
    inviterFound: false,
    rewardsProcessed: false
  })
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [rewardRecords, setRewardRecords] = useState<RewardRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleUserChange = (newUser: User | null) => {
    setUser(newUser)
    if (newUser) {
      loadUserData(newUser.id)
    }
  }

  const loadUserData = async (userId: string) => {
    try {
      const [userInvitations, userRewards] = await Promise.all([
        DatabaseService.getInvitationsByUser(userId),
        DatabaseService.getRewardRecords(userId)
      ])
      setInvitations(userInvitations)
      setRewardRecords(userRewards)
    } catch (error) {
      console.error("加载用户数据失败:", error)
    }
  }

  const generateInviteLink = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const link = await DatabaseService.createInviteLink(user.id)
      if (link) {
        setInviteLink(link)
        setTestResults(prev => ({ ...prev, linkGenerated: true, error: undefined }))
        await loadUserData(user.id) // 刷新邀请数据
      } else {
        setTestResults(prev => ({ ...prev, error: "生成邀请链接失败" }))
      }
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, error: error.message }))
    } finally {
      setIsLoading(false)
    }
  }

  const testInviteFlow = async () => {
    if (!inviteLink || !testWalletAddress) return
    
    setIsLoading(true)
    setTestResults({
      linkGenerated: true,
      inviterFound: false,
      rewardsProcessed: false
    })

    try {
      // 步骤1: 从邀请链接中提取钱包地址
      const inviterWalletAddress = inviteLink.split('/invite/')[1]
      
      // 步骤2: 验证邀请人是否存在
      const inviter = await DatabaseService.getUserByWalletAddress(inviterWalletAddress)
      if (!inviter) {
        setTestResults(prev => ({ ...prev, error: "邀请人不存在" }))
        return
      }
      setTestResults(prev => ({ ...prev, inviterFound: true }))

      // 步骤3: 模拟创建新用户
      const newUser = await DatabaseService.createUser({
        wallet_address: testWalletAddress.toLowerCase(),
        total_referrals: 0,
        is_active: true
      })

      if (!newUser) {
        setTestResults(prev => ({ ...prev, error: "创建测试用户失败" }))
        return
      }

      // 步骤4: 处理邀请关系
      const success = await DatabaseService.acceptInvitation(inviterWalletAddress, testWalletAddress)
      if (success) {
        setTestResults(prev => ({ ...prev, rewardsProcessed: true }))
        // 刷新数据
        await loadUserData(user!.id)
      } else {
        setTestResults(prev => ({ ...prev, error: "处理邀请关系失败" }))
      }

    } catch (error: any) {
      setTestResults(prev => ({ ...prev, error: error.message }))
    } finally {
      setIsLoading(false)
    }
  }

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
    }
  }

  const generateRandomWallet = () => {
    const randomHex = () => Math.floor(Math.random() * 16).toString(16)
    const wallet = "0x" + Array.from({length: 40}, randomHex).join("")
    setTestWalletAddress(wallet)
  }

  const refreshData = async () => {
    if (user) {
      await loadUserData(user.id)
    }
  }

  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader title="邀请系统测试" emoji="🧪" />

      <div className="container mx-auto px-4 pb-4 max-w-2xl">
        <div className="space-y-6">

          {/* 钱包连接 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-angel-primary" />
                用户连接
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <WalletConnect onUserChange={handleUserChange} />
                {user && (
                  <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">当前用户</p>
                    <p className="font-mono text-xs">{user.wallet_address}</p>
                    <div className="flex justify-center gap-4 mt-2 text-sm">
                      <span>余额: <strong>{user.angel_balance?.toLocaleString() || 0} ANGEL</strong></span>
                      <span>推荐: <strong>{user.total_referrals}</strong>人</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {user && (
            <>
              {/* 生成邀请链接 */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-angel-secondary" />
                    生成邀请链接
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      onClick={generateInviteLink}
                      disabled={isLoading}
                      className="w-full bg-gradient-secondary text-white hover:opacity-90"
                    >
                      {isLoading ? "生成中..." : "生成邀请链接"}
                    </Button>

                    {inviteLink && (
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">邀请链接</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={copyInviteLink}
                            className="w-6 h-6"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="font-mono text-xs break-all">{inviteLink}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${testResults.linkGenerated ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">邀请链接生成</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 测试邀请流程 */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-angel-accent" />
                    测试邀请流程
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">测试钱包地址</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="0x..."
                          value={testWalletAddress}
                          onChange={(e) => setTestWalletAddress(e.target.value)}
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          onClick={generateRandomWallet}
                          className="whitespace-nowrap"
                        >
                          随机生成
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={testInviteFlow}
                      disabled={!inviteLink || !testWalletAddress || isLoading}
                      className="w-full bg-gradient-primary text-white hover:opacity-90"
                    >
                      {isLoading ? "测试中..." : "测试邀请流程"}
                    </Button>

                    {/* 测试步骤状态 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${testResults.linkGenerated ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm">1. 邀请链接已生成</span>
                        {testResults.linkGenerated && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${testResults.inviterFound ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm">2. 验证邀请人存在</span>
                        {testResults.inviterFound && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${testResults.rewardsProcessed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-sm">3. 处理邀请奖励</span>
                        {testResults.rewardsProcessed && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>

                    {testResults.error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-500 text-sm">{testResults.error}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 邀请数据 */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-angel-gold" />
                    邀请数据
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={refreshData}
                      className="w-6 h-6 ml-auto"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 邀请记录 */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">我的邀请 ({invitations.length})</h4>
                      {invitations.length > 0 ? (
                        <div className="space-y-2">
                          {invitations.map((invitation) => (
                            <div key={invitation.id} className="p-3 bg-secondary/30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="text-xs">
                                  <p className="text-muted-foreground">邀请链接</p>
                                  <p className="font-mono break-all">{invitation.invite_link}</p>
                                </div>
                                <Badge 
                                  className={
                                    invitation.status === 'accepted' 
                                      ? 'bg-green-500/20 text-green-500 border-green-500/30'
                                      : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                                  }
                                >
                                  {invitation.status}
                                </Badge>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                创建时间: {new Date(invitation.created_at).toLocaleString()}
                                {invitation.accepted_at && (
                                  <span className="ml-2">
                                    接受时间: {new Date(invitation.accepted_at).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">暂无邀请记录</p>
                      )}
                    </div>

                    {/* 奖励记录 */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">奖励记录 ({rewardRecords.length})</h4>
                      {rewardRecords.length > 0 ? (
                        <div className="space-y-2">
                          {rewardRecords.map((record) => (
                            <div key={record.id} className="p-3 bg-secondary/30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium">{record.description}</p>
                                  <p className="text-xs text-muted-foreground">{record.reward_type}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-angel-primary">+{record.amount} ANGEL</p>
                                  <Badge 
                                    className={
                                      record.status === 'completed'
                                        ? 'bg-green-500/20 text-green-500 border-green-500/30'
                                        : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                                    }
                                  >
                                    {record.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                {new Date(record.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">暂无奖励记录</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 奖励配置说明 */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-angel-success" />
                    奖励配置
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">新用户奖励</p>
                      <p className="font-bold text-angel-primary">{REWARD_CONFIG.WELCOME_BONUS} ANGEL</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">一级邀请</p>
                      <p className="font-bold text-angel-success">{REWARD_CONFIG.REFERRAL_L1} ANGEL</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">二级邀请</p>
                      <p className="font-bold text-angel-secondary">{REWARD_CONFIG.REFERRAL_L2} ANGEL</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">三级邀请</p>
                      <p className="font-bold text-angel-accent">{REWARD_CONFIG.REFERRAL_L3} ANGEL</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </MemeBackground>
  )
} 
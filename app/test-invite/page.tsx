"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { MemeBackground } from "@/components/meme-background"
import { WalletConnect } from "@/components/wallet-connect"
import { DatabaseClientApi } from "@/lib/database-client-api"
import { Copy, Share2, Users, Gift, CheckCircle, XCircle, Coins, Link as LinkIcon, RefreshCw, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

// Define types locally
interface User {
  id: string;
  wallet_address: string;
  angel_balance?: number;
}

interface Invitation {
  id?: string;
  inviter_id: string;
  invitee_id?: string;
  status: string;
  created_at: string;
}

interface RewardRecord {
  id?: string;
  user_id: string;
  reward_type: string;
  amount: number;
  description: string;
  created_at: string;
}

// Define reward config directly in this client component
const REWARD_CONFIG = {
  WELCOME_BONUS: 10000,
  REFERRAL_L1: 3000,
  REFERRAL_L2: 1500,
  REFERRAL_L3: 500
};

interface TestResult {
  linkGenerated: boolean
  linkFormat: boolean
  databaseConnection: boolean
  inviteCreation: boolean
  inviteAcceptance: boolean
}

export default function TestInvitePage() {
  const { user, isAuthenticated } = useAuth()
  const [inviteLink, setInviteLink] = useState<string>("")
  const [testWalletAddress, setTestWalletAddress] = useState<string>("")
  const [testResults, setTestResults] = useState<TestResult>({
    linkGenerated: false,
    linkFormat: false,
    databaseConnection: false,
    inviteCreation: false,
    inviteAcceptance: false,
  })
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [rewardRecords, setRewardRecords] = useState<RewardRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleUserChange = (newUser: User | null) => {
    if (newUser) {
      loadUserData(newUser.id)
    }
  }

  const loadUserData = async (userId: string) => {
    try {
      const [userInvitations, userRewards] = await Promise.all([
        DatabaseClientApi.getUserInvitations(userId),
        DatabaseClientApi.getUserRewards(userId)
      ])
      setInvitations(userInvitations)
      setRewardRecords(userRewards)
    } catch (error) {
      console.error("加载用户数据失败:", error)
    }
  }

  const testInviteLinkGeneration = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const link = await DatabaseClientApi.generateInviteLink(user.wallet_address)
      setInviteLink(link)
      
      // 验证链接格式
      const isValidFormat = link.includes('https://www.angelcoin.app/invite/') && 
                           link.includes(user.wallet_address)
      
      setTestResults(prev => ({
        ...prev,
        linkGenerated: !!link,
        linkFormat: isValidFormat,
      }))

      if (link) {
        toast.success('邀请链接生成成功！')
      }
    } catch (error) {
      console.error('生成邀请链接失败:', error)
      toast.error('生成邀请链接失败')
    } finally {
      setIsLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    if (!user) return

    try {
      const userData = await DatabaseClientApi.getUserByWalletAddress(user.wallet_address)
      setTestResults(prev => ({
        ...prev,
        databaseConnection: !!userData,
      }))
      
      if (userData) {
        toast.success('数据库连接正常！')
      }
    } catch (error) {
      console.error('数据库连接测试失败:', error)
      toast.error('数据库连接失败')
    }
  }

  const testInviteCreation = async () => {
    if (!user) return

    try {
      const newInviteLink = await DatabaseClientApi.generateInviteLink(user.wallet_address)
      setTestResults(prev => ({
        ...prev,
        inviteCreation: !!newInviteLink,
      }))

      if (newInviteLink) {
        toast.success('邀请记录创建成功！')
        loadInvitations()
      }
    } catch (error) {
      console.error('邀请创建测试失败:', error)
      toast.error('邀请创建失败')
    }
  }

  const loadInvitations = async () => {
    if (!user) return

    try {
      const data = await DatabaseClientApi.getUserInvitations(user.id)
      setInvitations(data)
    } catch (error) {
      console.error('加载邀请记录失败:', error)
    }
  }

  const copyInviteLink = async () => {
    if (!isClient || !inviteLink) return

    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success('邀请链接已复制到剪贴板！')
    } catch (error) {
      console.error('复制失败:', error)
      toast.error('复制失败')
    }
  }

  const runAllTests = async () => {
    if (!user) return

    await testDatabaseConnection()
    await testInviteLinkGeneration()
    await testInviteCreation()
    await loadInvitations()
  }

  useEffect(() => {
    if (isAuthenticated && user && isClient) {
      runAllTests()
    }
  }, [isAuthenticated, user, isClient])

  if (!isClient) {
    return (
      <MemeBackground variant="premium" overlay={true}>
        <PageHeader title="邀请系统测试" emoji="🧪" />
        <div className="container mx-auto px-4 pb-4 max-w-4xl pt-20">
          <div className="text-center">加载中...</div>
        </div>
      </MemeBackground>
    )
  }

  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader title="邀请系统测试" emoji="🧪" />

      <div className="container mx-auto px-4 pb-4 max-w-4xl pt-20">
        <div className="space-y-6">
          
          {/* 登录状态 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-angel-primary" />
                登录状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">请先连接钱包以测试邀请系统</p>
                  <WalletConnect />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">已登录</span>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">用户ID</p>
                    <p className="font-mono text-xs">{user?.id}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">钱包地址</p>
                    <p className="font-mono text-xs">{user?.wallet_address}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">ANGEL 余额</p>
                    <p className="font-mono text-xs">{user?.angel_balance || 0} ANGEL</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {user && (
            <>
              {/* 测试结果 */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-angel-secondary" />
                    测试结果
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${testResults.databaseConnection ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">数据库连接</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${testResults.linkGenerated ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">邀请链接生成</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${testResults.linkFormat ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm">链接格式验证</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${testResults.inviteCreation ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">邀请记录创建</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 邀请链接生成 */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-angel-secondary" />
                    邀请链接
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      onClick={testInviteLinkGeneration}
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
                        <p className="font-mono text-xs break-all mb-2">{inviteLink}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={testResults.linkFormat ? "default" : "destructive"}>
                            {testResults.linkFormat ? "格式正确" : "格式错误"}
                          </Badge>
                          <Badge variant="outline">
                            域名: {inviteLink.includes('https://www.angelcoin.app') ? '✓' : '✗'}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 邀请记录 */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-angel-primary" />
                    邀请记录 ({invitations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {invitations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">暂无邀请记录</p>
                      <Button
                        onClick={testInviteCreation}
                        variant="outline"
                        className="mt-4"
                      >
                        创建测试邀请
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invitations.map((invitation) => (
                        <div key={invitation.id} className="p-3 bg-secondary/30 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={invitation.status === 'accepted' ? 'default' : 'secondary'}>
                              {invitation.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {invitation.created_at ? new Date(invitation.created_at).toLocaleDateString() : '未知日期'}
                            </span>
                          </div>
                          <p className="font-mono text-xs break-all mb-1">
                            邀请人: {invitation.inviter_id}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>奖励: {invitation.reward_amount} ANGEL</span>
                            <span>状态: {invitation.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 系统信息 */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>系统信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">当前域名:</span>
                      <span className="font-mono">https://www.angelcoin.app</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">邀请路由:</span>
                      <span className="font-mono">/invite/[wallet_address]</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">数据库模式:</span>
                      <Badge variant="outline">
                        Production
                      </Badge>
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
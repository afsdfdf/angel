"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { MemeBackground } from "@/components/meme-background"
import { DatabaseClientApi } from "@/lib/database-client-api"
import { useAuth } from "@/lib/auth-context"
import { 
  Gift, 
  Users, 
  Coins, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

// Define reward config directly in this client component
const REWARD_CONFIG = {
  WELCOME_BONUS: 10000,
  REFERRAL_L1: 3000,
  REFERRAL_L2: 1500,
  REFERRAL_L3: 500
};

export default function TestInviteNewPage() {
  const { user, isAuthenticated, generateInviteLink } = useAuth()
  const [testWallet, setTestWallet] = useState("")
  const [inviteLink, setInviteLink] = useState("")
  const [testResults, setTestResults] = useState<{
    isNewUser: boolean | null
    inviterExists: boolean | null
    registrationSuccess: boolean | null
    error: string | null
  }>({
    isNewUser: null,
    inviterExists: null,
    registrationSuccess: null,
    error: null
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      const fetchInviteLink = async () => {
        const link = await generateInviteLink(user.wallet_address)
      setInviteLink(link)
      }
      fetchInviteLink()
    }
  }, [user, generateInviteLink])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("已复制到剪贴板")
    } catch (error) {
      toast.error("复制失败")
    }
  }

  const testInviteSystem = async () => {
    setIsLoading(true)
    setTestResults({
      isNewUser: null,
      inviterExists: null,
      registrationSuccess: null,
      error: null
    })

    try {
      // 测试1: 检查是否为新用户
      const isNew = !(await DatabaseClientApi.isUserExists(testWallet))
      setTestResults(prev => ({ ...prev, isNewUser: isNew }))

      // 测试2: 检查邀请人是否存在
      if (user) {
        const inviterExists = await DatabaseClientApi.getUserByWalletAddress(user.wallet_address)
        setTestResults(prev => ({ ...prev, inviterExists: !!inviterExists }))

        // 测试3: 模拟邀请注册流程（仅在新用户情况下）
        if (isNew) {
          // 注意：这里不会真正创建用户，只是测试函数调用
          const success = await DatabaseClientApi.processInviteRegistration(
            testWallet.toLowerCase(),
            user.wallet_address.toLowerCase()
          )
          setTestResults(prev => ({ ...prev, registrationSuccess: success }))
        } else {
          setTestResults(prev => ({ ...prev, registrationSuccess: false, error: "用户已存在，无法测试注册流程" }))
        }
      }
    } catch (error: any) {
      console.error("测试失败:", error)
      setTestResults(prev => ({ ...prev, error: error.message || "测试过程中发生错误" }))
    } finally {
      setIsLoading(false)
    }
  }

  const openInvitePage = () => {
    if (inviteLink) {
      window.open(inviteLink, '_blank')
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <MemeBackground variant="premium" overlay={true}>
        <PageHeader title="邀请系统测试" emoji="🧪" />
        <div className="container mx-auto px-4 pb-4 max-w-2xl pt-20">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">需要登录</h3>
              <p className="text-muted-foreground">
                请先连接钱包并登录以测试邀请系统
              </p>
            </CardContent>
          </Card>
        </div>
      </MemeBackground>
    )
  }

  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader title="邀请系统测试" emoji="🧪" />

      <div className="container mx-auto px-4 pb-4 max-w-4xl pt-20">
        <div className="space-y-6">
          
          {/* 当前用户信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                当前用户信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">钱包地址</Label>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                      {user.wallet_address}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(user.wallet_address)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">天使代币</Label>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">天使代币</p>
                    <p className="text-lg font-semibold">{(user.angel_balance || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">成功邀请</Label>
                  <p className="text-lg font-semibold">{user.invites_count || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 邀请链接信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                邀请链接
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="invite-link">生成的邀请链接</Label>
                <div className="flex gap-2">
                  <Input
                    id="invite-link"
                    value={inviteLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(inviteLink)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={openInvitePage}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-medium mb-2">链接格式说明</h4>
                <p className="text-sm text-muted-foreground">
                  新的邀请链接格式：<code className="bg-background px-1 rounded">域名/invite/钱包地址</code>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  不再需要推荐码，直接使用钱包地址作为邀请标识
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 测试功能 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                功能测试
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-wallet">测试钱包地址</Label>
                <div className="flex gap-2">
                  <Input
                    id="test-wallet"
                    value={testWallet}
                    onChange={(e) => setTestWallet(e.target.value)}
                    placeholder="输入要测试的钱包地址"
                    className="font-mono"
                  />
                  <Button
                    onClick={testInviteSystem}
                    disabled={isLoading || !testWallet}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    开始测试
                  </Button>
                </div>
              </div>

              {/* 测试结果 */}
              {(testResults.isNewUser !== null || testResults.error) && (
                <div className="space-y-3">
                  <h4 className="font-medium">测试结果</h4>
                  
                  <div className="grid gap-3">
                    {/* 新用户检查 */}
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <span className="text-sm">是否为新用户</span>
                      <Badge variant={testResults.isNewUser ? "default" : "secondary"}>
                        {testResults.isNewUser ? "是" : "否"}
                      </Badge>
                    </div>

                    {/* 邀请人存在检查 */}
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <span className="text-sm">邀请人是否存在</span>
                      <Badge variant={testResults.inviterExists ? "default" : "destructive"}>
                        {testResults.inviterExists ? "存在" : "不存在"}
                      </Badge>
                    </div>

                    {/* 注册流程测试 */}
                    {testResults.registrationSuccess !== null && (
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <span className="text-sm">邀请注册流程</span>
                        <Badge variant={testResults.registrationSuccess ? "default" : "destructive"}>
                          {testResults.registrationSuccess ? "成功" : "失败"}
                        </Badge>
                      </div>
                    )}

                    {/* 错误信息 */}
                    {testResults.error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          <span className="text-sm font-medium text-destructive">错误</span>
                        </div>
                        <p className="text-sm text-destructive mt-1">{testResults.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 奖励配置信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                奖励配置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20">
                  <p className="text-sm text-muted-foreground mb-1">新用户奖励</p>
                  <p className="text-xl font-bold text-green-600">{REWARD_CONFIG.WELCOME_BONUS}</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-muted-foreground mb-1">一级邀请</p>
                  <p className="text-xl font-bold text-blue-600">{REWARD_CONFIG.REFERRAL_L1}</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-muted-foreground mb-1">二级邀请</p>
                  <p className="text-xl font-bold text-purple-600">{REWARD_CONFIG.REFERRAL_L2}</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20">
                  <p className="text-sm text-muted-foreground mb-1">三级邀请</p>
                  <p className="text-xl font-bold text-orange-600">{REWARD_CONFIG.REFERRAL_L3}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 使用说明 */}
          <Card>
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                  <p>复制上方生成的邀请链接</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                  <p>分享给朋友或在新的浏览器窗口中打开</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                  <p>朋友连接钱包后会自动建立邀请关系并获得奖励</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                  <p>您也会获得相应的邀请奖励</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MemeBackground>
  )
} 
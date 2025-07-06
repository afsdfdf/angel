"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { MemeBackground } from "@/components/meme-background"
import { WalletConnect } from "@/components/wallet-connect"
import { useAuth } from "@/lib/auth-context"
import { DatabaseService, type User, REWARD_CONFIG } from "@/lib/database"
import { Gift, Users, Coins, Star, TrendingUp, AlertCircle } from "lucide-react"

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const { login } = useAuth()
  const inviterWalletAddress = params.code as string
  
  const [inviter, setInviter] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  useEffect(() => {
    if (inviterWalletAddress) {
      loadInviterInfo()
    }
  }, [inviterWalletAddress])

  const loadInviterInfo = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 验证钱包地址格式
      if (!inviterWalletAddress || !inviterWalletAddress.startsWith('0x') || inviterWalletAddress.length !== 42) {
        setError("邀请链接格式无效")
        return
      }

      const inviterData = await DatabaseService.getUserByWalletAddress(inviterWalletAddress)
      
      if (inviterData) {
        setInviter(inviterData)
      } else {
        setError("邀请人不存在或邀请链接无效")
      }
    } catch (error) {
      console.error("加载邀请信息失败:", error)
      setError("加载邀请信息失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserChange = async (user: User | null) => {
    if (!user) return
    
    try {
      setIsRegistering(true)
      
      // 检查是否为新用户通过邀请链接注册
      const isNewUser = await DatabaseService.isNewUser(user.wallet_address)
      
      if (isNewUser) {
        // 新用户通过邀请链接注册
        // 处理邀请注册关系
        const success = await DatabaseService.processInviteRegistration(
          user.wallet_address.toLowerCase(),
          inviterWalletAddress.toLowerCase()
        )
        
        if (success) {
          // 重新获取用户信息（包含奖励）
          const updatedUser = await DatabaseService.getUserByWalletAddress(user.wallet_address)
          if (updatedUser) {
            await login(updatedUser)
          } else {
            await login(user)
          }
          setRegistrationSuccess(true)
          
          // 3秒后跳转到主页
          setTimeout(() => {
            router.push('/')
          }, 3000)
        } else {
          // 邀请处理失败，但仍然登录用户
          await login(user)
          setError("邀请处理失败，但您已成功登录")
        }
      } else {
        // 已存在用户直接登录
        await login(user)
        
        // 1秒后跳转到主页
        setTimeout(() => {
          router.push('/')
        }, 1000)
      }
    } catch (error: any) {
      console.error("处理用户登录失败:", error)
      setError("处理用户登录失败，请重试")
    } finally {
      setIsRegistering(false)
    }
  }

  if (isLoading) {
    return (
      <MemeBackground variant="premium" overlay={true}>
        <PageHeader title="加载中..." emoji="⏳" />
        <div className="container mx-auto px-4 pb-4 max-w-md pt-20">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-angel-primary"></div>
          </div>
        </div>
      </MemeBackground>
    )
  }

  if (error) {
    return (
      <MemeBackground variant="premium" overlay={true}>
        <PageHeader title="邀请无效" emoji="❌" />
        <div className="container mx-auto px-4 pb-4 max-w-md pt-20">
          <Card className="glass-card border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-foreground font-bold text-lg mb-2">邀请链接无效</h3>
              <p className="text-muted-foreground text-sm mb-4">{error}</p>
                              <div className="space-y-2">
                  <WalletConnect onUserChange={handleUserChange} />
                  <p className="text-xs text-muted-foreground">
                    您仍可以正常连接钱包使用应用
                  </p>
                </div>
            </CardContent>
          </Card>
        </div>
      </MemeBackground>
    )
  }

  if (registrationSuccess) {
    return (
      <MemeBackground variant="premium" overlay={true}>
        <PageHeader title="注册成功" emoji="🎉" />
        <div className="container mx-auto px-4 pb-4 max-w-md pt-20">
          <Card className="glass-card border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-foreground font-bold text-lg mb-2">欢迎加入天使生态！</h3>
              <p className="text-muted-foreground text-sm mb-4">
                您已成功通过邀请注册，获得 {REWARD_CONFIG.WELCOME_BONUS} 枚天使代币！
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="bg-gradient-primary/10 rounded-lg p-4 border border-angel-primary/20">
                  <p className="text-angel-primary font-bold text-xl">
                    +{REWARD_CONFIG.WELCOME_BONUS} ANGEL
                  </p>
                  <p className="text-xs text-muted-foreground">新用户注册奖励</p>
                </div>
                
                <div className="bg-angel-success/10 rounded-lg p-3 border border-angel-success/20">
                  <p className="text-angel-success font-medium text-sm">
                    邀请人也获得了 {REWARD_CONFIG.REFERRAL_L1} 枚代币奖励！
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="animate-pulse text-angel-primary font-medium">
                  正在跳转到主页...
                </div>
                <div className="w-full bg-angel-primary/20 rounded-full h-2 mt-2">
                  <div className="bg-angel-primary h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MemeBackground>
    )
  }

  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader title="邀请加入" emoji="🎁" />

      <div className="container mx-auto px-4 pb-4 max-w-md pt-20">
        <div className="space-y-6">
          
          {/* 邀请信息卡片 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-angel-primary" />
                邀请详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-angel-primary">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-foreground font-bold text-lg mb-2">
                  {inviter?.username || `用户${inviter?.wallet_address?.slice(0, 6)}...${inviter?.wallet_address?.slice(-4)}`} 邀请您加入
                </h3>
                <p className="text-muted-foreground text-sm">天使加密生态系统</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border">
                  <span className="text-muted-foreground text-sm">邀请人</span>
                  <div className="text-right">
                    <p className="text-foreground font-medium">
                      {inviter?.username || `用户${inviter?.wallet_address?.slice(0, 6)}...${inviter?.wallet_address?.slice(-4)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      已邀请 {inviter?.total_referrals || 0} 人
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border">
                  <span className="text-muted-foreground text-sm">邀请人地址</span>
                  <Badge className="bg-angel-gold/20 text-angel-gold border-angel-gold/30 font-mono text-xs">
                    {inviterWalletAddress?.slice(0, 6)}...{inviterWalletAddress?.slice(-4)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border">
                  <span className="text-muted-foreground text-sm">当前余额</span>
                  <div className="text-right">
                    <p className="text-foreground font-medium">
                      {inviter?.angel_balance?.toLocaleString() || 0} ANGEL
                    </p>
                    <p className="text-xs text-muted-foreground">
                      总收益: {inviter?.total_earned?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 奖励说明卡片 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-angel-secondary" />
                奖励机制
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gradient-primary/10 rounded-lg p-4 border border-angel-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="w-5 h-5 text-angel-primary" />
                    <span className="font-medium text-foreground">新用户奖励</span>
                  </div>
                  <p className="text-2xl font-bold text-angel-primary mb-1">
                    {REWARD_CONFIG.WELCOME_BONUS} ANGEL
                  </p>
                  <p className="text-xs text-muted-foreground">
                    连接钱包即可获得
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 bg-secondary/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">一级邀请</p>
                    <p className="font-bold text-angel-success">{REWARD_CONFIG.REFERRAL_L1}</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">二级邀请</p>
                    <p className="font-bold text-angel-secondary">{REWARD_CONFIG.REFERRAL_L2}</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">三级邀请</p>
                    <p className="font-bold text-angel-accent">{REWARD_CONFIG.REFERRAL_L3}</p>
                  </div>
                </div>

                <div className="bg-angel-success/10 rounded-lg p-3 border border-angel-success/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-angel-success" />
                    <span className="text-sm font-medium text-angel-success">多级奖励</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    邀请人也将获得相应奖励，实现多级收益
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 连接钱包卡片 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-angel-gold" />
                开始您的天使之旅
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-muted-foreground text-sm">
                  连接您的钱包，立即获得 {REWARD_CONFIG.WELCOME_BONUS} 枚天使代币
                </p>
                
                <div className="space-y-3">
                  <WalletConnect 
                    onUserChange={handleUserChange}
                  />
                  
                  {isRegistering && (
                    <div className="bg-angel-primary/10 rounded-lg p-3 border border-angel-primary/20">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-angel-primary"></div>
                        <span className="text-sm text-angel-primary">正在处理邀请关系...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  支持 MetaMask、Trust Wallet 等主流钱包
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MemeBackground>
  )
} 
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Wallet, LogOut, Copy, ExternalLink, Gift, Users, Coins, Share2 } from "lucide-react"
import { Web3Service } from "@/lib/web3"
import { DatabaseService, type User, REWARD_CONFIG } from "@/lib/database"

interface WalletConnectProps {
  onUserChange?: (user: User | null) => void
}

export function WalletConnect({ onUserChange }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showReferralInput, setShowReferralInput] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [web3Service, setWeb3Service] = useState<Web3Service | null>(null)

  useEffect(() => {
    // 在客户端初始化 Web3 服务
    if (typeof window !== 'undefined') {
      const service = Web3Service.getInstance()
      setWeb3Service(service)
      checkConnection(service)
    }
  }, [])

  const checkConnection = async (service: Web3Service) => {
    try {
      if (service.isWalletInstalled() && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          const account = accounts[0]
          await loginWithWallet(account, service)
        }
      }
    } catch (error) {
      console.error("检查连接失败:", error)
    }
  }

  const loginWithWallet = async (walletAddress: string, service: Web3Service) => {
    try {
      setAccount(walletAddress)
      setIsConnected(true)

      // 从数据库获取用户信息
      const userData = await DatabaseService.getUserByWalletAddress(walletAddress)
      
      if (userData) {
        // 老用户，直接登录
        setUser(userData)
        onUserChange?.(userData)
              } else {
          // 新用户，显示推荐码输入
          setShowReferralInput(true)
        }
    } catch (error) {
      console.error("登录失败:", error)
      setError("登录失败")
    }
  }

  const connectWallet = async () => {
    if (!web3Service) {
      setError("Web3 服务未初始化")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await web3Service.connectWallet()

      if (!result.success) {
        setError(result.error || "连接失败")
        return
      }

      // 直接登录
      await loginWithWallet(result.account!, web3Service)
    } catch (error: any) {
      console.error("连接钱包失败:", error)
      setError(error.message || "连接失败")
    } finally {
      setIsLoading(false)
    }
  }

  const createNewUser = async (walletAddress: string, refCode?: string) => {
    try {
      setIsLoading(true)
      
      // 如果有推荐码，验证推荐码
      if (refCode) {
        const referrer = await DatabaseService.getUserByReferralCode(refCode)
        if (!referrer) {
          setError("推荐码无效")
          setIsLoading(false)
          return
        }
      }

      // 创建新用户
      const newUser = {
        wallet_address: walletAddress.toLowerCase(),
        total_referrals: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      const userData = await DatabaseService.createUser(newUser)
      
      if (!userData) {
        setError("用户创建失败")
        setIsLoading(false)
        return
      }

      // 如果有推荐码，处理推荐关系
      if (refCode) {
        await DatabaseService.acceptInvitation(refCode, walletAddress)
      }

      setUser(userData)
      onUserChange?.(userData)
      setShowReferralInput(false)
      setReferralCode("")
      setIsLoading(false)
    } catch (error: any) {
      console.error("创建用户失败:", error)
      setError(error.message || "创建用户失败")
      setIsLoading(false)
    }
  }

  const handleReferralSubmit = async () => {
    if (!account) return
    await createNewUser(account, referralCode || undefined)
  }

  const disconnectWallet = async () => {
    if (web3Service) {
      await web3Service.disconnectWallet()
    }
    setIsConnected(false)
    setAccount(null)
    setUser(null)
    setShowReferralInput(false)
    setReferralCode("")
    setError(null)
    setShowDropdown(false)
    onUserChange?.(null)
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
    }
  }

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code)
    }
  }

  const copyInviteLink = async () => {
    if (!user) return
    
    try {
      const inviteLink = await DatabaseService.createInviteLink(user.id)
      if (inviteLink) {
        navigator.clipboard.writeText(inviteLink)
        // 可以添加一个提示消息
      }
    } catch (error) {
      console.error("创建邀请链接失败:", error)
    }
  }

  const shareInviteLink = async () => {
    if (!user) return
    
    try {
      const inviteLink = await DatabaseService.createInviteLink(user.id)
      if (inviteLink && navigator.share) {
        await navigator.share({
          title: '加入天使加密',
          text: `邀请您加入天使加密，获得${REWARD_CONFIG.WELCOME_BONUS}枚天使代币！`,
          url: inviteLink,
        })
      } else if (inviteLink) {
        // 降级到复制链接
        navigator.clipboard.writeText(inviteLink)
      }
    } catch (error) {
      console.error("分享邀请链接失败:", error)
    }
  }

  // 未连接状态
  if (!isConnected) {
    return (
      <div className="relative">
        {error && (
          <div className="absolute -top-12 right-0 bg-red-500/90 border border-red-500 rounded-lg p-2 min-w-48 z-50">
            <p className="text-red-100 text-xs">{error}</p>
          </div>
        )}
        <Button
          onClick={connectWallet}
          disabled={isLoading}
          className="bg-gradient-to-r from-angel-primary to-angel-secondary hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-angel-primary flex items-center gap-2 touch-feedback"
        >
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">{isLoading ? "连接中..." : "连接钱包"}</span>
        </Button>
      </div>
    )
  }

  // 新用户推荐码输入
  if (showReferralInput) {
    return (
      <div className="relative">
        {/* 背景遮罩 */}
        <div className="fixed inset-0 bg-black/50 z-40" />
        
        {/* 推荐码输入弹窗 */}
        <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw] glass-card border-angel-primary/30 shadow-2xl z-50">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-angel-primary">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-foreground font-bold text-lg mb-2">欢迎加入天使生态</h3>
              <p className="text-muted-foreground text-sm mb-2">您将获得 {REWARD_CONFIG.WELCOME_BONUS} 枚天使代币！</p>
              <p className="text-muted-foreground text-xs">输入推荐码可获得额外奖励</p>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  placeholder="输入推荐码 (可选)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="bg-secondary/50 border-border text-foreground text-center font-mono"
                />
              </div>

              {error && (
                <div className="bg-angel-error/10 border border-angel-error/30 rounded-lg p-3">
                  <p className="text-angel-error text-sm text-center">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleReferralSubmit()}
                  className="flex-1 border-border text-muted-foreground hover:bg-secondary touch-feedback"
                  disabled={isLoading}
                >
                  跳过
                </Button>
                <Button
                  onClick={handleReferralSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-primary text-white hover:opacity-90 touch-feedback"
                >
                  {isLoading ? "创建中..." : "确认"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 已连接状态
  return (
    <div className="relative">
      {/* 钱包连接按钮 */}
      <Button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-gradient-to-r from-angel-success to-angel-accent hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-angel-success flex items-center gap-2 touch-feedback"
      >
        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
        <span className="hidden sm:inline">
          {user?.username || `用户${user?.id?.slice(0, 6) || account?.slice(0, 6)}`}
        </span>
        <span className="hidden md:inline text-xs opacity-80">
          ({account?.slice(0, 4)}...{account?.slice(-2)})
        </span>
      </Button>

      {/* 下拉菜单 */}
      {showDropdown && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* 下拉内容 */}
          <Card className="absolute top-full right-0 mt-2 w-80 max-w-[90vw] glass-card border-angel-success/30 shadow-2xl z-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-angel-success to-angel-accent flex items-center justify-center shadow-angel-success">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">
                      {user?.username || `用户${user?.id?.slice(0, 6) || account?.slice(0, 6)}`}
                    </p>
                    <p className="text-muted-foreground text-xs">已连接</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={disconnectWallet}
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg touch-feedback"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>

              {/* 余额显示 */}
              {user && (
                <div className="bg-gradient-primary/10 rounded-lg p-3 mb-4 border border-angel-primary/20">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">天使代币余额</p>
                    <p className="text-2xl font-bold text-angel-primary">
                      {user.angel_balance?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      累计收益: {user.total_earned?.toLocaleString() || '0'} ANGEL
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="bg-secondary/30 rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-sm">钱包地址</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyAddress}
                        className="w-6 h-6 text-muted-foreground hover:text-foreground touch-feedback"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-6 h-6 text-muted-foreground hover:text-foreground touch-feedback"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-foreground font-mono text-xs">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </p>
                </div>

                {user?.referral_code && (
                  <div className="bg-secondary/30 rounded-lg p-3 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground text-sm">我的推荐</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyReferralCode}
                          className="w-6 h-6 text-muted-foreground hover:text-foreground touch-feedback"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={shareInviteLink}
                          className="w-6 h-6 text-muted-foreground hover:text-foreground touch-feedback"
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-angel-gold font-bold font-mono">{user.referral_code}</p>
                      <Badge className="bg-angel-accent/20 text-angel-accent border-angel-accent/30 text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {user.total_referrals}人
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>邀请奖励: 一级{REWARD_CONFIG.REFERRAL_L1} | 二级{REWARD_CONFIG.REFERRAL_L2} | 三级{REWARD_CONFIG.REFERRAL_L3}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

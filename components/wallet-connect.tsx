"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, LogOut, Copy, Gift, Users, Share2 } from "lucide-react"
import { DatabaseService, type User, REWARD_CONFIG } from "@/lib/database"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface WalletConnectProps {
  onUserChange?: (user: User | null) => void
  inviterWallet?: string // 邀请人钱包地址
}

// 简化的钱包连接服务
class SimpleWalletService {
  // 检查是否安装了钱包
  isWalletInstalled(): boolean {
    return typeof window !== "undefined" && window.ethereum !== undefined
  }

  // 连接钱包
  async connectWallet(): Promise<{ success: boolean; account?: string; error?: string }> {
    try {
      if (!this.isWalletInstalled()) {
        return { success: false, error: "请安装 MetaMask 或其他以太坊钱包" }
      }

      // 请求连接钱包
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        return { success: false, error: "未找到钱包账户" }
      }

      return { success: true, account: accounts[0] }
    } catch (error: any) {
      console.error("连接钱包失败:", error)
      return { success: false, error: error.message || "连接钱包失败" }
    }
  }

  // 签名消息
  async signMessage(account: string, message: string): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      if (!this.isWalletInstalled()) {
        return { success: false, error: "钱包未安装" }
      }

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      })

      return { success: true, signature }
    } catch (error: any) {
      console.error("签名失败:", error)
      return { success: false, error: error.message || "签名失败" }
    }
  }

  // 获取当前账户
  async getCurrentAccount(): Promise<string | null> {
    try {
      if (!this.isWalletInstalled()) {
        return null
      }

      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      return accounts.length > 0 ? accounts[0] : null
    } catch (error) {
      console.error("获取账户失败:", error)
      return null
    }
  }
}

export function WalletConnect({ onUserChange, inviterWallet }: WalletConnectProps) {
  const { user, login, logout } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()

  const walletService = new SimpleWalletService()

  useEffect(() => {
    // 检查是否已经连接
    checkConnection()

    // 监听账户变化
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    try {
      const currentAccount = await walletService.getCurrentAccount()
      if (currentAccount) {
        setAccount(currentAccount)
        setIsConnected(true)
        // 检查是否已经登录
        try {
          const userData = await DatabaseService.getUserByWalletAddress(currentAccount)
          if (userData) {
            login(userData)
            onUserChange?.(userData)
          }
        } catch (dbError) {
          console.warn("数据库连接失败，但钱包已连接:", dbError)
          // 即使数据库不可用，也保持钱包连接状态
        }
      }
    } catch (error) {
      console.error("检查连接失败:", error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // 钱包断开连接
      disconnectWallet()
    } else if (accounts[0] !== account) {
      // 账户切换
      setAccount(accounts[0])
      logout()
      onUserChange?.(null)
      // 可以选择自动重新登录
      // loginWithWallet(accounts[0])
    }
  }

  const handleChainChanged = () => {
    // 网络切换时重新加载页面
    window.location.reload()
  }

  const connectWallet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await walletService.connectWallet()

      if (!result.success) {
        setError(result.error || "连接失败")
        return
      }

      setAccount(result.account!)
      setIsConnected(true)

      // 自动登录
      await loginWithWallet(result.account!)
    } catch (error: any) {
      console.error("连接钱包失败:", error)
      setError(error.message || "连接失败")
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithWallet = async (walletAddress: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // 生成签名消息
      const message = `欢迎来到Angel Crypto App！\n\n请签名以验证您的身份。\n\n钱包地址: ${walletAddress}\n时间戳: ${Date.now()}`
      
      // 请求用户签名
      const signResult = await walletService.signMessage(walletAddress, message)
      
      if (!signResult.success) {
        setError(signResult.error || "签名失败")
        return
      }

      try {
        // 检查是否为新用户
        const isNewUser = await DatabaseService.isNewUser(walletAddress)
        
        if (isNewUser) {
          // 新用户，处理邀请注册
          let success = false
          if (inviterWallet) {
            success = await DatabaseService.processInviteRegistration(walletAddress, inviterWallet)
          } else {
            // 没有邀请人，直接创建用户
            const newUser = await DatabaseService.createUser({
              wallet_address: walletAddress.toLowerCase()
            })
            success = !!newUser
          }
          
          if (!success) {
            console.warn("用户创建失败，但钱包已连接")
            // 不设置错误，允许用户继续使用应用
          }
        }

        // 获取用户信息
        const userData = await DatabaseService.getUserByWalletAddress(walletAddress)
        if (userData) {
          login(userData)
          onUserChange?.(userData)
        } else {
          console.warn("未找到用户数据，但钱包已连接")
          // 不设置错误，允许用户继续使用应用
        }
      } catch (dbError) {
        console.warn("数据库操作失败，但钱包已连接:", dbError)
        // 即使数据库不可用，也不阻止钱包连接
      }
    } catch (error: any) {
      console.error("登录失败:", error)
      setError(error.message || "登录失败")
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAccount(null)
    logout()
    setError(null)
    setShowDropdown(false)
    onUserChange?.(null)
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
    }
  }

  const copyInviteLink = async () => {
    if (!user) return
    
    try {
      const inviteLink = await DatabaseService.generateInviteLink(user.wallet_address)
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
      const inviteLink = await DatabaseService.generateInviteLink(user.wallet_address)
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
                        onClick={() => window.open(`https://bscscan.com/address/${account}`, '_blank')}
                        className="w-6 h-6 text-muted-foreground hover:text-foreground touch-feedback"
                      >
                        <Gift className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-foreground font-mono text-xs">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </p>
                </div>

                {/* 邀请功能 */}
                <div className="bg-secondary/30 rounded-lg p-3 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-sm">邀请好友</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyInviteLink}
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
                    <p className="text-angel-gold font-bold text-xs">
                      {account?.slice(0, 8)}...{account?.slice(-6)}
                    </p>
                    <Badge className="bg-angel-accent/20 text-angel-accent border-angel-accent/30 text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {user?.total_referrals || 0}人
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>邀请奖励: 一级{REWARD_CONFIG.REFERRAL_L1} | 二级{REWARD_CONFIG.REFERRAL_L2} | 三级{REWARD_CONFIG.REFERRAL_L3}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// 全局声明
declare global {
  interface Window {
    ethereum?: any
  }
}

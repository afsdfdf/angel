"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, LogOut, Copy, Gift, Users, Share2, CheckCircle } from "lucide-react"
import { DatabaseClientApi } from "@/lib/database-client-api"
import { useRouter } from "next/navigation"
import { useAuth, User } from "@/lib/auth-context"
import { useWallet } from "@/lib/wallet-context"

// Define reward config directly in this client component to avoid server imports
const REWARD_CONFIG = {
  WELCOME_BONUS: 10000,
  REFERRAL_L1: 3000,
  REFERRAL_L2: 1500,
  REFERRAL_L3: 500
};

interface WalletConnectProps {
  onUserChange?: (user: User | null) => void
  inviterWallet?: string // 邀请人钱包地址
}

// 简化的钱包连接服务
class SimpleWalletService {
  private isConnecting = false
  private isSigning = false

  // 检查是否安装了钱包
  isWalletInstalled(): boolean {
    return typeof window !== "undefined" && window.ethereum !== undefined
  }

  // 连接钱包
  async connectWallet(): Promise<{ success: boolean; account?: string; error?: string }> {
    // 防止重复连接
    if (this.isConnecting) {
      return { success: false, error: "连接请求进行中，请稍候" }
    }

    this.isConnecting = true

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
    } finally {
      this.isConnecting = false
    }
  }

  // 签名消息
  async signMessage(account: string, message: string): Promise<{ success: boolean; signature?: string; error?: string }> {
    // 防止重复签名
    if (this.isSigning) {
      return { success: false, error: "签名请求进行中，请稍候" }
    }

    this.isSigning = true

    try {
      if (!this.isWalletInstalled()) {
        return { success: false, error: "钱包未安装" }
      }

      // 检查是否有待处理的请求
      if (window.ethereum.isMetaMask) {
        // 等待一下，确保没有待处理的请求
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      })

      return { success: true, signature }
    } catch (error: any) {
      console.error("签名失败:", error)
      
      // 处理特定的错误类型
      if (error.message?.includes("pending request")) {
        return { success: false, error: "钱包有未完成的请求，请稍后再试" }
      }
      
      if (error.code === 4001) {
        return { success: false, error: "用户拒绝了签名请求" }
      }
      
      if (error.code === -32002) {
        return { success: false, error: "请检查钱包扩展程序并完成待处理的请求" }
      }
      
      return { success: false, error: error.message || "签名失败" }
    } finally {
      this.isSigning = false
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
  const { 
    isConnected, 
    account, 
    isLoading, 
    error, 
    connectWallet: connectWalletGlobal, 
    disconnectWallet: disconnectWalletGlobal,
    setError: setErrorGlobal,
    setIsLoading: setIsLoadingGlobal
  } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState<Set<string>>(new Set())
  const router = useRouter()

  const walletService = new SimpleWalletService()

  const connectWallet = async () => {
    try {
      // 防止重复点击
      if (isLoading || isLoggingIn || isSigning) {
        console.log("请求正在处理中，请稍候...")
        return;
      }
      
      setIsLoadingGlobal(true); // 使用全局的setIsLoading
      
      // 清除可能的错误状态
      setErrorGlobal(null);

      // 请求连接钱包
      console.log("🔄 请求连接钱包...");
      await connectWalletGlobal();
      
      // 连接成功后显示成功状态，但不自动登录
      setTimeout(() => {
        setIsLoadingGlobal(false); // 使用全局的setIsLoading
      }, 1000);
      
      // 不要在这里自动触发登录
      
    } catch (error: any) {
      console.error("连接钱包失败:", error);
      setErrorGlobal(error.message || "连接失败");
      setIsLoadingGlobal(false); // 使用全局的setIsLoading
    }
  }

  // 移除自动登录逻辑
  // useEffect(() => {
  //   const canAutoLogin = isConnected && 
  //                        account && 
  //                        !user && 
  //                        !isLoggingIn && 
  //                        !isSigning && 
  //                        !loginAttempts.has(account);
  //   
  //   if (canAutoLogin) {
  //     const timer = setTimeout(() => {
  //       console.log("🔄 钱包已连接，尝试自动登录用户:", account);
  //       loginWithWallet(account);
  //     }, 1000);
  //     
  //     return () => clearTimeout(timer);
  //   }
  // }, [isConnected, account, user, isLoggingIn, isSigning, loginAttempts]);

  // 添加错误自动关闭的效果
  useEffect(() => {
    // 如果有错误，设置自动关闭计时器
    if (error) {
      const timer = setTimeout(() => {
        setErrorGlobal(null);
      }, 15000); // 15秒后自动关闭错误

      return () => clearTimeout(timer);
    }
  }, [error, setErrorGlobal]);

  // 格式化错误信息，增加更友好的提示
  const getFormattedErrorMessage = (errorMsg: string | null) => {
    if (!errorMsg) return null;
    
    // MetaMask 常见错误
    if (errorMsg.includes('pending request')) {
      return '钱包有未完成的请求，请打开钱包扩展程序并检查或拒绝待处理的请求。';
    }
    
    if (errorMsg.includes('User rejected')) {
      return '您拒绝了签名请求，请点击重试并在钱包中确认签名。';
    }
    
    if (errorMsg.includes('already pending')) {
      return '钱包有待处理的请求，请在钱包扩展中完成或拒绝它。';
    }
    
    if (errorMsg.includes('Request of type')) {
      return '钱包有待处理的请求，请检查钱包扩展并处理它。';
    }
    
    return errorMsg;
  };

  // 清理函数
  useEffect(() => {
    return () => {
      // 组件卸载时清理状态
      setIsLoggingIn(false)
      setIsSigning(false)
      setLoginAttempts(new Set())
    }
  }, [])

  const loginWithWallet = async (walletAddress: string) => {
    // 防止重复登录
    if (isLoggingIn || isSigning || loginAttempts.has(walletAddress)) {
      console.log("🔄 登录或签名进行中，跳过重复请求")
      return
    }

    // 标记当前钱包地址正在尝试登录
    setLoginAttempts(prev => new Set(prev).add(walletAddress))
    setIsLoggingIn(true)
    setIsSigning(true)
    setErrorGlobal(null) // 清除之前的错误

    try {
      // 添加较长延迟，确保钱包扩展程序准备好
      await new Promise(resolve => setTimeout(resolve, 800))

      // 生成签名消息 - 添加随机数避免重复
      const timestamp = Date.now()
      const randomId = Math.floor(Math.random() * 1000000)
      const message = `欢迎来到Angel Crypto App！\n\n请签名以验证您的身份。\n\n钱包地址: ${walletAddress}\n时间戳: ${timestamp}\n随机码: ${randomId}`
      
      console.log("🔄 请求用户签名...")
      
      // 请求用户签名
      const signResult = await walletService.signMessage(walletAddress, message)
      
      if (!signResult.success) {
        console.log("❌ 签名失败:", signResult.error)
        setErrorGlobal(signResult.error || "签名失败")
        return
      }

      console.log("✅ 签名成功，继续处理...")
      setIsSigning(false) // 签名完成

      try {
        // 检查是否为新用户
        console.log("🔄 检查用户是否存在...")
        const userExists = await DatabaseClientApi.isUserExists(walletAddress)
        const isNewUser = !userExists
        
        if (isNewUser) {
          console.log("🆕 检测到新用户，创建账户...")
          // 新用户，处理邀请注册
          let success = false
          if (inviterWallet) {
            console.log("🔄 处理邀请注册:", walletAddress, inviterWallet)
            success = await DatabaseClientApi.processInviteRegistration(walletAddress, inviterWallet)
            console.log("邀请注册结果:", success ? "成功" : "失败")
          } else {
            // 没有邀请人，直接创建用户
            console.log("🔄 创建新用户:", walletAddress)
            const newUser = await DatabaseClientApi.createUser({
              wallet_address: walletAddress.toLowerCase()
            })
            success = !!newUser
            console.log("用户创建结果:", success ? "成功" : "失败")
          }
          
          if (!success) {
            console.warn("⚠️ 用户创建失败，但钱包已连接")
            // 不设置错误，允许用户继续使用应用
          }
        } else {
          console.log("👤 用户已存在，获取信息...")
        }

        // 获取用户信息
        console.log("🔄 获取用户信息...")
        const userData = await DatabaseClientApi.getUserByWalletAddress(walletAddress)
        if (userData) {
          console.log("✅ 获取用户信息成功，完成登录")
          login(userData)
          onUserChange?.(userData)
        } else {
          console.warn("⚠️ 未找到用户数据，但钱包已连接")
          // 不设置错误，允许用户继续使用应用
        }
      } catch (dbError) {
        console.error("❌ 数据库操作失败:", dbError)
        setErrorGlobal("数据库访问失败，请稍后再试")
      }
    } catch (error: any) {
      console.error("❌ 登录失败:", error)
      setErrorGlobal(error.message || "登录失败")
    } finally {
      setIsLoggingIn(false)
      setIsSigning(false)
      
      // 延迟清除登录尝试记录，给用户一些时间查看错误信息
      setTimeout(() => {
        setLoginAttempts(prev => {
          const newSet = new Set(prev)
          newSet.delete(walletAddress)
          return newSet
        })
      }, 2000)
    }
  }

  const disconnectWallet = () => {
    disconnectWalletGlobal()
    logout()
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
      const inviteLink = await DatabaseClientApi.generateInviteLink(user.wallet_address)
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
      const inviteLink = await DatabaseClientApi.generateInviteLink(user.wallet_address)
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
            <div className="flex justify-between items-start">
              <p className="text-red-100 text-xs">{getFormattedErrorMessage(error)}</p>
              <button 
                onClick={() => setErrorGlobal(null)} 
                className="text-white/70 hover:text-white ml-2 text-xs"
              >
                ×
              </button>
            </div>
            <div className="mt-2 text-center">
              <button 
                onClick={() => {
                  setErrorGlobal(null);
                  // 重置所有状态
                  setIsLoadingGlobal(false);
                  setLoginAttempts(new Set());
                  setIsLoggingIn(false);
                  setIsSigning(false);
                }}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md"
              >
                重试
              </button>
            </div>
          </div>
        )}
        <Button
          onClick={connectWallet}
          disabled={isLoading || isLoggingIn || isSigning}
          className="bg-gradient-to-r from-angel-primary to-angel-secondary hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-angel-primary flex items-center gap-2 touch-feedback"
        >
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isLoading ? "连接中..." : 
             isSigning ? "签名中..." : 
             isLoggingIn ? "登录中..." : 
             "连接钱包"}
          </span>
        </Button>
      </div>
    )
  }

  // 钱包已连接但用户未登录状态
  if (isConnected && account && !user) {
    return (
      <div className="relative">
        {error && (
          <div className="absolute -top-12 right-0 bg-red-500/90 border border-red-500 rounded-lg p-2 min-w-48 z-50">
            <div className="flex justify-between items-start">
              <p className="text-red-100 text-xs">{getFormattedErrorMessage(error)}</p>
              <button 
                onClick={() => setErrorGlobal(null)} 
                className="text-white/70 hover:text-white ml-2 text-xs"
              >
                ×
              </button>
            </div>
            <div className="mt-2 text-center">
              <button 
                onClick={() => {
                  setErrorGlobal(null);
                  // 如果是签名错误，则清除登录尝试记录，允许重试
                  if (account) {
                    setLoginAttempts(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(account);
                      return newSet;
                    });
                  }
                }}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md"
              >
                重试
              </button>
            </div>
          </div>
        )}
        <Button
          onClick={() => loginWithWallet(account)}
          disabled={isLoggingIn || isSigning}
          className="bg-gradient-to-r from-angel-accent to-angel-secondary hover:opacity-90 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-angel-accent flex items-center gap-2 touch-feedback"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isSigning ? "签名中..." : 
             isLoggingIn ? "登录中..." : 
             "点击登录"}
          </span>
        </Button>
      </div>
    )
  }

  // 已连接且已登录状态
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
                      {user?.invites_count || 0}人
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


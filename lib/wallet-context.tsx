"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WalletContextType {
  isConnected: boolean
  account: string | null
  isLoading: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  setAccount: (account: string | null) => void
  setIsConnected: (connected: boolean) => void
  setError: (error: string | null) => void
  setIsLoading: (loading: boolean) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

// 简化的钱包连接服务
class SimpleWalletService {
  private isConnecting = false;
  private isSigning = false;

  // 检查是否安装了钱包
  isWalletInstalled(): boolean {
    return typeof window !== "undefined" && window.ethereum !== undefined
  }

  // 连接钱包
  async connectWallet(): Promise<{ success: boolean; account?: string; error?: string }> {
    // 防止重复连接
    if (this.isConnecting) {
      console.log("已有连接请求正在处理中...")
      return { success: false, error: "已有连接请求正在处理中，请稍后再试" }
    }
    
    this.isConnecting = true;
    
    try {
      if (!this.isWalletInstalled()) {
        return { success: false, error: "请安装 MetaMask 或其他以太坊钱包" }
      }

      // 请求连接钱包前，添加延迟
      await new Promise(resolve => setTimeout(resolve, 300));

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
      
      // 处理特定的错误类型
      if (error.message?.includes("pending request")) {
        return { success: false, error: "钱包有未完成的请求，请刷新页面后再试" }
      }
      
      if (error.code === 4001) {
        return { success: false, error: "用户拒绝了连接请求" }
      }
      
      if (error.code === -32002) {
        return { success: false, error: "请检查钱包扩展程序并完成待处理的请求" }
      }
      
      return { success: false, error: error.message || "连接钱包失败" }
    } finally {
      this.isConnecting = false;
    }
  }

  // 签名消息
  async signMessage(account: string, message: string): Promise<{ success: boolean; signature?: string; error?: string }> {
    // 防止重复签名
    if (this.isSigning) {
      console.log("已有签名请求正在处理中...")
      return { success: false, error: "已有签名请求正在处理中，请稍后再试" }
    }

    this.isSigning = true;
    
    try {
      if (!this.isWalletInstalled()) {
        return { success: false, error: "钱包未安装" }
      }

      // 在请求签名前，等待一下，确保钱包UI已准备好
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      })

      return { success: true, signature }
    } catch (error: any) {
      console.error("签名失败:", error)
      
      // 处理特定的错误类型
      if (error.message?.includes("pending request")) {
        return { success: false, error: "钱包有未完成的请求，请刷新页面后再试" }
      }
      
      if (error.code === 4001) {
        return { success: false, error: "用户拒绝了签名请求" }
      }
      
      if (error.code === -32002) {
        return { success: false, error: "请检查钱包扩展程序并完成待处理的请求" }
      }
      
      return { success: false, error: error.message || "签名失败" }
    } finally {
      this.isSigning = false;
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

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        console.log("🔗 钱包已连接:", currentAccount)
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
      console.log("✅ 钱包连接成功:", result.account)
    } catch (error: any) {
      console.error("连接钱包失败:", error)
      setError(error.message || "连接失败")
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAccount(null)
    setError(null)
  }

  const value: WalletContextType = {
    isConnected,
    account,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    setAccount,
    setIsConnected,
    setError,
    setIsLoading
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
} 
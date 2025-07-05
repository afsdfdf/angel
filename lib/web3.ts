import { createPublicClient, createWalletClient, custom, http } from "viem"
import { bsc } from "viem/chains"

// Web3 钱包连接
export class Web3Service {
  private static instance: Web3Service
  private walletClient: any = null
  private publicClient: any = null
  private account: string | null = null

  static getInstance(): Web3Service {
    if (!Web3Service.instance) {
      Web3Service.instance = new Web3Service()
    }
    return Web3Service.instance
  }

  // 检查是否安装了钱包
  isWalletInstalled(): boolean {
    return typeof window !== "undefined" && window.ethereum !== undefined
  }

  // 连接钱包
  async connectWallet(): Promise<{ success: boolean; account?: string; error?: string }> {
    try {
      if (!this.isWalletInstalled()) {
        return { success: false, error: "请安装MetaMask钱包" }
      }

      // 请求连接钱包
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        return { success: false, error: "未找到钱包账户" }
      }

      this.account = accounts[0]

      // 创建钱包客户端
      this.walletClient = createWalletClient({
        chain: bsc,
        transport: custom(window.ethereum),
      })

      this.publicClient = createPublicClient({
        chain: bsc,
        transport: http(),
      })

      return { success: true, account: this.account || undefined }
    } catch (error: any) {
      return { success: false, error: error.message || "连接钱包失败" }
    }
  }

  // 断开钱包连接
  async disconnectWallet(): Promise<void> {
    this.account = null
    this.walletClient = null
    this.publicClient = null
  }

  // 获取当前账户
  getAccount(): string | null {
    return this.account
  }

  // 签名消息（用于登录验证）
  async signMessage(message: string): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      if (!this.walletClient || !this.account) {
        return { success: false, error: "请先连接钱包" }
      }

      const signature = await this.walletClient.signMessage({
        account: this.account,
        message,
      })

      return { success: true, signature }
    } catch (error: any) {
      return { success: false, error: error.message || "签名失败" }
    }
  }

  // 获取余额
  async getBalance(): Promise<{ success: boolean; balance?: string; error?: string }> {
    try {
      if (!this.publicClient || !this.account) {
        return { success: false, error: "请先连接钱包" }
      }

      const balance = await this.publicClient.getBalance({
        address: this.account,
      })

      return { success: true, balance: balance.toString() }
    } catch (error: any) {
      return { success: false, error: error.message || "获取余额失败" }
    }
  }
}

// 全局声明
declare global {
  interface Window {
    ethereum?: any
  }
}

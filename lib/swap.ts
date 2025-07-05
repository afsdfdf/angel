// 交换相关的数据和逻辑
export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
  balance?: string
  price?: number
}

export interface Pool {
  token0: Token
  token1: Token
  reserve0: string
  reserve1: string
  totalSupply: string
  fee: number
  apy: number
}

export interface SwapRoute {
  path: Token[]
  amountIn: string
  amountOut: string
  priceImpact: number
  fee: string
}

export class SwapService {
  private static instance: SwapService
  private tokens: Token[] = []
  private pools: Pool[] = []

  static getInstance(): SwapService {
    if (!SwapService.instance) {
      SwapService.instance = new SwapService()
      SwapService.instance.initTokens()
    }
    return SwapService.instance
  }

  private initTokens() {
    this.tokens = [
      {
        address: "0x0000000000000000000000000000000000000000",
        symbol: "BNB",
        name: "BNB",
        decimals: 18,
        logoURI: "🟡",
        balance: "2.847",
        price: 298.45,
      },
      {
        address: "0x1234567890123456789012345678901234567890",
        symbol: "ANGEL",
        name: "Angel Token",
        decimals: 18,
        logoURI: "👼",
        balance: "152847.52",
        price: 0.0847,
      },
      {
        address: "0x55d398326f99059fF775485246999027B3197955",
        symbol: "USDT",
        name: "Tether USD",
        decimals: 18,
        logoURI: "💚",
        balance: "1247.89",
        price: 1.0,
      },
      {
        address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
        symbol: "BUSD",
        name: "Binance USD",
        decimals: 18,
        logoURI: "💛",
        balance: "847.23",
        price: 1.0,
      },
      {
        address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 18,
        logoURI: "🔵",
        balance: "523.67",
        price: 1.0,
      },
      {
        address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
        symbol: "BTCB",
        name: "Bitcoin BEP20",
        decimals: 18,
        logoURI: "🟠",
        balance: "0.0234",
        price: 43250.0,
      },
      {
        address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
        symbol: "ETH",
        name: "Ethereum Token",
        decimals: 18,
        logoURI: "🔷",
        balance: "0.847",
        price: 2650.0,
      },
    ]

    // 初始化流动性池
    this.pools = [
      {
        token0: this.tokens[0], // BNB
        token1: this.tokens[1], // ANGEL
        reserve0: "1000000",
        reserve1: "35000000",
        totalSupply: "5916079",
        fee: 0.25,
        apy: 45.2,
      },
      {
        token0: this.tokens[1], // ANGEL
        token1: this.tokens[2], // USDT
        reserve0: "25000000",
        reserve1: "2117500",
        totalSupply: "7280109",
        fee: 0.25,
        apy: 38.7,
      },
      {
        token0: this.tokens[0], // BNB
        token1: this.tokens[2], // USDT
        reserve0: "500000",
        reserve1: "149225000",
        totalSupply: "8660254",
        fee: 0.25,
        apy: 12.5,
      },
    ]
  }

  getTokens(): Token[] {
    return this.tokens
  }

  getToken(address: string): Token | undefined {
    return this.tokens.find((token) => token.address.toLowerCase() === address.toLowerCase())
  }

  getPools(): Pool[] {
    return this.pools
  }

  getPool(token0: string, token1: string): Pool | undefined {
    return this.pools.find(
      (pool) =>
        (pool.token0.address === token0 && pool.token1.address === token1) ||
        (pool.token0.address === token1 && pool.token1.address === token0),
    )
  }

  // 计算交换输出
  calculateSwapOutput(
    tokenIn: Token,
    tokenOut: Token,
    amountIn: string,
  ): { amountOut: string; priceImpact: number; fee: string } {
    const pool = this.getPool(tokenIn.address, tokenOut.address)

    if (!pool) {
      return { amountOut: "0", priceImpact: 0, fee: "0" }
    }

    const amountInNum = Number.parseFloat(amountIn)
    if (amountInNum <= 0) {
      return { amountOut: "0", priceImpact: 0, fee: "0" }
    }

    // 简化的AMM计算 (x * y = k)
    const isToken0In = pool.token0.address === tokenIn.address
    const reserveIn = Number.parseFloat(isToken0In ? pool.reserve0 : pool.reserve1)
    const reserveOut = Number.parseFloat(isToken0In ? pool.reserve1 : pool.reserve0)

    // 扣除手续费
    const feeAmount = amountInNum * (pool.fee / 100)
    const amountInAfterFee = amountInNum - feeAmount

    // AMM公式计算
    const amountOut = (reserveOut * amountInAfterFee) / (reserveIn + amountInAfterFee)

    // 价格影响计算
    const priceImpact = (amountInAfterFee / reserveIn) * 100

    return {
      amountOut: amountOut.toFixed(6),
      priceImpact: Math.min(priceImpact, 100),
      fee: feeAmount.toFixed(6),
    }
  }

  // 执行交换
  async executeSwap(
    tokenIn: Token,
    tokenOut: Token,
    amountIn: string,
    amountOutMin: string,
    slippage: number,
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // 模拟交换执行
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 更新余额 (模拟)
      const tokenInIndex = this.tokens.findIndex((t) => t.address === tokenIn.address)
      const tokenOutIndex = this.tokens.findIndex((t) => t.address === tokenOut.address)

      if (tokenInIndex !== -1 && tokenOutIndex !== -1) {
        const currentBalanceIn = Number.parseFloat(this.tokens[tokenInIndex].balance || "0")
        const currentBalanceOut = Number.parseFloat(this.tokens[tokenOutIndex].balance || "0")

        const { amountOut } = this.calculateSwapOutput(tokenIn, tokenOut, amountIn)

        this.tokens[tokenInIndex].balance = (currentBalanceIn - Number.parseFloat(amountIn)).toFixed(6)
        this.tokens[tokenOutIndex].balance = (currentBalanceOut + Number.parseFloat(amountOut)).toFixed(6)
      }

      return {
        success: true,
        txHash: "0x" + Math.random().toString(16).substr(2, 64),
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "交换失败",
      }
    }
  }

  // 添加流动性
  async addLiquidity(
    token0: Token,
    token1: Token,
    amount0: string,
    amount1: string,
  ): Promise<{ success: boolean; lpTokens?: string; error?: string }> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const pool = this.getPool(token0.address, token1.address)
      if (!pool) {
        return { success: false, error: "流动性池不存在" }
      }

      // 计算LP代币数量 (简化计算)
      const lpTokens = (Number.parseFloat(amount0) + Number.parseFloat(amount1)).toFixed(6)

      return {
        success: true,
        lpTokens,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "添加流动性失败",
      }
    }
  }
}

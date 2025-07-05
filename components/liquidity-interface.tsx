"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Droplets, TrendingUp } from "lucide-react"
import { TokenSelector } from "./token-selector"
import { SwapService, type Token, type Pool } from "@/lib/swap"

export function LiquidityInterface() {
  const [token0, setToken0] = useState<Token | undefined>()
  const [token1, setToken1] = useState<Token | undefined>()
  const [amount0, setAmount0] = useState("")
  const [amount1, setAmount1] = useState("")
  const [showTokenSelector, setShowTokenSelector] = useState<"token0" | "token1" | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [pools, setPools] = useState<Pool[]>([])

  const swapService = SwapService.getInstance()

  useEffect(() => {
    setPools(swapService.getPools())
  }, [])

  // 初始化默认代币
  useEffect(() => {
    const tokens = swapService.getTokens()
    setToken0(tokens.find((t) => t.symbol === "ANGEL"))
    setToken1(tokens.find((t) => t.symbol === "BNB"))
  }, [])

  const handleAddLiquidity = async () => {
    if (!token0 || !token1 || !amount0 || !amount1) return

    setIsAdding(true)
    try {
      const result = await swapService.addLiquidity(token0, token1, amount0, amount1)

      if (result.success) {
        setAmount0("")
        setAmount1("")
        // Successfully added liquidity
      } else {
        console.error("添加流动性失败:", result.error)
      }
    } catch (error) {
      console.error("添加流动性错误:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const canAddLiquidity =
    token0 && token1 && amount0 && amount1 && Number.parseFloat(amount0) > 0 && Number.parseFloat(amount1) > 0

  return (
    <div className="space-y-6">
      {/* 添加流动性 */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" />
            添加流动性
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 代币0 */}
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">代币A</span>
              <span className="text-gray-400 text-sm">余额: {token0?.balance || "0"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTokenSelector("token0")}
                className="border-slate-600/50 text-white hover:bg-slate-600/50 rounded-xl px-4 py-2 h-auto"
              >
                {token0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{token0.logoURI}</span>
                    <span className="font-semibold">{token0.symbol}</span>
                  </div>
                ) : (
                  <span>选择代币</span>
                )}
              </Button>
              <Input
                type="number"
                placeholder="0.0"
                value={amount0}
                onChange={(e) => setAmount0(e.target.value)}
                className="flex-1 text-right text-xl font-bold bg-transparent border-0 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* 加号 */}
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-slate-700/50 rounded-full flex items-center justify-center border border-slate-600/30">
              <Plus className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* 代币1 */}
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">代币B</span>
              <span className="text-gray-400 text-sm">余额: {token1?.balance || "0"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTokenSelector("token1")}
                className="border-slate-600/50 text-white hover:bg-slate-600/50 rounded-xl px-4 py-2 h-auto"
              >
                {token1 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{token1.logoURI}</span>
                    <span className="font-semibold">{token1.symbol}</span>
                  </div>
                ) : (
                  <span>选择代币</span>
                )}
              </Button>
              <Input
                type="number"
                placeholder="0.0"
                value={amount1}
                onChange={(e) => setAmount1(e.target.value)}
                className="flex-1 text-right text-xl font-bold bg-transparent border-0 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* 添加按钮 */}
          <Button
            onClick={handleAddLiquidity}
            disabled={!canAddLiquidity || isAdding}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold h-14 rounded-xl disabled:opacity-50"
          >
            {isAdding ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                添加中...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                添加流动性
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 流动性池列表 */}
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            流动性池
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pools.map((pool, index) => (
              <div
                key={index}
                className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center text-sm border-2 border-slate-800">
                        {pool.token0.logoURI}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center text-sm border-2 border-slate-800">
                        {pool.token1.logoURI}
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {pool.token0.symbol}/{pool.token1.symbol}
                      </p>
                      <p className="text-gray-400 text-sm">手续费 {pool.fee}%</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {pool.apy}% APY
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-800/30 rounded-lg p-3">
                    <p className="text-gray-400 mb-1">总流动性</p>
                    <p className="text-white font-semibold">
                      $
                      {(
                        Number.parseFloat(pool.reserve0) * (pool.token0.price || 0) +
                        Number.parseFloat(pool.reserve1) * (pool.token1.price || 0)
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-3">
                    <p className="text-gray-400 mb-1">24小时交易量</p>
                    <p className="text-white font-semibold">${(Math.random() * 100000).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg"
                  >
                    添加流动性
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-600/50 text-gray-300 hover:bg-white/5 rounded-lg bg-transparent"
                  >
                    查看详情
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 代币选择器 */}
      {showTokenSelector && (
        <TokenSelector
          selectedToken={showTokenSelector === "token0" ? token0 : token1}
          excludeToken={showTokenSelector === "token0" ? token1 : token0}
          onTokenSelect={(token) => {
            if (showTokenSelector === "token0") {
              setToken0(token)
            } else {
              setToken1(token)
            }
          }}
          onClose={() => setShowTokenSelector(null)}
        />
      )}
    </div>
  )
}

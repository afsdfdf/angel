"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpDown, Settings, AlertTriangle, ChevronDown, Info } from "lucide-react"
import { TokenSelector } from "./token-selector"
import { TokenLogo } from "./token-logo"
import { SwapService, type Token } from "@/lib/swap"

interface SwapInterfaceProps {
  onSwapComplete?: () => void
}

export function SwapInterface({ onSwapComplete }: SwapInterfaceProps) {
  const [tokenIn, setTokenIn] = useState<Token | undefined>()
  const [tokenOut, setTokenOut] = useState<Token | undefined>()
  const [amountIn, setAmountIn] = useState("")
  const [amountOut, setAmountOut] = useState("")
  const [showTokenSelector, setShowTokenSelector] = useState<"in" | "out" | null>(null)
  const [slippage, setSlippage] = useState(0.5)
  const [showSettings, setShowSettings] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [priceImpact, setPriceImpact] = useState(0)
  const [fee, setFee] = useState("0")

  const swapService = SwapService.getInstance()

  // 初始化默认代币
  useEffect(() => {
    const tokens = swapService.getTokens()
    setTokenIn(tokens.find((t) => t.symbol === "BNB"))
    setTokenOut(tokens.find((t) => t.symbol === "ANGEL"))
  }, [])

  // 计算输出金额
  useEffect(() => {
    if (tokenIn && tokenOut && amountIn && Number.parseFloat(amountIn) > 0) {
      const result = swapService.calculateSwapOutput(tokenIn, tokenOut, amountIn)
      setAmountOut(result.amountOut)
      setPriceImpact(result.priceImpact)
      setFee(result.fee)
    } else {
      setAmountOut("")
      setPriceImpact(0)
      setFee("0")
    }
  }, [tokenIn, tokenOut, amountIn])

  const handleSwapTokens = () => {
    const tempToken = tokenIn
    const tempAmount = amountIn
    setTokenIn(tokenOut)
    setTokenOut(tempToken)
    setAmountIn(amountOut)
    setAmountOut(tempAmount)
  }

  const handleMaxClick = () => {
    if (tokenIn?.balance) {
      setAmountIn(tokenIn.balance)
    }
  }

  const handleSwap = async () => {
    if (!tokenIn || !tokenOut || !amountIn) return

    setIsSwapping(true)
    try {
      const result = await swapService.executeSwap(tokenIn, tokenOut, amountIn, amountOut, slippage)

      if (result.success) {
        setAmountIn("")
        setAmountOut("")
        onSwapComplete?.()
      } else {
        console.error("交换失败:", result.error)
      }
    } catch (error) {
      console.error("交换错误:", error)
    } finally {
      setIsSwapping(false)
    }
  }

  const canSwap =
    tokenIn &&
    tokenOut &&
    amountIn &&
    Number.parseFloat(amountIn) > 0 &&
    Number.parseFloat(amountIn) <= Number.parseFloat(tokenIn.balance || "0")

  const getPriceImpactColor = (impact: number) => {
    if (impact < 1) return "text-angel-success"
    if (impact < 3) return "text-angel-warning"
    if (impact < 5) return "text-orange-500"
    return "text-angel-error"
  }

  return (
    <>
      <Card className="glass-card border-0 shadow-angel-primary">
        <CardContent className="p-6">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-foreground font-bold text-xl">交换</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="text-muted-foreground hover:text-angel-primary hover:bg-secondary rounded-xl touch-feedback"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* 滑点设置 */}
          {showSettings && (
            <div className="mb-6 p-4 bg-secondary/50 rounded-xl border border-border">
              <h4 className="text-foreground font-medium mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                交易设置
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">滑点容忍度</label>
                  <div className="flex gap-2 mb-2">
                    {[0.1, 0.5, 1.0].map((value) => (
                      <Button
                        key={value}
                        variant={slippage === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSlippage(value)}
                        className={`${
                          slippage === value
                            ? "bg-gradient-primary text-white hover:opacity-90"
                            : "border-border text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    placeholder="自定义滑点"
                    value={slippage}
                    onChange={(e) => setSlippage(Number.parseFloat(e.target.value) || 0.5)}
                    className="bg-background border-border text-foreground"
                    step="0.1"
                    min="0.1"
                    max="50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 交换界面 */}
          <div className="space-y-1">
            {/* 输入代币 */}
            <div className="bg-secondary/30 rounded-2xl p-4 border border-border hover:border-angel-primary/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm font-medium">支付</span>
                <span className="text-muted-foreground text-sm">
                  余额: {tokenIn?.balance || "0"} {tokenIn?.symbol}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTokenSelector("in")}
                  className="bg-background border-border hover:bg-secondary rounded-xl px-4 py-3 h-auto min-w-[120px] touch-feedback"
                >
                  {tokenIn ? (
                    <div className="flex items-center gap-2">
                      <TokenLogo symbol={tokenIn.symbol} size={24} />
                      <span className="font-semibold text-foreground">{tokenIn.symbol}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">选择代币</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </Button>
                <div className="flex-1 text-right">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    className="text-right text-2xl font-bold bg-transparent border-0 p-0 h-auto text-foreground placeholder-muted-foreground"
                  />
                  {tokenIn && amountIn && (
                    <p className="text-muted-foreground text-sm mt-1">
                      ≈ ${(Number.parseFloat(amountIn) * (tokenIn.price || 0)).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMaxClick}
                  className="text-angel-primary hover:text-angel-primary hover:bg-angel-primary/10 h-auto p-1 text-sm font-medium"
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* 交换按钮 */}
            <div className="flex justify-center py-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapTokens}
                className="bg-background border-border hover:bg-secondary rounded-xl w-12 h-12 shadow-lg hover:shadow-angel-primary/20 touch-feedback"
              >
                <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>

            {/* 输出代币 */}
            <div className="bg-secondary/30 rounded-2xl p-4 border border-border hover:border-angel-secondary/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm font-medium">接收</span>
                <span className="text-muted-foreground text-sm">
                  余额: {tokenOut?.balance || "0"} {tokenOut?.symbol}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTokenSelector("out")}
                  className="bg-background border-border hover:bg-secondary rounded-xl px-4 py-3 h-auto min-w-[120px] touch-feedback"
                >
                  {tokenOut ? (
                    <div className="flex items-center gap-2">
                      <TokenLogo symbol={tokenOut.symbol} size={24} />
                      <span className="font-semibold text-foreground">{tokenOut.symbol}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">选择代币</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </Button>
                <div className="flex-1 text-right">
                  <div className="text-2xl font-bold text-foreground">
                    {amountOut || "0.0"}
                  </div>
                  {tokenOut && amountOut && (
                    <p className="text-muted-foreground text-sm mt-1">
                      ≈ ${(Number.parseFloat(amountOut) * (tokenOut.price || 0)).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 交易详情 */}
          {tokenIn && tokenOut && amountIn && amountOut && (
            <div className="mt-4 p-4 bg-secondary/30 rounded-xl border border-border">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">汇率</span>
                  <span className="text-foreground font-medium">
                    1 {tokenIn.symbol} = {(Number.parseFloat(amountOut) / Number.parseFloat(amountIn)).toFixed(6)} {tokenOut.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    价格影响
                    <Info className="w-3 h-3" />
                  </span>
                  <span className={`font-medium ${getPriceImpactColor(priceImpact)}`}>
                    {priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">交易费用</span>
                  <span className="text-foreground font-medium">{fee} {tokenIn.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">滑点容忍度</span>
                  <span className="text-foreground font-medium">{slippage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">最少接收</span>
                  <span className="text-foreground font-medium">
                    {(Number.parseFloat(amountOut) * (1 - slippage / 100)).toFixed(6)} {tokenOut.symbol}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 价格影响警告 */}
          {priceImpact > 5 && (
            <div className="mt-4 p-4 bg-angel-error/10 border border-angel-error/20 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-angel-error" />
                <span className="text-angel-error font-medium">价格影响较高</span>
              </div>
              <p className="text-angel-error/80 text-sm mt-1">
                此交易将产生 {priceImpact.toFixed(2)}% 的价格影响，请谨慎操作。
              </p>
            </div>
          )}

          {/* 交换按钮 */}
          <Button
            onClick={handleSwap}
            disabled={!canSwap || isSwapping}
            className={`w-full mt-6 h-14 text-lg font-bold rounded-xl transition-all touch-feedback ${
              canSwap && !isSwapping
                ? "bg-gradient-primary hover:opacity-90 text-white shadow-angel-primary hover-glow-primary"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            }`}
          >
            {isSwapping ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                交换中...
              </div>
            ) : !tokenIn || !tokenOut ? (
              "选择代币"
            ) : !amountIn || Number.parseFloat(amountIn) <= 0 ? (
              "输入金额"
            ) : Number.parseFloat(amountIn) > Number.parseFloat(tokenIn.balance || "0") ? (
              "余额不足"
            ) : (
              "交换"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 代币选择器 */}
      {showTokenSelector && (
        <TokenSelector
          selectedToken={showTokenSelector === "in" ? tokenIn : tokenOut}
          excludeToken={showTokenSelector === "in" ? tokenOut : tokenIn}
          onTokenSelect={(token) => {
            if (showTokenSelector === "in") {
              setTokenIn(token)
            } else {
              setTokenOut(token)
            }
            setShowTokenSelector(null)
          }}
          onClose={() => setShowTokenSelector(null)}
        />
      )}
    </>
  )
}

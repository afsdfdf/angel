"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Star } from "lucide-react"
import { TokenLogo } from "./token-logo"
import { SwapService, type Token } from "@/lib/swap"

interface TokenSelectorProps {
  selectedToken?: Token
  onTokenSelect: (token: Token) => void
  excludeToken?: Token
  onClose: () => void
}

export function TokenSelector({ selectedToken, onTokenSelect, excludeToken, onClose }: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [favoriteTokens] = useState(["ANGEL", "BNB", "USDT"])

  const swapService = SwapService.getInstance()
  const allTokens = swapService.getTokens()

  const filteredTokens = allTokens.filter((token) => {
    if (excludeToken && token.address === excludeToken.address) return false

    const query = searchQuery.toLowerCase()
    return (
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    )
  })

  const popularTokens = filteredTokens.filter((token) => favoriteTokens.includes(token.symbol))

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/95 border-slate-700/50 backdrop-blur-xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">选择代币</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white rounded-lg">
              ×
            </Button>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索代币名称或地址"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 rounded-xl"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 热门代币 */}
          {!searchQuery && (
            <div className="p-6 border-b border-slate-700/30">
              <h4 className="text-gray-400 text-sm font-medium mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                热门代币
              </h4>
              <div className="flex flex-wrap gap-2">
                {popularTokens.map((token) => (
                  <Button
                    key={token.address}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTokenSelect(token)}
                    className="border-slate-600/50 text-white hover:bg-slate-700/50 rounded-lg"
                  >
                    <span className="mr-2"><TokenLogo symbol={token.symbol} size={18} /></span>
                    {token.symbol}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 代币列表 */}
          <div className="p-6">
            <div className="space-y-2">
              {filteredTokens.map((token) => (
                <div
                  key={token.address}
                  onClick={() => handleTokenSelect(token)}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-700/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center text-lg">
                      <TokenLogo symbol={token.symbol} size={32} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{token.symbol}</p>
                      <p className="text-gray-400 text-sm">{token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {token.balance && (
                      <>
                        <p className="text-white font-medium">{Number.parseFloat(token.balance).toFixed(4)}</p>
                        <p className="text-gray-400 text-sm">
                          ${(Number.parseFloat(token.balance) * (token.price || 0)).toFixed(2)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredTokens.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">未找到匹配的代币</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"

interface TokenLogoProps {
  symbol: string
  size?: number
  className?: string
}

export function TokenLogo({ symbol, size = 24, className = "" }: TokenLogoProps) {
  const [svgError, setSvgError] = useState(false)
  const [pngError, setPngError] = useState(false)
  const fallbackEmoji = getFallbackEmoji(symbol)
  
  // Convert symbol to lowercase for file path
  const tokenSymbol = symbol.toLowerCase()
  
  // Special handling for ANGEL token - use logos.png
  if (symbol.toLowerCase() === 'angel') {
    return (
      <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
        <Image
          src="/logos.png"
          alt="ANGEL logo"
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }
  
  if (svgError && pngError) {
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-gradient-to-r from-slate-600 to-slate-700 ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.6 }}>{fallbackEmoji}</span>
      </div>
    )
  }
  
  if (!svgError) {
    return (
      <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
        <Image
          src={`/tokens/${tokenSymbol}.svg`}
          alt={`${symbol} logo`}
          width={size}
          height={size}
          onError={() => setSvgError(true)}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }
  
  return (
    <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <Image
        src={`/tokens/${tokenSymbol}.png`}
        alt={`${symbol} logo`}
        width={size}
        height={size}
        onError={() => setPngError(true)}
        className="object-cover w-full h-full"
      />
    </div>
  )
}

// Get fallback emoji based on token symbol
function getFallbackEmoji(symbol: string): string {
  const emojiMap: Record<string, string> = {
    "bnb": "🟡",
    "angel": "👼",
    "usdt": "💚",
    "busd": "💛",
    "usdc": "🔵",
    "btcb": "🟠",
    "eth": "🔷",
    "default": "🪙"
  }
  
  return emojiMap[symbol.toLowerCase()] || emojiMap.default
} 
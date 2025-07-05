"use client"

import { TokenLogo } from "./token-logo"

interface LPTokenLogoProps {
  token1: string
  token2: string
  size?: number
  className?: string
}

export function LPTokenLogo({ token1, token2, size = 32, className = "" }: LPTokenLogoProps) {
  const logoSize = Math.round(size * 0.7)
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* 第一个代币 */}
      <div 
        className="absolute top-0 left-0 border-2 border-white rounded-full overflow-hidden shadow-sm"
        style={{ width: logoSize, height: logoSize }}
      >
        <TokenLogo symbol={token1} size={logoSize} />
      </div>
      
      {/* 第二个代币 */}
      <div 
        className="absolute bottom-0 right-0 border-2 border-white rounded-full overflow-hidden shadow-sm"
        style={{ 
          width: logoSize, 
          height: logoSize,
          transform: `translate(${Math.round(size * 0.15)}px, ${Math.round(size * 0.15)}px)`
        }}
      >
        <TokenLogo symbol={token2} size={logoSize} />
      </div>
    </div>
  )
} 
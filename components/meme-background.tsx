"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { ImageIcon } from "lucide-react"

interface MemeBackgroundProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "gradient" | "image" | "premium"
  backgroundImage?: string
  overlay?: boolean
}

export function MemeBackground({ 
  children, 
  className,
  variant = "default",
  backgroundImage,
  overlay = true
}: MemeBackgroundProps) {
  const getBackgroundStyle = () => {
    if (backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }
    }
    
    switch (variant) {
      case "gradient":
        return {
          background: `
            linear-gradient(135deg, 
              rgba(147, 51, 234, 0.2) 0%, 
              rgba(219, 39, 119, 0.15) 25%,
              rgba(59, 130, 246, 0.2) 50%,
              rgba(16, 185, 129, 0.15) 75%,
              rgba(245, 158, 11, 0.2) 100%
            ),
            linear-gradient(45deg,
              hsl(var(--background)) 0%,
              hsl(var(--muted)) 50%,
              hsl(var(--card)) 100%
            )
          `
        }
      case "image":
        return {
          background: `
            url('/backgrounds/angel-heaven.jpg'),
            linear-gradient(135deg, 
              rgba(147, 51, 234, 0.4) 0%, 
              rgba(219, 39, 119, 0.3) 50%,
              rgba(59, 130, 246, 0.4) 100%
            )
          `,
          backgroundSize: 'cover, cover',
          backgroundPosition: 'center, center',
          backgroundBlendMode: 'overlay'
        }
      case "premium":
        return {
          background: `
            radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(219, 39, 119, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
            linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)
          `
        }
      default:
        return {
          background: `
            linear-gradient(135deg, 
              rgba(147, 51, 234, 0.1) 0%, 
              rgba(219, 39, 119, 0.08) 50%,
              rgba(59, 130, 246, 0.1) 100%
            ),
            hsl(var(--background))
          `
        }
    }
  }

  return (
    <div 
      className={cn(
        "min-h-screen relative transition-all duration-500",
        className
      )}
      style={getBackgroundStyle()}
    >
      {/* 可选的覆盖层 */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-500/10 pointer-events-none" />
      )}
      
      {/* 装饰性几何图形 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* 浮动的天使元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate-float">😇</div>
        <div className="absolute top-40 right-20 text-3xl opacity-15 animate-float-delayed">✨</div>
        <div className="absolute bottom-40 left-20 text-2xl opacity-10 animate-float-slow">🌟</div>
        <div className="absolute bottom-20 right-10 text-3xl opacity-20 animate-float">💫</div>
        <div className="absolute top-1/3 left-1/4 text-2xl opacity-10 animate-float-delayed">👼</div>
        <div className="absolute top-2/3 right-1/3 text-4xl opacity-15 animate-float-slow">🕊️</div>
      </div>
      
      {/* 主要内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

interface MemeCardProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "primary" | "accent" | "premium" | "glass"
  hover?: boolean
  glow?: boolean
  style?: React.CSSProperties
}

// MEME币风格的卡片组件
export function MemeCard({ 
  children, 
  className, 
  variant = "default", 
  hover = true,
  glow = false,
  style 
}: MemeCardProps) {
  const getCardStyles = () => {
    const baseStyles = "relative overflow-hidden transition-all duration-300"
    
    switch (variant) {
      case "primary":
        return cn(
          baseStyles,
          "bg-gradient-primary dark:from-angel-primary/20 dark:via-card dark:to-angel-secondary/20",
          "border border-purple-500/30 dark:border-purple-400/30 shadow-lg shadow-purple-500/20",
          "backdrop-blur-sm",
          hover && "hover:shadow-xl hover:shadow-purple-500/40 dark:hover:shadow-purple-400/30 hover:-translate-y-1",
          glow && "ring-2 ring-purple-500/50 dark:ring-purple-400/50 ring-offset-2"
        )
      case "accent":
        return cn(
          baseStyles,
          "bg-gradient-secondary dark:from-angel-accent/20 dark:via-card dark:to-angel-primary/20",
          "border border-cyan-500/30 dark:border-cyan-400/30 shadow-lg shadow-cyan-500/20",
          "backdrop-blur-sm",
          hover && "hover:shadow-xl hover:shadow-cyan-500/40 dark:hover:shadow-cyan-400/30 hover:-translate-y-1",
          glow && "ring-2 ring-cyan-500/50 dark:ring-cyan-400/50 ring-offset-2"
        )
      case "premium":
        return cn(
          baseStyles,
          "bg-gradient-gold dark:from-angel-gold/20 dark:via-card dark:to-angel-gold-light/20",
          "border border-yellow-500/30 dark:border-yellow-400/30 shadow-lg shadow-yellow-500/20",
          "backdrop-blur-sm",
          hover && "hover:shadow-xl hover:shadow-yellow-500/40 dark:hover:shadow-yellow-400/30 hover:-translate-y-1",
          glow && "ring-2 ring-yellow-500/50 dark:ring-yellow-400/50 ring-offset-2"
        )
      case "glass":
        return cn(
          baseStyles,
          "glass-premium dark:glass-premium-dark",
          hover && "hover:bg-white/50 dark:hover:bg-white/15 hover:shadow-3xl hover:-translate-y-1",
          glow && "ring-2 ring-purple-500/30 dark:ring-purple-400/30 ring-offset-2"
        )
      default:
        return cn(
          baseStyles,
          "bg-white/80 dark:bg-card/80 backdrop-blur-sm",
          "border border-gray-200/50 dark:border-border shadow-lg shadow-gray-500/5 dark:shadow-black/20",
          hover && "hover:bg-white/90 dark:hover:bg-card/90 hover:shadow-xl hover:shadow-gray-500/10 dark:hover:shadow-black/30 hover:-translate-y-1",
          glow && "ring-2 ring-purple-500/30 dark:ring-purple-400/50 ring-offset-2"
        )
    }
  }

  return (
    <div className={cn(getCardStyles(), className)} style={style}>
      {/* 卡片内部光效 */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
      
      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

interface MemeButtonProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "primary" | "meme" | "premium" | "glass"
  size?: "sm" | "md" | "lg"
  glow?: boolean
  onClick?: () => void
}

export function MemeButton({ 
  children, 
  className, 
  variant = "default", 
  size = "md",
  glow = false,
  onClick 
}: MemeButtonProps) {
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm"
      case "lg":
        return "px-8 py-4 text-lg"
      default:
        return "px-6 py-3 text-base"
    }
  }

  const getButtonStyles = () => {
    const baseStyles = "relative overflow-hidden font-medium rounded-xl transition-all duration-300 transform active:scale-95"
    
    switch (variant) {
      case "primary":
        return cn(
          baseStyles,
          "bg-gradient-primary text-white",
          "shadow-lg shadow-purple-500/25",
          "hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5",
          glow && "ring-2 ring-purple-500/50 ring-offset-2"
        )
      case "meme":
        return cn(
          baseStyles,
          "bg-gradient-gold text-white",
          "shadow-lg shadow-yellow-500/25",
          "hover:shadow-xl hover:shadow-yellow-500/40 hover:-translate-y-0.5",
          glow && "ring-2 ring-yellow-500/50 ring-offset-2"
        )
      case "premium":
        return cn(
          baseStyles,
          "bg-gradient-premium text-white",
          "shadow-xl shadow-purple-500/30",
          "hover:shadow-2xl hover:-translate-y-0.5",
          glow && "ring-2 ring-purple-500/50 ring-offset-2 animate-glow"
        )
      case "glass":
        return cn(
          baseStyles,
          "glass-premium text-gray-800 dark:text-gray-200",
          "hover:bg-white/30 dark:hover:bg-white/10 hover:shadow-xl hover:-translate-y-0.5",
          glow && "ring-2 ring-purple-500/30 ring-offset-2"
        )
      default:
        return cn(
          baseStyles,
          "bg-white text-gray-700 border border-gray-200",
          "shadow-md shadow-gray-500/10",
          "hover:bg-gray-50 hover:shadow-lg hover:-translate-y-0.5",
          glow && "ring-2 ring-gray-300/50 ring-offset-2"
        )
    }
  }

  return (
    <button
      className={cn(getButtonStyles(), getSizeStyles(), className)}
      onClick={onClick}
    >
      {/* 按钮内部光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {/* 内容 */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  )
} 
"use client"

import { useState, useEffect } from "react"
import { Home, Sparkles, TrendingUp, User, Map, ArrowUpDown, X, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AngelBrand } from "@/components/angel-logo"

interface SidebarNavProps {
  isOpen: boolean
  onClose: () => void
}

export function SidebarNav({ isOpen, onClose }: SidebarNavProps) {
  const pathname = usePathname()
  
  const navItems = [
    { id: "home", icon: Home, label: "首页", href: "/", description: "返回主页" },
    { id: "swap", icon: ArrowUpDown, label: "交换", href: "/swap", description: "买卖ANGEL代币" },
    { id: "nft", icon: Sparkles, label: "NFT", href: "/nft", description: "天使卡牌市场" },
    { id: "paradise", icon: Map, label: "天使乐园", href: "/paradise", description: "探索天使土地" },
    { id: "staking", icon: TrendingUp, label: "质押挖矿", href: "/staking", description: "质押赚取收益" },
    { id: "profile", icon: User, label: "我的", href: "/profile", description: "个人资料设置" },
  ]

  // 点击背景关闭侧边栏
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // ESC键关闭侧边栏
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden' // 防止背景滚动
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleBackdropClick}
      />
      
      {/* 侧边栏 */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] glass-effect border-r border-border shadow-2xl transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <AngelBrand size="md" />
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors touch-feedback"
            aria-label="关闭导航菜单"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group touch-feedback active:scale-98 min-h-[60px]",
                    isActive
                      ? "bg-gradient-primary text-white shadow-angel-primary"
                      : "text-foreground hover:bg-secondary hover:text-angel-primary"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-secondary text-muted-foreground group-hover:bg-angel-primary/10 group-hover:text-angel-primary"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-medium text-sm",
                      isActive ? "text-white" : "text-foreground group-hover:text-angel-primary"
                    )}>
                      {item.label}
                    </div>
                    <div className={cn(
                      "text-xs mt-0.5 truncate",
                      isActive ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* 底部区域 */}
        <div className="p-4 border-t border-border">
          <div className="glass-card rounded-2xl p-4 bg-gradient-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center shadow-angel-gold">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">每日奖励</div>
                <div className="text-xs text-muted-foreground">连续签到获得更多奖励</div>
              </div>
            </div>
            <div className="text-xs text-angel-gold font-medium">
              今日已签到 +10 ANGEL
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// 汉堡菜单按钮组件
export function MenuButton({ onClick, className }: { onClick: () => void, className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-12 h-12 rounded-xl bg-secondary hover:bg-secondary/80 hover:shadow-angel-primary/20 flex items-center justify-center transition-all duration-200 touch-feedback active:scale-95 hover-glow-primary",
        className
      )}
      aria-label="打开导航菜单"
    >
      <Menu className="w-6 h-6 text-muted-foreground hover:text-angel-primary transition-colors" />
    </button>
  )
}
 
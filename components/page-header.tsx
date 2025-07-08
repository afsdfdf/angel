"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, ArrowLeft } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"
import { MenuButton } from "@/components/sidebar-nav"
import { useNavigation } from "@/components/navigation-context"
import { AngelLogo } from "@/components/angel-logo"
import { TelegramIcon } from "@/components/telegram-icon"
import type { LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface PageHeaderProps {
  title: string
  icon?: LucideIcon
  emoji?: string
  notifications?: number
  onUserChange?: (user: any | null) => void
  children?: React.ReactNode
  showBack?: boolean
  variant?: "default" | "transparent" | "solid"
  showBalance?: boolean
  angelBalance?: number
}

export function PageHeader({
  title,
  icon: Icon,
  emoji = "😇",
  notifications = 0,
  onUserChange,
  children,
  showBack = false,
  variant = "default",
  showBalance = false,
  angelBalance = 0
}: PageHeaderProps) {
  const router = useRouter()
  const { openSidebar } = useNavigation()

  // Debug log to help diagnose
  useEffect(() => {
    if (showBalance) {
      console.log('PageHeader showBalance:', showBalance)
      console.log('PageHeader angelBalance:', angelBalance)
    }
  }, [showBalance, angelBalance])

  const getHeaderStyles = () => {
    switch (variant) {
      case "transparent":
        return "bg-transparent"
      case "solid":
        return "bg-background border-b border-border"
      default:
        return "glass-effect border-b border-border"
    }
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${getHeaderStyles()}`}>
      <div className="container mx-auto px-4 max-w-md">
        <div className="flex items-center justify-between h-16 min-h-[64px]">
          
          {/* 左侧：菜单按钮 + 返回按钮 + 标题区域 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* 汉堡菜单按钮 */}
            <MenuButton onClick={openSidebar} />
            
            {showBack && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
                className="w-10 h-10 rounded-xl text-muted-foreground hover:text-angel-primary hover:bg-secondary flex-shrink-0 touch-feedback"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* 应用图标/页面图标 */}
              <AngelLogo size="md" variant="default" className="flex-shrink-0 !w-12 !h-12" />
              
              {/* 标题和副标题 */}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-foreground truncate">
                  {title}
                </h1>
                {children && (
                  <p className="text-xs text-muted-foreground truncate leading-tight">
                    {children}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：Telegram链接 + 钱包连接按钮 */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Telegram链接按钮 */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="w-10 h-10 rounded-xl text-muted-foreground hover:text-angel-primary hover:bg-secondary flex-shrink-0 touch-feedback"
            >
              <a href="https://t.me/angecoin1" target="_blank" rel="noopener noreferrer" aria-label="Join our Telegram">
                <TelegramIcon className="w-5 h-5" />
              </a>
            </Button>
            
            {/* 钱包连接按钮 - 始终显示 */}
            <div className="ml-1">
              <WalletConnect onUserChange={onUserChange} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 
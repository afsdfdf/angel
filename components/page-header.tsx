"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, ArrowLeft, Moon, Sun } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"
import { useTheme } from "@/components/theme-provider"
import { MenuButton } from "@/components/sidebar-nav"
import { useNavigation } from "@/components/navigation-context"
import { AngelLogo } from "@/components/angel-logo"
import type { User } from "@/lib/database"
import type { LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"

interface PageHeaderProps {
  title: string
  icon?: LucideIcon
  emoji?: string
  notifications?: number
  onUserChange?: (user: User | null) => void
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
  const { isDark, toggleTheme } = useTheme()
  const { openSidebar } = useNavigation()

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

          {/* 右侧：操作按钮区域 */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* 主题切换按钮 */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl text-muted-foreground hover:text-angel-primary hover:bg-secondary touch-feedback"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* 钱包连接按钮 */}
            {onUserChange && (
              <div className="ml-1">
                <WalletConnect onUserChange={onUserChange} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 
"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { NavigationProvider, useNavigation } from "@/components/navigation-context"

interface LayoutWrapperProps {
  children: React.ReactNode
}

function LayoutContent({ children }: LayoutWrapperProps) {
  const { isSidebarOpen, closeSidebar } = useNavigation()

  return (
    <>
      {/* 主内容区域 - 优化移动端布局 */}
      <div className="w-full max-w-md mx-auto bg-background min-h-screen relative overflow-hidden">
        {/* 内容区域 */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* 移动端优化的底部安全区域 */}
        <div className="h-safe-area-inset-bottom" />
      </div>
      
      {/* 侧边栏导航 */}
      <SidebarNav 
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
    </>
  )
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <NavigationProvider>
      <LayoutContent>{children}</LayoutContent>
    </NavigationProvider>
  )
} 
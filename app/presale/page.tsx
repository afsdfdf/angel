'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Home, 
  ArrowUpDown, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  User, 
  Users, 
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function PresalePage() {
  const [isNavOpen, setIsNavOpen] = useState(false)

  const navItems = [
    { icon: Home, label: '首页', href: '/' },
    { icon: ArrowUpDown, label: '交换', href: '/swap' },
    { icon: Sparkles, label: 'NFT', href: '/nft' },
    { icon: Zap, label: '乐园', href: '/paradise' },
    { icon: TrendingUp, label: '质押', href: '/staking' },
    { icon: User, label: '个人', href: '/profile' },
    { icon: Users, label: '邀请', href: '/invite' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 左上角风琴导航 */}
      <div className="fixed top-4 left-4 z-50">
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-0">
            {/* 导航切换按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="w-12 h-12 p-0 rounded-none"
            >
              {isNavOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
            
            {/* 风琴导航菜单 */}
            <div className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              isNavOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="border-t">
                {navItems.map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <Link key={index} href={item.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-12 px-4 rounded-none justify-start gap-3 hover:bg-gray-100"
                        onClick={() => setIsNavOpen(false)}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 预售网站内嵌 */}
      <div className="w-full h-screen">
        <iframe
          src="https://ido.angelcoin.app/"
          className="w-full h-full border-0"
          title="ANGEL 代币预售"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  )
} 
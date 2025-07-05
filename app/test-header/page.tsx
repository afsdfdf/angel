"use client"

import { PageHeader } from "@/components/page-header"
import { MemeBackground, MemeCard } from "@/components/meme-background"

export default function TestHeaderPage() {
  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader 
        title="页头测试" 
        emoji="🧪" 
      />
      
      <div className="container mx-auto px-4 pb-4 max-w-md pt-20">
        <div className="space-y-6">
          {/* 生成多个卡片来测试滚动效果 */}
          {Array.from({ length: 20 }, (_, i) => (
            <MemeCard key={i} className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-2">测试卡片 {i + 1}</h3>
              <p className="text-gray-600">
                这是第 {i + 1} 个测试卡片。页头应该固定在顶部，不会随着页面滚动而移动。
                当您滚动页面时，页头应该始终保持在屏幕顶部可见。
              </p>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  页头已去除铃铛和齿轮图标，只保留主题切换和钱包连接功能。
                </p>
              </div>
            </MemeCard>
          ))}
        </div>
      </div>
    </MemeBackground>
  )
} 
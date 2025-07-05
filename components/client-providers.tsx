'use client'

import dynamic from 'next/dynamic'
import React from 'react'

// 动态导入Web3相关的providers，禁用SSR
const Providers = dynamic(() => import('@/components/providers').then(mod => ({ default: mod.Providers })), {
  ssr: false,
})

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return <Providers>{children}</Providers>
} 
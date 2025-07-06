'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth-context'
import { WalletProvider } from '@/lib/wallet-context'

// 创建QueryClient实例
const queryClient = new QueryClient()

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </WalletProvider>
    </QueryClientProvider>
  )
} 
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from 'sonner'
import { ClientProviders } from '@/components/client-providers'
import { LayoutWrapper } from '@/components/layout-wrapper'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Angel - 天使加密货币生态",
  description: "Angel 天使币生态系统，包含NFT卡牌、质押挖矿、社区治理等功能",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          <ThemeProvider defaultTheme="light" storageKey="angel-theme">
            <LayoutWrapper>
              {children}
              <Toaster position="top-center" />
            </LayoutWrapper>
          </ThemeProvider>
        </ClientProviders>
      </body>
    </html>
  )
}

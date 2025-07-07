// 应用配置
export const config = {
  // 数据库配置
  supabase: {
    url: 'https://onfplwhsmtvmkssyisot.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnBsd2hzbXR2bWtzc3lpc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjM3NzksImV4cCI6MjA2MjAzOTc3OX0.HwC1mqTWDtwOCDm1zufyyA9Xrg2pgVOElxx2JX9z9Bs',
    serviceRoleKey: '',
  },
  
  // 钱包连接配置
  walletConnect: {
    projectId: 'c1330fe25daa5b2a1a0b72864e762d7f',
  },
  
  // NextAuth配置
  nextAuth: {
    url: typeof window !== 'undefined' ? window.location.origin : 'https://www.angelcoin.app',
    secret: 'angel-crypto-app-secret-key',
  },
  
  // 应用配置
  app: {
    name: 'Angel Crypto App',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://www.angelcoin.app',
  },
  
  // 支持的区块链网络
  chains: {
    ethereum: {
      id: 1,
      name: 'Ethereum',
      rpcUrls: ['https://eth.llamarpc.com'],
    },
    polygon: {
      id: 137,
      name: 'Polygon',
      rpcUrls: ['https://polygon.llamarpc.com'],
    },
    bsc: {
      id: 56,
      name: 'BNB Smart Chain',
      rpcUrls: ['https://bsc-dataseed.binance.org'],
    },
  },
} as const;

export type Config = typeof config; 
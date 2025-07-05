// 应用配置
export const config = {
  // 数据库配置
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-role-key',
  },
  
  // 钱包连接配置
  walletConnect: {
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  },
  
  // NextAuth配置
  nextAuth: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  },
  
  // 应用配置
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Angel Crypto App',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
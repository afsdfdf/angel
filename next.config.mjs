/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
  },
  serverExternalPackages: ['mongodb', 'mongoose'],
  typescript: {
    // 忽略TypeScript错误，在生产构建中不进行类型检查
    ignoreBuildErrors: true,
  },
  // 排除测试页面，只处理这些文件类型
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  excludeDefaultMomentLocales: true,
  eslint: {
    // 生产构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  // 忽略不存在的文件/目录中的TypeScript错误
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      child_process: false,
      mongodb: false
    };
    
    config.externals.push('pino-pretty', 'lokijs', 'encoding', 'mongodb');
    
    return config;
  },
}

export default nextConfig

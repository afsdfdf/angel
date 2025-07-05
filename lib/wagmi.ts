import { http, createConfig } from 'wagmi';
import { mainnet, polygon, bsc } from 'wagmi/chains';
import { injected, walletConnect, metaMask } from 'wagmi/connectors';
import { config } from './config';

// 配置支持的区块链网络
const chains = [mainnet, polygon, bsc] as const;

// 配置连接器
const connectors = [
  injected(),
  metaMask(),
  // 只有在有 Project ID 时才添加 WalletConnect
  ...(config.walletConnect.projectId ? [
    walletConnect({
      projectId: config.walletConnect.projectId,
      metadata: {
        name: config.app.name,
        description: 'Angel Crypto App - 天使加密应用',
        url: config.app.url,
        icons: [`${config.app.url}/favicon.ico`],
      },
    })
  ] : []),
];

// 创建Wagmi配置
export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
  ssr: false, // 禁用服务器端渲染以避免hydration错误
});

// 导出类型
export type WagmiConfig = typeof wagmiConfig;
export { chains }; 
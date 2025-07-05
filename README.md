# Angel Crypto App - 天使加密货币生态

一个完整的加密货币生态系统，包含钱包登录、NFT卡牌、质押挖矿、社区治理等功能。

## 🚀 项目状态

### ✅ 已完成功能

1. **UI系统**
   - 统一的玻璃效果卡片设计
   - 响应式布局和现代化UI
   - 深色/浅色主题支持
   - 动画和交互效果

2. **钱包连接系统**
   - 集成 Wagmi 和 WalletConnect
   - 支持 MetaMask、WalletConnect 等主流钱包
   - 钱包连接状态管理

3. **认证系统架构**
   - 完整的认证上下文 (AuthContext)
   - 用户会话管理
   - 钱包签名认证
   - 邀请系统框架

4. **数据库集成**
   - Supabase 第三方API数据库
   - 用户、邀请、会话表结构
   - 数据库服务层

### 🔧 当前开发状态

- **开发服务器**: 运行在 http://localhost:3001
- **构建状态**: 基本功能正常，需要配置环境变量
- **UI组件**: 完整的玻璃效果卡片系统
- **认证系统**: 代码完成，需要数据库配置

## 📋 快速开始

### 1. 环境配置

运行环境配置脚本：
```bash
node setup-env.js
```

编辑 `.env.local` 文件，填入以下配置：

```env
# 数据库配置 (使用Supabase作为第三方API数据库)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 钱包连接配置
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# NextAuth配置
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# 应用配置
NEXT_PUBLIC_APP_NAME=Angel Crypto App
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 2. 数据库设置

1. 访问 [Supabase](https://supabase.com/) 创建新项目
2. 获取项目的 URL 和 API 密钥
3. 在 Supabase SQL 编辑器中运行 `scripts/init-database.sql` 脚本

### 3. WalletConnect 配置

1. 访问 [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. 创建新项目并获取 Project ID
3. 配置项目元数据和域名

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3001 查看应用

## 🎯 测试页面

### 主页
- 路径: `/`
- 功能: 展示ANGEL代币信息、功能导航、用户资产

### 认证测试页面
- 路径: `/auth/simple`
- 功能: 测试钱包连接和认证功能

### 认证页面
- 路径: `/auth`
- 功能: 完整的认证和邀请系统界面

## 🏗️ 项目结构

```
angel-crypto-app/
├── app/                          # Next.js 应用页面
│   ├── auth/                     # 认证相关页面
│   ├── globals.css              # 全局样式
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 主页
├── components/                   # React 组件
│   ├── ui/                      # 基础UI组件
│   ├── meme-background.tsx      # 玻璃效果背景组件
│   ├── bottom-nav.tsx           # 底部导航
│   └── page-header.tsx          # 页面头部
├── lib/                         # 工具库
│   ├── auth-context.tsx         # 认证上下文
│   ├── database.ts              # 数据库服务
│   ├── wagmi.ts                 # 钱包配置
│   └── config.ts                # 应用配置
├── scripts/                     # 脚本文件
│   └── init-database.sql        # 数据库初始化脚本
├── styles/                      # 样式文件
├── public/                      # 静态资源
└── docs/                        # 文档
```

## 🎨 UI 组件系统

### MemeCard 组件
- 玻璃效果背景
- 圆角设计
- 悬停动画
- 多种变体支持

### MemeButton 组件
- 渐变背景
- 点击动画
- 多种尺寸和样式

### MemeBackground 组件
- 动态背景效果
- 浮动元素动画
- 多种背景变体

## 🔐 认证系统

### 功能特性
- 钱包连接和签名认证
- 用户注册和登录
- 会话管理
- 邀请系统
- 推荐奖励机制

### 技术实现
- 使用 Wagmi 进行钱包连接
- 自定义认证上下文
- Supabase 数据库存储
- 本地存储会话管理

## 📊 数据库设计

### 用户表 (users)
- 钱包地址
- 推荐码
- 推荐关系
- 用户状态

### 邀请表 (invitations)
- 邀请者信息
- 被邀请者信息
- 邀请状态
- 奖励信息

### 会话表 (user_sessions)
- 用户ID
- 会话令牌
- 过期时间

## 🚀 部署指南

### 1. 环境变量配置
确保生产环境中所有环境变量都已正确配置。

### 2. 数据库迁移
在生产数据库中运行初始化脚本。

### 3. 域名配置
更新 WalletConnect 项目配置中的域名。

### 4. 构建和部署
```bash
npm run build
npm start
```

## 🛠️ 开发指南

### 添加新页面
1. 在 `app/` 目录下创建新文件夹
2. 添加 `page.tsx` 文件
3. 使用 MemeCard 和 MemeButton 组件保持UI一致性

### 添加新组件
1. 在 `components/` 目录下创建组件文件
2. 使用 TypeScript 定义接口
3. 添加适当的样式和动画

### 数据库操作
使用 `DatabaseService` 类进行数据库操作：
```typescript
import { DatabaseService } from '@/lib/database';

// 创建用户
const user = await DatabaseService.createUser(userData);

// 获取用户
const user = await DatabaseService.getUserByWalletAddress(address);
```

## 📚 相关文档

- [AUTH_SETUP_GUIDE.md](./AUTH_SETUP_GUIDE.md) - 认证系统设置指南
- [BACKGROUND_GUIDE.md](./BACKGROUND_GUIDE.md) - 背景设计指南
- [CEO_STRATEGIC_OPTIMIZATION_PLAN.md](./CEO_STRATEGIC_OPTIMIZATION_PLAN.md) - 战略优化计划

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 🆘 故障排除

### 常见问题

1. **钱包连接失败**
   - 检查 WalletConnect Project ID 是否正确
   - 确认钱包应用已安装并可用

2. **数据库连接错误**
   - 验证 Supabase 配置
   - 检查网络连接
   - 确认数据库表已创建

3. **构建错误**
   - 检查环境变量配置
   - 确认所有依赖已安装
   - 查看控制台错误信息

### 调试技巧

1. 开启浏览器开发者工具查看控制台错误
2. 检查网络请求状态
3. 验证环境变量配置
4. 查看 Supabase 日志

## 📞 支持

如有问题，请查看相关文档或创建 Issue。 
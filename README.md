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
   - 连接钱包即注册并获得奖励
   - 优化的钱包连接体验与自动重试机制

3. **认证系统架构**
   - 完整的认证上下文 (AuthContext)
   - 用户会话管理
   - 钱包签名认证
   - 邀请系统框架
   - 防重复请求机制

4. **数据库集成**
   - MongoDB Atlas 云数据库
   - 用户、邀请、奖励记录集合
   - 数据库服务层
   - 高效的数据查询与缓存机制

5. **邀请奖励系统**
   - 连接钱包注册获得 10,000 ANGEL 代币
   - 一级邀请奖励 3,000 ANGEL 代币
   - 二级邀请奖励 1,500 ANGEL 代币
   - 三级邀请奖励 500 ANGEL 代币
   - 多级推荐跟踪与奖励自动发放
   - 优化的奖励计算和分配机制

### 🔧 当前开发状态

- **开发服务器**: 运行在 http://localhost:3001
- **构建状态**: 基本功能正常，需要配置环境变量
- **UI组件**: 完整的玻璃效果卡片系统
- **认证系统**: 代码完成，需要MongoDB数据库配置
- **优化状态**: 已优化钱包连接体验，减少重复签名问题

## 📋 快速开始

### 1. 环境配置

运行环境配置脚本：
```bash
node setup-env.js
```

编辑 `.env.local` 文件，填入以下配置：

```env
# MongoDB数据库配置
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/angel-crypto?retryWrites=true&w=majority
MONGODB_DB_NAME=angel-crypto

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

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) 创建新账户或登录
2. 创建一个新的集群（可使用免费层级）
3. 设置数据库用户和网络访问权限
4. 获取连接字符串
5. 运行初始化脚本：
   ```bash
   npm run init-mongodb
   ```

详细的MongoDB设置指南请参考 [MONGODB_SETUP_GUIDE.md](./MONGODB_SETUP_GUIDE.md)

### 3. WalletConnect 配置

1. 访问 [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. 创建新项目并获取 Project ID
3. 配置项目元数据和域名

详细的钱包连接配置指南请参考 [WALLET_CONNECT_GUIDE.md](./WALLET_CONNECT_GUIDE.md)

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3001 查看应用

## 🎯 主要功能页面

### 主页
- 路径: `/`
- 功能: 展示ANGEL代币信息、功能导航、用户资产

### 邀请页面
- 路径: `/invite/[wallet_address]`
- 功能: 通过邀请链接注册并获得奖励

### 个人资料页面
- 路径: `/profile`
- 功能: 查看个人资料、邀请记录和奖励历史

### NFT市场
- 路径: `/nft`
- 功能: 查看和交易NFT卡牌

### 代币兑换
- 路径: `/swap`
- 功能: 代币兑换交易功能

## 🔑 钱包连接 = 注册

Angel Crypto App采用了简化的用户注册流程：

1. **连接钱包即完成注册** - 用户只需连接钱包，无需填写任何表单
2. **自动获得奖励** - 新用户连接钱包后自动获得10,000 ANGEL代币
3. **邀请奖励自动发放** - 通过邀请链接注册时，邀请人自动获得奖励
4. **多级奖励系统** - 支持三级邀请奖励，全部自动计算和发放

这种设计极大简化了用户体验，让用户能够立即参与生态系统。

### 钱包连接优化

为提升用户体验，我们对钱包连接流程进行了以下优化：

1. **防重复请求机制** - 避免用户重复签名
2. **自动重试** - 连接失败时自动尝试重新连接
3. **错误处理改进** - 更友好的错误提示
4. **延迟处理** - 确保钱包扩展有足够时间响应
5. **分离连接与登录步骤** - 避免连续请求导致的问题

## 🏗️ 项目结构

```
angel-crypto-app/
├── app/                          # Next.js 应用页面
│   ├── admin/                    # 管理页面
│   ├── auth/                     # 认证相关页面
│   ├── api/                      # API路由
│   │   ├── invites/              # 邀请相关API
│   │   ├── rewards/              # 奖励相关API
│   │   └── users/                # 用户相关API
│   ├── invite/                   # 邀请页面
│   ├── profile/                  # 个人资料页面
│   ├── nft/                      # NFT市场
│   ├── swap/                     # 代币兑换
│   ├── globals.css              # 全局样式
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 主页
├── components/                   # React 组件
│   ├── auth/                    # 认证相关组件
│   ├── ui/                      # 基础UI组件
│   ├── invite-rewards.tsx       # 邀请奖励组件
│   ├── meme-background.tsx      # 玻璃效果背景组件
│   ├── wallet-connect.tsx       # 钱包连接组件
│   └── page-header.tsx          # 页面头部
├── lib/                         # 工具库
│   ├── auth-context.tsx         # 认证上下文
│   ├── database-mongodb.ts      # MongoDB数据库服务
│   ├── database-client-api.ts   # 客户端API封装
│   ├── mongodb-config.ts        # MongoDB配置
│   └── config.ts                # 应用配置
├── scripts/                     # 脚本文件
│   └── mongodb-init.js          # MongoDB初始化脚本
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
- MongoDB Atlas 数据库存储
- 本地存储会话管理

## 📊 数据库设计

### 用户集合 (users)
- 钱包地址
- 用户名和头像
- 推荐关系
- 代币余额
- 邀请数量
- 用户级别和状态

### 邀请集合 (invitations)
- 邀请人ID和钱包地址
- 被邀请人ID和钱包地址
- 邀请状态
- 奖励金额
- 创建和接受时间

### 奖励记录集合 (reward_records)
- 用户ID
- 奖励类型（欢迎、一级邀请、二级邀请、三级邀请）
- 奖励金额（欢迎10000、一级3000、二级1500、三级500）
- 相关用户和邀请ID
- 奖励状态

### 奖励机制实现
- 新用户注册自动发放欢迎奖励
- 邀请成功自动发放多级邀请奖励
- 奖励记录完整跟踪
- 实时更新用户代币余额

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

## 🔧 故障排除

如果遇到问题，请参考以下指南：

- [钱包连接问题](./WALLET_CONNECT_TROUBLESHOOTING.md)
- [数据库连接问题](./DATABASE_TROUBLESHOOTING.md)
- [邀请奖励问题](./INVITE_REWARDS_TROUBLESHOOTING.md)
- [用户创建修复](./FIX_USER_CREATION_GUIDE.md)

## 📚 文档

详细文档请参考：

- [MongoDB设置指南](./MONGODB_SETUP_GUIDE.md)
- [钱包连接指南](./WALLET_CONNECT_GUIDE.md)
- [邀请系统使用指南](./INVITE_SYSTEM_USAGE.md)
- [奖励系统说明](./README-REWARD-SYSTEM.md)
- [NFT系统说明](./README-NFT-SYSTEM.md)
- [数据库指南](./README-database.md)
- [快速入门](./QUICK_START.md) 
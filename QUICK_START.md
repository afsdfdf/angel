# 🚀 快速启动指南

## 立即开始开发

如果您想立即开始开发而不配置Supabase，项目已经内置了模拟数据库模式。

### 1. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 2. 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

### 3. 访问应用

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🎭 模拟模式功能

在没有配置真实Supabase的情况下，应用会自动运行在模拟模式下：

- ✅ 用户注册和登录
- ✅ 钱包连接
- ✅ 邀请系统
- ✅ 会话管理
- ✅ 所有界面功能

### 模拟模式特点

- 🔄 数据存储在内存中（重启后清空）
- 🎯 完全功能的用户体验
- 🐛 便于开发和测试
- 📝 控制台会显示 `🎭 Mock:` 前缀的日志

## 🗄️ 配置真实数据库

当您准备使用真实数据库时：

### 1. 创建 `.env.local` 文件

复制 `env.example` 文件内容到 `.env.local`：

```bash
cp env.example .env.local
```

### 2. 配置Supabase

按照 [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) 指南配置您的Supabase项目。

### 3. 更新环境变量

在 `.env.local` 中填入您的真实配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. 重启开发服务器

```bash
npm run dev
```

## 🔧 开发工具

### 构建项目

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

### 代码检查

```bash
npm run lint
```

## 📱 功能概览

### 🏠 主页面
- 钱包连接
- 用户状态显示
- 导航菜单

### 💱 交易页面
- 代币交换
- 流动性提供
- 交易历史

### 🎯 质押页面
- 代币质押
- 收益显示
- 质押管理

### 🖼️ NFT页面
- NFT展示
- 收藏管理

### 🏝️ 天使乐园
- 虚拟土地
- 游戏化体验

### 👤 用户档案
- 个人信息
- 邀请系统
- 推荐管理

## 🎨 主题切换

应用支持亮色和暗色主题，可通过界面右上角的主题切换按钮进行切换。

## 📱 响应式设计

- 📱 移动端优先设计
- 💻 桌面端适配
- 🎯 最大宽度 448px (手机屏幕尺寸)

## 🔗 有用链接

- [Supabase 设置指南](./SUPABASE_SETUP.md)
- [项目清理总结](./CLEANUP_SUMMARY.md)
- [数据库初始化脚本](./scripts/supabase-init.sql)

## 🆘 常见问题

### Q: 为什么看到"🎭 Mock:"日志？
A: 这表示应用正在模拟模式下运行，数据存储在内存中。这是正常的开发行为。

### Q: 如何连接真实数据库？
A: 按照 `SUPABASE_SETUP.md` 指南配置Supabase，然后更新 `.env.local` 文件。

### Q: 模拟模式下的数据会保存吗？
A: 不会，模拟模式下的数据存储在内存中，重启应用后会清空。

### Q: 如何获取WalletConnect项目ID？
A: 访问 [WalletConnect Cloud](https://cloud.walletconnect.com) 创建项目并获取项目ID。

## 🎉 开始开发

现在您可以开始开发了！应用已经完全配置好，无论是否有真实数据库都可以正常运行。 
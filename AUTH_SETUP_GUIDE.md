# Angel Crypto App 认证系统设置指南

## 概述

本项目实现了一个完整的钱包登录和邀请系统，包含以下功能：

- 🔐 钱包连接和签名认证
- 👥 用户注册和登录
- 🎁 邀请系统和推荐奖励
- 📊 用户数据管理
- 🗄️ 第三方API数据库集成

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **钱包连接**: Wagmi, WalletConnect
- **数据库**: Supabase (PostgreSQL)
- **认证**: 自定义钱包签名认证
- **UI**: Tailwind CSS, Radix UI

## 环境配置

### 1. 环境变量设置

复制 `.env.example` 文件并重命名为 `.env.local`，然后填入以下配置：

```env
# 数据库配置 (使用Supabase作为第三方API数据库)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 钱包连接配置
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# NextAuth配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# 应用配置
NEXT_PUBLIC_APP_NAME=Angel Crypto App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase 数据库设置

1. 访问 [Supabase](https://supabase.com/) 并创建新项目
2. 获取项目的 URL 和 API 密钥
3. 在 Supabase SQL 编辑器中运行 `scripts/init-database.sql` 脚本
4. 确保 RLS (Row Level Security) 策略正确配置

### 3. WalletConnect 项目设置

1. 访问 [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. 创建新项目并获取 Project ID
3. 配置项目元数据和域名

## 功能特性

### 钱包连接
- 支持 MetaMask、WalletConnect 等主流钱包
- 无需支付 Gas 费的签名认证
- 自动会话管理

### 用户系统
- 基于钱包地址的用户身份
- 自动生成唯一推荐码
- 用户资料管理

### 邀请系统
- 生成邀请链接和推荐码
- 多级推荐奖励机制
- 邀请记录和状态跟踪
- 奖励发放和领取

### 数据安全
- 行级安全策略 (RLS)
- 会话令牌管理
- 自动清理过期数据

## 使用指南

### 1. 用户注册/登录流程

```typescript
// 用户连接钱包
const { connect, connectors } = useConnect();
await connect({ connector: connectors[0] });

// 用户登录（带可选推荐码）
const { login } = useAuth();
await login(referralCode);
```

### 2. 邀请系统使用

```typescript
// 生成邀请链接
const { generateInviteLink } = useAuth();
const inviteLink = generateInviteLink();

// 创建邀请记录
await DatabaseService.createInvitation({
  inviter_id: user.id,
  referral_code: user.referral_code,
  status: 'pending',
  // ... 其他字段
});
```

### 3. 数据库操作

```typescript
// 获取用户信息
const user = await DatabaseService.getUserByWalletAddress(address);

// 更新用户信息
await DatabaseService.updateUser(userId, updates);

// 获取邀请记录
const invitations = await DatabaseService.getInvitationsByUser(userId);
```

## API 接口

### 用户相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/user/profile` - 获取用户资料
- `PUT /api/user/profile` - 更新用户资料

### 邀请相关
- `POST /api/invite/create` - 创建邀请
- `GET /api/invite/list` - 获取邀请列表
- `POST /api/invite/accept` - 接受邀请

## 页面结构

- `/auth` - 认证页面（登录/注册）
- `/profile` - 用户资料页面
- `/invite` - 邀请系统页面

## 组件结构

```
components/
├── auth/
│   ├── login-button.tsx      # 登录按钮组件
│   └── invite-system.tsx     # 邀请系统组件
├── ui/                       # 基础UI组件
└── ...

lib/
├── auth-context.tsx          # 认证上下文
├── database.ts               # 数据库服务
├── wagmi.ts                  # 钱包配置
└── config.ts                 # 应用配置
```

## 部署指南

### 1. 环境变量配置
确保生产环境中所有环境变量都已正确配置。

### 2. 数据库迁移
在生产数据库中运行初始化脚本。

### 3. 域名配置
更新 WalletConnect 项目配置中的域名。

### 4. 安全设置
- 启用 HTTPS
- 配置 CORS 策略
- 设置适当的 CSP 头

## 故障排除

### 常见问题

1. **钱包连接失败**
   - 检查 WalletConnect Project ID 是否正确
   - 确认钱包应用已安装并可用

2. **数据库连接错误**
   - 验证 Supabase 配置
   - 检查网络连接
   - 确认数据库表已创建

3. **签名验证失败**
   - 检查消息格式
   - 确认钱包地址匹配

### 调试技巧

1. 开启浏览器开发者工具查看控制台错误
2. 检查网络请求状态
3. 验证环境变量配置
4. 查看 Supabase 日志

## 安全注意事项

1. **私钥安全**: 应用不会接触用户私钥
2. **会话管理**: 定期清理过期会话
3. **数据验证**: 所有输入都经过验证
4. **权限控制**: 使用 RLS 策略限制数据访问

## 更新日志

### v1.0.0 (2024-01-20)
- 初始版本发布
- 基础钱包连接功能
- 用户注册和登录
- 邀请系统实现
- 数据库集成

## 支持

如有问题或建议，请联系开发团队或在项目仓库中提交 Issue。

---

**注意**: 这是一个演示项目，生产环境使用前请进行充分的安全审计和测试。 
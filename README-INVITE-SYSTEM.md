# 邀请系统配置说明

## 概述

Angel Crypto App 的邀请系统已完成配置，使用新域名 `https://www.angelcoin.app/`。

## 配置更新

### 1. 域名配置

已将应用域名从 `http://localhost:3000` 更新为 `https://www.angelcoin.app`：

```typescript
// lib/config.ts
export const config = {
  app: {
    name: 'Angel Crypto App',
    url: 'https://www.angelcoin.app',
  },
  nextAuth: {
    url: 'https://www.angelcoin.app',
  },
  // ...
}
```

### 2. 环境变量

更新 `env.example` 文件：

```env
NEXT_PUBLIC_APP_URL=https://www.angelcoin.app
NEXTAUTH_URL=https://www.angelcoin.app
```

## 邀请系统功能

### 1. 邀请链接生成

- **格式**: `https://www.angelcoin.app/invite/[钱包地址]`
- **示例**: `https://www.angelcoin.app/invite/0x742d35Cc6634C0532925a3b8D8bE0b3f4f8C8A8e`

### 2. 邀请流程

1. 用户连接钱包并登录
2. 生成个人邀请链接
3. 分享邀请链接给朋友
4. 朋友通过链接访问并注册
5. 系统自动处理奖励分配

### 3. 奖励机制

- **新用户奖励**: 100 ANGEL 代币
- **一级推荐奖励**: 50 ANGEL 代币
- **二级推荐奖励**: 25 ANGEL 代币
- **三级推荐奖励**: 10 ANGEL 代币

## 技术实现

### 1. 路由配置

```
app/invite/[code]/page.tsx - 邀请页面
```

### 2. 数据库表结构

```sql
-- 邀请记录表
CREATE TABLE invitations (
    id UUID PRIMARY KEY,
    inviter_id UUID NOT NULL,
    invitee_id UUID,
    invitee_wallet_address TEXT,
    referral_code TEXT NOT NULL,
    invite_link TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    level INTEGER DEFAULT 1,
    reward_amount DECIMAL(18, 2) DEFAULT 0.00,
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);
```

### 3. 核心函数

```typescript
// 生成邀请链接
DatabaseService.generateInviteLink(walletAddress: string): string

// 创建邀请记录
DatabaseService.createInviteLink(userId: string): Promise<string | null>

// 接受邀请
DatabaseService.acceptInvitation(inviterWallet: string, inviteeWallet: string): Promise<boolean>
```

## 测试说明

### 1. 测试页面

访问 `/test-invite` 页面进行完整的邀请系统测试：

- 连接钱包
- 生成邀请链接
- 验证链接格式
- 测试邀请功能

### 2. 测试步骤

1. 启动开发服务器：`npm run dev`
2. 访问 `http://localhost:3000/test-invite`
3. 连接钱包
4. 点击"生成邀请链接"
5. 验证链接格式是否正确
6. 复制链接并在新窗口中测试

### 3. 验证要点

- ✅ 链接格式：`https://www.angelcoin.app/invite/[钱包地址]`
- ✅ 数据库连接正常
- ✅ 邀请记录创建成功
- ✅ 奖励机制正常运行

## 生产部署

### 1. 环境变量设置

在生产环境中设置以下环境变量：

```env
NEXT_PUBLIC_APP_URL=https://www.angelcoin.app
NEXTAUTH_URL=https://www.angelcoin.app
NEXT_PUBLIC_SUPABASE_URL=你的Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务角色密钥
```

### 2. 域名配置

确保域名 `https://www.angelcoin.app` 正确指向你的应用服务器。

### 3. SSL 证书

确保 HTTPS 证书配置正确，邀请链接使用 HTTPS 协议。

## 故障排除

### 1. 邀请链接格式错误

如果邀请链接仍然显示 `localhost`，请检查：

- 环境变量 `NEXT_PUBLIC_APP_URL` 是否正确设置
- 重启开发服务器
- 清除浏览器缓存

### 2. 数据库连接问题

如果数据库连接失败，系统会自动切换到 Mock 模式：

- 检查 Supabase 配置
- 验证数据库连接字符串
- 确认数据库表结构正确

### 3. 奖励未发放

如果奖励未正确发放，请检查：

- 邀请关系是否正确建立
- 奖励配置是否正确
- 数据库事务是否成功

## 相关文件

- `lib/config.ts` - 应用配置
- `lib/database.ts` - 数据库服务
- `lib/auth-context.tsx` - 认证上下文
- `app/invite/[code]/page.tsx` - 邀请页面
- `app/test-invite/page.tsx` - 测试页面
- `components/auth/invite-system.tsx` - 邀请系统组件

## 更新日志

### 2024-01-XX
- ✅ 更新域名配置为 `https://www.angelcoin.app`
- ✅ 修复邀请链接生成逻辑
- ✅ 完善测试页面
- ✅ 更新环境变量示例
- ✅ 验证邀请系统功能正常

---

如有问题，请查看测试页面或联系开发团队。 
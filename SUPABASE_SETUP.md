# Supabase 数据库设置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并创建账户
2. 创建新项目
3. 记录项目的 URL 和 API 密钥

## 2. 执行数据库初始化脚本

1. 在 Supabase 项目中，进入 "SQL Editor"
2. 复制 `scripts/supabase-init.sql` 文件的内容
3. 粘贴到 SQL Editor 中并执行

## 3. 配置环境变量

创建 `.env.local` 文件并添加以下配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WalletConnect 配置
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# 应用配置
NEXT_PUBLIC_APP_NAME=Angel Crypto App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. 获取 Supabase 密钥

### 项目 URL 和匿名密钥
1. 在 Supabase 项目仪表板中
2. 进入 "Settings" → "API"
3. 复制 "Project URL" 和 "anon public" 密钥

### 服务角色密钥
1. 在同一个 API 设置页面
2. 复制 "service_role" 密钥（注意：这个密钥有完全访问权限，请妥善保管）

## 5. 启用必要的扩展

在 Supabase SQL Editor 中执行：

```sql
-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 可选：启用定时任务扩展
CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

## 6. 验证安装

执行数据库脚本后，您应该看到以下表：

- `public.users` - 用户信息
- `public.invitations` - 邀请记录
- `public.user_sessions` - 用户会话
- `public.tokens` - 代币信息
- `public.liquidity_pools` - 流动性池
- `public.user_liquidity_positions` - 用户流动性位置
- `public.swap_transactions` - 交易记录

## 7. 行级安全策略 (RLS)

数据库脚本已自动启用和配置 RLS 策略，确保：
- 用户只能访问自己的数据
- 公共数据（如代币信息）对所有人可见
- 邀请系统正常工作

## 8. 测试连接

运行项目后，检查浏览器控制台是否有连接错误。如果配置正确，应该能够：
- 连接钱包
- 创建用户账户
- 使用邀请系统

## 故障排除

### 常见问题

1. **RLS 策略错误**
   - 确保所有策略都已正确创建
   - 检查用户认证状态

2. **连接失败**
   - 验证环境变量是否正确设置
   - 检查 Supabase 项目状态

3. **权限错误**
   - 确保使用正确的 API 密钥
   - 检查 RLS 策略配置

### 有用的 SQL 查询

```sql
-- 查看所有表
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 查看 RLS 策略
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- 清理测试数据
TRUNCATE public.users CASCADE;
```

## 生产环境注意事项

1. **安全性**
   - 不要在客户端代码中使用 service_role 密钥
   - 定期轮换 API 密钥
   - 启用 2FA

2. **性能**
   - 监控数据库使用情况
   - 考虑添加额外索引
   - 定期清理过期数据

3. **备份**
   - 启用自动备份
   - 定期测试恢复流程
   - 考虑跨区域备份 
# 使用硬编码环境变量解决 Supabase 连接问题指南

## 问题概述

在使用 Supabase 的过程中，我们遇到了以下连接问题：

1. 系统代理（`127.0.0.1:7897`）可能会干扰 Supabase 连接
2. 环境变量加载问题导致配置丢失
3. 客户端使用 anon 密钥无法直接访问敏感表（如 `users` 表）

## 解决方案

我们已经创建了一套使用硬编码环境变量的解决方案，包含以下文件：

### 1. 硬编码配置文件

**`lib/supabase-config.ts`**
- 包含所有必要的 Supabase 配置信息
- 硬编码 API 密钥和连接参数
- 配置客户端选项以解决代理问题

### 2. 数据库连接客户端

**`lib/database-hardcoded.ts`**
- 使用硬编码配置创建 Supabase 客户端
- 提供服务端（admin）客户端和客户端（client）实例
- 实现 RPC 函数调用和 API 接口

### 3. 健康检查 API

**`app/api/health/route.ts`**
- 提供数据库连接健康检查端点
- 测试 RPC 函数可用性
- 返回详细的诊断信息

### 4. API 端点

**`app/api/users/route-hardcoded.ts`**
- 使用服务端客户端访问敏感数据
- 提供用户数据 CRUD 操作
- 绕过 RLS 限制

### 5. 前端组件示例

**`components/auth/user-profile-hardcoded.tsx`**
- 展示如何在前端使用硬编码客户端
- 实现用户数据加载和更新

### 6. 连接测试页面

**`app/test-connection/page.tsx`**
- 提供实时连接状态检查
- 测试 RPC 函数和 API 端点
- 显示详细的错误信息

## 使用步骤

### 步骤 1: 上传 SQL 函数

确保在 Supabase 中创建以下 SQL 函数：

```sql
-- 1. 健康检查函数
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- 2. 用户存在检查函数
CREATE OR REPLACE FUNCTION is_user_exists(wallet TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM users WHERE wallet_address = wallet
  ) INTO user_exists;
  
  RETURN user_exists;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- 3. 获取用户数据函数
CREATE OR REPLACE FUNCTION get_user_data(wallet_addr TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'wallet_address', wallet_address,
    'username', username,
    'email', email,
    'avatar_url', avatar_url,
    'referred_by', referred_by,
    'invites_count', invites_count,
    'angel_balance', angel_balance,
    'total_earned', total_earned,
    'level', level,
    'is_active', is_active,
    'is_admin', is_admin,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result
  FROM users
  WHERE wallet_address = wallet_addr;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 步骤 2: 复制硬编码文件

将以下文件添加到项目中：

1. `lib/supabase-config.ts`
2. `lib/database-hardcoded.ts`
3. `app/api/health/route.ts`
4. `app/api/users/route-hardcoded.ts`
5. `components/auth/user-profile-hardcoded.tsx`
6. `app/test-connection/page.tsx`

### 步骤 3: 测试连接

1. 启动应用：`npm run dev`
2. 访问测试页面：`http://localhost:3000/test-connection`
3. 检查连接状态和 RPC 函数调用

### 步骤 4: 代理配置（如有需要）

如果系统使用代理（127.0.0.1:7897），考虑以下选项：

1. **临时方案**：使用应用程序时禁用系统代理
   - 打开 Windows 设置 > 网络和 Internet > 代理
   - 关闭"使用代理服务器"选项

2. **长期方案**：将 Supabase 域名添加到代理排除列表
   - 打开 Windows 设置 > 网络和 Internet > 代理
   - 在"不将代理服务器用于本地地址"框中勾选
   - 添加 `*.supabase.co` 到排除列表

## 注意事项

1. **安全警告**：
   - 硬编码方案仅适用于开发环境
   - 生产环境请使用环境变量或密钥管理解决方案

2. **使用服务端 API**：
   - 对于需要敏感数据访问的操作，使用服务端 API
   - 不要在客户端直接查询敏感表

3. **迁移回环境变量**：
   - 一旦连接问题解决，应该迁移回使用环境变量
   - 创建 `.env.local` 文件并移除硬编码

## 故障排除

如果仍然遇到连接问题：

1. **检查网络**：
   - 确保可以 ping 通 `onfplwhsmtvmkssyisot.supabase.co`
   - 确认网络没有阻止 HTTPS 连接

2. **验证凭据**：
   - 登录 Supabase 控制台确认密钥有效
   - 确认项目 ID 和 URL 正确

3. **检查 RLS 策略**：
   - 确认表的 RLS 策略允许必要的访问
   - 使用 `SECURITY DEFINER` 的 RPC 函数绕过 RLS 
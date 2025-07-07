# Supabase 连接问题解决方案

## 问题概述

在使用 Supabase 作为后端数据库时，我们遇到了以下问题：

1. 使用 anon 密钥无法直接访问 `users` 表（返回 401 错误和 "permission denied for table users"）
2. 系统代理设置（`127.0.0.1:7897`）可能会影响某些连接功能

## 诊断结果

我们进行了全面的诊断测试，包括：

- DNS 解析测试（✅ 成功）
- Ping 测试（✅ 成功）
- HTTP 请求测试（⚠️ 权限问题）
- 代理设置检查（⚠️ 发现系统代理）
- 无代理环境测试（⚠️ 仍有权限问题，但 RPC 函数调用成功）

## 结论

**主要问题不是连接问题，而是 Supabase 的安全设计**：

- Supabase 使用 Row Level Security (RLS) 策略来保护数据
- anon 密钥（客户端密钥）被设计为有限权限，不能直接访问敏感表（如 `users` 表）
- 这是预期行为，不是 bug

## 解决方案

### 1. 使用正确的访问模式

#### 客户端代码（前端）

客户端代码应使用 anon 密钥，但不应直接查询敏感表。相反，应该：

```javascript
// ❌ 不要这样做（直接查询 users 表）
const { data, error } = await supabase
  .from('users')
  .select('*');

// ✅ 应该这样做（使用 RPC 函数）
const { data, error } = await supabase
  .rpc('get_user_data', { user_id: userId });

// ✅ 或者使用自定义 API 端点
const response = await fetch('/api/users', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${session.access_token}` }
});
```

#### 服务器端代码（后端）

服务器端代码可以使用 service_role 密钥来访问敏感表：

```javascript
// 服务器端代码（Next.js API 路由）
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 使用 service_role 密钥创建 Supabase 客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // 现在可以安全地查询 users 表
  const { data, error } = await supabase
    .from('users')
    .select('*');
    
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
}
```

### 2. 配置 RLS 策略

为表配置适当的 RLS 策略，允许必要的访问：

```sql
-- 示例：允许用户查看自己的数据
CREATE POLICY "用户可以查看自己的数据" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- 示例：允许用户更新自己的数据
CREATE POLICY "用户可以更新自己的数据" ON users
  FOR UPDATE
  USING (auth.uid() = id);
```

### 3. 实现 RPC 函数

在 Supabase 中创建安全的 RPC 函数，用于客户端访问敏感数据：

```sql
-- 示例：创建安全的用户数据获取函数
CREATE OR REPLACE FUNCTION get_user_data(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- 检查调用者是否是请求的用户
  IF auth.uid() = user_id THEN
    SELECT json_build_object(
      'id', id,
      'email', email,
      'username', username,
      'created_at', created_at
    ) INTO result
    FROM users
    WHERE id = user_id;
    
    RETURN result;
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. 处理代理问题（可选）

如果系统代理（`127.0.0.1:7897`）影响连接：

1. **临时解决方案**：使用应用程序时禁用系统代理
   - Windows 设置 > 网络和 Internet > 代理 > 关闭"使用代理服务器"

2. **长期解决方案**：配置代理排除
   - 将 `*.supabase.co` 添加到代理排除列表
   - 或者配置代理软件允许 Supabase 连接

## 实施步骤

1. **审查前端代码**：
   - 找出所有直接查询敏感表的地方
   - 将它们替换为 RPC 函数调用或 API 端点

2. **创建必要的后端 API**：
   - 为需要特权访问的操作实现服务器端 API 端点
   - 使用 service_role 密钥进行数据库操作

3. **在 Supabase 中创建 RPC 函数**：
   - 为常用操作创建安全的 RPC 函数
   - 确保函数包含适当的权限检查

4. **配置 RLS 策略**：
   - 为所有表配置适当的 RLS 策略
   - 测试策略以确保它们按预期工作

## 最佳实践

1. **密钥管理**：
   - 永远不要在客户端代码中使用 service_role 密钥
   - 将 service_role 密钥安全地存储在环境变量中

2. **安全访问**：
   - 使用 RPC 函数和 API 端点进行数据访问
   - 实现适当的身份验证和授权检查

3. **错误处理**：
   - 优雅地处理权限错误
   - 向用户提供有意义的错误消息

4. **测试**：
   - 测试不同用户角色的访问权限
   - 确保 RLS 策略按预期工作

## 参考资源

- [Supabase 安全文档](https://supabase.com/docs/guides/auth/row-level-security)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase RPC 函数](https://supabase.com/docs/guides/database/functions)
- [Supabase 权限管理](https://supabase.com/docs/guides/auth/permissions)

---

通过遵循这些指南，您应该能够解决 Supabase 连接问题，并实现一个安全、高效的数据访问模式。 
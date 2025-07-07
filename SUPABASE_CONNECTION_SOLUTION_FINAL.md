# Supabase 数据库连接问题最终解决方案

## 问题概述

我们在使用 Supabase 作为后端数据库时，遇到了连接问题：

1. 系统代理设置 (`127.0.0.1:7897`) 干扰了 Supabase 连接
2. 使用 anon 密钥无法直接访问 `users` 表（这是预期安全行为）
3. 环境变量加载问题导致配置丢失或不一致

## 解决方案

我们实现了一个硬编码环境变量的解决方案，包含以下核心文件：

### 1. `lib/supabase-config.ts`

硬编码 Supabase 配置文件，包含所有连接信息：

```typescript
export const supabaseConfig = {
  url: "https://onfplwhsmtvmkssyisot.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  
  clientOptions: {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-client-info': 'angel-crypto-app'
      }
    }
  }
};
```

### 2. `lib/database-hardcoded.ts`

使用硬编码配置的数据库客户端：

```typescript
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './supabase-config';

// 创建客户端和管理员实例
export const supabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  supabaseConfig.clientOptions
);

export const supabaseAdmin = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  supabaseConfig.clientOptions
);
```

### 3. `app/api/users/route-hardcoded.ts`

服务端 API 端点，使用 service_role 密钥安全访问数据：

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/database-hardcoded';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  
  // 使用管理员客户端直接查询 users 表
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('wallet_address', wallet)
    .single();
    
  // 返回响应
  return NextResponse.json({ user: data, error });
}
```

### 4. SQL 函数

在 Supabase 中创建的辅助 SQL 函数：

```sql
-- 健康检查函数
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- 用户数据获取函数
CREATE OR REPLACE FUNCTION get_user_data(wallet_addr TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'wallet_address', wallet_address,
    'username', username
    -- 其他字段...
  ) INTO result
  FROM users
  WHERE wallet_address = wallet_addr;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 实施步骤

1. 添加硬编码配置文件：`lib/supabase-config.ts`
2. 添加数据库客户端：`lib/database-hardcoded.ts`
3. 添加 API 端点：`app/api/users/route-hardcoded.ts` 和 `app/api/health/route.ts`
4. 在 Supabase 中创建必要的 SQL 函数
5. 修改前端组件使用新的客户端和 API

## 最佳实践

1. **前端代码**：
   - 不要直接查询受保护表（如 users 表）
   - 使用 RPC 函数或 API 端点

2. **后端代码**：
   - 使用 service_role 密钥访问敏感数据
   - 实现安全的 API 端点
   - 使用 RPC 函数绕过 RLS 限制

3. **安全注意事项**：
   - 硬编码方案仅用于开发环境
   - 生产环境应使用环境变量或密钥管理方案
   - 不要在客户端使用 service_role 密钥

## 代理解决方案

如果系统代理干扰连接：

1. **临时方案**：禁用系统代理
   - Windows 设置 > 网络和 Internet > 代理 > 关闭"使用代理服务器"

2. **长期方案**：配置代理排除
   - 在排除列表中添加 `*.supabase.co`
   - 或修改代理软件配置

## 其他解决方案

1. **修复环境变量**：
   - 创建 `.env.local` 文件，添加所有必要环境变量
   - 确保变量名称与代码中使用的一致

2. **使用正确的访问模式**：
   - 遵循 Supabase 的安全最佳实践
   - 客户端使用 RPC 函数或 API 端点
   - 服务端代码使用 service_role 密钥

## 提交内容

本次提交包含：

1. 硬编码解决方案的所有文件
2. SQL 函数定义
3. 这份解决方案文档

解决方案已经过测试，可以成功连接到 Supabase 数据库并安全地访问数据。 
# 修复用户创建功能指南

## 问题描述

我们在用户创建功能中发现了一个SQL错误:

```
"message": "column reference \"wallet_address\" is ambiguous",
"details": "It could refer to either a PL/pgSQL variable or a table column."
```

这是一个PostgreSQL错误，表示在RPC函数中有歧义的列引用。具体来说，参数名称`wallet_address`与表中的列名相同，导致PostgreSQL无法确定应该使用哪一个。

## 解决方案

我们通过两个步骤修复这个问题:

1. 更新Supabase RPC函数，使用不同的参数名称
2. 更新前端代码，使用新的参数名称

### 1. 更新Supabase RPC函数

请在Supabase的SQL编辑器中执行以下SQL代码:

```sql
-- 修复create_user RPC函数的列引用歧义问题
CREATE OR REPLACE FUNCTION create_user(
  in_wallet_address text,
  in_email text DEFAULT NULL,
  in_username text DEFAULT NULL,
  in_avatar_url text DEFAULT NULL,
  in_referred_by text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  user_record jsonb;
BEGIN
  -- 检查用户是否已存在
  IF EXISTS (SELECT 1 FROM users WHERE LOWER(wallet_address) = LOWER(in_wallet_address)) THEN
    -- 返回现有用户
    SELECT json_build_object(
      'id', id,
      'wallet_address', wallet_address,
      'email', email,
      'username', username,
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
    ) INTO user_record
    FROM users
    WHERE LOWER(wallet_address) = LOWER(in_wallet_address)
    LIMIT 1;
    
    RETURN user_record;
  END IF;

  -- 确保钱包地址值有效
  IF in_wallet_address IS NULL OR LENGTH(TRIM(in_wallet_address)) = 0 THEN
    RAISE EXCEPTION '无效的钱包地址';
  END IF;

  -- 插入新用户
  INSERT INTO users (
    wallet_address,
    email,
    username,
    avatar_url,
    referred_by,
    invites_count,
    angel_balance,
    total_earned,
    level,
    is_active,
    is_admin,
    created_at,
    updated_at
  )
  VALUES (
    LOWER(in_wallet_address),
    in_email,
    COALESCE(in_username, '用户_' || substring(LOWER(in_wallet_address), 1, 6)),
    in_avatar_url,
    in_referred_by,
    0, -- invites_count
    100, -- welcome_bonus
    100, -- total_earned
    1, -- level
    true, -- is_active
    false, -- is_admin
    NOW(),
    NOW()
  )
  RETURNING id INTO new_user_id;
  
  -- 获取创建的用户
  SELECT json_build_object(
    'id', id,
    'wallet_address', wallet_address,
    'email', email,
    'username', username,
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
  ) INTO user_record
  FROM users
  WHERE id = new_user_id;
  
  RETURN user_record;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_user 错误: %', SQLERRM;
  RETURN NULL;
END;
$$;
```

这个更新做了以下改变:

1. 将参数名从 `wallet_address` 改为 `in_wallet_address`（同样处理其他参数）
2. 更新函数体中的所有引用，使用新的参数名
3. 添加了更好的错误处理和日志记录

### 2. 验证RPC函数

在Supabase SQL编辑器中执行以下查询来测试函数:

```sql
-- 测试函数
SELECT create_user('0xtest123456', NULL, '测试用户_修复版', NULL, NULL);
```

如果一切正常，应该会看到成功返回的JSON数据，包含新创建的用户信息。

### 3. 更新前端代码

前端代码已经更新，使用新的参数名称。主要更改如下:

```typescript
// 使用RPC函数创建用户（使用新的参数名称）
const rpcParams = {
  in_wallet_address: normalizedAddress,
  in_email: userData.email || null,
  in_username: userData.username || null,
  in_avatar_url: userData.avatar_url || null,
  in_referred_by: userData.referred_by || null
};
```

## 测试

1. 打开浏览器访问 http://localhost:3000/test-db-supabase-rpc
2. 点击"测试创建用户"按钮
3. 验证用户是否成功创建，不再出现错误

## 为什么会出现这个问题？

这是一个PostgreSQL的常见问题。在PL/pgSQL函数中，当参数名称与表列名相同时，会产生歧义。有两种主要的解决方案:

1. 使用不同的参数名称（我们选择了这种方法）
2. 明确地限定表列的引用，例如 `users.wallet_address`

第一种方法（使用不同的参数名）是更清晰和一致的解决方案，因此我们采用了这种方法。 
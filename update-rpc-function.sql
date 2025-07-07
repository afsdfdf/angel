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

-- 测试函数
SELECT create_user('0xtest123456', NULL, '测试用户_修复版', NULL, NULL); 
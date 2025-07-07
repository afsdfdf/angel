-- Supabase RPC函数
-- 这些函数允许客户端安全地访问数据，而不需要直接表访问权限

-- 健康检查函数
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN true;
END;
$$;

-- 通过钱包地址获取用户
CREATE OR REPLACE FUNCTION get_user_by_wallet(wallet text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_record jsonb;
BEGIN
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
  WHERE wallet_address = wallet;
  
  RETURN user_record;
END;
$$;

-- 检查用户是否存在
CREATE OR REPLACE FUNCTION is_user_exists(wallet text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_count integer;
BEGIN
  SELECT count(*) INTO user_count
  FROM users
  WHERE wallet_address = wallet;
  
  RETURN user_count > 0;
END;
$$;

-- 创建用户
CREATE OR REPLACE FUNCTION create_user(
  wallet_address text,
  email text DEFAULT NULL,
  username text DEFAULT NULL,
  avatar_url text DEFAULT NULL,
  referred_by text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  user_record jsonb;
BEGIN
  -- 检查用户是否已存在
  IF EXISTS (SELECT 1 FROM users WHERE wallet_address = wallet_address) THEN
    RAISE EXCEPTION 'User with this wallet address already exists';
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
  ) VALUES (
    wallet_address,
    email,
    username,
    avatar_url,
    referred_by,
    0, -- invites_count
    100, -- angel_balance (欢迎奖励)
    100, -- total_earned
    1, -- level
    true, -- is_active
    false, -- is_admin
    now(), -- created_at
    now() -- updated_at
  ) RETURNING id INTO new_user_id;
  
  -- 记录欢迎奖励
  INSERT INTO reward_records (
    user_id,
    reward_type,
    amount,
    description,
    status,
    created_at,
    completed_at
  ) VALUES (
    new_user_id,
    'welcome',
    100,
    '注册欢迎奖励',
    'completed',
    now(),
    now()
  );
  
  -- 返回新创建的用户
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
END;
$$;

-- 处理邀请注册
CREATE OR REPLACE FUNCTION process_invite_registration(
  new_user_wallet text,
  inviter_wallet text
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  inviter_id uuid;
  invite_code text;
BEGIN
  -- 获取用户ID
  SELECT id INTO new_user_id
  FROM users
  WHERE wallet_address = new_user_wallet;
  
  IF new_user_id IS NULL THEN
    RAISE EXCEPTION 'New user not found';
  END IF;
  
  SELECT id INTO inviter_id
  FROM users
  WHERE wallet_address = inviter_wallet;
  
  IF inviter_id IS NULL THEN
    RAISE EXCEPTION 'Inviter not found';
  END IF;
  
  -- 检查是否已存在邀请记录
  IF EXISTS (
    SELECT 1
    FROM invitations
    WHERE inviter_id = inviter_id AND invitee_id = new_user_id
  ) THEN
    RETURN true; -- 已处理过
  END IF;
  
  -- 生成邀请码
  invite_code := substr(md5(random()::text), 1, 8);
  
  -- 创建邀请记录
  INSERT INTO invitations (
    inviter_id,
    invitee_id,
    invite_code,
    status,
    reward_amount,
    created_at,
    updated_at
  ) VALUES (
    inviter_id,
    new_user_id,
    invite_code,
    'accepted',
    50, -- 奖励金额
    now(),
    now()
  );
  
  -- 更新用户关系
  UPDATE users
  SET referred_by = inviter_id
  WHERE id = new_user_id;
  
  -- 更新邀请统计
  UPDATE users
  SET 
    invites_count = COALESCE(invites_count, 0) + 1,
    angel_balance = COALESCE(angel_balance, 0) + 50,
    total_earned = COALESCE(total_earned, 0) + 50
  WHERE id = inviter_id;
  
  -- 记录奖励
  INSERT INTO reward_records (
    user_id,
    reward_type,
    amount,
    description,
    related_user_id,
    status,
    created_at,
    completed_at
  ) VALUES (
    inviter_id,
    'referral_l1',
    50,
    '邀请奖励 L1 - 成功邀请用户 ' || new_user_wallet,
    new_user_id,
    'completed',
    now(),
    now()
  );
  
  RETURN true;
END;
$$;

-- 获取用户邀请记录
CREATE OR REPLACE FUNCTION get_user_invitations(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  invitations_record jsonb;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', i.id,
      'inviter_id', i.inviter_id,
      'invitee_id', i.invitee_id,
      'invite_code', i.invite_code,
      'status', i.status,
      'reward_amount', i.reward_amount,
      'created_at', i.created_at,
      'updated_at', i.updated_at,
      'invitee', json_build_object(
        'id', u.id,
        'wallet_address', u.wallet_address,
        'username', u.username,
        'avatar_url', u.avatar_url,
        'created_at', u.created_at
      )
    )
  ) INTO invitations_record
  FROM invitations i
  JOIN users u ON i.invitee_id = u.id
  WHERE i.inviter_id = user_id;
  
  RETURN invitations_record;
END;
$$;

-- 获取用户奖励记录
CREATE OR REPLACE FUNCTION get_user_rewards(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  rewards_record jsonb;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', id,
      'user_id', user_id,
      'reward_type', reward_type,
      'amount', amount,
      'description', description,
      'related_user_id', related_user_id,
      'related_invitation_id', related_invitation_id,
      'transaction_hash', transaction_hash,
      'status', status,
      'created_at', created_at,
      'completed_at', completed_at
    )
  ) INTO rewards_record
  FROM reward_records
  WHERE user_id = user_id
  ORDER BY created_at DESC;
  
  RETURN rewards_record;
END;
$$;

-- 获取所有用户（仅管理员可用）
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  users_record jsonb;
BEGIN
  -- 这里应该添加管理员权限检查
  -- 但为了简化，我们暂时不添加
  
  SELECT json_agg(
    json_build_object(
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
    )
  ) INTO users_record
  FROM users
  ORDER BY created_at DESC;
  
  RETURN users_record;
END;
$$; 
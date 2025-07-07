-- 创建通过ID处理邀请的数据库函数
CREATE OR REPLACE FUNCTION process_invite_registration_by_id(
  new_user_wallet TEXT,
  inviter_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  new_user_id UUID;
  invite_exists BOOLEAN;
  invite_id UUID;
  reward_amount DECIMAL(18, 2) := 50.00;
BEGIN
  -- 记录函数调用
  RAISE NOTICE '处理邀请注册 (ID): 新用户钱包 = %, 邀请人ID = %', new_user_wallet, inviter_id;
  
  -- 确保钱包地址为小写
  new_user_wallet := LOWER(new_user_wallet);
  
  -- 验证参数
  IF new_user_wallet IS NULL OR inviter_id IS NULL THEN
    RAISE NOTICE '参数无效: 新用户钱包 = %, 邀请人ID = %', new_user_wallet, inviter_id;
    RETURN FALSE;
  END IF;
  
  -- 获取新用户ID
  SELECT id INTO new_user_id FROM users WHERE LOWER(wallet_address) = new_user_wallet;
  
  IF new_user_id IS NULL THEN
    RAISE NOTICE '新用户不存在: %', new_user_wallet;
    RETURN FALSE;
  END IF;
  
  -- 检查邀请人是否存在
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = inviter_id) THEN
    RAISE NOTICE '邀请人不存在: %', inviter_id;
    RETURN FALSE;
  END IF;
  
  -- 检查是否已存在邀请记录
  SELECT EXISTS(
    SELECT 1 FROM invites WHERE invited_user_id = new_user_id
  ) INTO invite_exists;
  
  IF invite_exists THEN
    RAISE NOTICE '邀请记录已存在，跳过处理';
    
    -- 检查是否已发放奖励
    IF EXISTS (SELECT 1 FROM invites WHERE invited_user_id = new_user_id AND reward_claimed = FALSE) THEN
      -- 处理未发放的奖励
      UPDATE users
      SET angel_balance = angel_balance + reward_amount,
          total_earned = total_earned + reward_amount
      WHERE id = inviter_id;
      
      -- 更新邀请记录
      UPDATE invites
      SET reward_claimed = TRUE
      WHERE invited_user_id = new_user_id;
      
      RAISE NOTICE '处理了未发放的奖励';
    END IF;
    
    RETURN TRUE; -- 已存在视为成功
  END IF;
  
  -- 创建邀请记录
  INSERT INTO invites (inviter_id, invited_user_id, status, reward_claimed, reward_amount)
  VALUES (inviter_id, new_user_id, 'completed', FALSE, reward_amount)
  RETURNING id INTO invite_id;
  
  RAISE NOTICE '邀请记录创建成功: %', invite_id;
  
  -- 更新用户邀请计数
  UPDATE users
  SET invites_count = COALESCE(invites_count, 0) + 1
  WHERE id = inviter_id;
  
  RAISE NOTICE '邀请人邀请计数已更新';
  
  -- 立即发放奖励
  UPDATE users
  SET angel_balance = COALESCE(angel_balance, 0) + reward_amount,
      total_earned = COALESCE(total_earned, 0) + reward_amount
  WHERE id = inviter_id;
  
  -- 标记奖励已发放
  UPDATE invites
  SET reward_claimed = TRUE
  WHERE id = invite_id;
  
  RAISE NOTICE '邀请奖励已发放: % ANGEL', reward_amount;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '处理邀请注册异常: %', SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 添加邀请码字段（如果需要）
ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_code UUID DEFAULT gen_random_uuid();
CREATE INDEX IF NOT EXISTS idx_users_invite_code ON users(invite_code);

-- 添加一个简化的邀请处理函数
CREATE OR REPLACE FUNCTION simple_invite_process(
  new_user_wallet TEXT,
  inviter_wallet TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  new_user_id UUID;
  inviter_id UUID;
  invite_exists BOOLEAN;
  reward_amount DECIMAL(18, 2) := 50.00;
BEGIN
  -- 确保钱包地址为小写
  new_user_wallet := LOWER(new_user_wallet);
  inviter_wallet := LOWER(inviter_wallet);
  
  -- 获取用户ID
  SELECT id INTO new_user_id FROM users WHERE LOWER(wallet_address) = new_user_wallet;
  SELECT id INTO inviter_id FROM users WHERE LOWER(wallet_address) = inviter_wallet;
  
  IF new_user_id IS NULL OR inviter_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- 检查是否已存在邀请记录
  SELECT EXISTS(
    SELECT 1 FROM invites WHERE invited_user_id = new_user_id
  ) INTO invite_exists;
  
  IF invite_exists THEN
    -- 检查是否已发放奖励
    IF EXISTS (SELECT 1 FROM invites WHERE invited_user_id = new_user_id AND reward_claimed = FALSE) THEN
      -- 处理未发放的奖励
      UPDATE users
      SET angel_balance = COALESCE(angel_balance, 0) + reward_amount,
          total_earned = COALESCE(total_earned, 0) + reward_amount
      WHERE id = inviter_id;
      
      -- 更新邀请记录
      UPDATE invites
      SET reward_claimed = TRUE
      WHERE invited_user_id = new_user_id;
    END IF;
    
    RETURN TRUE; -- 已存在视为成功
  END IF;
  
  -- 创建邀请记录
  INSERT INTO invites (inviter_id, invited_user_id, status, reward_claimed, reward_amount)
  VALUES (inviter_id, new_user_id, 'completed', TRUE, reward_amount);
  
  -- 更新用户邀请计数
  UPDATE users
  SET invites_count = COALESCE(invites_count, 0) + 1
  WHERE id = inviter_id;
  
  -- 立即发放奖励
  UPDATE users
  SET angel_balance = COALESCE(angel_balance, 0) + reward_amount,
      total_earned = COALESCE(total_earned, 0) + reward_amount
  WHERE id = inviter_id;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 检查数据库中是否存在invites表
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'invites'
) AS invites_table_exists;

-- 检查数据库中是否存在invitations表
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'invitations'
) AS invitations_table_exists;

-- 如果invites表存在，检查其结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'invites'
ORDER BY ordinal_position;

-- 如果invitations表存在，检查其结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'invitations'
ORDER BY ordinal_position;

-- 检查process_invite_registration_by_id函数是否存在
SELECT EXISTS (
   SELECT FROM pg_proc
   WHERE proname = 'process_invite_registration_by_id'
) AS process_invite_registration_by_id_exists;

-- 检查simple_invite_process函数是否存在
SELECT EXISTS (
   SELECT FROM pg_proc
   WHERE proname = 'simple_invite_process'
) AS simple_invite_process_exists;

-- 创建invites表（如果不存在）
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID NOT NULL REFERENCES users(id),
    invited_user_id UUID REFERENCES users(id),
    status TEXT DEFAULT 'completed',
    reward_claimed BOOLEAN DEFAULT FALSE,
    reward_amount DECIMAL(18, 2) DEFAULT 50.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_invites_inviter_id ON invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invites_invited_user_id ON invites(invited_user_id);

-- 添加invites_count字段到users表（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS invites_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS angel_balance DECIMAL(18, 2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_earned DECIMAL(18, 2) DEFAULT 0.00;

-- 创建简单的邀请处理函数
CREATE OR REPLACE FUNCTION direct_invite_process(
  inviter_id UUID,
  invited_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  invite_exists BOOLEAN;
  reward_amount DECIMAL(18, 2) := 50.00;
BEGIN
  -- 检查参数
  IF inviter_id IS NULL OR invited_user_id IS NULL THEN
    RAISE NOTICE '参数无效: inviter_id = %, invited_user_id = %', inviter_id, invited_user_id;
    RETURN FALSE;
  END IF;
  
  -- 检查是否已存在邀请记录
  SELECT EXISTS(
    SELECT 1 FROM invites WHERE invited_user_id = invited_user_id
  ) INTO invite_exists;
  
  IF invite_exists THEN
    RAISE NOTICE '邀请记录已存在，跳过处理';
    RETURN TRUE; -- 已存在视为成功
  END IF;
  
  -- 创建邀请记录
  INSERT INTO invites (inviter_id, invited_user_id, status, reward_claimed, reward_amount)
  VALUES (inviter_id, invited_user_id, 'completed', TRUE, reward_amount);
  
  -- 更新用户邀请计数
  UPDATE users
  SET invites_count = invites_count + 1
  WHERE id = inviter_id;
  
  -- 给邀请人发放奖励
  UPDATE users
  SET angel_balance = angel_balance + reward_amount,
      total_earned = total_earned + reward_amount
  WHERE id = inviter_id;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '处理邀请异常: %', SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 创建辅助函数用于递增计数
CREATE OR REPLACE FUNCTION increment(count INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN count + 1;
END;
$$ LANGUAGE plpgsql;

-- 创建函数，用于在API中调用以创建invites表
CREATE OR REPLACE FUNCTION create_invites_table()
RETURNS BOOLEAN AS $$
BEGIN
  -- 创建invites表（如果不存在）
  CREATE TABLE IF NOT EXISTS invites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      inviter_id UUID NOT NULL REFERENCES users(id),
      invited_user_id UUID REFERENCES users(id),
      status TEXT DEFAULT 'completed',
      reward_claimed BOOLEAN DEFAULT FALSE,
      reward_amount DECIMAL(18, 2) DEFAULT 50.00,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- 创建索引
  CREATE INDEX IF NOT EXISTS idx_invites_inviter_id ON invites(inviter_id);
  CREATE INDEX IF NOT EXISTS idx_invites_invited_user_id ON invites(invited_user_id);
  
  -- 添加invites_count字段到users表（如果不存在）
  ALTER TABLE users ADD COLUMN IF NOT EXISTS invites_count INTEGER DEFAULT 0;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS angel_balance DECIMAL(18, 2) DEFAULT 0.00;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS total_earned DECIMAL(18, 2) DEFAULT 0.00;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '创建表异常: %', SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 创建函数，用于处理邀请奖励
CREATE OR REPLACE FUNCTION process_invite_rewards(invite_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record RECORD;
  reward_amount DECIMAL(18, 2) := 50.00;
BEGIN
  -- 获取邀请记录
  SELECT * INTO invite_record
  FROM invites
  WHERE id = invite_id AND reward_claimed = FALSE;
  
  -- 如果没有找到记录或已经发放过奖励，返回
  IF invite_record.id IS NULL THEN
    RAISE NOTICE '邀请记录不存在或已发放奖励: %', invite_id;
    RETURN FALSE;
  END IF;
  
  -- 给邀请人发放奖励
  UPDATE users
  SET angel_balance = angel_balance + reward_amount,
      total_earned = total_earned + reward_amount
  WHERE id = invite_record.inviter_id;
  
  -- 标记奖励已发放
  UPDATE invites
  SET reward_claimed = TRUE
  WHERE id = invite_id;
  
  RAISE NOTICE '邀请奖励处理成功: 邀请ID = %, 奖励金额 = %', invite_id, reward_amount;
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '处理邀请奖励异常: %', SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 创建函数，用于处理所有未发放奖励的邀请
CREATE OR REPLACE FUNCTION process_all_pending_rewards()
RETURNS INTEGER AS $$
DECLARE
  invite_record RECORD;
  processed_count INTEGER := 0;
BEGIN
  -- 遍历所有未发放奖励的邀请记录
  FOR invite_record IN
    SELECT id FROM invites WHERE reward_claimed = FALSE
  LOOP
    IF process_invite_rewards(invite_record.id) THEN
      processed_count := processed_count + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE '处理了 % 条未发放奖励的邀请记录', processed_count;
  RETURN processed_count;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '批量处理邀请奖励异常: %', SQLERRM;
  RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

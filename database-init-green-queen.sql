-- Angel Crypto App 完整数据库初始化脚本
-- 适用于新的邀请系统（基于钱包地址）

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 创建用户表（更新版本）
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    username TEXT,
    avatar_url TEXT,
    angel_balance DECIMAL(18, 2) DEFAULT 0.00,
    referred_by UUID REFERENCES users(id),
    total_referrals INTEGER DEFAULT 0,
    total_earned DECIMAL(18, 2) DEFAULT 0.00,
    level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建邀请表（更新版本）
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID NOT NULL REFERENCES users(id),
    invitee_id UUID REFERENCES users(id),
    invitee_wallet_address TEXT,
    inviter_wallet_address TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 3),
    reward_amount DECIMAL(18, 2) DEFAULT 0.00,
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- 3. 创建奖励记录表
CREATE TABLE IF NOT EXISTS reward_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    reward_type TEXT NOT NULL CHECK (reward_type IN ('welcome', 'referral_l1', 'referral_l2', 'referral_l3', 'bonus')),
    amount DECIMAL(18, 2) NOT NULL,
    description TEXT,
    related_user_id UUID REFERENCES users(id),
    related_invitation_id UUID REFERENCES invitations(id),
    transaction_hash TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. 创建用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    wallet_address TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_wallet ON invitations(inviter_wallet_address);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee_wallet ON invitations(invitee_wallet_address);
CREATE INDEX IF NOT EXISTS idx_reward_records_user_id ON reward_records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- 6. 创建触发器函数：自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. 为用户表添加自动更新触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. 创建函数：增加推荐数量
CREATE OR REPLACE FUNCTION increment_referral_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET total_referrals = total_referrals + 1,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建函数：增加用户余额
CREATE OR REPLACE FUNCTION add_user_balance(user_id UUID, amount DECIMAL(18, 2))
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET angel_balance = angel_balance + amount,
        total_earned = total_earned + amount,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 10. 创建函数：处理邀请注册
CREATE OR REPLACE FUNCTION process_invite_registration(
  new_user_wallet TEXT,
  inviter_wallet TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  new_user_id UUID;
  inviter_id UUID;
  inviter_record RECORD;
  l2_inviter_record RECORD;
  l3_inviter_record RECORD;
  welcome_bonus DECIMAL(18, 2) := 100.00;
  reward_l1 DECIMAL(18, 2) := 50.00;
  reward_l2 DECIMAL(18, 2) := 25.00;
  reward_l3 DECIMAL(18, 2) := 10.00;
  invitation_id UUID;
BEGIN
  -- 获取新用户ID
  SELECT id INTO new_user_id FROM users WHERE wallet_address = new_user_wallet;
  
  -- 获取邀请人信息
  SELECT * INTO inviter_record FROM users WHERE wallet_address = inviter_wallet;
  
  IF inviter_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  inviter_id := inviter_record.id;
  
  -- 更新新用户的推荐关系
  UPDATE users 
  SET referred_by = inviter_id,
      updated_at = NOW()
  WHERE id = new_user_id;
  
  -- 给新用户发放欢迎奖励
  UPDATE users 
  SET angel_balance = angel_balance + welcome_bonus,
      total_earned = total_earned + welcome_bonus,
      updated_at = NOW()
  WHERE id = new_user_id;
  
  -- 记录新用户欢迎奖励
  INSERT INTO reward_records (user_id, reward_type, amount, description)
  VALUES (new_user_id, 'welcome', welcome_bonus, '新用户注册奖励');
  
  -- 创建邀请记录
  INSERT INTO invitations (
    inviter_id, 
    invitee_id, 
    invitee_wallet_address,
    inviter_wallet_address,
    status, 
    level, 
    reward_amount,
    accepted_at
  ) VALUES (
    inviter_id,
    new_user_id,
    new_user_wallet,
    inviter_wallet,
    'accepted',
    1,
    reward_l1,
    NOW()
  ) RETURNING id INTO invitation_id;
  
  -- 给一级邀请人奖励
  UPDATE users 
  SET angel_balance = angel_balance + reward_l1,
      total_earned = total_earned + reward_l1,
      total_referrals = total_referrals + 1,
      updated_at = NOW()
  WHERE id = inviter_id;
  
  -- 记录一级邀请奖励
  INSERT INTO reward_records (user_id, reward_type, amount, description, related_user_id, related_invitation_id)
  VALUES (inviter_id, 'referral_l1', reward_l1, '一级邀请奖励', new_user_id, invitation_id);
  
  -- 处理二级邀请奖励
  IF inviter_record.referred_by IS NOT NULL THEN
    SELECT * INTO l2_inviter_record FROM users WHERE id = inviter_record.referred_by;
    
    IF l2_inviter_record.id IS NOT NULL THEN
      -- 给二级邀请人奖励
      UPDATE users 
      SET angel_balance = angel_balance + reward_l2,
          total_earned = total_earned + reward_l2,
          updated_at = NOW()
      WHERE id = l2_inviter_record.id;
      
      -- 记录二级邀请奖励
      INSERT INTO reward_records (user_id, reward_type, amount, description, related_user_id, related_invitation_id)
      VALUES (l2_inviter_record.id, 'referral_l2', reward_l2, '二级邀请奖励', new_user_id, invitation_id);
      
      -- 处理三级邀请奖励
      IF l2_inviter_record.referred_by IS NOT NULL THEN
        SELECT * INTO l3_inviter_record FROM users WHERE id = l2_inviter_record.referred_by;
        
        IF l3_inviter_record.id IS NOT NULL THEN
          -- 给三级邀请人奖励
          UPDATE users 
          SET angel_balance = angel_balance + reward_l3,
              total_earned = total_earned + reward_l3,
              updated_at = NOW()
          WHERE id = l3_inviter_record.id;
          
          -- 记录三级邀请奖励
          INSERT INTO reward_records (user_id, reward_type, amount, description, related_user_id, related_invitation_id)
          VALUES (l3_inviter_record.id, 'referral_l3', reward_l3, '三级邀请奖励', new_user_id, invitation_id);
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 11. 创建函数：检查是否为新用户
CREATE OR REPLACE FUNCTION is_new_user(wallet_address TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM users WHERE wallet_address = wallet_address
  );
END;
$$ LANGUAGE plpgsql;

-- 12. 创建函数：生成邀请链接
CREATE OR REPLACE FUNCTION generate_invite_link(wallet_address TEXT, base_url TEXT DEFAULT 'https://www.angelcoin.app')
RETURNS TEXT AS $$
BEGIN
  RETURN base_url || '/invite/' || wallet_address;
END;
$$ LANGUAGE plpgsql;

-- 13. 创建函数：清理过期会话
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 14. 创建视图：邀请统计
CREATE OR REPLACE VIEW invitation_stats AS
SELECT 
  u.wallet_address,
  u.username,
  u.total_referrals,
  u.total_earned,
  u.angel_balance,
  COUNT(i.id) as total_invitations,
  COUNT(CASE WHEN i.status = 'accepted' THEN 1 END) as accepted_invitations,
  SUM(CASE WHEN i.status = 'accepted' THEN i.reward_amount ELSE 0 END) as total_rewards
FROM users u
LEFT JOIN invitations i ON u.id = i.inviter_id
GROUP BY u.id, u.wallet_address, u.username, u.total_referrals, u.total_earned, u.angel_balance;

-- 15. 创建视图：用户邀请树
CREATE OR REPLACE VIEW user_referral_tree AS
WITH RECURSIVE referral_tree AS (
  -- 根节点：没有推荐人的用户
  SELECT 
    id,
    wallet_address,
    username,
    referred_by,
    1 as level,
    ARRAY[id] as path
  FROM users 
  WHERE referred_by IS NULL
  
  UNION ALL
  
  -- 递归：查找下级用户
  SELECT 
    u.id,
    u.wallet_address,
    u.username,
    u.referred_by,
    rt.level + 1,
    rt.path || u.id
  FROM users u
  JOIN referral_tree rt ON u.referred_by = rt.id
  WHERE NOT u.id = ANY(rt.path) -- 防止循环引用
)
SELECT * FROM referral_tree;

-- 16. 插入管理员用户（可选）
INSERT INTO users (wallet_address, username, angel_balance, is_active, level)
VALUES ('0x0000000000000000000000000000000000000000', 'Admin', 10000.00, true, 1)
ON CONFLICT (wallet_address) DO NOTHING;

-- 17. 设置行级安全策略（RLS）- 重要！
-- 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Allow anonymous to read users" ON users;
DROP POLICY IF EXISTS "Allow anonymous to create users" ON users;
DROP POLICY IF EXISTS "Allow users to update own data" ON users;
DROP POLICY IF EXISTS "Allow read invitations" ON invitations;
DROP POLICY IF EXISTS "Allow create invitations" ON invitations;
DROP POLICY IF EXISTS "Allow read rewards" ON reward_records;
DROP POLICY IF EXISTS "Allow create rewards" ON reward_records;
DROP POLICY IF EXISTS "Allow manage sessions" ON user_sessions;

-- 创建新的RLS策略

-- users表策略
CREATE POLICY "Allow anonymous to read users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous to create users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update own data" ON users
    FOR UPDATE USING (true);

-- invitations表策略
CREATE POLICY "Allow read invitations" ON invitations
    FOR SELECT USING (true);

CREATE POLICY "Allow create invitations" ON invitations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update invitations" ON invitations
    FOR UPDATE USING (true);

-- reward_records表策略
CREATE POLICY "Allow read rewards" ON reward_records
    FOR SELECT USING (true);

CREATE POLICY "Allow create rewards" ON reward_records
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update rewards" ON reward_records
    FOR UPDATE USING (true);

-- user_sessions表策略
CREATE POLICY "Allow read sessions" ON user_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow create sessions" ON user_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update sessions" ON user_sessions
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete sessions" ON user_sessions
    FOR DELETE USING (true);

-- 18. 清理旧的不必要的函数和约束
DROP FUNCTION IF EXISTS process_referral_rewards(UUID, TEXT);

-- 完成提示
SELECT 'Angel Crypto App 数据库初始化完成！' AS status;
SELECT '表结构已更新为新的邀请系统版本' AS info;
SELECT '所有必要的函数和视图已创建' AS functions;
SELECT 'RLS策略已配置，允许匿名用户操作' AS rls_status; 
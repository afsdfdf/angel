-- Angel Crypto App 邀请系统数据库更新脚本
-- 简化邀请系统：使用钱包地址直接邀请，无需推荐码

-- 1. 删除不必要的字段和约束
ALTER TABLE users DROP COLUMN IF EXISTS referral_code;
ALTER TABLE invitations DROP COLUMN IF EXISTS referral_code;
ALTER TABLE invitations DROP COLUMN IF EXISTS invite_link;

-- 2. 添加新的字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS inviter_wallet_address TEXT;

-- 3. 更新邀请表结构
ALTER TABLE invitations 
  DROP CONSTRAINT IF EXISTS invitations_referral_code_key,
  ADD CONSTRAINT invitations_inviter_wallet_address_fkey 
    FOREIGN KEY (inviter_wallet_address) REFERENCES users(wallet_address);

-- 4. 创建新的索引
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_wallet ON invitations(inviter_wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- 5. 更新奖励配置常量
-- 新用户注册奖励: 100 ANGEL
-- 一级邀请奖励: 50 ANGEL  
-- 二级邀请奖励: 25 ANGEL
-- 三级邀请奖励: 10 ANGEL

-- 6. 创建函数：处理邀请注册
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

-- 7. 创建函数：检查是否为新用户
CREATE OR REPLACE FUNCTION is_new_user(wallet_address TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM users WHERE wallet_address = wallet_address
  );
END;
$$ LANGUAGE plpgsql;

-- 8. 创建函数：生成邀请链接
CREATE OR REPLACE FUNCTION generate_invite_link(wallet_address TEXT, base_url TEXT DEFAULT 'https://www.angelcoin.app')
RETURNS TEXT AS $$
BEGIN
  RETURN base_url || '/invite/' || wallet_address;
END;
$$ LANGUAGE plpgsql;

-- 9. 清理旧的不必要的函数
DROP FUNCTION IF EXISTS process_referral_rewards(UUID, TEXT);

-- 10. 更新现有数据（如果有的话）
-- 为现有用户设置默认等级
UPDATE users SET level = 1 WHERE level IS NULL;

-- 11. 创建视图：邀请统计
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

-- 12. 创建视图：用户邀请树
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

-- 完成更新
SELECT 'Angel Crypto App 邀请系统数据库更新完成' as status; 
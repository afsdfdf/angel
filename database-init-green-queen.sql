-- Angel Crypto App 数据库初始化脚本
-- 项目: Supabase-Green-Queen

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255),
    username VARCHAR(100),
    avatar_url TEXT,
    angel_balance DECIMAL(20, 8) DEFAULT 0,
    referred_by UUID REFERENCES users(id),
    total_referrals INTEGER DEFAULT 0,
    total_earned DECIMAL(20, 8) DEFAULT 0,
    level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_referred_by ON users(referred_by);

-- 创建邀请表
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inviter_id UUID NOT NULL REFERENCES users(id),
    invitee_id UUID REFERENCES users(id),
    invitee_wallet_address VARCHAR(42),
    inviter_wallet_address VARCHAR(42) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    level INTEGER NOT NULL,
    reward_amount DECIMAL(20, 8) DEFAULT 0,
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

-- 创建索引
CREATE INDEX idx_invitations_inviter_id ON invitations(inviter_id);
CREATE INDEX idx_invitations_invitee_id ON invitations(invitee_id);
CREATE INDEX idx_invitations_inviter_wallet ON invitations(inviter_wallet_address);

-- 创建奖励记录表
CREATE TABLE IF NOT EXISTS reward_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('welcome', 'referral_l1', 'referral_l2', 'referral_l3', 'bonus')),
    amount DECIMAL(20, 8) NOT NULL,
    description TEXT,
    related_user_id UUID REFERENCES users(id),
    related_invitation_id UUID REFERENCES invitations(id),
    transaction_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX idx_reward_records_user_id ON reward_records(user_id);
CREATE INDEX idx_reward_records_status ON reward_records(status);

-- 创建用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    wallet_address VARCHAR(42) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为用户表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建处理邀请注册的函数
CREATE OR REPLACE FUNCTION process_invite_registration(
    new_user_wallet VARCHAR(42),
    inviter_wallet VARCHAR(42)
)
RETURNS BOOLEAN AS $$
DECLARE
    inviter_user users%ROWTYPE;
    new_user_id UUID;
    l1_reward DECIMAL := 50;
    l2_reward DECIMAL := 25;
    l3_reward DECIMAL := 10;
BEGIN
    -- 获取邀请人信息
    SELECT * INTO inviter_user FROM users WHERE wallet_address = LOWER(inviter_wallet);
    
    IF inviter_user.id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 创建新用户（如果不存在）
    INSERT INTO users (wallet_address, referred_by, angel_balance, total_earned)
    VALUES (LOWER(new_user_wallet), inviter_user.id, 10000, 10000)
    ON CONFLICT (wallet_address) DO NOTHING
    RETURNING id INTO new_user_id;
    
    IF new_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 记录欢迎奖励
    INSERT INTO reward_records (user_id, reward_type, amount, description, status, completed_at)
    VALUES (new_user_id, 'welcome', 10000, '新用户注册奖励', 'completed', CURRENT_TIMESTAMP);
    
    -- 创建一级邀请记录
    INSERT INTO invitations (inviter_id, invitee_id, inviter_wallet_address, invitee_wallet_address, level, reward_amount, status, accepted_at)
    VALUES (inviter_user.id, new_user_id, LOWER(inviter_wallet), LOWER(new_user_wallet), 1, l1_reward, 'accepted', CURRENT_TIMESTAMP);
    
    -- 更新邀请人余额和统计
    UPDATE users 
    SET angel_balance = angel_balance + l1_reward,
        total_referrals = total_referrals + 1,
        total_earned = total_earned + l1_reward
    WHERE id = inviter_user.id;
    
    -- 记录一级邀请奖励
    INSERT INTO reward_records (user_id, reward_type, amount, description, related_user_id, status, completed_at)
    VALUES (inviter_user.id, 'referral_l1', l1_reward, '一级邀请奖励', new_user_id, 'completed', CURRENT_TIMESTAMP);
    
    -- 处理二级邀请（如果存在）
    IF inviter_user.referred_by IS NOT NULL THEN
        UPDATE users 
        SET angel_balance = angel_balance + l2_reward,
            total_earned = total_earned + l2_reward
        WHERE id = inviter_user.referred_by;
        
        -- 创建二级邀请记录
        INSERT INTO invitations (inviter_id, invitee_id, inviter_wallet_address, invitee_wallet_address, level, reward_amount, status, accepted_at)
        VALUES (inviter_user.referred_by, new_user_id, 
                (SELECT wallet_address FROM users WHERE id = inviter_user.referred_by), 
                LOWER(new_user_wallet), 2, l2_reward, 'accepted', CURRENT_TIMESTAMP);
        
        -- 记录二级邀请奖励
        INSERT INTO reward_records (user_id, reward_type, amount, description, related_user_id, status, completed_at)
        VALUES (inviter_user.referred_by, 'referral_l2', l2_reward, '二级邀请奖励', new_user_id, 'completed', CURRENT_TIMESTAMP);
        
        -- 处理三级邀请（如果存在）
        DECLARE
            l2_inviter_id UUID;
        BEGIN
            SELECT referred_by INTO l2_inviter_id FROM users WHERE id = inviter_user.referred_by;
            
            IF l2_inviter_id IS NOT NULL THEN
                UPDATE users 
                SET angel_balance = angel_balance + l3_reward,
                    total_earned = total_earned + l3_reward
                WHERE id = l2_inviter_id;
                
                -- 创建三级邀请记录
                INSERT INTO invitations (inviter_id, invitee_id, inviter_wallet_address, invitee_wallet_address, level, reward_amount, status, accepted_at)
                VALUES (l2_inviter_id, new_user_id, 
                        (SELECT wallet_address FROM users WHERE id = l2_inviter_id), 
                        LOWER(new_user_wallet), 3, l3_reward, 'accepted', CURRENT_TIMESTAMP);
                
                -- 记录三级邀请奖励
                INSERT INTO reward_records (user_id, reward_type, amount, description, related_user_id, status, completed_at)
                VALUES (l2_inviter_id, 'referral_l3', l3_reward, '三级邀请奖励', new_user_id, 'completed', CURRENT_TIMESTAMP);
            END IF;
        END;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 创建 RLS (Row Level Security) 策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读取用户信息（用于检查钱包地址）
CREATE POLICY "Allow anonymous to read users" ON users
    FOR SELECT USING (true);

-- 允许匿名用户创建新用户
CREATE POLICY "Allow anonymous to create users" ON users
    FOR INSERT WITH CHECK (true);

-- 允许用户更新自己的信息
CREATE POLICY "Allow users to update own data" ON users
    FOR UPDATE USING (true);

-- 允许读取邀请信息
CREATE POLICY "Allow read invitations" ON invitations
    FOR SELECT USING (true);

-- 允许创建邀请
CREATE POLICY "Allow create invitations" ON invitations
    FOR INSERT WITH CHECK (true);

-- 允许读取奖励记录
CREATE POLICY "Allow read rewards" ON reward_records
    FOR SELECT USING (true);

-- 允许创建奖励记录
CREATE POLICY "Allow create rewards" ON reward_records
    FOR INSERT WITH CHECK (true);

-- 允许管理会话
CREATE POLICY "Allow manage sessions" ON user_sessions
    FOR ALL USING (true);

-- 输出成功信息
DO $$
BEGIN
    RAISE NOTICE '数据库初始化完成！';
    RAISE NOTICE '请确保在 Supabase 控制面板中启用了 Row Level Security';
END $$; 
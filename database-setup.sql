-- Angel Crypto App 数据库设置脚本
-- 请在 Supabase 或其他 PostgreSQL 数据库中执行

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    username TEXT,
    avatar_url TEXT,
    angel_balance DECIMAL(18, 2) DEFAULT 0.00,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by UUID REFERENCES users(id),
    total_referrals INTEGER DEFAULT 0,
    total_earned DECIMAL(18, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建邀请表
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID NOT NULL REFERENCES users(id),
    invitee_id UUID REFERENCES users(id),
    invitee_wallet_address TEXT,
    referral_code TEXT NOT NULL,
    invite_link TEXT NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_invitations_referral_code ON invitations(referral_code);
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON invitations(inviter_id);
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

-- 10. 创建函数：处理邀请奖励
CREATE OR REPLACE FUNCTION process_referral_rewards(new_user_id UUID, referral_code TEXT)
RETURNS VOID AS $$
DECLARE
    inviter_record RECORD;
    l2_inviter_record RECORD;
    l3_inviter_record RECORD;
    reward_l1 DECIMAL(18, 2) := 500.00;
    reward_l2 DECIMAL(18, 2) := 250.00;
    reward_l3 DECIMAL(18, 2) := 100.00;
BEGIN
    -- 查找一级邀请人
    SELECT u.* INTO inviter_record
    FROM users u
    WHERE u.referral_code = referral_code;
    
    IF inviter_record.id IS NOT NULL THEN
        -- 给一级邀请人奖励
        PERFORM add_user_balance(inviter_record.id, reward_l1);
        
        -- 记录一级奖励
        INSERT INTO reward_records (user_id, reward_type, amount, description, related_user_id)
        VALUES (inviter_record.id, 'referral_l1', reward_l1, '一级邀请奖励', new_user_id);
        
        -- 查找二级邀请人
        IF inviter_record.referred_by IS NOT NULL THEN
            SELECT u.* INTO l2_inviter_record
            FROM users u
            WHERE u.id = inviter_record.referred_by;
            
            IF l2_inviter_record.id IS NOT NULL THEN
                -- 给二级邀请人奖励
                PERFORM add_user_balance(l2_inviter_record.id, reward_l2);
                
                -- 记录二级奖励
                INSERT INTO reward_records (user_id, reward_type, amount, description, related_user_id)
                VALUES (l2_inviter_record.id, 'referral_l2', reward_l2, '二级邀请奖励', new_user_id);
                
                -- 查找三级邀请人
                IF l2_inviter_record.referred_by IS NOT NULL THEN
                    SELECT u.* INTO l3_inviter_record
                    FROM users u
                    WHERE u.id = l2_inviter_record.referred_by;
                    
                    IF l3_inviter_record.id IS NOT NULL THEN
                        -- 给三级邀请人奖励
                        PERFORM add_user_balance(l3_inviter_record.id, reward_l3);
                        
                        -- 记录三级奖励
                        INSERT INTO reward_records (user_id, reward_type, amount, description, related_user_id)
                        VALUES (l3_inviter_record.id, 'referral_l3', reward_l3, '三级邀请奖励', new_user_id);
                    END IF;
                END IF;
            END IF;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 11. 创建函数：清理过期会话
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

-- 12. 插入一些示例数据（可选）
-- 注意：这些是示例数据，生产环境中请删除

-- 创建管理员用户
INSERT INTO users (wallet_address, username, referral_code, angel_balance, is_active)
VALUES ('0x0000000000000000000000000000000000000000', 'Admin', 'ADMIN001', 10000.00, true)
ON CONFLICT (wallet_address) DO NOTHING;

-- 设置行级安全策略（RLS）- 可选
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reward_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 创建基本的 RLS 策略
-- CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
-- CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

COMMIT;

-- 执行完成提示
SELECT 'Angel Crypto App 数据库设置完成！' AS status; 
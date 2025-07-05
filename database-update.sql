-- Angel Crypto App 数据库安全更新脚本
-- 此脚本会检查现有对象，只添加缺失的部分

-- 1. 安全地创建用户表（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
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
        RAISE NOTICE 'Created table: users';
    ELSE
        RAISE NOTICE 'Table users already exists';
        
        -- 检查并添加缺失的列
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'angel_balance') THEN
            ALTER TABLE users ADD COLUMN angel_balance DECIMAL(18, 2) DEFAULT 0.00;
            RAISE NOTICE 'Added column: angel_balance';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_earned') THEN
            ALTER TABLE users ADD COLUMN total_earned DECIMAL(18, 2) DEFAULT 0.00;
            RAISE NOTICE 'Added column: total_earned';
        END IF;
    END IF;
END $$;

-- 2. 安全地创建邀请表（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invitations') THEN
        CREATE TABLE invitations (
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
        RAISE NOTICE 'Created table: invitations';
    ELSE
        RAISE NOTICE 'Table invitations already exists';
    END IF;
END $$;

-- 3. 安全地创建奖励记录表（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reward_records') THEN
        CREATE TABLE reward_records (
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
        RAISE NOTICE 'Created table: reward_records';
    ELSE
        RAISE NOTICE 'Table reward_records already exists';
    END IF;
END $$;

-- 4. 安全地创建用户会话表（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
        CREATE TABLE user_sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id),
            wallet_address TEXT NOT NULL,
            session_token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created table: user_sessions';
    ELSE
        RAISE NOTICE 'Table user_sessions already exists';
    END IF;
END $$;

-- 5. 安全地创建索引
DO $$
BEGIN
    -- 用户表索引
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_wallet_address') THEN
        CREATE INDEX idx_users_wallet_address ON users(wallet_address);
        RAISE NOTICE 'Created index: idx_users_wallet_address';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_referral_code') THEN
        CREATE INDEX idx_users_referral_code ON users(referral_code);
        RAISE NOTICE 'Created index: idx_users_referral_code';
    END IF;
    
    -- 邀请表索引
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invitations_referral_code') THEN
        CREATE INDEX idx_invitations_referral_code ON invitations(referral_code);
        RAISE NOTICE 'Created index: idx_invitations_referral_code';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invitations_inviter_id') THEN
        CREATE INDEX idx_invitations_inviter_id ON invitations(inviter_id);
        RAISE NOTICE 'Created index: idx_invitations_inviter_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invitations_invitee_wallet') THEN
        CREATE INDEX idx_invitations_invitee_wallet ON invitations(invitee_wallet_address);
        RAISE NOTICE 'Created index: idx_invitations_invitee_wallet';
    END IF;
    
    -- 奖励记录表索引
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reward_records_user_id') THEN
        CREATE INDEX idx_reward_records_user_id ON reward_records(user_id);
        RAISE NOTICE 'Created index: idx_reward_records_user_id';
    END IF;
    
    -- 会话表索引
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sessions_token') THEN
        CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
        RAISE NOTICE 'Created index: idx_user_sessions_token';
    END IF;
END $$;

-- 6. 安全地创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. 安全地创建触发器
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created trigger: update_users_updated_at';
    ELSE
        RAISE NOTICE 'Trigger update_users_updated_at already exists';
    END IF;
END $$;

-- 8. 创建或替换数据库函数
CREATE OR REPLACE FUNCTION increment_referral_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET total_referrals = total_referrals + 1,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

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

-- 9. 创建管理员用户（如果不存在）
INSERT INTO users (wallet_address, username, referral_code, angel_balance, is_active)
VALUES ('0x0000000000000000000000000000000000000000', 'Admin', 'ADMIN001', 10000.00, true)
ON CONFLICT (wallet_address) DO NOTHING;

-- 完成提示
SELECT 'Angel Crypto App 数据库安全更新完成！' AS status; 
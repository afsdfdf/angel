-- Angel Crypto App 简化版数据库设置脚本

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT,
    angel_balance DECIMAL(18, 2) DEFAULT 10000.00,
    invites_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建邀请表
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID NOT NULL REFERENCES users(id),
    invitee_wallet_address TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee_wallet ON invitations(invitee_wallet_address);

-- 4. 创建函数：检查用户是否存在
CREATE OR REPLACE FUNCTION is_user_exists(wallet TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM users WHERE wallet_address = wallet) INTO user_exists;
    RETURN user_exists;
END;
$$ LANGUAGE plpgsql;

-- 5. 创建函数：处理邀请注册
CREATE OR REPLACE FUNCTION process_invite_registration(new_user_wallet TEXT, inviter_wallet TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    inviter_id UUID;
    new_user_id UUID;
    l1_reward DECIMAL(18, 2) := 3000.00;
    l2_reward DECIMAL(18, 2) := 1500.00;
    l3_reward DECIMAL(18, 2) := 500.00;
BEGIN
    -- 检查新用户是否已存在
    IF is_user_exists(new_user_wallet) THEN
        RETURN FALSE;
    END IF;
    
    -- 获取邀请人ID
    SELECT id INTO inviter_id FROM users WHERE wallet_address = inviter_wallet;
    
    -- 如果邀请人不存在，返回失败
    IF inviter_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 创建新用户
    INSERT INTO users (wallet_address, angel_balance, created_at)
    VALUES (new_user_wallet, 10000.00, NOW())
    RETURNING id INTO new_user_id;
    
    -- 创建邀请记录
    INSERT INTO invitations (inviter_id, invitee_wallet_address, status, created_at, accepted_at)
    VALUES (inviter_id, new_user_wallet, 'accepted', NOW(), NOW());
    
    -- 增加邀请人的邀请计数
    UPDATE users SET invites_count = invites_count + 1 WHERE id = inviter_id;
    
    -- 给邀请人奖励
    UPDATE users SET angel_balance = angel_balance + l1_reward WHERE id = inviter_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 6. 插入一个测试管理员用户
INSERT INTO users (wallet_address, username, angel_balance, invites_count)
VALUES ('0x0000000000000000000000000000000000000000', 'Admin', 100000.00, 0)
ON CONFLICT (wallet_address) DO NOTHING;

-- 执行完成提示
SELECT 'Angel Crypto App 简化版数据库设置完成！' AS status; 
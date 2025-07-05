-- Angel Crypto App - Supabase 数据库初始化脚本
-- 执行前请确保已启用以下扩展：
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pg_cron"; -- 可选，用于定时任务

-- ====================================
-- 1. 创建基础表结构
-- ====================================

-- 用户表
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    username TEXT,
    avatar_url TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by UUID REFERENCES public.users(id),
    total_referrals INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 邀请表
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    invitee_wallet_address TEXT,
    invitee_id UUID REFERENCES public.users(id),
    referral_code TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired')),
    reward_amount DECIMAL(18, 8) DEFAULT 100,
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- 用户会话表
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 代币信息表
CREATE TABLE IF NOT EXISTS public.tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    contract_address TEXT,
    decimals INTEGER DEFAULT 18,
    logo_url TEXT,
    chain_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(symbol, chain_id)
);

-- 流动性池表
CREATE TABLE IF NOT EXISTS public.liquidity_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token0_id UUID NOT NULL REFERENCES public.tokens(id),
    token1_id UUID NOT NULL REFERENCES public.tokens(id),
    pool_address TEXT NOT NULL,
    chain_id INTEGER NOT NULL,
    fee_tier INTEGER DEFAULT 3000,
    total_value_locked DECIMAL(18, 8) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(token0_id, token1_id, chain_id)
);

-- 用户流动性提供记录
CREATE TABLE IF NOT EXISTS public.user_liquidity_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pool_id UUID NOT NULL REFERENCES public.liquidity_pools(id),
    lp_token_amount DECIMAL(18, 8) NOT NULL,
    token0_amount DECIMAL(18, 8) NOT NULL,
    token1_amount DECIMAL(18, 8) NOT NULL,
    transaction_hash TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 交易记录表
CREATE TABLE IF NOT EXISTS public.swap_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_in_id UUID NOT NULL REFERENCES public.tokens(id),
    token_out_id UUID NOT NULL REFERENCES public.tokens(id),
    amount_in DECIMAL(18, 8) NOT NULL,
    amount_out DECIMAL(18, 8) NOT NULL,
    transaction_hash TEXT UNIQUE NOT NULL,
    chain_id INTEGER NOT NULL,
    gas_used DECIMAL(18, 8),
    gas_price DECIMAL(18, 8),
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 2. 创建索引
-- ====================================

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);

-- 邀请表索引
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON public.invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invitations_referral_code ON public.invitations(referral_code);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- 会话表索引
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- 代币表索引
CREATE INDEX IF NOT EXISTS idx_tokens_symbol_chain ON public.tokens(symbol, chain_id);
CREATE INDEX IF NOT EXISTS idx_tokens_contract_address ON public.tokens(contract_address);

-- 流动性池索引
CREATE INDEX IF NOT EXISTS idx_liquidity_pools_tokens ON public.liquidity_pools(token0_id, token1_id);
CREATE INDEX IF NOT EXISTS idx_liquidity_pools_chain ON public.liquidity_pools(chain_id);

-- 用户流动性位置索引
CREATE INDEX IF NOT EXISTS idx_user_liquidity_user_id ON public.user_liquidity_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_liquidity_pool_id ON public.user_liquidity_positions(pool_id);

-- 交易记录索引
CREATE INDEX IF NOT EXISTS idx_swap_transactions_user_id ON public.swap_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_transactions_hash ON public.swap_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_swap_transactions_created_at ON public.swap_transactions(created_at);

-- ====================================
-- 3. 创建函数
-- ====================================

-- 更新时间戳函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 增加推荐数量函数
CREATE OR REPLACE FUNCTION public.increment_referral_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET total_referrals = total_referrals + 1,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 生成唯一推荐码函数
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_code BOOLEAN;
BEGIN
    LOOP
        -- 生成8位随机字符串
        code := 'ANGEL' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 3));
        
        -- 检查是否已存在
        SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = code) INTO exists_code;
        
        -- 如果不存在则返回
        IF NOT exists_code THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 清理过期会话函数
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_sessions 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 获取用户统计信息函数
CREATE OR REPLACE FUNCTION public.get_user_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_referrals', COALESCE(u.total_referrals, 0),
        'active_invitations', COALESCE(inv_count.count, 0),
        'total_swaps', COALESCE(swap_count.count, 0),
        'total_liquidity_positions', COALESCE(lp_count.count, 0)
    ) INTO result
    FROM public.users u
    LEFT JOIN (
        SELECT inviter_id, COUNT(*) as count
        FROM public.invitations
        WHERE status = 'pending'
        GROUP BY inviter_id
    ) inv_count ON u.id = inv_count.inviter_id
    LEFT JOIN (
        SELECT user_id, COUNT(*) as count
        FROM public.swap_transactions
        WHERE status = 'success'
        GROUP BY user_id
    ) swap_count ON u.id = swap_count.user_id
    LEFT JOIN (
        SELECT user_id, COUNT(*) as count
        FROM public.user_liquidity_positions
        WHERE is_active = true
        GROUP BY user_id
    ) lp_count ON u.id = lp_count.user_id
    WHERE u.id = user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 4. 创建触发器
-- ====================================

-- 用户表更新时间戳触发器
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- 用户流动性位置更新时间戳触发器
CREATE TRIGGER update_user_liquidity_positions_updated_at 
    BEFORE UPDATE ON public.user_liquidity_positions 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- 5. 启用行级安全策略 (RLS)
-- ====================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_liquidity_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_transactions ENABLE ROW LEVEL SECURITY;

-- ====================================
-- 6. 创建 RLS 策略
-- ====================================

-- 用户表策略
CREATE POLICY "Users can view own profile" ON public.users 
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users 
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can view referral codes" ON public.users 
    FOR SELECT USING (true);

-- 邀请表策略
CREATE POLICY "Users can view own invitations" ON public.invitations 
    FOR SELECT USING (auth.uid()::text = inviter_id::text);

CREATE POLICY "Users can create invitations" ON public.invitations 
    FOR INSERT WITH CHECK (auth.uid()::text = inviter_id::text);

CREATE POLICY "Users can update own invitations" ON public.invitations 
    FOR UPDATE USING (auth.uid()::text = inviter_id::text);

-- 会话表策略
CREATE POLICY "Users can view own sessions" ON public.user_sessions 
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create sessions" ON public.user_sessions 
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own sessions" ON public.user_sessions 
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- 代币表策略（公开只读）
CREATE POLICY "Anyone can view tokens" ON public.tokens 
    FOR SELECT USING (true);

-- 流动性池策略（公开只读）
CREATE POLICY "Anyone can view liquidity pools" ON public.liquidity_pools 
    FOR SELECT USING (true);

-- 用户流动性位置策略
CREATE POLICY "Users can view own liquidity positions" ON public.user_liquidity_positions 
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create liquidity positions" ON public.user_liquidity_positions 
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own liquidity positions" ON public.user_liquidity_positions 
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 交易记录策略
CREATE POLICY "Users can view own transactions" ON public.swap_transactions 
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create transactions" ON public.swap_transactions 
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- ====================================
-- 7. 插入初始数据
-- ====================================

-- 插入主要代币
INSERT INTO public.tokens (symbol, name, contract_address, decimals, chain_id, logo_url) VALUES
-- Ethereum 主网 (Chain ID: 1)
('ETH', 'Ethereum', NULL, 18, 1, '/tokens/eth.svg'),
('USDC', 'USD Coin', '0xa0b86a33e6f792c4f101a44e8c3b8c7e6f6e4b3b', 6, 1, '/tokens/usdc.svg'),
('USDT', 'Tether USD', '0xdac17f958d2ee523a2206206994597c13d831ec7', 6, 1, '/tokens/usdt.svg'),

-- BSC 主网 (Chain ID: 56)
('BNB', 'BNB', NULL, 18, 56, '/tokens/bnb.svg'),
('BUSD', 'Binance USD', '0xe9e7cea3dedca5984780bafc599bd69add087d56', 18, 56, '/tokens/busd.svg'),
('USDT', 'Tether USD', '0x55d398326f99059ff775485246999027b3197955', 18, 56, '/tokens/usdt.svg'),
('BTCB', 'Bitcoin BEP2', '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', 18, 56, '/tokens/btcb.svg'),

-- Polygon 主网 (Chain ID: 137)
('MATIC', 'Polygon', NULL, 18, 137, '/tokens/matic.svg'),
('USDC', 'USD Coin', '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', 6, 137, '/tokens/usdc.svg'),
('USDT', 'Tether USD', '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 6, 137, '/tokens/usdt.svg')

ON CONFLICT (symbol, chain_id) DO NOTHING;

-- 插入示例流动性池
INSERT INTO public.liquidity_pools (token0_id, token1_id, pool_address, chain_id, fee_tier) 
SELECT 
    t1.id, t2.id, 
    '0x' || encode(gen_random_bytes(20), 'hex'), -- 生成示例地址
    56, 3000
FROM public.tokens t1, public.tokens t2 
WHERE t1.symbol = 'BNB' AND t2.symbol = 'USDT' AND t1.chain_id = 56 AND t2.chain_id = 56
ON CONFLICT (token0_id, token1_id, chain_id) DO NOTHING;

-- ====================================
-- 8. 创建定时任务（可选）
-- ====================================

-- 每天凌晨清理过期会话
-- 需要启用 pg_cron 扩展
-- SELECT cron.schedule('cleanup-expired-sessions', '0 0 * * *', 'SELECT public.cleanup_expired_sessions();');

-- ====================================
-- 9. 添加表注释
-- ====================================

COMMENT ON TABLE public.users IS '用户信息表';
COMMENT ON TABLE public.invitations IS '邀请记录表';
COMMENT ON TABLE public.user_sessions IS '用户会话表';
COMMENT ON TABLE public.tokens IS '代币信息表';
COMMENT ON TABLE public.liquidity_pools IS '流动性池表';
COMMENT ON TABLE public.user_liquidity_positions IS '用户流动性提供记录表';
COMMENT ON TABLE public.swap_transactions IS '交易记录表';

-- 添加列注释
COMMENT ON COLUMN public.users.wallet_address IS '钱包地址';
COMMENT ON COLUMN public.users.referral_code IS '推荐码';
COMMENT ON COLUMN public.users.referred_by IS '推荐人ID';
COMMENT ON COLUMN public.users.total_referrals IS '总推荐数';

COMMENT ON COLUMN public.invitations.inviter_id IS '邀请人ID';
COMMENT ON COLUMN public.invitations.invitee_wallet_address IS '被邀请人钱包地址';
COMMENT ON COLUMN public.invitations.referral_code IS '使用的推荐码';
COMMENT ON COLUMN public.invitations.status IS '邀请状态: pending, accepted, expired';
COMMENT ON COLUMN public.invitations.reward_amount IS '奖励金额';
COMMENT ON COLUMN public.invitations.reward_claimed IS '奖励是否已领取';

-- ====================================
-- 10. 执行完成提示
-- ====================================

DO $$
BEGIN
    RAISE NOTICE '数据库初始化完成！';
    RAISE NOTICE '已创建表: users, invitations, user_sessions, tokens, liquidity_pools, user_liquidity_positions, swap_transactions';
    RAISE NOTICE '已创建索引和触发器';
    RAISE NOTICE '已启用行级安全策略 (RLS)';
    RAISE NOTICE '已插入初始代币数据';
    RAISE NOTICE '请确保在 Supabase 项目中配置环境变量';
END $$; 
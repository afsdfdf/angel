
-- 创建安全的用户数据获取函数
CREATE OR REPLACE FUNCTION get_user_data(wallet_addr TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'wallet_address', wallet_address,
    'username', username,
    'email', email,
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
  ) INTO result
  FROM users
  WHERE wallet_address = wallet_addr;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

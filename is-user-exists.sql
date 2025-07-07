
-- 创建检查用户是否存在的函数
CREATE OR REPLACE FUNCTION is_user_exists(wallet TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- 检查用户是否存在
  SELECT EXISTS (
    SELECT 1 FROM users WHERE wallet_address = wallet
  ) INTO user_exists;
  
  RETURN user_exists;
EXCEPTION WHEN OTHERS THEN
  -- 如果发生任何错误，返回 false
  RETURN false;
END;
$$ LANGUAGE plpgsql;

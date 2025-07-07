
-- 创建数据库健康检查函数
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS BOOLEAN AS $$
BEGIN
  -- 简单返回 true 表示数据库连接正常
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  -- 如果发生任何错误，返回 false
  RETURN false;
END;
$$ LANGUAGE plpgsql;

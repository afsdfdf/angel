-- Angel Crypto App 数据库重置脚本
-- 警告：此脚本将删除所有现有数据！

-- 1. 删除所有表（按依赖关系顺序）
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS reward_records CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. 删除所有函数
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS increment_referral_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS add_user_balance(UUID, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS process_invite_registration(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS is_new_user(TEXT) CASCADE;
DROP FUNCTION IF EXISTS generate_invite_link(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_sessions() CASCADE;

-- 3. 删除所有视图
DROP VIEW IF EXISTS invitation_stats CASCADE;
DROP VIEW IF EXISTS user_referral_tree CASCADE;

-- 4. 删除所有索引（如果存在）
-- 注意：删除表时会自动删除索引

-- 5. 重置序列（如果有的话）
-- 注意：UUID主键不需要序列

-- 完成提示
SELECT '数据库重置完成！所有表、函数和视图已删除。' AS status;
SELECT '请运行 database-init-green-queen.sql 重新初始化数据库。' AS next_step; 
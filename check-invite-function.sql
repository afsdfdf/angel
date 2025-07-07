-- 检查邀请函数是否存在和可用的SQL脚本
-- 在 Supabase SQL 编辑器中运行此脚本

-- 1. 检查函数是否存在
SELECT 
  routine_name, 
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'process_invite_registration';

-- 2. 查看函数定义
SELECT 
  proname as function_name,
  prosrc as function_source,
  proargtypes as argument_types
FROM pg_proc 
WHERE proname = 'process_invite_registration';

-- 3. 检查函数权限
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.routine_privileges 
WHERE routine_name = 'process_invite_registration';

-- 4. 测试函数调用（使用无效参数）
SELECT process_invite_registration(
  '0x0000000000000000000000000000000000000000',
  '0x0000000000000000000000000000000000000000'
);

-- 5. 检查相关表是否存在
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name IN ('users', 'invitations', 'reward_records')
ORDER BY table_name;

-- 6. 检查表结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 7. 检查RLS策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('users', 'invitations', 'reward_records');

-- 8. 检查当前用户权限
SELECT 
  current_user,
  session_user,
  current_database(),
  current_schema();

-- 9. 列出所有自定义函数
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name; 
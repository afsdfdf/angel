# 数据库重置指南

## 问题描述

如果遇到以下问题，需要重置数据库：

1. **用户创建失败** - 返回null或权限错误
2. **用户查询失败** - RLS策略过于严格
3. **表结构不匹配** - 新旧版本表结构冲突
4. **RLS策略问题** - 权限配置错误

## 解决步骤

### 1. 备份现有数据（可选）

如果需要保留现有数据，请先导出：

```sql
-- 在Supabase SQL编辑器中执行
SELECT * FROM users;
SELECT * FROM invitations;
SELECT * FROM reward_records;
SELECT * FROM user_sessions;
```

### 2. 重置数据库

在Supabase SQL编辑器中执行以下脚本：

```sql
-- 1. 运行重置脚本
\i database-reset.sql

-- 2. 运行初始化脚本
\i database-init-green-queen.sql
```

或者直接复制粘贴脚本内容到SQL编辑器执行。

### 3. 验证修复

访问测试页面验证修复结果：

```
http://localhost:3000/test-db
```

应该看到所有测试都通过：
- ✅ 数据库连接
- ✅ 表结构
- ✅ 创建用户
- ✅ 获取用户
- ✅ RLS策略

## 主要修复内容

### RLS策略配置

新的RLS策略允许匿名用户进行基本操作：

```sql
-- users表策略
CREATE POLICY "Allow anonymous to read users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous to create users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update own data" ON users
    FOR UPDATE USING (true);
```

### 表结构更新

- 移除了过时的`referral_code`字段
- 统一使用`wallet_address`作为主要标识
- 优化了索引和约束

### 函数和视图

- 添加了完整的邀请处理函数
- 创建了统计视图
- 添加了用户推荐树视图

## 注意事项

1. **数据丢失** - 重置会删除所有现有数据
2. **环境变量** - 确保`.env.local`文件配置正确
3. **权限检查** - 重置后检查Supabase项目权限设置

## 故障排除

### 如果重置后仍有问题：

1. **检查环境变量**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

2. **检查Supabase项目状态**
   - 确认项目处于活跃状态
   - 检查API密钥权限

3. **检查网络连接**
   - 确认可以访问Supabase
   - 检查防火墙设置

### 联系支持

如果问题持续存在，请提供：
- 错误日志
- 测试页面截图
- 环境变量配置（隐藏敏感信息）

## 预防措施

1. **定期备份** - 重要数据定期导出
2. **测试环境** - 在测试环境验证更改
3. **版本控制** - 数据库脚本纳入版本控制
4. **监控** - 定期检查数据库健康状态 
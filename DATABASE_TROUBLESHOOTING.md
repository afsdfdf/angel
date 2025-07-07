# 数据库故障排除指南

## 问题概述

在Angel Crypto App项目中，我们遇到了数据库连接问题。经过诊断，我们发现以下几个问题：

1. Supabase API密钥无效（401 Unauthorized错误）
2. 网络连接问题（ETIMEDOUT错误）

## 解决方案

我们采取了以下步骤来解决这些问题：

### 1. 创建简化版数据库服务

我们创建了一个简化版的数据库服务（`lib/database-simple.ts`），专注于基本功能，移除复杂类型和错误处理。这个服务提供以下功能：

- 测试数据库连接
- 获取用户
- 创建用户
- 获取邀请链接
- 处理邀请

### 2. 创建简化版数据库初始化脚本

我们创建了一个简化版的数据库初始化脚本（`database-simple.sql`），包含以下内容：

- 创建用户表
- 创建邀请表
- 创建必要的索引
- 创建函数：检查用户是否存在
- 创建函数：处理邀请注册
- 插入测试管理员用户

### 3. 创建诊断工具

我们创建了以下诊断工具来帮助排查问题：

- `diagnose-database.js`：测试数据库连接、检查表结构、检查RLS策略、检查数据库函数
- `check-supabase.js`：检查Supabase项目是否存在、检查API密钥是否有效

### 4. 更新配置

我们更新了`lib/config.ts`文件，确保使用正确的Supabase凭据：

```typescript
supabase: {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://onfplwhsmtvmkssyisot.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnBsd2hzbXR2bWtzc3lpc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5MDQ3MjAsImV4cCI6MjAzMzQ4MDcyMH0.Nh1ygL-IVDxIXmNs8QfVfIQrRJUQyWzXYoVpkZLgDCE',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
}
```

### 5. 创建测试页面

我们创建了一个测试页面（`app/test-db-simple/page.tsx`）来测试数据库功能：

- 测试数据库连接
- 查询用户
- 创建用户
- 处理邀请

## 后续步骤

要完全解决数据库连接问题，请按照以下步骤操作：

1. 创建新的Supabase项目：
   - 访问 https://supabase.com 并登录
   - 创建新项目
   - 获取项目URL和API密钥

2. 更新项目配置：
   - 创建`.env.local`文件，填入Supabase URL和API密钥
   - 或者直接更新`lib/config.ts`文件

3. 初始化数据库：
   - 在Supabase仪表板中，打开SQL编辑器
   - 运行`database-simple.sql`脚本

4. 测试连接：
   - 运行`node check-supabase.js`
   - 访问`/test-db-simple`页面

## 常见问题

### 401 Unauthorized错误

这表示API密钥无效。请检查：
- API密钥是否正确复制
- 是否使用了正确的密钥类型（anon key）
- 项目是否已暂停或删除

### ETIMEDOUT错误

这表示网络连接问题。请检查：
- 网络连接是否正常
- 是否有防火墙阻止连接
- 是否需要代理服务器

### 表不存在错误

这表示数据库初始化脚本未运行。请：
- 在Supabase仪表板中运行初始化脚本
- 检查脚本是否有语法错误

## 结论

通过创建简化版的数据库服务和诊断工具，我们能够更容易地排查和解决数据库连接问题。请按照上述步骤操作，确保数据库连接正常工作。 
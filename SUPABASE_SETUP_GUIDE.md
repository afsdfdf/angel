# Supabase设置指南

## 简介

本指南将帮助您设置Supabase项目，并将其与Angel Crypto App连接。Supabase是一个开源的Firebase替代品，提供数据库、认证、存储等服务。

## 步骤1：创建Supabase项目

1. 访问[Supabase官网](https://supabase.com)并登录（如果没有账号，请先注册）
2. 点击"New Project"按钮
3. 填写项目详情：
   - 组织：选择您的组织或创建新组织
   - 项目名称：输入"angel-crypto-app"或您喜欢的名称
   - 数据库密码：设置一个强密码并保存好
   - 区域：选择离您最近的区域
4. 点击"Create new project"按钮
5. 等待项目创建完成（约需1-2分钟）

## 步骤2：获取API凭据

1. 在项目仪表板中，点击左侧导航栏中的"Settings"
2. 点击"API"选项
3. 复制以下信息：
   - Project URL：项目URL
   - anon public：匿名公共密钥
   - service_role：服务角色密钥（仅在需要管理员权限时使用）

## 步骤3：配置环境变量

1. 在项目根目录创建`.env.local`文件（如果已存在，请编辑它）
2. 添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=您的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的匿名公共密钥
SUPABASE_SERVICE_ROLE_KEY=您的服务角色密钥
```

## 步骤4：初始化数据库

1. 在Supabase仪表板中，点击"SQL Editor"
2. 点击"New Query"按钮
3. 复制`database-simple.sql`文件中的内容并粘贴到查询编辑器中
4. 点击"Run"按钮执行SQL脚本

## 步骤5：测试连接

1. 运行以下命令测试Supabase连接：

```bash
node check-supabase.js
```

2. 如果连接成功，您将看到"API密钥有效!"消息

## 步骤6：启动应用

1. 启动开发服务器：

```bash
pnpm dev
```

2. 访问`http://localhost:3000/test-db-simple`测试数据库功能

## 常见问题

### 连接错误

如果遇到连接错误，请检查：

1. 环境变量是否正确设置
2. Supabase项目是否已创建并运行
3. 网络连接是否正常

### 401 Unauthorized错误

如果遇到401错误，请检查：

1. API密钥是否正确复制
2. 是否使用了正确的密钥类型（anon key）

### 表不存在错误

如果遇到表不存在错误，请确保已执行数据库初始化脚本。

## 高级配置

### 行级安全策略（RLS）

Supabase默认启用RLS，这意味着未经授权的用户无法访问数据。要配置RLS：

1. 在Supabase仪表板中，点击"Authentication"
2. 点击"Policies"选项
3. 为每个表添加适当的策略

### 数据库备份

Supabase自动备份您的数据库，但您也可以手动备份：

1. 在Supabase仪表板中，点击"Database"
2. 点击"Backups"选项
3. 点击"Create Backup"按钮

## 结论

现在您已成功设置Supabase项目并将其与Angel Crypto App连接。如果遇到任何问题，请参考[Supabase文档](https://supabase.com/docs)或使用我们的诊断工具进行排查。 
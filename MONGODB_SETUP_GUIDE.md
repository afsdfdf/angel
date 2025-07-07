# MongoDB Atlas 设置指南

本文档将指导您如何设置MongoDB Atlas数据库，以供Angel Crypto应用使用。

## 步骤1: 创建MongoDB Atlas账户

1. 访问 [MongoDB Atlas官网](https://www.mongodb.com/cloud/atlas/register)
2. 注册一个新账户或使用现有账户登录
3. 选择"Free"计划（这提供一个免费的共享集群）

## 步骤2: 创建新集群

1. 选择"Build a Cluster"
2. 选择免费计划 (M0 Sandbox)
3. 选择您偏好的云提供商和区域（离您或您的用户最近的区域）
4. 点击"Create Cluster"（集群创建可能需要几分钟）

## 步骤3: 设置数据库访问权限

1. 在左侧导航栏中，点击"Database Access"
2. 点击"Add New Database User"
3. 创建用户名和密码（确保使用强密码并保存好它）
4. 在"Database User Privileges"中选择"Atlas admin"
5. 点击"Add User"

## 步骤4: 设置网络访问权限

1. 在左侧导航栏中，点击"Network Access"
2. 点击"Add IP Address"
3. 选择"Allow Access from Anywhere"（或设置特定IP地址）
4. 点击"Confirm"

## 步骤5: 获取连接字符串

1. 在左侧导航栏中，点击"Databases"
2. 找到您的集群，点击"Connect"
3. 选择"Connect your application"
4. 选择驱动类型为"Node.js"和最新版本
5. 复制连接字符串（它看起来像这样：`mongodb+srv://username:<password>@clustername.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`）
6. 替换`<password>`为您之前创建的密码
7. 将`myFirstDatabase`替换为`angel-crypto`

## 步骤6: 配置环境变量

1. 在您的项目根目录中，将env.example复制为.env.local
2. 编辑.env.local文件，设置以下变量：

```
MONGODB_URI=mongodb+srv://username:password@clustername.mongodb.net/angel-crypto?retryWrites=true&w=majority
MONGODB_DB_NAME=angel-crypto
```

## 步骤7: 初始化数据库

运行以下命令初始化数据库集合和索引：

```bash
npm run init-mongodb
# 或
yarn init-mongodb
# 或 
pnpm init-mongodb
```

这将创建所需的集合和索引，并设置初始管理员用户。

## 使用提示

1. **客户端代码访问**：客户端代码将通过API端点访问数据，不应直接连接到MongoDB。

2. **数据验证**：确保在服务器端API中实现适当的数据验证，以保护数据库免受无效或恶意数据的影响。

3. **备份**：考虑定期备份您的数据库。MongoDB Atlas提供了自动备份功能。

4. **监控**：使用MongoDB Atlas提供的监控工具来监控数据库性能和使用情况。

## 故障排除

如果您遇到连接问题：

1. **检查连接字符串**：确保连接字符串中的用户名、密码和集群名称正确。

2. **检查网络访问**：确保您的应用程序的IP地址已添加到MongoDB Atlas的IP白名单中。

3. **检查用户权限**：确保数据库用户有足够的权限。

4. **检查日志**：查看应用程序日志以获取更详细的错误信息。

5. **测试连接**：使用MongoDB Compass或MongoDB Shell测试连接。

如需更多帮助，请参考[MongoDB Atlas文档](https://docs.atlas.mongodb.com/)。 
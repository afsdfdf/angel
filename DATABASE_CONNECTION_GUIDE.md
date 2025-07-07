# 数据库连接问题解决指南

## 问题概述

我们的应用在连接 Supabase 数据库时遇到了两个主要问题：

1. **权限问题**：使用 anon 密钥无法直接访问 `users` 表（返回 401 错误和 "permission denied for table users"）
2. **代理问题**：系统代理设置（`127.0.0.1:7897`）可能会影响某些连接功能

## 核心原因

经过诊断，我们发现主要问题是 **Supabase 的安全设计**：

- Supabase 使用 Row Level Security (RLS) 策略来保护数据
- anon 密钥（客户端密钥）被设计为有限权限，不能直接访问敏感表（如 `users` 表）
- 这是预期行为，不是 bug

## 解决方案

我们创建了三个新文件来解决这些问题：

1. `lib/database-connection-fix.ts` - 解决代理和连接问题
2. `lib/database-rpc.ts` - 使用 RPC 函数而不是直接查询表
3. `supabase-rpc-functions.sql` - 在 Supabase 中创建必要的 RPC 函数

### 步骤 1：设置 Supabase RPC 函数

1. 登录 Supabase 管理控制台
2. 转到 SQL 编辑器
3. 创建新查询
4. 粘贴 `supabase-rpc-functions.sql` 中的所有内容
5. 运行查询以创建所有 RPC 函数

### 步骤 2：在项目中使用新的数据库服务

将现有的数据库调用替换为新的 RPC 方法：

```typescript
// 旧方法 - 直接查询表（会失败）
import { DatabaseService } from './lib/database';

const user = await DatabaseService.getUserByWalletAddress(walletAddress);

// 新方法 - 使用 RPC 函数（会成功）
import { DatabaseRpcService } from './lib/database-rpc';

const user = await DatabaseRpcService.getUserByWalletAddress(walletAddress);
```

### 步骤 3：更新项目中的导入

在所有使用数据库服务的文件中，更新导入语句：

```typescript
// 将这个:
import { DatabaseService } from '../lib/database';

// 替换为:
import { DatabaseRpcService as DatabaseService } from '../lib/database-rpc';
```

这样可以保持代码其余部分不变，只需更改导入。

## 新的数据库服务方法

`DatabaseRpcService` 提供以下方法：

- `isHealthy()` - 检查数据库连接是否正常
- `isUserExists(walletAddress)` - 检查用户是否存在
- `getUserByWalletAddress(walletAddress)` - 通过钱包地址获取用户
- `createUser(userData)` - 创建用户
- `processInviteRegistration(newUserWallet, inviterWallet)` - 处理邀请注册
- `getUserInvitations(userId)` - 获取用户邀请记录
- `getRewardRecords(userId)` - 获取用户奖励记录
- `getAllUsers()` - 获取所有用户（仅管理员可用）
- `generateInviteLink(walletAddress, baseUrl?)` - 生成邀请链接
- `diagnoseDatabase()` - 诊断数据库问题

## 测试连接

我们提供了一个测试脚本来验证新的连接方法是否有效：

```bash
node test-database-rpc.js
```

## 最佳实践

1. **使用 RPC 函数**：对于需要直接访问敏感表的操作，使用 RPC 函数
2. **使用 API 端点**：对于复杂操作，创建服务器端 API 端点
3. **避免直接查询**：避免在客户端直接查询敏感表
4. **处理代理问题**：如果系统使用代理，确保使用自定义 fetch 函数绕过代理

## 故障排除

如果遇到连接问题：

1. 检查 Supabase 项目状态
2. 验证 RPC 函数是否已正确创建
3. 确保使用了正确的 Supabase URL 和 API 密钥
4. 使用 `diagnoseDatabase()` 方法诊断问题
5. 检查系统代理设置

## 参考资源

- [Supabase 安全文档](https://supabase.com/docs/guides/auth/row-level-security)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase RPC 函数](https://supabase.com/docs/guides/database/functions)
- [Supabase 权限管理](https://supabase.com/docs/guides/auth/permissions) 
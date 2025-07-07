# 用户创建功能修复总结

## 问题

在用户创建功能中发现了SQL错误：

```
"message": "column reference \"wallet_address\" is ambiguous",
"details": "It could refer to either a PL/pgSQL variable or a table column."
```

这是一个PostgreSQL错误，表示在RPC函数中有歧义的列引用。当参数名称与表列名相同时，PostgreSQL无法确定应该使用哪一个。

## 解决方案

### 1. 更新Supabase RPC函数

修改了`create_user`函数，使用带有`in_`前缀的参数名称，解决了歧义问题：

```sql
CREATE OR REPLACE FUNCTION create_user(
  in_wallet_address text,
  in_email text DEFAULT NULL,
  in_username text DEFAULT NULL,
  in_avatar_url text DEFAULT NULL,
  in_referred_by text DEFAULT NULL
)
```

### 2. 更新前端代码

相应地更新了前端代码中的RPC调用参数：

- 在`lib/database-rpc.ts`中更新了`createUser`方法
- 在`app/test-db-supabase-rpc/page.tsx`中更新了测试函数

### 3. 添加调试日志

为了更好地诊断问题，我们在关键位置添加了详细的日志输出：

```typescript
console.log('开始创建用户, 传入数据:', JSON.stringify(userData, null, 2));
console.log('调用RPC函数 create_user 参数:', JSON.stringify(rpcParams, null, 2));
console.log('RPC函数返回数据:', JSON.stringify(data, null, 2));
```

### 4. 改进错误处理

在RPC函数中添加了更好的错误处理和日志记录：

```sql
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_user 错误: %', SQLERRM;
  RETURN NULL;
```

在前端代码中也改进了错误处理：

```typescript
catch (err) {
  console.error('创建用户异常:', err);
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorDetails = JSON.stringify(err, Object.getOwnPropertyNames(err));
  setError(`创建用户失败: ${errorMessage}\n详情: ${errorDetails}`);
}
```

## 文件更改列表

1. `supabase-rpc-functions.sql` - 更新了RPC函数定义
2. `lib/database-rpc.ts` - 更新了RPC调用参数
3. `app/test-db-supabase-rpc/page.tsx` - 更新了测试页面
4. `app/user-test/page.tsx` - 改进了错误处理
5. `FIX_USER_CREATION_GUIDE.md` - 创建了修复指南
6. `update-rpc-function.sql` - 创建了可执行的SQL更新脚本

## 如何测试修复

1. 在Supabase SQL编辑器中执行`update-rpc-function.sql`中的SQL代码
2. 重启Next.js开发服务器（`npm run dev`）
3. 访问 http://localhost:3000/test-db-supabase-rpc 并测试创建用户功能
4. 验证用户是否成功创建，不再出现错误

## 预防未来问题

为避免类似问题，我们建议：

1. 在PostgreSQL函数中，始终为参数使用带前缀的命名约定（如`in_`）
2. 在引用表列时，显式使用表名前缀（如`users.wallet_address`）
3. 添加全面的错误处理和日志记录
4. 创建测试页面来验证关键功能 
# Supabase 服务器连接问题诊断报告

## 诊断结果

### 网络连接状态

1. **DNS 解析**: ✅ 正常
   - 成功解析 `onfplwhsmtvmkssyisot.supabase.co` 到 IP 地址 `104.18.38.10`

2. **Ping 测试**: ✅ 正常
   - 成功 ping 通 Supabase 服务器，平均延迟约 117ms
   - 数据包无丢失

3. **HTTP 请求测试**:
   - 不带认证的请求: ✅ 正常，返回 401 状态码（预期行为）
   - 带认证的请求: ⚠️ 返回 401 状态码，错误信息: "permission denied for table users"

### 代理设置

⚠️ **发现系统代理**: `127.0.0.1:7897`

这可能会影响与 Supabase 的连接。

## 无代理测试结果

我们进行了禁用代理的测试，结果如下：

1. **HTTP 请求（不带认证）**: ✅ 正常
   - 返回 401 状态码（预期行为）
   - 响应消息: "No API key found in request"

2. **HTTP 请求（带认证）**: ⚠️ 仍然有权限问题
   - 返回 401 状态码
   - 错误信息: "permission denied for table users"

3. **RPC 函数调用**: ✅ 正常
   - 返回 200 状态码
   - 函数 `process_invite_registration` 成功调用，返回值: `false`

## 问题分析

1. **权限问题（主要问题）**:
   - 即使禁用代理，带认证的请求仍然返回 "permission denied for table users" 错误，表明 API 密钥没有足够的权限访问 users 表。
   - 这是由于 Supabase 的 Row Level Security (RLS) 策略限制了 anon 密钥对 users 表的访问。

2. **代理干扰（次要问题）**:
   - 系统代理设置为 `127.0.0.1:7897`
   - 禁用代理后，RPC 函数调用能够正常工作，表明代理可能会影响某些功能。

## 最终结论

1. **主要问题**: API 密钥权限不足
   - 当前使用的 anon 密钥没有权限访问 users 表，这是由 Supabase 的安全策略设计的，是正常行为。
   - RPC 函数调用正常工作，表明基本连接是正常的。

2. **解决方案**:
   - 对于需要访问 users 表的操作，应该使用服务器端代码和 service_role 密钥。
   - 客户端代码应该通过 RPC 函数或 API 端点来间接访问数据，而不是直接查询 users 表。
   - 确保 RLS 策略正确配置，允许必要的访问权限。

## 解决方案

### 1. 使用正确的访问模式

1. **客户端（浏览器）**:
   - 使用 anon 密钥
   - 通过 RPC 函数或 API 端点访问数据
   - 不直接查询受保护的表（如 users 表）

2. **服务器端**:
   - 使用 service_role 密钥
   - 实现安全的 API 端点
   - 处理需要特权访问的操作

### 2. 检查 RLS 策略

1. 登录 Supabase 管理控制台
2. 检查 users 表的 RLS 策略
3. 确保策略允许必要的访问权限

### 3. 禁用系统代理（可选）

如果代理影响某些功能，可以考虑在使用应用程序时临时禁用系统代理：

1. 打开 Windows 设置 > 网络和 Internet > 代理
2. 关闭"使用代理服务器"选项

## 后续步骤

1. 更新应用程序代码，使用正确的访问模式
2. 如果需要直接访问 users 表，使用 service_role 密钥和服务器端代码
3. 考虑实现更多的 RPC 函数来安全地访问受保护的数据

## 附加信息

- Supabase 项目 ID: `onfplwhsmtvmkssyisot`
- 使用的 API 密钥类型: anon key
- 系统环境: Windows 10
- 网络环境: 存在系统代理 `127.0.0.1:7897` 
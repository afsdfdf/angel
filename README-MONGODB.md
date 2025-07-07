# MongoDB 数据库集成指南

本项目已从Supabase迁移到MongoDB Atlas，以提供更稳定可靠的数据库服务。本文档将介绍如何设置和使用MongoDB数据库。

## 主要文件

- `lib/mongodb-config.ts` - MongoDB连接配置
- `lib/database-mongodb.ts` - MongoDB数据库服务实现
- `scripts/mongodb-init.js` - 数据库初始化脚本
- `app/test-mongodb/page.tsx` - MongoDB连接测试页面

## 数据模型

项目使用以下主要数据集合:

1. **users** - 用户信息
   ```typescript
   interface User {
     _id?: string | ObjectId;
     id?: string;
     wallet_address: string;
     email?: string;
     username?: string;
     avatar_url?: string;
     referred_by?: string;
     invites_count: number;
     angel_balance: number;
     total_earned: number;
     level: number;
     is_active: boolean;
     is_admin: boolean;
     created_at: string;
     updated_at?: string;
   }
   ```

2. **invitations** - 邀请记录
   ```typescript
   interface Invitation {
     _id?: string | ObjectId;
     id?: string;
     inviter_id: string;
     invitee_id?: string;
     invitee_wallet_address?: string;
     inviter_wallet_address: string;
     status: string; // 'pending' | 'accepted' | 'expired'
     level: number;
     reward_amount: number;
     reward_claimed: boolean;
     created_at: string;
     accepted_at?: string;
     expires_at?: string;
   }
   ```

3. **reward_records** - 奖励记录
   ```typescript
   interface RewardRecord {
     _id?: string | ObjectId;
     id?: string;
     user_id: string;
     reward_type: string; // 'welcome' | 'referral_l1' | 'referral_l2' | 'referral_l3'
     amount: number;
     description: string;
     related_user_id?: string;
     related_invitation_id?: string;
     status: string; // 'pending' | 'completed' | 'failed'
     created_at: string;
   }
   ```

## 设置步骤

1. **安装MongoDB驱动**
   ```bash
   npm install mongodb
   # 或
   yarn add mongodb
   # 或
   pnpm add mongodb
   ```

2. **配置环境变量**
   复制`.env.example`文件为`.env.local`，然后添加MongoDB连接信息:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/angel-crypto?retryWrites=true&w=majority
   MONGODB_DB_NAME=angel-crypto
   ```

3. **初始化数据库**
   运行初始化脚本创建集合和索引:
   ```bash
   npm run init-mongodb
   # 或
   yarn init-mongodb
   # 或
   pnpm init-mongodb
   ```

4. **测试连接**
   访问`/test-mongodb`页面测试数据库连接

## 使用方法

### 在服务器端API中使用

```typescript
import { DatabaseService } from '@/lib/database-mongodb';

export async function GET(request: NextRequest) {
  try {
    const users = await DatabaseService.getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
```

### 在客户端组件中使用

客户端组件不应直接访问数据库，而应通过API端点:

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users);
    }
    
    fetchUsers();
  }, []);
  
  return (
    <div>
      <h1>用户列表</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 关键服务方法

- `DatabaseService.isHealthy()` - 检查数据库连接
- `DatabaseService.isUserExists(walletAddress)` - 检查用户是否存在
- `DatabaseService.getUserByWalletAddress(walletAddress)` - 获取用户信息
- `DatabaseService.createUser(userData)` - 创建用户
- `DatabaseService.processInviteRegistration(newUserWallet, inviterWallet)` - 处理邀请注册
- `DatabaseService.getUserInvitations(userId)` - 获取用户邀请记录
- `DatabaseService.getUserRewards(userId)` - 获取用户奖励记录
- `DatabaseService.generateInviteLink(walletAddress)` - 生成邀请链接
- `DatabaseService.getAllUsers()` - 获取所有用户
- `DatabaseService.updateUser(userId, updates)` - 更新用户信息
- `DatabaseService.diagnoseDatabase()` - 数据库诊断

## 故障排除

如遇连接问题，请检查:

1. 环境变量是否正确配置
2. MongoDB Atlas IP白名单是否已添加当前IP
3. 数据库用户名和密码是否正确
4. 网络连接是否正常

您可以通过访问`/test-mongodb`页面运行诊断来帮助排查问题。

## 参考资源

- [MongoDB Atlas文档](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js驱动文档](https://mongodb.github.io/node-mongodb-native/)
- [详细设置指南](./MONGODB_SETUP_GUIDE.md) 
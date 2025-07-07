# Angel Crypto App 邀请系统开发文档

## 系统架构

Angel Crypto App 邀请系统采用了前后端分离的架构，前端使用 Next.js 和 React，后端使用 Supabase 提供的 PostgreSQL 数据库和 Functions。

### 前端组件

- `invite-system.tsx`: 生成邀请链接的主要组件
- `app/invite/[code]/page.tsx`: 处理邀请链接的页面
- `app/test-invite-simple/page.tsx`: 邀请系统测试页面

### 后端服务

- `lib/database.ts`: 数据库服务类，包含所有与邀请系统相关的方法
- `check-invites-table.sql`: 数据库表结构和函数定义

## 数据流程

1. 用户生成邀请链接
2. 被邀请用户通过链接访问
3. 系统创建邀请记录
4. 系统处理邀请奖励

## 数据库设计

### 表结构

#### invites 表

```sql
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID NOT NULL REFERENCES users(id),
    invited_user_id UUID REFERENCES users(id),
    status TEXT DEFAULT 'completed',
    reward_claimed BOOLEAN DEFAULT FALSE,
    reward_amount DECIMAL(18, 2) DEFAULT 50.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 索引

```sql
CREATE INDEX IF NOT EXISTS idx_invites_inviter_id ON invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invites_invited_user_id ON invites(invited_user_id);
```

### 数据库函数

#### 1. 处理邀请注册

```sql
CREATE OR REPLACE FUNCTION process_invite_registration_by_id(
  new_user_wallet TEXT,
  inviter_id UUID
)
RETURNS BOOLEAN AS $$
-- 函数实现
$$ LANGUAGE plpgsql;
```

#### 2. 简化的邀请处理

```sql
CREATE OR REPLACE FUNCTION simple_invite_process(
  new_user_wallet TEXT,
  inviter_wallet TEXT
)
RETURNS BOOLEAN AS $$
-- 函数实现
$$ LANGUAGE plpgsql;
```

#### 3. 直接邀请处理

```sql
CREATE OR REPLACE FUNCTION direct_invite_process(
  inviter_id UUID,
  invited_user_id UUID
)
RETURNS BOOLEAN AS $$
-- 函数实现
$$ LANGUAGE plpgsql;
```

#### 4. 处理邀请奖励

```sql
CREATE OR REPLACE FUNCTION process_invite_rewards(invite_id UUID)
RETURNS BOOLEAN AS $$
-- 函数实现
$$ LANGUAGE plpgsql;
```

#### 5. 批量处理奖励

```sql
CREATE OR REPLACE FUNCTION process_all_pending_rewards()
RETURNS INTEGER AS $$
-- 函数实现
$$ LANGUAGE plpgsql;
```

## 前端实现

### 生成邀请链接

```typescript
const generateLink = async () => {
  if (!user?.wallet_address) {
    console.error('❌ 无法生成邀请链接：用户未登录');
    return;
  }
  
  setIsGenerating(true);
  try {
    console.log('🔄 生成邀请链接，用户:', user);
    const link = await DatabaseService.generateInviteLink(user.wallet_address);
    
    if (!link) {
      console.error('❌ 生成邀请链接失败');
      setError('生成邀请链接失败，请稍后重试');
      return;
    }
    
    console.log('✅ 生成邀请链接成功:', link);
    setInviteLink(link);
  } catch (error) {
    console.error('❌ 生成邀请链接异常:', error);
    setError('生成邀请链接时发生错误');
  } finally {
    setIsGenerating(false);
  }
};
```

### 处理邀请注册

```typescript
const handleUserChange = async (user: User | null) => {
  if (!user) return;
  
  try {
    setIsRegistering(true);
    
    // 检查是否为新用户通过邀请链接注册
    console.log('🔍 检查是否为新用户:', user.wallet_address);
    const isNewUser = await DatabaseService.isNewUser(user.wallet_address);
    console.log('✅ 是否为新用户:', isNewUser);
    
    // 检查邀请人是否存在
    console.log('🔍 检查邀请人:', inviteCode);
    const inviter = await DatabaseService.getUserById(inviteCode);
    console.log('✅ 邀请人存在:', !!inviter);
    
    if (!inviter) {
      console.error('❌ 邀请人不存在:', inviteCode);
      setError("邀请人不存在或邀请链接无效");
      setIsRegistering(false);
      return;
    }
    
    if (isNewUser) {
      // 新用户通过邀请链接注册
      console.log('🔄 处理新用户邀请注册:', {
        newUserWallet: user.wallet_address,
        inviterId: inviter.id,
        inviterWallet: inviter.wallet_address
      });
      
      // 确保用户已经创建
      console.log('🔄 确认用户已创建');
      const createdUser = await DatabaseService.getUserByWalletAddress(user.wallet_address);
      
      if (!createdUser) {
        console.error('❌ 用户未被创建');
        setError("用户创建失败，请重试");
        setIsRegistering(false);
        return;
      }
      
      // 处理邀请注册关系
      console.log('🔄 调用处理邀请函数，参数:', {
        newUserWallet: user.wallet_address.toLowerCase(),
        inviterWallet: inviter.wallet_address.toLowerCase()
      });
      
      const success = await DatabaseService.processInviteRegistrationById(
        user.wallet_address.toLowerCase(),
        inviter.id
      );
      
      console.log('✅ 邀请处理结果:', success);
      
      if (!success) {
        console.log('⚠️ 邀请处理失败，尝试备用方法...');
        // 尝试备用方法
        const backupSuccess = await DatabaseService.directInsertInvitationById(
          user.wallet_address.toLowerCase(),
          inviter.id
        );
        console.log('备用方法结果:', backupSuccess);
        
        if (!backupSuccess) {
          console.error('❌ 所有邀请处理方法都失败');
          setError("邀请处理失败，但您已成功登录");
        } else {
          console.log('✅ 备用方法成功处理邀请');
          // 继续处理成功逻辑
          const updatedUser = await DatabaseService.getUserByWalletAddress(user.wallet_address);
          if (updatedUser) {
            await login(updatedUser);
          } else {
            await login(user);
          }
          setRegistrationSuccess(true);
          
          // 3秒后跳转到主页
          setTimeout(() => {
            router.push('/');
          }, 3000);
          return;
        }
      }
      
      if (success) {
        // 重新获取用户信息（包含奖励）
        console.log('🔄 重新获取用户信息');
        const updatedUser = await DatabaseService.getUserByWalletAddress(user.wallet_address);
        if (updatedUser) {
          console.log('✅ 获取更新后的用户信息成功');
          await login(updatedUser);
        } else {
          console.log('⚠️ 获取更新后的用户信息失败，使用原始用户信息');
          await login(user);
        }
        setRegistrationSuccess(true);
        
        // 3秒后跳转到主页
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } else {
      // 已存在用户直接登录
      console.log('ℹ️ 已存在用户，直接登录');
      await login(user);
      
      // 1秒后跳转到主页
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  } catch (error: any) {
    console.error("❌ 处理用户登录失败:", error);
    setError(`处理用户登录失败: ${error.message || '未知错误'}`);
  } finally {
    setIsRegistering(false);
  }
};
```

## 后端实现

### 数据库服务类

```typescript
// 提供supabase客户端访问
static supabase() {
  if (!supabase) {
    console.error('Supabase 配置未找到，请配置数据库连接');
    throw new Error('Supabase 配置未找到');
  }
  return supabase;
}

// 生成邀请链接
static async generateInviteLink(walletAddress: string, baseUrl?: string): Promise<string> {
  try {
    // 确保钱包地址为小写
    const normalizedAddress = walletAddress.toLowerCase();
    console.log('🔍 生成邀请链接，钱包地址:', normalizedAddress);
    
    // 获取用户ID
    if (!supabase) {
      console.error('Supabase 配置未找到，请配置数据库连接');
      return '';
    }
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', normalizedAddress)
      .single();
    
    if (error || !userData) {
      console.error('❌ 获取用户ID失败:', error || '用户不存在');
      return '';
    }
    
    console.log('✅ 获取用户ID成功:', userData.id);
    
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://www.angelcoin.app');
    return `${base}/invite/${userData.id}`;
  } catch (error) {
    console.error('❌ 生成邀请链接失败:', error);
    return '';
  }
}

// 通过ID获取用户
static async getUserById(userId: string): Promise<User | null> {
  try {
    if (!supabase) {
      console.error('Supabase 配置未找到，请配置数据库连接');
      return null;
    }

    console.log('🔍 通过ID获取用户:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ 通过ID获取用户失败:', error);
      return null;
    }

    if (!data) {
      console.log('⚠️ 未找到用户ID:', userId);
      return null;
    }

    console.log('✅ 通过ID获取用户成功');
    return data as User;
  } catch (error) {
    console.error('❌ 通过ID获取用户异常:', error);
    return null;
  }
}

// 通过ID处理邀请注册
static async processInviteRegistrationById(
  newUserWalletAddress: string,
  inviterId: string
): Promise<boolean> {
  try {
    if (!supabase) {
      console.error('Supabase 配置未找到，请配置数据库连接');
      return false;
    }

    console.log('🔄 处理邀请注册 (ID):', { newUserWalletAddress, inviterId });
    
    // 确保钱包地址为小写
    const normalizedWallet = newUserWalletAddress.toLowerCase();

    // 调用数据库函数
    const { data, error } = await supabase.rpc('process_invite_registration_by_id', {
      new_user_wallet: normalizedWallet,
      inviter_id: inviterId
    });

    if (error) {
      console.error('❌ 处理邀请注册失败 (ID):', error);
      return false;
    }

    console.log('✅ 处理邀请注册成功 (ID):', data);
    return true;
  } catch (error) {
    console.error('❌ 处理邀请注册异常 (ID):', error);
    return false;
  }
}

// 直接插入邀请记录 (ID版本)
static async directInsertInvitationById(
  newUserWalletAddress: string,
  inviterId: string
): Promise<boolean> {
  try {
    if (!supabase) {
      console.error('Supabase 配置未找到，请配置数据库连接');
      return false;
    }

    console.log('🔄 直接插入邀请记录 (ID):', { newUserWalletAddress, inviterId });
    
    // 确保钱包地址为小写
    const normalizedWallet = newUserWalletAddress.toLowerCase();

    // 获取新用户ID
    const { data: newUserData, error: newUserError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', normalizedWallet)
      .single();

    if (newUserError || !newUserData) {
      console.error('❌ 获取新用户ID失败:', newUserError || '用户不存在');
      return false;
    }

    // 检查是否已存在邀请记录
    const { data: existingInvite, error: checkError } = await supabase
      .from('invites')
      .select('id, reward_claimed')
      .eq('invited_user_id', newUserData.id)
      .single();

    if (existingInvite) {
      console.log('⚠️ 邀请记录已存在，跳过插入');
      
      // 如果存在但未发放奖励，尝试发放奖励
      if (!existingInvite.reward_claimed) {
        console.log('🔄 尝试处理未发放的奖励...');
        const { data: rewardData, error: rewardError } = await supabase
          .rpc('process_invite_rewards', { invite_id: existingInvite.id });
        
        if (rewardError) {
          console.error('❌ 处理奖励失败:', rewardError);
        } else {
          console.log('✅ 奖励处理成功');
        }
      }
      
      return true; // 已存在视为成功
    }

    // 直接插入邀请记录
    const { data: insertData, error: insertError } = await supabase
      .from('invites')
      .insert([
        {
          inviter_id: inviterId,
          invited_user_id: newUserData.id,
          status: 'completed',
          reward_claimed: false,
          reward_amount: 50.00
        }
      ])
      .select();

    if (insertError) {
      console.error('❌ 直接插入邀请记录失败:', insertError);
      
      // 尝试使用数据库函数
      console.log('🔄 尝试使用数据库函数直接插入...');
      const { data, error } = await supabase.rpc('direct_invite_process', {
        inviter_id: inviterId,
        invited_user_id: newUserData.id
      });
      
      if (error) {
        console.error('❌ 数据库函数插入失败:', error);
        return false;
      }
      
      console.log('✅ 数据库函数插入成功');
      return true;
    }

    console.log('✅ 直接插入邀请记录成功:', insertData);
    
    // 处理邀请奖励
    if (insertData && insertData.length > 0) {
      console.log('🔄 处理邀请奖励...');
      const { data: rewardData, error: rewardError } = await supabase
        .rpc('process_invite_rewards', { invite_id: insertData[0].id });
      
      if (rewardError) {
        console.error('❌ 处理奖励失败:', rewardError);
      } else {
        console.log('✅ 奖励处理成功');
      }
    }
    
    // 更新邀请计数
    const { error: updateError } = await supabase
      .from('users')
      .update({ invites_count: supabase.rpc('increment', { count: 1 }) })
      .eq('id', inviterId);
    
    if (updateError) {
      console.error('❌ 更新邀请计数失败:', updateError);
    }
    
    return true;
  } catch (error) {
    console.error('❌ 直接插入邀请记录异常:', error);
    return false;
  }
}
```

## 部署指南

### 1. 数据库设置

1. 登录 Supabase 管理控制台
2. 进入 SQL 编辑器
3. 执行 `check-invites-table.sql` 脚本

### 2. 前端部署

1. 确保环境变量已正确设置
2. 构建并部署 Next.js 应用

```bash
npm run build
npm run start
```

## 测试指南

### 单元测试

可以使用 Jest 和 React Testing Library 编写单元测试：

```typescript
describe('邀请系统', () => {
  test('生成邀请链接', async () => {
    // 测试代码
  });
  
  test('处理邀请注册', async () => {
    // 测试代码
  });
});
```

### 集成测试

使用 Cypress 进行端到端测试：

```typescript
describe('邀请流程', () => {
  it('新用户通过邀请链接注册', () => {
    // 测试代码
  });
});
```

### 手动测试

使用 `/test-invite-simple` 页面进行手动测试。

## 故障排除

### 常见错误

1. **数据库连接失败**
   - 检查 Supabase URL 和 API Key
   - 验证网络连接

2. **函数调用失败**
   - 检查函数参数
   - 查看 Supabase 日志

3. **邀请链接无效**
   - 验证用户ID格式
   - 检查数据库中用户是否存在

## 性能优化

1. 添加适当的索引
2. 使用批处理处理大量奖励
3. 实现缓存机制

## 安全考虑

1. 防止重复邀请和奖励
2. 验证用户身份
3. 使用参数化查询防止SQL注入

## 未来改进

1. 添加多级邀请奖励
2. 实现邀请统计和可视化
3. 添加邀请活动和特殊奖励

## 参考资料

- [Supabase 文档](https://supabase.io/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/) 
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './supabase-config';

// 创建 Supabase 客户端 - 使用硬编码配置
export const supabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  supabaseConfig.clientOptions
);

// 创建服务端 Supabase 客户端 - 使用 service_role 密钥
export const supabaseAdmin = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  supabaseConfig.clientOptions
);

// 数据类型定义
export interface User {
  id: string;
  wallet_address: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  referred_by?: string;
  invites_count?: number;
  angel_balance?: number;
  total_earned?: number;
  level?: number;
  is_active?: boolean;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Invitation {
  id: string;
  inviter_id: string;
  invitee_id: string;
  invite_code: string;
  status: string;
  reward_amount?: number;
  created_at?: string;
  updated_at?: string;
}

// 检查数据库连接是否正常
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    console.log('检查数据库连接...');
    
    // 尝试简单查询（不涉及敏感表）
    const { error } = await supabaseClient.from('public').select('count', { head: true });
    
    if (error) {
      console.error('数据库连接检查失败:', error);
      
      // 尝试调用健康检查 RPC 函数
      const { error: rpcError } = await supabaseClient.rpc('check_database_health');
      
      if (rpcError) {
        console.error('RPC 健康检查也失败:', rpcError);
        return false;
      }
      
      console.log('通过 RPC 函数检查数据库连接正常');
      return true;
    }
    
    console.log('数据库连接正常');
    return true;
  } catch (error) {
    console.error('数据库连接检查异常:', error);
    return false;
  }
}

// 检查用户是否存在 - 使用 RPC 函数
export async function isUserExists(walletAddress: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient.rpc('is_user_exists', { wallet: walletAddress });
    
    if (error) {
      console.error('检查用户是否存在失败:', error);
      return false;
    }
    
    return Boolean(data);
  } catch (error) {
    console.error('检查用户是否存在异常:', error);
    return false;
  }
}

// 获取用户 - 使用 RPC 函数
export async function getUserByWalletAddress(walletAddress: string): Promise<User | null> {
  try {
    // 使用 RPC 函数获取用户数据
    const { data, error } = await supabaseClient.rpc('get_user_data', { wallet_addr: walletAddress });
    
    if (error || !data) {
      console.error('使用 RPC 获取用户失败:', error);
      
      // 服务端 API 备选方案
      try {
        const response = await fetch(`/api/users?wallet=${walletAddress}`);
        if (!response.ok) {
          throw new Error(`API 请求失败: ${response.status}`);
        }
        
        const { user, error: apiError } = await response.json();
        if (apiError) {
          throw new Error(apiError);
        }
        
        return user as User;
      } catch (apiError) {
        console.error('API 获取用户失败:', apiError);
        return null;
      }
    }
    
    return data as User;
  } catch (error) {
    console.error('获取用户失败:', error);
    return null;
  }
}

// 创建用户 - 使用服务端 API
export async function createUser(userData: {
  walletAddress: string;
  username?: string;
}): Promise<User | null> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }
    
    const { user, error } = await response.json();
    
    if (error) {
      throw new Error(error);
    }
    
    return user as User;
  } catch (error) {
    console.error('创建用户失败:', error);
    return null;
  }
}

// 更新用户 - 使用服务端 API
export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<User | null> {
  try {
    const response = await fetch('/api/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: userId,
        ...updates,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }
    
    const { user, error } = await response.json();
    
    if (error) {
      throw new Error(error);
    }
    
    return user as User;
  } catch (error) {
    console.error('更新用户失败:', error);
    return null;
  }
} 
/**
 * 基于RPC函数的数据库服务
 * 解决Supabase Row Level Security (RLS)权限问题
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';
import crypto from 'crypto';

// 导入连接修复工具
import { initSupabase, getSupabaseClient, reinitializeSupabase } from './database-connection-fix';

// 类型定义
export interface User {
  id: string;
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

export interface Invitation {
  id: string;
  inviter_id: string;
  invitee_id: string;
  invite_code: string;
  status: string;
  reward_amount: number;
  created_at: string;
  updated_at?: string;
  invitee?: {
    id: string;
    wallet_address: string;
    username?: string;
    avatar_url?: string;
    created_at: string;
  };
}

export interface RewardRecord {
  id: string;
  user_id: string;
  reward_type: 'welcome' | 'referral_l1' | 'referral_l2' | 'referral_l3' | 'bonus';
  amount: number;
  description?: string;
  related_user_id?: string;
  related_invitation_id?: string;
  transaction_hash?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

// 奖励配置
export const REWARD_CONFIG = {
  WELCOME_BONUS: 100,
  REFERRAL_L1: 50,
  REFERRAL_L2: 25,
  REFERRAL_L3: 10
};

/**
 * 基于RPC的数据库服务类
 */
export class DatabaseRpcService {
  /**
   * 检查数据库连接是否正常
   */
  static async isHealthy(): Promise<boolean> {
    try {
      console.log('检查数据库连接...');
      const client = getSupabaseClient();
      
      // 使用RPC函数检查连接
      const { data, error } = await client.rpc('check_database_health');
      
      if (error) {
        console.error('数据库连接检查失败:', error);
        return false;
      }
      
      console.log('数据库连接正常');
      return Boolean(data);
    } catch (error) {
      console.error('数据库连接检查异常:', error);
      return false;
    }
  }
  
  /**
   * 检查用户是否存在
   */
  static async isUserExists(walletAddress: string): Promise<boolean> {
    try {
      const client = getSupabaseClient();
      const normalizedAddress = walletAddress.toLowerCase();
      
      // 使用RPC函数检查用户是否存在
      const { data, error } = await client.rpc('is_user_exists', { wallet: normalizedAddress });
      
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
  
  /**
   * 通过钱包地址获取用户
   */
  static async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    try {
      const client = getSupabaseClient();
      const normalizedAddress = walletAddress.toLowerCase();
      
      // 使用RPC函数获取用户
      const { data, error } = await client.rpc('get_user_by_wallet', { wallet: normalizedAddress });
      
      if (error) {
        console.error('获取用户失败:', error);
        return null;
      }
      
      if (!data) {
        console.log('未找到用户:', normalizedAddress);
        return null;
      }
      
      return data as User;
    } catch (error) {
      console.error('获取用户异常:', error);
      return null;
    }
  }
  
  /**
   * 创建用户
   */
  static async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const client = getSupabaseClient();
      
      if (!userData.wallet_address) {
        throw new Error('创建用户必须提供钱包地址');
      }
      
      const normalizedAddress = userData.wallet_address.toLowerCase();
      
      // 使用RPC函数创建用户
      const { data, error } = await client.rpc('create_user', {
        wallet_address: normalizedAddress,
        email: userData.email,
        username: userData.username,
        avatar_url: userData.avatar_url,
        referred_by: userData.referred_by
      });
      
      if (error) {
        console.error('创建用户失败:', error);
        return null;
      }
      
      return data as User;
    } catch (error) {
      console.error('创建用户异常:', error);
      return null;
    }
  }
  
  /**
   * 处理邀请注册
   */
  static async processInviteRegistration(newUserWallet: string, inviterWallet: string): Promise<boolean> {
    try {
      const client = getSupabaseClient();
      
      // 确保钱包地址为小写
      const normalizedNewUserWallet = newUserWallet.toLowerCase();
      const normalizedInviterWallet = inviterWallet.toLowerCase();
      
      // 使用RPC函数处理邀请
      const { data, error } = await client.rpc('process_invite_registration', {
        new_user_wallet: normalizedNewUserWallet,
        inviter_wallet: normalizedInviterWallet
      });
      
      if (error) {
        console.error('处理邀请失败:', error);
        return false;
      }
      
      return Boolean(data);
    } catch (error) {
      console.error('处理邀请异常:', error);
      return false;
    }
  }
  
  /**
   * 获取用户邀请记录
   */
  static async getUserInvitations(userId: string): Promise<Invitation[]> {
    try {
      const client = getSupabaseClient();
      
      // 使用RPC函数获取用户邀请
      const { data, error } = await client.rpc('get_user_invitations', { user_id: userId });
      
      if (error) {
        console.error('获取用户邀请失败:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('获取用户邀请异常:', error);
      return [];
    }
  }
  
  /**
   * 获取用户奖励记录
   */
  static async getRewardRecords(userId: string): Promise<RewardRecord[]> {
    try {
      const client = getSupabaseClient();
      
      // 使用RPC函数获取用户奖励
      const { data, error } = await client.rpc('get_user_rewards', { user_id: userId });
      
      if (error) {
        console.error('获取用户奖励失败:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('获取用户奖励异常:', error);
      return [];
    }
  }
  
  /**
   * 获取所有用户（仅管理员可用）
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const client = getSupabaseClient();
      
      // 使用RPC函数获取所有用户
      const { data, error } = await client.rpc('get_all_users');
      
      if (error) {
        console.error('获取所有用户失败:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('获取所有用户异常:', error);
      return [];
    }
  }
  
  /**
   * 生成邀请链接
   */
  static async generateInviteLink(walletAddress: string, baseUrl?: string): Promise<string> {
    try {
      const user = await this.getUserByWalletAddress(walletAddress);
      if (!user) {
        throw new Error('用户不存在');
      }

      const appUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://angelcoin.app');
      return `${appUrl}/invite/${user.id}`;
    } catch (error) {
      console.error('生成邀请链接失败:', error);
      throw error;
    }
  }
  
  /**
   * 诊断数据库问题
   */
  static async diagnoseDatabase(): Promise<Record<string, any>> {
    try {
      const client = getSupabaseClient();
      const results: Record<string, any> = {
        timestamp: new Date().toISOString(),
        tests: {}
      };
      
      // 测试1: 健康检查RPC
      try {
        const { data, error } = await client.rpc('check_database_health');
        
        results.tests.healthCheck = {
          success: !error && data === true,
          error: error ? error.message : null
        };
      } catch (e: any) {
        results.tests.healthCheck = {
          success: false,
          error: e.message
        };
      }
      
      // 测试2: 获取用户RPC
      try {
        const { error } = await client.rpc('get_user_by_wallet', { 
          wallet: '0x0000000000000000000000000000000000000001' 
        });
        
        // 这里可能会返回null，但不应该有错误
        results.tests.getUserRpc = {
          success: !error,
          error: error ? error.message : null
        };
      } catch (e: any) {
        results.tests.getUserRpc = {
          success: false,
          error: e.message
        };
      }
      
      // 测试3: 直接表访问（应该失败，这是预期行为）
      try {
        const { data, error } = await client
          .from('users')
          .select('count(*)', { count: 'exact', head: true });
        
        results.tests.directTableAccess = {
          success: !error,
          error: error ? error.message : null,
          expected: 'permission denied for table users'
        };
      } catch (e: any) {
        results.tests.directTableAccess = {
          success: false,
          error: e.message
        };
      }
      
      // 总结结果
      results.summary = {
        rpcWorks: results.tests.healthCheck.success,
        permissionIssueConfirmed: results.tests.directTableAccess.error?.includes('permission denied'),
        recommendation: '使用RPC函数访问数据，而不是直接查询表'
      };
      
      return results;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
} 
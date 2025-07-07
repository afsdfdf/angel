/**
 * 修复版本的数据库服务
 * 解决了类型安全问题和Supabase连接问题
 */
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

// 全局Supabase客户端实例
let supabase: SupabaseClient | null = null;

// 初始化Supabase客户端
function initSupabase(): SupabaseClient {
  try {
    if (!config.supabase || !config.supabase.url || !config.supabase.anonKey) {
      throw new Error('缺少Supabase配置');
    }

    // 解决代理问题的配置
    const clientOptions = {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'x-client-info': 'angel-crypto-app'
        }
      },
      // 解决系统代理问题
      fetch: (url: RequestInfo | URL, options?: RequestInit) => {
        return fetch(url, {
          ...options,
          // 绕过代理设置
          cache: 'no-store'
        });
      }
    };

    const client = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      clientOptions
    );

    console.log('Supabase 客户端初始化成功');
    return client;
  } catch (error) {
    console.error('初始化 Supabase 失败:', error);
    throw new Error('数据库连接失败，请检查网络和配置');
  }
}

// 强制重新初始化客户端
export function reinitializeSupabase(): SupabaseClient {
  supabase = initSupabase();
  return supabase;
}

// 获取Supabase客户端实例（懒加载）
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = initSupabase();
  }
  return supabase;
}

// 类型定义部分
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

export interface UserSession {
  id: string;
  user_id: string;
  wallet_address: string;
  session_token: string;
  expires_at: string;
  created_at: string;
}

// 常量配置
export const REWARD_CONFIG = {
  WELCOME_BONUS: 100,     // 欢迎奖励
  REFERRAL_L1: 50,        // 一级推荐奖励
  REFERRAL_L2: 25,        // 二级推荐奖励
  REFERRAL_L3: 10         // 三级推荐奖励
};

// 安全转换函数
function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function safeNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function safeBoolean(value: unknown): boolean {
  return Boolean(value);
}

// 类型转换函数
function mapToUser(data: Record<string, unknown>): User {
  return {
    id: safeString(data.id),
    wallet_address: safeString(data.wallet_address),
    email: data.email ? safeString(data.email) : undefined,
    username: data.username ? safeString(data.username) : undefined,
    avatar_url: data.avatar_url ? safeString(data.avatar_url) : undefined,
    referred_by: data.referred_by ? safeString(data.referred_by) : undefined,
    invites_count: safeNumber(data.invites_count),
    angel_balance: safeNumber(data.angel_balance),
    total_earned: safeNumber(data.total_earned),
    level: safeNumber(data.level),
    is_active: safeBoolean(data.is_active),
    is_admin: safeBoolean(data.is_admin),
    created_at: safeString(data.created_at),
    updated_at: data.updated_at ? safeString(data.updated_at) : undefined,
  };
}

function mapToInvitation(data: Record<string, unknown>): Invitation {
  return {
    id: safeString(data.id),
    inviter_id: safeString(data.inviter_id),
    invitee_id: safeString(data.invitee_id),
    invite_code: safeString(data.invite_code),
    status: safeString(data.status),
    reward_amount: safeNumber(data.reward_amount),
    created_at: safeString(data.created_at),
    updated_at: data.updated_at ? safeString(data.updated_at) : undefined,
  };
}

function mapToRewardRecord(data: Record<string, unknown>): RewardRecord {
  const rewardType = safeString(data.reward_type);
  // 验证reward_type是否有效
  if (!['welcome', 'referral_l1', 'referral_l2', 'referral_l3', 'bonus'].includes(rewardType)) {
    throw new Error(`Invalid reward_type: ${rewardType}`);
  }

  const status = safeString(data.status);
  // 验证status是否有效
  if (!['pending', 'completed', 'failed'].includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  return {
    id: safeString(data.id),
    user_id: safeString(data.user_id),
    reward_type: rewardType as RewardRecord['reward_type'],
    amount: safeNumber(data.amount),
    description: data.description ? safeString(data.description) : undefined,
    related_user_id: data.related_user_id ? safeString(data.related_user_id) : undefined,
    related_invitation_id: data.related_invitation_id ? safeString(data.related_invitation_id) : undefined,
    transaction_hash: data.transaction_hash ? safeString(data.transaction_hash) : undefined,
    status: status as RewardRecord['status'],
    created_at: safeString(data.created_at),
    completed_at: data.completed_at ? safeString(data.completed_at) : undefined,
  };
}

// 数据库服务类
export class DatabaseServiceFixed {
  // 检查数据库连接是否正常
  static async isHealthy(): Promise<boolean> {
    try {
      console.log('开始数据库健康检查...');
      
      const client = getSupabaseClient();
      
      // 简单检查连接
      const { data, error } = await client
        .from('health_check')
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.error('数据库健康检查失败:', error);
        return false;
      }
      
      console.log('数据库健康检查成功');
      return true;
    } catch (error) {
      console.error('数据库健康检查出现异常:', error);
      return false;
    }
  }

  // 检查用户是否存在
  static async isUserExists(walletAddress: string): Promise<boolean> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      const client = getSupabaseClient();
      
      const { count, error } = await client
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('wallet_address', normalizedAddress);
      
      if (error) {
        console.error('检查用户是否存在失败:', error);
        return false;
      }
      
      return count !== null && count > 0;
    } catch (error) {
      console.error('检查用户是否存在时出现异常:', error);
      return false;
    }
  }

  // 创建用户
  static async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const client = getSupabaseClient();
      
      // 确保必要字段存在
      if (!userData.wallet_address) {
        throw new Error('创建用户必须提供钱包地址');
      }
      
      // 准备插入数据
      const insertData = {
        ...userData,
        wallet_address: userData.wallet_address.toLowerCase(),
        angel_balance: userData.angel_balance ?? REWARD_CONFIG.WELCOME_BONUS,
        invites_count: userData.invites_count ?? 0,
        total_earned: userData.total_earned ?? REWARD_CONFIG.WELCOME_BONUS,
        level: userData.level ?? 1,
        is_active: userData.is_active ?? true,
        is_admin: userData.is_admin ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 插入数据
      const { data, error } = await client
        .from('users')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('创建用户失败:', error);
        return null;
      }

      // 发放欢迎奖励记录
      if (data && data.id) {
        await this.recordWelcomeReward(data.id);
      }

      return data ? mapToUser(data as Record<string, unknown>) : null;
    } catch (error) {
      console.error('创建用户异常:', error);
      return null;
    }
  }

  // 通过钱包地址获取用户
  static async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    try {
      const client = getSupabaseClient();
      const normalizedAddress = walletAddress.toLowerCase();

      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('wallet_address', normalizedAddress)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116是"没有行"的错误
          console.error('获取用户失败:', error);
        }
        return null;
      }
      
      return data ? mapToUser(data as Record<string, unknown>) : null;
    } catch (error) {
      console.error('获取用户异常:', error);
      return null;
    }
  }

  // 更新用户
  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const client = getSupabaseClient();
      
      const { data, error } = await client
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('更新用户失败:', error);
        return null;
      }
      
      return data ? mapToUser(data as Record<string, unknown>) : null;
    } catch (error) {
      console.error('更新用户异常:', error);
      return null;
    }
  }

  // 处理邀请注册
  static async processInviteRegistration(newUserWallet: string, inviterWallet: string): Promise<boolean> {
    try {
      const client = getSupabaseClient();
      
      // 确保钱包地址为小写
      const normalizedNewUserWallet = newUserWallet.toLowerCase();
      const normalizedInviterWallet = inviterWallet.toLowerCase();
      
      // 获取用户信息
      const newUser = await this.getUserByWalletAddress(normalizedNewUserWallet);
      const inviter = await this.getUserByWalletAddress(normalizedInviterWallet);
      
      if (!newUser) {
        console.error('新用户不存在:', normalizedNewUserWallet);
        return false;
      }
      
      if (!inviter) {
        console.error('邀请人不存在:', normalizedInviterWallet);
        return false;
      }
      
      // 检查是否已存在邀请记录
      const { count, error: existingError } = await client
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('inviter_id', inviter.id)
        .eq('invitee_id', newUser.id);
      
      if (existingError) {
        console.error('检查现有邀请失败:', existingError);
        return false;
      }
      
      if (count && count > 0) {
        console.log('已存在邀请记录，无需重复处理');
        return true;
      }
      
      // 创建邀请记录
      const inviteCode = crypto.randomUUID().slice(0, 8);
      
      const { error: insertError } = await client
        .from('invitations')
        .insert([
          {
            inviter_id: inviter.id,
            invitee_id: newUser.id,
            invite_code: inviteCode,
            status: 'accepted',
            reward_amount: REWARD_CONFIG.REFERRAL_L1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      
      if (insertError) {
        console.error('创建邀请记录失败:', insertError);
        return false;
      }
      
      // 更新邀请计数
      const newInvitesCount = (inviter.invites_count || 0) + 1;
      const newBalance = (inviter.angel_balance || 0) + REWARD_CONFIG.REFERRAL_L1;
      const newTotalEarned = (inviter.total_earned || 0) + REWARD_CONFIG.REFERRAL_L1;
      
      const { error: updateError } = await client
        .from('users')
        .update({
          invites_count: newInvitesCount,
          angel_balance: newBalance,
          total_earned: newTotalEarned
        })
        .eq('id', inviter.id);
      
      if (updateError) {
        console.error('更新邀请计数失败:', updateError);
        return false;
      }
      
      // 记录奖励
      const { error: rewardError } = await client
        .from('reward_records')
        .insert([
          {
            user_id: inviter.id,
            reward_type: 'referral_l1',
            amount: REWARD_CONFIG.REFERRAL_L1,
            description: `邀请奖励 L1 - 成功邀请用户 ${newUserWallet}`,
            related_user_id: newUser.id,
            status: 'completed',
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          }
        ]);
      
      if (rewardError) {
        console.error('记录奖励失败:', rewardError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('处理邀请异常:', error);
      return false;
    }
  }

  // 记录欢迎奖励
  static async recordWelcomeReward(userId: string): Promise<boolean> {
    try {
      const client = getSupabaseClient();
      
      const { error } = await client
        .from('reward_records')
        .insert([
          {
            user_id: userId,
            reward_type: 'welcome',
            amount: REWARD_CONFIG.WELCOME_BONUS,
            description: '注册欢迎奖励',
            status: 'completed',
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          }
        ]);
      
      if (error) {
        console.error('记录欢迎奖励失败:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('记录欢迎奖励异常:', error);
      return false;
    }
  }

  // 获取奖励记录
  static async getRewardRecords(userId: string): Promise<RewardRecord[]> {
    try {
      const client = getSupabaseClient();
      
      const { data, error } = await client
        .from('reward_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('获取奖励记录失败:', error);
        return [];
      }
      
      return data ? data.map(item => mapToRewardRecord(item as Record<string, unknown>)) : [];
    } catch (error) {
      console.error('获取奖励记录异常:', error);
      return [];
    }
  }

  // 获取用户邀请记录
  static async getUserInvitations(userId: string): Promise<Invitation[]> {
    try {
      const client = getSupabaseClient();
      
      const { data, error } = await client
        .from('invitations')
        .select('*')
        .eq('inviter_id', userId);
      
      if (error) {
        console.error('获取用户邀请记录失败:', error);
        return [];
      }
      
      return data ? data.map(item => mapToInvitation(item as Record<string, unknown>)) : [];
    } catch (error) {
      console.error('获取用户邀请记录异常:', error);
      return [];
    }
  }

  // 获取用户被邀请记录
  static async getUserInvitedBy(userId: string): Promise<Invitation | null> {
    try {
      const client = getSupabaseClient();
      
      const { data, error } = await client
        .from('invitations')
        .select('*')
        .eq('invitee_id', userId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('获取用户被邀请记录失败:', error);
        }
        return null;
      }
      
      return data ? mapToInvitation(data as Record<string, unknown>) : null;
    } catch (error) {
      console.error('获取用户被邀请记录异常:', error);
      return null;
    }
  }

  // 获取所有用户
  static async getAllUsers(): Promise<User[]> {
    try {
      const client = getSupabaseClient();
      
      const { data, error } = await client
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('获取所有用户失败:', error);
        return [];
      }
      
      return data ? data.map(item => mapToUser(item as Record<string, unknown>)) : [];
    } catch (error) {
      console.error('获取所有用户异常:', error);
      return [];
    }
  }

  // 获取所有邀请记录
  static async getAllInvitations(): Promise<Invitation[]> {
    try {
      const client = getSupabaseClient();
      
      const { data, error } = await client
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('获取所有邀请记录失败:', error);
        return [];
      }
      
      return data ? data.map(item => mapToInvitation(item as Record<string, unknown>)) : [];
    } catch (error) {
      console.error('获取所有邀请记录异常:', error);
      return [];
    }
  }

  // 通过ID获取用户
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const client = getSupabaseClient();
      
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('通过ID获取用户失败:', error);
        return null;
      }
      
      return data ? mapToUser(data as Record<string, unknown>) : null;
    } catch (error) {
      console.error('通过ID获取用户异常:', error);
      return null;
    }
  }

  // 数据库诊断
  static async diagnoseDatabase(): Promise<Record<string, unknown>> {
    try {
      const client = getSupabaseClient();
      const results: Record<string, unknown> = {};
      
      // 检查连接
      try {
        const { error: connectionError } = await client
          .from('health_check')
          .select('count(*)', { count: 'exact', head: true });
        
        results.connection = !connectionError;
        results.connectionError = connectionError ? connectionError.message : null;
      } catch (connError: any) {
        results.connection = false;
        results.connectionError = connError.message;
      }
      
      // 检查表存在
      try {
        const { count: usersCount, error: usersError } = await client
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        results.usersTable = !usersError;
        results.usersCount = usersCount;
      } catch (tableError: any) {
        results.usersTable = false;
        results.usersError = tableError.message;
      }
      
      // 返回诊断结果
      return results;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
} 
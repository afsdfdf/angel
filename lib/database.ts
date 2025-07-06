import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// 检查是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

// 验证 Supabase 配置
const validateSupabaseConfig = () => {
  let url = config.supabase.url;
  let key = config.supabase.anonKey;
  
  // 移除可能的引号
  if (url) url = url.replace(/^["']|["']$/g, '');
  if (key) key = key.replace(/^["']|["']$/g, '');
  
  console.log('🔍 检查 Supabase 配置:');
  console.log('   URL:', url ? `${url.substring(0, 30)}...` : '未设置');
  console.log('   Key:', key ? `${key.substring(0, 30)}...` : '未设置');
  
  if (!url || !key || url.includes('your-') || key.includes('your-') || url.includes('placeholder') || key.includes('placeholder')) {
    console.warn('Supabase 配置未找到或使用默认值，将使用模拟模式');
    return { url: '', key: '', isValid: false };
  }
  
  return { url, key, isValid: true };
};

const { url, key, isValid } = validateSupabaseConfig();

// 创建 Supabase 客户端 
const supabase = isValid && url && key ? createClient(url.replace(/^["']|["']$/g, ''), key.replace(/^["']|["']$/g, '')) : null;

// 如果数据库不可用，抛出错误
if (!supabase) {
  console.error('❌ Supabase 客户端初始化失败！请检查环境变量配置：');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// 标记数据库是否可用
export const isDatabaseAvailable = isValid && supabase !== null;

// 奖励配置
export const REWARD_CONFIG = {
  WELCOME_BONUS: 10000,    // 新用户注册奖励
  REFERRAL_L1: 50,         // 一级邀请奖励
  REFERRAL_L2: 25,         // 二级邀请奖励
  REFERRAL_L3: 10,         // 三级邀请奖励
} as const;

// 数据类型定义
export interface User {
  id: string;
  wallet_address: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  angel_balance: number;
  referred_by?: string;
  total_referrals: number;
  total_earned: number;
  level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  inviter_id: string;
  invitee_id?: string;
  invitee_wallet_address?: string;
  inviter_wallet_address: string;
  status: 'pending' | 'accepted' | 'expired';
  level: number;
  reward_amount: number;
  reward_claimed: boolean;
  created_at: string;
  accepted_at?: string;
  expires_at: string;
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

// 主数据库服务类
export class DatabaseService {
  // 数据库健康检查
  static async isHealthy(): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase 配置未找到');
        return false;
      }
      
      console.log('🔍 开始数据库健康检查...');
      
      // 尝试执行一个简单的查询来检查连接
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ 数据库健康检查失败:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return false;
      }
      
      console.log('✅ 数据库健康检查通过');
      return true;
    } catch (error: any) {
      console.error('❌ 数据库健康检查异常:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      });
      return false;
    }
  }
  // 用户管理
  static async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return null;
      }

      console.log('🔍 创建用户数据:', userData);

      const insertData = {
        ...userData,
        angel_balance: REWARD_CONFIG.WELCOME_BONUS, // 新用户默认获得欢迎奖励
        total_referrals: 0,
        total_earned: REWARD_CONFIG.WELCOME_BONUS,
        level: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('📝 插入数据:', insertData);

      const { data, error } = await supabase
        .from('users')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase 错误:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ 用户创建成功:', data);

      // 发放欢迎奖励记录
      await this.recordWelcomeReward(data.id);

      return data;
    } catch (error: any) {
      console.error('❌ 创建用户失败:', error);
      
      // 详细记录错误信息
      const errorInfo = {
        message: error?.message || '未知错误',
        code: error?.code || 'NO_CODE',
        details: error?.details || '无详细信息',
        hint: error?.hint || '无提示信息',
        stack: error?.stack || '无堆栈信息'
      };
      
      console.error('❌ 错误详情:', errorInfo);
      
      // 如果是表不存在错误，提供特殊提示
      if (error?.code === '42P01' || error?.message?.includes('relation "users" does not exist')) {
        console.error('❌ 数据库表不存在！请运行数据库初始化脚本');
      }
      
      // 如果是权限错误，提供特殊提示
      if (error?.code === '42501' || error?.message?.includes('permission denied')) {
        console.error('❌ 数据库权限不足！请检查RLS策略');
      }
      
      return null;
    }
  }

  static async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    try {
      // 检查是否有有效的 Supabase 配置
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('数据库查询错误:', error);
        return null;
      }
      
      return data || null;
    } catch (error) {
      console.error('获取用户失败:', error);
      return null;
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('更新用户失败:', error);
      return null;
    }
  }

  // 邀请系统
  static async processInviteRegistration(newUserWallet: string, inviterWallet: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return false;
      }

      // 调用数据库函数处理邀请注册
      const { data, error } = await supabase
        .rpc('process_invite_registration', {
          new_user_wallet: newUserWallet.toLowerCase(),
          inviter_wallet: inviterWallet.toLowerCase()
        });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('处理邀请注册失败:', error);
      return false;
    }
  }

  static async isNewUser(walletAddress: string): Promise<boolean> {
    try {
      const existingUser = await this.getUserByWalletAddress(walletAddress);
      return !existingUser;
    } catch (error) {
      console.error('检查新用户失败:', error);
      return false;
    }
  }

  // 生成邀请链接
  static async generateInviteLink(walletAddress: string, baseUrl?: string): Promise<string> {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://www.angelcoin.app');
    return `${base}/invite/${walletAddress}`;
  }

  static async getInvitationsByUser(userId: string): Promise<Invitation[]> {
    try {
      // 检查数据库是否可用
      if (!supabase) {
        console.error('数据库不可用，请配置数据库连接');
        return [];
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('inviter_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取邀请列表失败:', error);
      return [];
    }
  }

  static async getInvitationsByInviterWallet(inviterWallet: string): Promise<Invitation[]> {
    try {
      // 检查数据库是否可用
      if (!supabase) {
        console.error('数据库不可用，请配置数据库连接');
        return [];
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('inviter_wallet_address', inviterWallet.toLowerCase())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取邀请列表失败:', error);
      return [];
    }
  }

  // 奖励系统
  static async recordWelcomeReward(userId: string): Promise<boolean> {
    try {
      // 检查数据库是否可用
      if (!supabase) {
        console.error('数据库不可用，请配置数据库连接');
        return false;
      }

      const { error } = await supabase
        .from('reward_records')
        .insert([{
          user_id: userId,
          reward_type: 'welcome',
          amount: REWARD_CONFIG.WELCOME_BONUS,
          description: '新用户注册奖励',
          status: 'completed',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('记录欢迎奖励失败:', error);
      return false;
    }
  }

  static async getRewardRecords(userId: string): Promise<RewardRecord[]> {
    try {
      // 检查数据库是否可用
      if (!supabase) {
        console.error('数据库不可用，请配置数据库连接');
        return [];
      }

      const { data, error } = await supabase
        .from('reward_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取奖励记录失败:', error);
      return [];
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('获取用户失败:', error);
      return null;
    }
  }

  // 会话管理
  static async createSession(sessionData: Partial<UserSession>): Promise<UserSession | null> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return null;
      }

      const { data, error } = await supabase
        .from('user_sessions')
        .insert([sessionData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('创建会话失败:', error);
      return null;
    }
  }

  static async getSessionByToken(sessionToken: string): Promise<UserSession | null> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return null;
      }

      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('获取会话失败:', error);
      return null;
    }
  }

  static async deleteSession(sessionToken: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return false;
      }

      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('删除会话失败:', error);
      return false;
    }
  }

  // 管理员功能
  static async getAllUsers(): Promise<User[]> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return [];
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取所有用户失败:', error);
      return [];
    }
  }

  static async getAllInvitations(): Promise<Invitation[]> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return [];
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取所有邀请失败:', error);
      return [];
    }
  }
}

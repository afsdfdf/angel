import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import { MockDatabaseService } from './database-mock';

// 检查是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

// 检查是否使用模拟模式
const isUsingMockMode = config.supabase.url === 'https://demo.supabase.co' || 
                      config.supabase.anonKey === 'demo-anon-key';

// 验证Supabase配置
const validateSupabaseConfig = () => {
  if (!config.supabase.url || config.supabase.url === 'https://demo.supabase.co') {
    if (!isDev) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL is required in production');
      // 在生产环境中不抛出错误，而是使用模拟模式
      console.warn('⚠️  Falling back to mock mode due to missing Supabase configuration');
    }
    console.warn('⚠️  Using demo Supabase URL. Please configure your environment variables.');
  }
  
  if (!config.supabase.anonKey || config.supabase.anonKey === 'demo-anon-key') {
    if (!isDev) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is required in production');
      // 在生产环境中不抛出错误，而是使用模拟模式
      console.warn('⚠️  Falling back to mock mode due to missing Supabase configuration');
    }
    console.warn('⚠️  Using demo Supabase anon key. Please configure your environment variables.');
  }

  if (isUsingMockMode) {
    console.log('🎭 Running in mock database mode');
  }
};

// 验证配置
validateSupabaseConfig();

// 创建Supabase客户端
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// 创建管理员客户端（用于服务端操作）
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// 数据库类型定义
export interface User {
  id: string;
  wallet_address: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  angel_balance: number;
  referral_code: string;
  referred_by?: string;
  total_referrals: number;
  total_earned: number;
  level?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  inviter_id: string;
  invitee_id?: string;
  invitee_wallet_address?: string;
  referral_code: string;
  invite_link: string;
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

// 奖励配置
export const REWARD_CONFIG = {
  WELCOME_BONUS: 1000,
  REFERRAL_L1: 500,
  REFERRAL_L2: 250,
  REFERRAL_L3: 100,
} as const;

// 数据库操作类
export class DatabaseService {
  // 用户相关操作
  static async createUser(userData: Partial<User>): Promise<User | null> {
    // 如果在模拟模式下，使用模拟服务
    if (isUsingMockMode) {
      return MockDatabaseService.createUser(userData);
    }

    try {
      // 生成推荐码
      const referralCode = userData.referral_code || this.generateReferralCode();
      
      const newUser = {
        ...userData,
        referral_code: referralCode,
        angel_balance: 0,
        total_referrals: 0,
        total_earned: 0,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();
      
      if (error) throw error;
      
      // 发放欢迎奖励
      if (data) {
        await this.giveWelcomeReward(data.id);
      }
      
      return data;
    } catch (error) {
      console.error('创建用户失败:', error);
      return null;
    }
  }

  static async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    // 如果在模拟模式下，使用模拟服务
    if (isUsingMockMode) {
      return MockDatabaseService.getUserByWalletAddress(walletAddress);
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('获取用户失败:', error);
      return null;
    }
  }

  static async getUserByReferralCode(referralCode: string): Promise<User | null> {
    // 如果在模拟模式下，使用模拟服务
    if (isUsingMockMode) {
      return MockDatabaseService.getUserByReferralCode(referralCode);
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('referral_code', referralCode)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('获取用户失败:', error);
      return null;
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
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

  // 奖励系统
  static async giveWelcomeReward(userId: string): Promise<boolean> {
    try {
      // 添加余额
      const { error: balanceError } = await supabase.rpc('add_user_balance', {
        user_id: userId,
        amount: REWARD_CONFIG.WELCOME_BONUS
      });

      if (balanceError) throw balanceError;

      // 记录奖励
      const { error: recordError } = await supabase
        .from('reward_records')
        .insert([{
          user_id: userId,
          reward_type: 'welcome',
          amount: REWARD_CONFIG.WELCOME_BONUS,
          description: '新用户欢迎奖励',
          status: 'completed',
          completed_at: new Date().toISOString(),
        }]);

      if (recordError) throw recordError;
      return true;
    } catch (error) {
      console.error('发放欢迎奖励失败:', error);
      return false;
    }
  }

  static async processReferralRewards(newUserId: string, referralCode: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('process_referral_rewards', {
        new_user_id: newUserId,
        referral_code: referralCode
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('处理邀请奖励失败:', error);
      return false;
    }
  }

  // 邀请系统
  static async createInviteLink(userId: string): Promise<string | null> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return null;

      const inviteLink = `${config.app.url}/invite/${user.wallet_address}`;
      
      // 创建邀请记录
      const { error } = await supabase
        .from('invitations')
        .insert([{
          inviter_id: userId,
          referral_code: user.referral_code,
          invite_link: inviteLink,
          status: 'pending',
          level: 1,
          reward_amount: REWARD_CONFIG.REFERRAL_L1,
        }]);

      if (error) throw error;
      return inviteLink;
    } catch (error) {
      console.error('创建邀请链接失败:', error);
      return null;
    }
  }

  static async acceptInvitation(inviterWalletAddress: string, inviteeWalletAddress: string): Promise<boolean> {
    try {
      // 查找邀请人
      const inviter = await this.getUserByWalletAddress(inviterWalletAddress);
      if (!inviter) return false;

      // 获取新用户
      const newUser = await this.getUserByWalletAddress(inviteeWalletAddress);
      if (!newUser) return false;

      // 更新用户的推荐关系
      await this.updateUser(newUser.id, { referred_by: inviter.id });

      // 更新邀请记录
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          invitee_id: newUser.id,
          invitee_wallet_address: inviteeWalletAddress.toLowerCase(),
          accepted_at: new Date().toISOString(),
        })
        .eq('inviter_id', inviter.id)
        .eq('status', 'pending');

      if (updateError) throw updateError;

      // 处理多级奖励
      await this.processReferralRewards(newUser.id, inviter.referral_code);

      return true;
    } catch (error) {
      console.error('接受邀请失败:', error);
      return false;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
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

  static async getInvitationsByUser(userId: string): Promise<Invitation[]> {
    try {
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

  static async getRewardRecords(userId: string): Promise<RewardRecord[]> {
    try {
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

  // 会话管理
  static async createSession(sessionData: Partial<UserSession>): Promise<UserSession | null> {
    try {
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
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
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

  // 工具方法
  static generateReferralCode(): string {
    return 'ANGEL' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  static generateInviteLink(walletAddress: string): string {
    return `${config.app.url}/invite/${walletAddress}`;
  }

  // 管理员方法
  static async getAllUsers(): Promise<User[]> {
    try {
      if (isUsingMockMode) {
        return MockDatabaseService.getAllUsers();
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
      if (isUsingMockMode) {
        return MockDatabaseService.getAllInvitations();
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

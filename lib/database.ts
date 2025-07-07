import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// 检查是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

// 初始化Supabase客户端
let supabase: ReturnType<typeof createClient> | null = null;

// 初始化Supabase客户端
function initSupabase() {
  try {
    if (typeof window !== 'undefined') {
      console.log('在浏览器环境中初始化Supabase客户端');
    } else {
      console.log('在服务器环境中初始化Supabase客户端');
    }
    
    if (!config.supabase.url || !config.supabase.anonKey) {
      console.error('Supabase配置缺失:', {
        url: config.supabase.url ? '已设置' : '未设置',
        key: config.supabase.anonKey ? '已设置' : '未设置'
      });
      throw new Error('Supabase配置缺失');
    }
    
    // 创建客户端时添加额外选项以处理潜在的代理问题
    supabase = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            'x-client-info': 'angel-crypto-app'
          }
        }
      }
    );
    
    console.log('Supabase客户端初始化成功');
  } catch (error) {
    console.error('初始化Supabase客户端失败:', error);
    supabase = null;
    throw error;
  }
}

// 尝试初始化Supabase客户端
try {
  initSupabase();
} catch (error) {
  console.error('初始化Supabase客户端时出错:', error);
}

// 验证 Supabase 配置
const validateSupabaseConfig = () => {
  const url = config.supabase.url;
  const key = config.supabase.anonKey;
  
  console.log('🔍 检查 Supabase 配置:');
  console.log('   URL:', url ? `${url.substring(0, 30)}...` : '未设置');
  console.log('   Key:', key ? `${key.substring(0, 30)}...` : '未设置');
  
  if (!url || !key || url.includes('your-') || key.includes('your-') || url.includes('placeholder') || key.includes('placeholder')) {
    console.warn('Supabase 配置未找到或使用默认值，将使用模拟模式');
    return { url, key, isValid: false };
  }
  
  return { url, key, isValid: true };
};

const { url, key, isValid } = validateSupabaseConfig();

// 创建 Supabase 客户端 
const supabaseClient = isValid && url && key ? createClient(
  url, 
  key,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-client-info': 'angel-crypto-app'
      }
    }
  }
) : null;

// 如果数据库不可用，抛出错误
if (!supabaseClient) {
  console.error('❌ Supabase 客户端初始化失败！请检查环境变量配置：');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// 标记数据库是否可用
export const isDatabaseAvailable = isValid && supabaseClient !== null;

// 奖励配置
export const REWARD_CONFIG = {
  WELCOME_BONUS: 10000,    // 新用户注册奖励
  REFERRAL_L1: 3000,       // 一级邀请奖励
  REFERRAL_L2: 1500,       // 二级邀请奖励
  REFERRAL_L3: 500,        // 三级邀请奖励
} as const;

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

// 先定义一些类型安全的辅助函数，用于确保对象符合User接口要求

// 增强ensureUser函数以提供更好的类型安全
function ensureUser(data: any): User | null {
  if (!data) return null;
  
  // 确保至少有必要的字段
  if (typeof data.id !== 'string' || typeof data.wallet_address !== 'string') {
    console.warn('数据缺少User必要字段:', data);
    return null;
  }
  
  // 构造一个规范的User对象
  const user: User = {
    id: data.id,
    wallet_address: data.wallet_address,
    email: data.email || undefined,
    username: data.username || undefined,
    avatar_url: data.avatar_url || undefined,
    referred_by: data.referred_by || undefined,
    invites_count: safeNumber(data.invites_count),
    angel_balance: safeNumber(data.angel_balance),
    total_earned: safeNumber(data.total_earned),
    level: safeNumber(data.level),
    is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
    is_admin: typeof data.is_admin === 'boolean' ? data.is_admin : false,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
  
  return user;
}

function ensureUserArray(data: any[]): User[] {
  if (!data) return [];
  return data.filter(item => 
    typeof item.id === 'string' && 
    typeof item.wallet_address === 'string'
  ) as User[];
}

// 增强ensureInvitation函数以提供更好的类型安全
function ensureInvitation(data: any): Invitation | null {
  if (!data) return null;
  
  // 确保至少有必要的字段
  if (typeof data.id !== 'string' || 
      typeof data.inviter_id !== 'string' || 
      typeof data.invitee_id !== 'string' ||
      typeof data.invite_code !== 'string' ||
      typeof data.status !== 'string') {
    console.warn('数据缺少Invitation必要字段:', data);
    return null;
  }
  
  // 构造一个规范的Invitation对象
  const invitation: Invitation = {
    id: data.id,
    inviter_id: data.inviter_id,
    invitee_id: data.invitee_id,
    invite_code: data.invite_code,
    status: data.status,
    reward_amount: safeNumber(data.reward_amount),
    created_at: data.created_at || undefined,
    updated_at: data.updated_at || undefined
  };
  
  return invitation;
}

function ensureInvitationArray(data: any[]): Invitation[] {
  if (!data) return [];
  return data.filter(item => 
    typeof item.id === 'string' && 
    typeof item.inviter_id === 'string' &&
    typeof item.invitee_id === 'string' &&
    typeof item.invite_code === 'string' &&
    typeof item.status === 'string'
  ) as Invitation[];
}

function ensureRewardRecordArray(data: any[]): RewardRecord[] {
  if (!data) return [];
  return data.filter(item => 
    typeof item.id === 'string' && 
    typeof item.user_id === 'string' &&
    typeof item.reward_type === 'string' &&
    typeof item.amount === 'number' &&
    typeof item.status === 'string' &&
    typeof item.created_at === 'string'
  ) as RewardRecord[];
}

function ensureUserSession(data: any): UserSession | null {
  if (!data) return null;
  
  // 确保至少有必要的字段
  if (typeof data.id !== 'string' || 
      typeof data.user_id !== 'string' || 
      typeof data.wallet_address !== 'string' ||
      typeof data.session_token !== 'string' ||
      typeof data.expires_at !== 'string' ||
      typeof data.created_at !== 'string') {
    console.warn('数据缺少UserSession必要字段:', data);
    return null;
  }
  
  return data as UserSession;
}

// 增强safeNumber函数以确保类型安全
function safeNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// 主数据库服务类
export class DatabaseService {
  // 获取Supabase客户端实例
  static supabase() {
    try {
      if (!supabase) {
        console.error('Supabase 客户端未初始化，尝试重新初始化...');
        initSupabase();
        
        if (!supabase) {
          throw new Error('无法初始化 Supabase 客户端');
        }
      }
      return supabase;
    } catch (error) {
      console.error('获取 Supabase 客户端失败:', error);
      // 尝试使用备用方法初始化
      try {
        const { createClient } = require('@supabase/supabase-js');
        const backupClient = createClient(
          config.supabase.url,
          config.supabase.anonKey,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
            global: {
              headers: {
                'x-client-info': 'angel-crypto-app'
              }
            }
          }
        );
        console.log('使用备用方法创建 Supabase 客户端');
        return backupClient;
      } catch (backupError) {
        console.error('备用初始化也失败:', backupError);
        throw new Error('数据库连接失败，请检查网络和配置');
      }
    }
  }

  // 检查数据库连接是否正常
  static async isHealthy(): Promise<boolean> {
    try {
      console.log('开始数据库健康检查...');
      console.log('Supabase URL:', config.supabase.url);
      console.log('Supabase Key (前10位):', config.supabase.anonKey.substring(0, 10) + '...');
      
      const client = this.supabase();
      
      // 使用 RPC 函数替代直接查询，避免 RLS 权限问题
      const { data, error } = await client.rpc('check_database_health');
      
      if (error) {
        console.error('数据库健康检查失败:', error);
        // 备用方案：如果RPC不可用，尝试简单的 REST API 请求检查连接
        const { error: restError } = await client.from('public').select('count(*)', { head: true });
        if (restError) {
          console.error('备用健康检查也失败:', restError);
          return false;
        }
        console.log('备用健康检查成功');
        return true;
      }
      
      console.log('数据库健康检查成功');
      return true;
    } catch (error) {
      console.error('数据库健康检查出现异常:', error);
      return false;
    }
  }

  // 检查用户是否存在 - 使用 RPC 函数
  static async isUserExists(walletAddress: string): Promise<boolean> {
    try {
      const client = this.supabase();
      const { data, error } = await client.rpc('is_user_exists', { wallet: walletAddress });
      
      if (error) {
        console.error('检查用户是否存在失败:', error);
        return false;
      }
      
      return Boolean(data);
    } catch (error) {
      console.error('检查用户是否存在时出现异常:', error);
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
      if (data && data.id && typeof data.id === 'string') {
        await this.recordWelcomeReward(data.id);
      }

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

      // 确保钱包地址为小写
      const normalizedAddress = walletAddress.toLowerCase();
      console.log('🔍 查询用户，钱包地址:', normalizedAddress);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', normalizedAddress)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('数据库查询错误:', error);
        return null;
      }
      
      if (data) {
        console.log('✅ 找到用户:', data.id);
      } else {
        console.log('❌ 未找到用户:', normalizedAddress);
      }
      
      return ensureUser(data);
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
      return ensureUser(data);
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

      // 确保钱包地址为小写
      const normalizedNewUserWallet = newUserWallet.toLowerCase();
      const normalizedInviterWallet = inviterWallet.toLowerCase();

      console.log('🔄 开始处理邀请注册:', {
        newUserWallet: normalizedNewUserWallet,
        inviterWallet: normalizedInviterWallet
      });

      // 首先尝试使用新的简化函数
      console.log('🔄 尝试使用新的简化函数处理邀请...');
      try {
        const { data: simpleResult, error: simpleError } = await supabase
          .rpc('simple_invite_process', {
            new_user_wallet: normalizedNewUserWallet,
            inviter_wallet: normalizedInviterWallet
          });
        
        if (!simpleError && simpleResult === true) {
          console.log('✅ 使用新的简化函数处理邀请成功');
          return true;
        } else if (simpleError) {
          console.log('⚠️ 新的简化函数调用失败，尝试其他方法:', simpleError);
        }
      } catch (simpleErr) {
        console.log('⚠️ 新的简化函数调用异常，尝试其他方法:', simpleErr);
      }

      // 尝试使用旧的简单函数
      console.log('🔄 尝试使用旧的简单函数插入邀请记录...');
      try {
        const { data: simpleResult, error: simpleError } = await supabase
          .rpc('simple_insert_invitation', {
            new_user_wallet: normalizedNewUserWallet,
            inviter_wallet: normalizedInviterWallet
          });
        
        if (!simpleError && simpleResult === true) {
          console.log('✅ 使用旧的简单函数插入邀请记录成功');
          return true;
        } else if (simpleError) {
          console.log('⚠️ 旧的简单函数调用失败，尝试其他方法:', simpleError);
        }
      } catch (simpleErr) {
        console.log('⚠️ 旧的简单函数调用异常，尝试其他方法:', simpleErr);
      }

      // 先检查两个钱包地址是否存在于用户表中
      console.log('🔍 检查新用户是否存在...');
      const { data: newUserRaw, error: newUserError } = await supabase
        .from('users')
        .select('id, wallet_address')
        .eq('wallet_address', normalizedNewUserWallet)
        .single();
      
      if (newUserError) {
        console.error('❌ 查询新用户失败:', newUserError);
        return false;
      }
      
      if (!newUserRaw) {
        console.error('❌ 新用户不存在:', normalizedNewUserWallet);
        return false;
      }
      
      console.log('✅ 新用户存在:', newUserRaw);
      
      console.log('🔍 检查邀请人是否存在...');
      const { data: inviterRaw, error: inviterError } = await supabase
        .from('users')
        .select('id, wallet_address, invites_count')
        .eq('wallet_address', normalizedInviterWallet)
        .single();
      
      if (inviterError) {
        console.error('❌ 查询邀请人失败:', inviterError);
        return false;
      }
      
      if (!inviterRaw) {
        console.error('❌ 邀请人不存在:', normalizedInviterWallet);
        return false;
      }
      
      console.log('✅ 邀请人存在:', inviterRaw);

      // 检查是否已经处理过这个邀请
      console.log('🔍 检查是否已处理过此邀请...');
      const { data: existingInvite, error: existingError } = await supabase
        .from('invitations')
        .select('id')
        .eq('inviter_id', inviterRaw.id)
        .eq('invitee_id', newUserRaw.id)
        .maybeSingle();
      
      if (existingError) {
        console.error('❌ 检查现有邀请失败:', existingError);
        return false;
      }
      
      if (existingInvite) {
        console.log('⚠️ 已存在邀请记录，无需重复处理');
        return true; // 已经处理过，认为成功
      }
      
      // 创建邀请记录
      console.log('🔄 创建邀请记录...');
      const inviteCode = crypto.randomUUID().slice(0, 8);
      
      const { error: insertError } = await supabase
        .from('invitations')
        .insert([
          {
            inviter_id: inviterRaw.id,
            invitee_id: newUserRaw.id,
            invite_code: inviteCode,
            status: 'accepted',
            reward_amount: REWARD_CONFIG.REFERRAL_L1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      
      if (insertError) {
        console.error('❌ 创建邀请记录失败:', insertError);
        return false;
      }
      
      console.log('✅ 创建邀请记录成功');
      
      // 更新邀请人的邀请计数
      console.log('🔄 更新邀请人的邀请计数...');
      try {
        // 获取当前invites_count
        const { data: currentInviter, error: fetchError } = await supabase
          .from('users')
          .select('invites_count')
          .eq('id', inviterRaw.id)
          .single();
        
        if (fetchError) {
          console.error('❌ 获取邀请人信息失败:', fetchError);
          return false;
        }
        
        // 安全地读取和计算新的invites_count值
        const currentCount = currentInviter?.invites_count || 0;
        const newCount = currentCount + 1;
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ invites_count: newCount })
          .eq('id', inviterRaw.id);
        
        if (updateError) {
          console.error('❌ 更新邀请计数失败:', updateError);
          return false;
        }
      } catch (error) {
        console.error('❌ 更新邀请计数异常:', error);
        return false;
      }
      
      console.log('✅ 更新邀请计数成功');
      
      // 分发奖励
      console.log('🔄 分发奖励...');
      try {
        // 记录一级邀请奖励
        const { error: rewardError } = await supabase
          .from('reward_records')
          .insert([
            {
              user_id: String(inviterRaw.id),
              reward_type: 'referral_l1' as const,
              amount: REWARD_CONFIG.REFERRAL_L1,
              description: `邀请奖励 L1 - 成功邀请用户 ${newUserWallet}`,
              related_user_id: String(newUserRaw.id),
              status: 'completed' as const,
              created_at: new Date().toISOString(),
              completed_at: new Date().toISOString()
            }
          ]);
        
        if (rewardError) {
          console.error('❌ 记录奖励失败:', rewardError);
          return false;
        }
        
        // 更新邀请人的余额 - 不使用RPC函数，直接获取当前值并更新
        const { data: balanceData, error: fetchBalanceError } = await supabase
          .from('users')
          .select('angel_balance, total_earned')
          .eq('id', String(inviterRaw.id))
          .single();
        
        if (fetchBalanceError) {
          console.error('❌ 获取余额信息失败:', fetchBalanceError);
          return false;
        }
        
        // 安全地处理数值，确保是数字类型
        const currentBalance = safeNumber(balanceData?.angel_balance);
        const currentTotalEarned = safeNumber(balanceData?.total_earned);
        
        // 计算新值并更新
        const newBalance = currentBalance + REWARD_CONFIG.REFERRAL_L1;
        const newTotalEarned = currentTotalEarned + REWARD_CONFIG.REFERRAL_L1;
        
        const { error: balanceError } = await supabase
          .from('users')
          .update({ 
            angel_balance: newBalance,
            total_earned: newTotalEarned
          })
          .eq('id', String(inviterRaw.id));
        
        if (balanceError) {
          console.error('❌ 更新余额失败:', balanceError);
          return false;
        }
      } catch (error) {
        console.error('❌ 分发奖励异常:', error);
        return false;
      }
      
      console.log('✅ 分发奖励成功');
      console.log('✅ 邀请处理完成');
      
      return true;
    } catch (error) {
      console.error('❌ 处理邀请异常:', error);
      return false;
    }
  }

  // 直接插入邀请记录（备用方法）
  static async directInsertInvitation(newUserWallet: string, inviterWallet: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return false;
      }

      // 先检查两个钱包地址是否存在于用户表中
      console.log('🔍 检查新用户是否存在...');
      const { data: newUserRaw, error: newUserError } = await supabase
        .from('users')
        .select('id, wallet_address')
        .eq('wallet_address', newUserWallet.toLowerCase())
        .single();
      
      if (newUserError) {
        console.error('❌ 查询新用户失败:', newUserError);
        return false;
      }
      
      if (!newUserRaw) {
        console.error('❌ 新用户不存在:', newUserWallet);
        return false;
      }
      
      // 使用类型断言确保数据符合要求
      const newUserData = {
        id: String(newUserRaw.id),
        wallet_address: String(newUserRaw.wallet_address)
      };
      
      console.log('✅ 新用户存在:', newUserData);
      
      console.log('🔍 检查邀请人是否存在...');
      const { data: inviterRaw, error: inviterError } = await supabase
        .from('users')
        .select('id, wallet_address')
        .eq('wallet_address', inviterWallet.toLowerCase())
        .single();
      
      if (inviterError) {
        console.error('❌ 查询邀请人失败:', inviterError);
        return false;
      }
      
      if (!inviterRaw) {
        console.error('❌ 邀请人不存在:', inviterWallet);
        return false;
      }
      
      // 使用类型断言确保数据符合要求
      const inviterData = {
        id: String(inviterRaw.id),
        wallet_address: String(inviterRaw.wallet_address)
      };
      
      console.log('✅ 邀请人存在:', inviterData);

      // 检查是否已经存在邀请记录
      const { data: existingInvite } = await supabase
        .from('invitations')
        .select('id')
        .eq('inviter_wallet_address', inviterWallet.toLowerCase())
        .eq('invitee_wallet_address', newUserWallet.toLowerCase())
        .single();
      
      if (existingInvite) {
        console.log('ℹ️ 邀请记录已存在，无需重复插入');
        return true;
      }

      // 插入邀请记录
      const { data, error } = await supabase
        .from('invitations')
        .insert([{
          inviter_id: inviterData.id,
          invitee_id: newUserData.id,
          inviter_wallet_address: inviterWallet.toLowerCase(),
          invitee_wallet_address: newUserWallet.toLowerCase(),
          status: 'accepted',
          level: 1,
          reward_amount: 50,
          reward_claimed: false,
          created_at: new Date().toISOString(),
          accepted_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select();

      if (error) {
        console.error('❌ 插入邀请记录失败:', error);
        return false;
      }

      console.log('✅ 插入邀请记录成功:', data);
      
      // 更新用户关系
      await supabase
        .from('users')
        .update({ referred_by: inviterData.id })
        .eq('id', newUserData.id);
      
      // 更新邀请统计
      const { data: currentInviter } = await supabase
        .from('users')
        .select('invites_count')
        .eq('id', inviterData.id)
        .single();
        
      await supabase
        .from('users')
        .update({ 
          invites_count: (currentInviter?.invites_count || 0) + 1 
        })
        .eq('id', inviterData.id);
      
      return true;
    } catch (error: any) {
      console.error('❌ 直接插入邀请异常:', error);
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

  static async getInvitationsByUser(userId: string): Promise<Invitation[]> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return [];
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('inviter_id', userId);
      
      if (error) {
        console.error('获取用户邀请记录失败:', error);
        return [];
      }
      
      // 使用安全的类型转换
      return data ? ensureInvitationArray(data) : [];
    } catch (error) {
      console.error('获取用户邀请记录异常:', error);
      return [];
    }
  }

  static async getInvitationsByInviterWallet(inviterWallet: string): Promise<Invitation[]> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return [];
      }

      // 先获取邀请者ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', inviterWallet.toLowerCase())
        .single();
      
      if (userError || !userData) {
        console.error('获取邀请者ID失败:', userError);
        return [];
      }
      
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('inviter_id', userData.id);
      
      if (error) {
        console.error('获取邀请记录失败:', error);
        return [];
      }
      
      // 使用安全的类型转换
      return data ? ensureInvitationArray(data) : [];
    } catch (error) {
      console.error('获取邀请记录异常:', error);
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
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return [];
      }

      const { data, error } = await supabase
        .from('reward_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('获取奖励记录失败:', error);
        return [];
      }
      
      // 使用安全的类型转换
      return data ? ensureRewardRecordArray(data) : [];
    } catch (error) {
      console.error('获取奖励记录异常:', error);
      return [];
    }
  }

  // 通过ID获取用户
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
      
      if (error && error.code !== 'PGRST116') {
        console.error('获取用户失败:', error);
        return null;
      }
      
      // 使用安全的类型转换
      return ensureUser(data);
    } catch (error) {
      console.error('获取用户异常:', error);
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

      // 检查必要参数
      if (!sessionData.user_id || !sessionData.wallet_address) {
        console.error('创建会话缺少必要参数');
        return null;
      }

      // 生成随机token
      const sessionToken = crypto.randomUUID();

      const { data, error } = await supabase
        .from('user_sessions')
        .insert([{
          user_id: sessionData.user_id,
          wallet_address: sessionData.wallet_address,
          session_token: sessionToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后过期
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        console.error('创建会话失败:', error);
        return null;
      }
      
      // 使用安全的类型转换
      return ensureUserSession(data);
    } catch (error) {
      console.error('创建会话异常:', error);
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
      
      if (error) {
        console.error('获取会话失败:', error);
        return null;
      }
      
      // 使用安全的类型转换
      return ensureUserSession(data);
    } catch (error) {
      console.error('获取会话异常:', error);
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

  // 获取所有用户
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
      
      if (error) {
        console.error('获取所有用户失败:', error);
        return [];
      }
      
      // 使用安全的类型转换
      return data ? ensureUserArray(data) : [];
    } catch (error) {
      console.error('获取所有用户异常:', error);
      return [];
    }
  }

  // 获取所有邀请
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
      
      if (error) {
        console.error('获取所有邀请记录失败:', error);
        return [];
      }
      
      // 使用安全的类型转换
      return data ? ensureInvitationArray(data) : [];
    } catch (error) {
      console.error('获取所有邀请记录异常:', error);
      return [];
    }
  }

  // 获取用户的邀请
  static async getUserInvitations(userId: string): Promise<Invitation[]> {
    try {
      const { data, error } = await this.supabase()
        .from('invitations')
        .select('*')
        .eq('inviter_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取用户邀请失败:', error);
      return [];
    }
  }

  // 获取用户的被邀请记录
  static async getUserInvitedBy(userId: string): Promise<Invitation | null> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return null;
      }

      // 验证参数类型
      if (typeof userId !== 'string') {
        console.error('getUserInvitedBy 参数错误: userId必须是字符串');
        return null;
      }

      const { data: invitationData, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('invitee_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('查询邀请关系失败:', error);
        return null;
      }
      
      if (!invitationData) return null;
      
      // 构造标准化的Invitation对象
      const invitation: Invitation = {
        id: String(invitationData.id),
        inviter_id: String(invitationData.inviter_id),
        invitee_id: String(invitationData.invitee_id),
        invite_code: String(invitationData.invite_code),
        status: String(invitationData.status),
        reward_amount: safeNumber(invitationData.reward_amount),
        created_at: invitationData.created_at ? String(invitationData.created_at) : undefined,
        updated_at: invitationData.updated_at ? String(invitationData.updated_at) : undefined
      };
      
      return invitation;
    } catch (error) {
      console.error('获取邀请关系异常:', error);
      return null;
    }
  }

  // 数据库诊断工具
  static async diagnoseInviteFunction(): Promise<any> {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase 配置未找到'
        };
      }

      console.log('🔍 开始诊断邀请函数...');

      // 1. 检查基本连接
      console.log('1. 检查数据库连接');
      const { data: healthCheck, error: healthError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (healthError) {
        console.error('❌ 数据库连接失败:', healthError);
        return {
          success: false,
          error: '数据库连接失败',
          details: healthError
        };
      }
      
      console.log('✅ 数据库连接正常');

      // 2. 检查函数是否存在
      console.log('2. 检查函数是否存在');
      let functionExists = false;
      let functionInfo = null;
      
      try {
        const { data: functions, error: functionError } = await supabase
          .rpc('get_function_info', { function_name: 'process_invite_registration' });
        
        if (functionError) {
          console.log('⚠️ 无法获取函数信息:', functionError);
        } else {
          functionExists = true;
          functionInfo = functions;
          console.log('✅ 函数存在:', functions);
        }
      } catch (funcError) {
        console.error('❌ 检查函数失败:', funcError);
      }
      
      // 3. 检查相关表是否存在
      console.log('3. 检查相关表是否存在');
      const tables = ['users', 'invitations', 'reward_records'];
      const tableResults: Record<string, { exists: boolean; error: string | null; count?: number }> = {};
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('count(*)')
            .limit(1);
            
          tableResults[table] = {
            exists: !error,
            error: error ? error.message : null,
            count: data ? data.length : 0
          };
          
          console.log(`${!error ? '✅' : '❌'} 表 ${table}: ${!error ? '存在' : '不存在或无权限'}`);
        } catch (tableError: any) {
          tableResults[table] = {
            exists: false,
            error: tableError.message || '未知错误'
          };
          console.error(`❌ 检查表 ${table} 失败:`, tableError);
        }
      }
      
      // 4. 测试函数调用
      console.log('4. 测试函数调用');
      let functionCallable = false;
      let testCallResult = null;
      let testCallError = null;
      
      try {
        // 使用无效参数测试调用
        const { data: testCall, error: testError } = await supabase
          .rpc('process_invite_registration', {
            new_user_wallet: '0x0000000000000000000000000000000000000001',
            inviter_wallet: '0x0000000000000000000000000000000000000002'
          });
          
        functionCallable = !testError;
        testCallResult = testCall;
        testCallError = testError;
        
        console.log(`${!testError ? '✅' : '❌'} 函数调用: ${!testError ? '成功' : '失败'}`);
        if (testError) console.error('函数调用错误:', testError);
      } catch (callError) {
        testCallError = callError;
        console.error('❌ 函数调用异常:', callError);
      }

      return {
        success: true,
        timestamp: new Date().toISOString(),
        databaseConnected: !healthError,
        functionExists,
        functionInfo,
        tableStatus: tableResults,
        functionCallable,
        testCallResult,
        testCallError,
        summary: {
          databaseConnected: !healthError,
          functionExists,
          functionCallable,
          tablesExist: Object.values(tableResults).every((t: { exists: boolean }) => t.exists)
        }
      };

    } catch (error: any) {
      console.error('❌ 诊断过程中发生错误:', error);
      return {
        success: false,
        error: '诊断失败',
        details: {
          message: error?.message || '未知错误',
          code: error?.code || 'NO_CODE',
          stack: error?.stack || '无堆栈信息'
        }
      };
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
  static async directInsertInvitationById(newUserWalletAddress: string, inviterId: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.error('Supabase 配置未找到，请配置数据库连接');
        return false;
      }

      // 检查新用户是否存在
      console.log('🔍 通过钱包地址查找新用户...');
      const { data: newUserData, error: newUserError } = await supabase
        .from('users')
        .select('id, wallet_address')
        .eq('wallet_address', newUserWalletAddress.toLowerCase())
        .single();
      
      if (newUserError) {
        console.error('❌ 查询新用户失败:', newUserError);
        return false;
      }
      
      if (!newUserData) {
        console.error('❌ 新用户不存在:', newUserWalletAddress);
        return false;
      }
      
      console.log('✅ 找到新用户:', newUserData);
      
      // 检查邀请人是否存在
      console.log('🔍 通过ID查找邀请人...');
      const { data: inviterRaw, error: inviterError } = await supabase
        .from('users')
        .select('id, wallet_address')
        .eq('id', inviterId)
        .single();
      
      if (inviterError) {
        console.error('❌ 查询邀请人失败:', inviterError);
        return false;
      }
      
      if (!inviterRaw) {
        console.error('❌ 邀请人不存在，ID:', inviterId);
        return false;
      }
      
      // 使用类型断言确保数据符合要求
      const inviterData = {
        id: String(inviterRaw.id),
        wallet_address: String(inviterRaw.wallet_address)
      };
      
      console.log('✅ 找到邀请人:', inviterData);
      
      // 检查是否已经存在邀请记录
      console.log('🔍 检查是否已存在邀请...');
      const { data: existingInvite, error: existingError } = await supabase
        .from('invitations')
        .select('id')
        .eq('inviter_id', inviterData.id)
        .eq('invitee_id', newUserData.id)
        .maybeSingle();
      
      if (existingError) {
        console.error('❌ 检查现有邀请失败:', existingError);
        return false;
      }
      
      if (existingInvite) {
        console.log('⚠️ 已存在邀请记录，无需重复处理');
        return true; // 已处理过，返回成功
      }
      
      // 创建邀请记录
      console.log('🔄 创建邀请记录...');
      const inviteCode = crypto.randomUUID().slice(0, 8);
      
      const { error: insertError } = await supabase
        .from('invitations')
        .insert([
          {
            inviter_id: inviterData.id,
            invitee_id: newUserData.id,
            invite_code: inviteCode,
            status: 'accepted',
            reward_amount: REWARD_CONFIG.REFERRAL_L1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      
      if (insertError) {
        console.error('❌ 创建邀请记录失败:', insertError);
        return false;
      }
      
      console.log('✅ 创建邀请记录成功');
      
      // 更新邀请人的邀请计数
      console.log('🔄 更新邀请人的邀请计数...');
      try {
        // 获取当前用户数据
        const { data: currentInviterRaw, error: fetchError } = await supabase
          .from('users')
          .select('invites_count, angel_balance, total_earned')
          .eq('id', String(inviterData.id))
          .single();
        
        if (fetchError) {
          console.error('❌ 获取邀请人信息失败:', fetchError);
          return false;
        }
        
        // 安全地解析当前值，确保都是数字类型
        const currentInvitesCount = safeNumber(currentInviterRaw?.invites_count);
        const currentBalance = safeNumber(currentInviterRaw?.angel_balance);
        const currentTotalEarned = safeNumber(currentInviterRaw?.total_earned);
        
        // 计算新值（确保类型正确）
        const newInvitesCount = currentInvitesCount + 1;
        const newBalance = currentBalance + REWARD_CONFIG.REFERRAL_L1;
        const newTotalEarned = currentTotalEarned + REWARD_CONFIG.REFERRAL_L1;
        
        // 更新用户数据
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            invites_count: newInvitesCount,
            angel_balance: newBalance,
            total_earned: newTotalEarned
          })
          .eq('id', String(inviterData.id));
        
        if (updateError) {
          console.error('❌ 更新邀请人数据失败:', updateError);
          return false;
        }
        
        // 记录奖励
        const { error: rewardError } = await supabase
          .from('reward_records')
          .insert([
            {
              user_id: String(inviterData.id),
              reward_type: 'referral_l1' as const,
              amount: REWARD_CONFIG.REFERRAL_L1,
              description: `邀请奖励 L1 - 成功邀请用户 ${newUserWalletAddress}`,
              related_user_id: String(newUserData.id),
              status: 'completed' as const,
              created_at: new Date().toISOString(),
              completed_at: new Date().toISOString()
            }
          ]);
        
        if (rewardError) {
          console.error('❌ 记录奖励失败:', rewardError);
        }
      } catch (error) {
        console.error('❌ 更新邀请计数异常:', error);
        return false;
      }
      
      console.log('✅ 更新邀请计数和余额成功');
      return true;
    } catch (error) {
      console.error('❌ 直接插入邀请异常:', error);
      return false;
    }
  }
}

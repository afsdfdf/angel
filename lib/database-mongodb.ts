// @ts-nocheck

/**
 * MongoDB Atlas 数据库服务
 * 提供连接和数据访问功能
 */
import { MongoClient, Db, ObjectId } from 'mongodb';
import { mongodbConfig } from './mongodb-config';

// 数据模型定义
export interface User {
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

export interface Invitation {
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

export interface RewardRecord {
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

// 奖励配置
export const REWARD_CONFIG = {
  WELCOME_BONUS: 10000,
  REFERRAL_L1: 3000,
  REFERRAL_L2: 1500,
  REFERRAL_L3: 500
};

// MongoDB客户端和数据库连接
let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * 连接到MongoDB数据库
 */
export async function connectToDatabase() {
  if (client && db) {
    return { client, db };
  }
  
  try {
    client = new MongoClient(mongodbConfig.uri);
    await client.connect();
    db = client.db(mongodbConfig.dbName);
    console.log('✅ MongoDB连接成功');
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error);
    throw error;
  }
}

/**
 * 检查数据库连接是否正常
 */
export async function isHealthy(): Promise<boolean> {
  try {
    console.log('检查数据库连接...');
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    console.log('数据库连接正常');
    return true;
  } catch (error) {
    console.error('数据库连接检查异常:', error);
    return false;
  }
}

/**
 * 检查用户是否存在
 */
export async function isUserExists(walletAddress: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const normalizedAddress = walletAddress.toLowerCase();
    
    const user = await db.collection('users').findOne({ 
      wallet_address: normalizedAddress 
    });
    
    return !!user;
  } catch (error) {
    console.error('检查用户是否存在异常:', error);
    return false;
  }
}

/**
 * 通过钱包地址获取用户
 */
export async function getUserByWalletAddress(walletAddress: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase();
    const normalizedAddress = walletAddress.toLowerCase();
    
    const user = await db.collection('users').findOne({ 
      wallet_address: normalizedAddress 
    });
    
    if (!user) return null;
    
    // 确保用户有一个string类型的id属性
    if (user._id && !user.id) {
      user.id = user._id.toString();
    }
    
    return user as User;
  } catch (error) {
    console.error('获取用户信息异常:', error);
    return null;
  }
}

/**
 * 通过ID获取用户
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { db } = await connectToDatabase();
    
    const user = await db.collection('users').findOne({ 
      $or: [
        { _id: new ObjectId(userId) },
        { id: userId }
      ]
    });
    
    if (!user) return null;
    
    // 确保用户有一个string类型的id属性
    if (user._id && !user.id) {
      user.id = user._id.toString();
    }
    
    return user as User;
  } catch (error) {
    console.error('通过ID获取用户信息异常:', error);
    return null;
  }
}

/**
 * 创建用户
 */
export async function createUser(userData: Partial<User>): Promise<User | null> {
  try {
    const { db } = await connectToDatabase();
    
    // 确保钱包地址有值且转换为小写
    if (!userData.wallet_address) {
      throw new Error('钱包地址是必需的');
    }
    
    const walletAddress = userData.wallet_address.toLowerCase();
    
    // 检查用户是否已存在
    const existingUser = await getUserByWalletAddress(walletAddress);
    if (existingUser) {
      return existingUser;
    }
    
    // 创建新用户
    const now = new Date().toISOString();
    const newUser: User = {
      wallet_address: walletAddress,
      email: userData.email,
      username: userData.username || `用户_${walletAddress.substring(0, 6)}`,
      avatar_url: userData.avatar_url,
      referred_by: userData.referred_by,
      invites_count: 0,
      angel_balance: REWARD_CONFIG.WELCOME_BONUS,
      total_earned: REWARD_CONFIG.WELCOME_BONUS,
      level: 1,
      is_active: true,
      is_admin: false,
      created_at: now,
      updated_at: now
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    if (!result.acknowledged) {
      throw new Error('创建用户失败');
    }
    
    // 添加id属性
    newUser.id = result.insertedId.toString();
    
    // 创建欢迎奖励记录
    await createRewardRecord({
      user_id: newUser.id,
      reward_type: 'welcome',
      amount: REWARD_CONFIG.WELCOME_BONUS,
      description: '注册欢迎奖励',
      status: 'completed',
      created_at: now
    });
    
    return newUser;
  } catch (error) {
    console.error('创建用户异常:', error);
    return null;
  }
}

/**
 * 处理邀请注册
 */
export async function processInviteRegistration(newUserWallet: string, inviterWallet: string): Promise<boolean> {
  try {
    console.log('🔄 处理邀请注册开始:', { newUserWallet, inviterWallet });
    
    // 检查参数
    if (!newUserWallet || !inviterWallet) {
      console.error('❌ 邀请处理失败: 缺少必需参数');
      return false;
    }
    
    // 检查是否为同一个钱包地址
    if (newUserWallet.toLowerCase() === inviterWallet.toLowerCase()) {
      console.error('❌ 邀请处理失败: 不能邀请自己');
      return false;
    }
    
    const { db } = await connectToDatabase();
    
    // 确保钱包地址为小写
    const normalizedNewUserWallet = newUserWallet.toLowerCase();
    const normalizedInviterWallet = inviterWallet.toLowerCase();
    
    // 获取邀请人
    const inviter = await getUserByWalletAddress(normalizedInviterWallet);
    if (!inviter || !inviter.id) {
      console.error('❌ 邀请处理失败: 邀请人不存在');
      return false;
    }
    
    console.log('✅ 找到邀请人:', { 
      id: inviter.id,
      wallet: inviter.wallet_address,
      balance: inviter.angel_balance,
      invites_count: inviter.invites_count
    });
    
    // 获取新用户
    const newUser = await getUserByWalletAddress(normalizedNewUserWallet);
    if (!newUser || !newUser.id) {
      console.error('❌ 邀请处理失败: 新用户不存在');
      return false;
    }
    
    console.log('✅ 找到新用户:', { 
      id: newUser.id,
      wallet: newUser.wallet_address,
      referred_by: newUser.referred_by
    });
    
    // 检查邀请记录是否已存在
    const existingInvitation = await db.collection('invitations').findOne({
      inviter_id: inviter.id,
      invitee_id: newUser.id
    });
    
    if (existingInvitation) {
      console.log('⚠️ 邀请记录已存在:', existingInvitation);
      return true;
    }
    
    const now = new Date().toISOString();
    
    // 更新新用户的 referred_by 字段
    console.log('🔄 更新新用户的 referred_by 字段:', {
      userId: newUser.id,
      oldReferredBy: newUser.referred_by,
      newReferredBy: inviter.id
    });
    
    const updateUserResult = await db.collection('users').updateOne(
      { _id: new ObjectId(newUser.id) },
      { 
        $set: { 
          referred_by: inviter.id,
          updated_at: now 
        }
      }
    );
    
    console.log('✅ 更新用户结果:', {
      matched: updateUserResult.matchedCount,
      modified: updateUserResult.modifiedCount
    });
    
    // 创建邀请记录
    const invitation: Invitation = {
      inviter_id: inviter.id,
      invitee_id: newUser.id,
      invitee_wallet_address: normalizedNewUserWallet,
      inviter_wallet_address: normalizedInviterWallet,
      status: 'accepted',
      level: 1,
      reward_amount: REWARD_CONFIG.REFERRAL_L1,
      reward_claimed: true,
      created_at: now,
      accepted_at: now
    };
    
    console.log('🔄 创建邀请记录:', invitation);
    
    const inviteResult = await db.collection('invitations').insertOne(invitation);
    
    if (!inviteResult.acknowledged) {
      console.error('❌ 创建邀请记录失败');
      throw new Error('创建邀请记录失败');
    }
    
    console.log('✅ 创建邀请记录成功:', { id: inviteResult.insertedId.toString() });
    
    const invitationId = inviteResult.insertedId.toString();
    
    // 更新邀请人的邀请计数和奖励
    console.log('🔄 更新邀请人的邀请计数和奖励:', {
      inviterId: inviter.id,
      oldBalance: inviter.angel_balance,
      oldInvitesCount: inviter.invites_count,
      rewardAmount: REWARD_CONFIG.REFERRAL_L1
    });
    
    const updateInviterResult = await db.collection('users').updateOne(
      { _id: new ObjectId(inviter.id) },
      { 
        $inc: { 
          invites_count: 1,
          angel_balance: REWARD_CONFIG.REFERRAL_L1,
          total_earned: REWARD_CONFIG.REFERRAL_L1
        },
        $set: { updated_at: now }
      }
    );
    
    console.log('✅ 更新邀请人结果:', {
      matched: updateInviterResult.matchedCount,
      modified: updateInviterResult.modifiedCount
    });
    
    // 创建奖励记录
    console.log('🔄 创建邀请奖励记录');
    
    const rewardRecordId = await createRewardRecord({
      user_id: inviter.id,
      reward_type: 'referral_l1',
      amount: REWARD_CONFIG.REFERRAL_L1,
      description: `邀请奖励: ${normalizedNewUserWallet}`,
      related_user_id: newUser.id,
      related_invitation_id: invitationId,
      status: 'completed',
      created_at: now
    });
    
    console.log('✅ 创建奖励记录成功:', { id: rewardRecordId });
    
    // 处理二级邀请奖励（如果有）
    if (inviter.referred_by) {
      console.log('🔄 处理二级邀请奖励:', { l2InviterId: inviter.referred_by });
      
      const l2Inviter = await db.collection('users').findOne({ 
        _id: new ObjectId(inviter.referred_by) 
      });
      
      if (l2Inviter) {
        console.log('✅ 找到二级邀请人:', { 
          id: l2Inviter._id,
          wallet: l2Inviter.wallet_address,
          balance: l2Inviter.angel_balance
        });
        
        // 更新二级邀请人奖励
        const updateL2Result = await db.collection('users').updateOne(
          { _id: new ObjectId(l2Inviter._id) },
          { 
            $inc: { 
              angel_balance: REWARD_CONFIG.REFERRAL_L2,
              total_earned: REWARD_CONFIG.REFERRAL_L2
            },
            $set: { updated_at: now }
          }
        );
        
        console.log('✅ 更新二级邀请人结果:', {
          matched: updateL2Result.matchedCount,
          modified: updateL2Result.modifiedCount
        });
        
        // 创建二级奖励记录
        const l2RewardId = await createRewardRecord({
          user_id: l2Inviter._id.toString(),
          reward_type: 'referral_l2',
          amount: REWARD_CONFIG.REFERRAL_L2,
          description: `二级邀请奖励: ${normalizedNewUserWallet}`,
          related_user_id: newUser.id,
          related_invitation_id: invitationId,
          status: 'completed',
          created_at: now
        });
        
        console.log('✅ 创建二级奖励记录成功:', { id: l2RewardId });
        
        // 处理三级邀请奖励（如果有）
        if (l2Inviter.referred_by) {
          console.log('🔄 处理三级邀请奖励:', { l3InviterId: l2Inviter.referred_by });
          
          const l3Inviter = await db.collection('users').findOne({ 
            _id: new ObjectId(l2Inviter.referred_by) 
          });
          
          if (l3Inviter) {
            console.log('✅ 找到三级邀请人:', { 
              id: l3Inviter._id,
              wallet: l3Inviter.wallet_address,
              balance: l3Inviter.angel_balance
            });
            
            // 更新三级邀请人奖励
            const updateL3Result = await db.collection('users').updateOne(
              { _id: new ObjectId(l3Inviter._id) },
              { 
                $inc: { 
                  angel_balance: REWARD_CONFIG.REFERRAL_L3,
                  total_earned: REWARD_CONFIG.REFERRAL_L3
                },
                $set: { updated_at: now }
              }
            );
            
            console.log('✅ 更新三级邀请人结果:', {
              matched: updateL3Result.matchedCount,
              modified: updateL3Result.modifiedCount
            });
            
            // 创建三级奖励记录
            const l3RewardId = await createRewardRecord({
              user_id: l3Inviter._id.toString(),
              reward_type: 'referral_l3',
              amount: REWARD_CONFIG.REFERRAL_L3,
              description: `三级邀请奖励: ${normalizedNewUserWallet}`,
              related_user_id: newUser.id,
              related_invitation_id: invitationId,
              status: 'completed',
              created_at: now
            });
            
            console.log('✅ 创建三级奖励记录成功:', { id: l3RewardId });
          }
        }
      }
    }
    
    console.log('✅ 邀请处理完成');
    return true;
  } catch (error) {
    console.error('❌ 处理邀请异常:', error);
    return false;
  }
}

/**
 * 创建奖励记录
 */
export async function createRewardRecord(recordData: Partial<RewardRecord>): Promise<string | null> {
  try {
    const { db } = await connectToDatabase();
    
    const now = new Date().toISOString();
    const newRecord: RewardRecord = {
      user_id: recordData.user_id!,
      reward_type: recordData.reward_type!,
      amount: recordData.amount!,
      description: recordData.description || `${recordData.reward_type}奖励`,
      related_user_id: recordData.related_user_id,
      related_invitation_id: recordData.related_invitation_id,
      status: recordData.status || 'completed',
      created_at: now
    };
    
    const result = await db.collection('reward_records').insertOne(newRecord);
    
    if (!result.acknowledged) {
      throw new Error('创建奖励记录失败');
    }
    
    // 添加id属性
    return result.insertedId.toString();
  } catch (error) {
    console.error('创建奖励记录异常:', error);
    return null;
  }
}

/**
 * 获取用户邀请记录
 */
export async function getUserInvitations(userId: string): Promise<Invitation[]> {
  try {
    const { db } = await connectToDatabase();
    
    // 查询邀请记录
    const invitations = await db.collection('invitations')
      .find({ inviter_id: userId })
      .toArray();
    
    // 添加id属性
    return invitations.map(inv => {
      if (inv._id && !inv.id) {
        inv.id = inv._id.toString();
      }
      return inv as Invitation;
    });
  } catch (error) {
    console.error('获取用户邀请记录异常:', error);
    return [];
  }
}

/**
 * 获取用户奖励记录
 */
export async function getUserRewards(userId: string): Promise<RewardRecord[]> {
  try {
    const { db } = await connectToDatabase();
    
    // 查询奖励记录
    const rewards = await db.collection('reward_records')
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .toArray();
    
    // 添加id属性
    return rewards.map(reward => {
      if (reward._id && !reward.id) {
        reward.id = reward._id.toString();
      }
      return reward as RewardRecord;
    });
  } catch (error) {
    console.error('获取用户奖励记录异常:', error);
    return [];
  }
}

/**
 * 生成邀请链接
 */
export async function generateInviteLink(walletAddress: string): Promise<string> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.angelcoin.app';
    return `${appUrl}/invite/${walletAddress}`;
  } catch (error) {
    console.error('生成邀请链接异常:', error);
    return '';
  }
}

/**
 * 获取所有用户
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const { db } = await connectToDatabase();
    
    const users = await db.collection('users')
      .find()
      .sort({ created_at: -1 })
      .toArray();
    
    // 添加id属性
    return users.map(user => {
      if (user._id && !user.id) {
        user.id = user._id.toString();
      }
      return user as User;
    });
  } catch (error) {
    console.error('获取所有用户异常:', error);
    return [];
  }
}

/**
 * 数据库诊断
 */
export async function diagnoseDatabase(): Promise<Record<string, any>> {
  try {
    const { db } = await connectToDatabase();
    const results: Record<string, any> = {
      timestamp: new Date().toISOString(),
      tests: {}
    };
    
    // 测试1: 连接测试
    try {
      await db.command({ ping: 1 });
      results.tests.connection = {
        success: true
      };
    } catch (e: any) {
      results.tests.connection = {
        success: false,
        error: e.message
      };
    }
    
    // 测试2: 检查集合
    const collections = ['users', 'invitations', 'reward_records'];
    results.tests.collections = {};
    
    for (const collection of collections) {
      try {
        const count = await db.collection(collection).countDocuments();
        results.tests.collections[collection] = {
          success: true,
          count
        };
      } catch (e: any) {
        results.tests.collections[collection] = {
          success: false,
          error: e.message
        };
      }
    }
    
    // 总结结果
    results.summary = {
      connected: results.tests.connection.success,
      collectionsAvailable: Object.values(results.tests.collections).every((c: any) => c.success),
      recommendation: results.tests.connection.success ? '数据库连接正常' : '请检查数据库连接'
    };
    
    return results;
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 更新用户信息
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    const { db } = await connectToDatabase();
    
    // 排除不应该更新的字段
    const { id, _id, wallet_address, created_at, ...safeUpdates } = updates;
    
    // 添加更新时间
    safeUpdates.updated_at = new Date().toISOString();
    
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: safeUpdates },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return null;
    }
    
    // 确保用户有一个string类型的id属性
    if (result._id && !result.id) {
      result.id = result._id.toString();
    }
    
    return result as User;
  } catch (error) {
    console.error('更新用户信息异常:', error);
    return null;
  }
}

// For backwards compatibility with imports that still use DatabaseService.method
export const DatabaseService = {
  isHealthy,
  isUserExists,
  getUserByWalletAddress,
  getUserById,
  createUser,
  processInviteRegistration,
  createRewardRecord,
  getUserInvitations,
  getUserRewards,
  generateInviteLink,
  getAllUsers,
  diagnoseDatabase,
  updateUser
}; 
// 开发模式数据库模拟服务
// 当没有配置真实的Supabase时使用

import { User, Invitation, RewardRecord, UserSession, REWARD_CONFIG } from './database';
import { config } from './config';

// 模拟数据存储
const mockUsers: User[] = [];
const mockInvitations: Invitation[] = [];
const mockRewardRecords: RewardRecord[] = [];
const mockSessions: UserSession[] = [];

// 生成模拟ID
const generateMockId = () => crypto.randomUUID();

// 生成推荐码
const generateReferralCode = () => {
  return 'ANGEL' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// 模拟数据库操作类
export class MockDatabaseService {
  // 用户相关操作
  static async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const referralCode = userData.referral_code || generateReferralCode();
      
      const user: User = {
        id: generateMockId(),
        wallet_address: userData.wallet_address || '',
        email: userData.email,
        username: userData.username,
        avatar_url: userData.avatar_url,
        angel_balance: 0,
        referral_code: referralCode,
        referred_by: userData.referred_by,
        total_referrals: 0,
        total_earned: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      mockUsers.push(user);
      console.log('🎭 Mock: Created user', user.wallet_address);
      
      // 发放欢迎奖励
      await this.giveWelcomeReward(user.id);
      
      return user;
    } catch (error) {
      console.error('Mock: 创建用户失败:', error);
      return null;
    }
  }

  static async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    try {
      const user = mockUsers.find(u => u.wallet_address.toLowerCase() === walletAddress.toLowerCase());
      console.log('🎭 Mock: Get user by wallet', walletAddress, user ? 'found' : 'not found');
      return user || null;
    } catch (error) {
      console.error('Mock: 获取用户失败:', error);
      return null;
    }
  }

  static async getUserByReferralCode(referralCode: string): Promise<User | null> {
    try {
      const user = mockUsers.find(u => u.referral_code === referralCode);
      console.log('🎭 Mock: Get user by referral code', referralCode, user ? 'found' : 'not found');
      return user || null;
    } catch (error) {
      console.error('Mock: 获取用户失败:', error);
      return null;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const user = mockUsers.find(u => u.id === userId);
      console.log('🎭 Mock: Get user by id', userId, user ? 'found' : 'not found');
      return user || null;
    } catch (error) {
      console.error('Mock: 获取用户失败:', error);
      return null;
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) return null;
      
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      console.log('🎭 Mock: Updated user', userId);
      return mockUsers[userIndex];
    } catch (error) {
      console.error('Mock: 更新用户失败:', error);
      return null;
    }
  }

  // 奖励系统
  static async giveWelcomeReward(userId: string): Promise<boolean> {
    try {
      // 增加用户余额
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        mockUsers[userIndex].angel_balance += REWARD_CONFIG.WELCOME_BONUS;
        mockUsers[userIndex].total_earned += REWARD_CONFIG.WELCOME_BONUS;
        mockUsers[userIndex].updated_at = new Date().toISOString();
      }

      // 记录奖励
      const rewardRecord: RewardRecord = {
        id: generateMockId(),
        user_id: userId,
        reward_type: 'welcome',
        amount: REWARD_CONFIG.WELCOME_BONUS,
        description: '新用户欢迎奖励',
        status: 'completed',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      };

      mockRewardRecords.push(rewardRecord);
      console.log('🎭 Mock: Welcome reward given', userId, REWARD_CONFIG.WELCOME_BONUS);
      return true;
    } catch (error) {
      console.error('Mock: 发放欢迎奖励失败:', error);
      return false;
    }
  }

  static async processReferralRewards(newUserId: string, referralCode: string): Promise<boolean> {
    try {
      // 查找一级邀请人
      const inviter = mockUsers.find(u => u.referral_code === referralCode);
      if (!inviter) return false;

      // 一级奖励
      const inviterIndex = mockUsers.findIndex(u => u.id === inviter.id);
      if (inviterIndex !== -1) {
        mockUsers[inviterIndex].angel_balance += REWARD_CONFIG.REFERRAL_L1;
        mockUsers[inviterIndex].total_earned += REWARD_CONFIG.REFERRAL_L1;
        mockUsers[inviterIndex].total_referrals += 1;
        mockUsers[inviterIndex].updated_at = new Date().toISOString();

        // 记录一级奖励
        mockRewardRecords.push({
          id: generateMockId(),
          user_id: inviter.id,
          reward_type: 'referral_l1',
          amount: REWARD_CONFIG.REFERRAL_L1,
          description: '一级邀请奖励',
          related_user_id: newUserId,
          status: 'completed',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });
      }

      // 查找二级邀请人
      if (inviter.referred_by) {
        const l2Inviter = mockUsers.find(u => u.id === inviter.referred_by);
        if (l2Inviter) {
          const l2InviterIndex = mockUsers.findIndex(u => u.id === l2Inviter.id);
          if (l2InviterIndex !== -1) {
            mockUsers[l2InviterIndex].angel_balance += REWARD_CONFIG.REFERRAL_L2;
            mockUsers[l2InviterIndex].total_earned += REWARD_CONFIG.REFERRAL_L2;
            mockUsers[l2InviterIndex].updated_at = new Date().toISOString();

            // 记录二级奖励
            mockRewardRecords.push({
              id: generateMockId(),
              user_id: l2Inviter.id,
              reward_type: 'referral_l2',
              amount: REWARD_CONFIG.REFERRAL_L2,
              description: '二级邀请奖励',
              related_user_id: newUserId,
              status: 'completed',
              created_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
            });
          }

          // 查找三级邀请人
          if (l2Inviter.referred_by) {
            const l3Inviter = mockUsers.find(u => u.id === l2Inviter.referred_by);
            if (l3Inviter) {
              const l3InviterIndex = mockUsers.findIndex(u => u.id === l3Inviter.id);
              if (l3InviterIndex !== -1) {
                mockUsers[l3InviterIndex].angel_balance += REWARD_CONFIG.REFERRAL_L3;
                mockUsers[l3InviterIndex].total_earned += REWARD_CONFIG.REFERRAL_L3;
                mockUsers[l3InviterIndex].updated_at = new Date().toISOString();

                // 记录三级奖励
                mockRewardRecords.push({
                  id: generateMockId(),
                  user_id: l3Inviter.id,
                  reward_type: 'referral_l3',
                  amount: REWARD_CONFIG.REFERRAL_L3,
                  description: '三级邀请奖励',
                  related_user_id: newUserId,
                  status: 'completed',
                  created_at: new Date().toISOString(),
                  completed_at: new Date().toISOString(),
                });
              }
            }
          }
        }
      }

      console.log('🎭 Mock: Referral rewards processed', newUserId, referralCode);
      return true;
    } catch (error) {
      console.error('Mock: 处理邀请奖励失败:', error);
      return false;
    }
  }

  // 邀请系统
  static async createInviteLink(userId: string): Promise<string | null> {
    try {
      const user = mockUsers.find(u => u.id === userId);
      if (!user) return null;

      const inviteLink = `${config.app.url}/invite/${user.wallet_address}`;
      
      const invitation: Invitation = {
        id: generateMockId(),
        inviter_id: userId,
        referral_code: user.referral_code,
        invite_link: inviteLink,
        status: 'pending',
        level: 1,
        reward_amount: REWARD_CONFIG.REFERRAL_L1,
        reward_claimed: false,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      mockInvitations.push(invitation);
      console.log('🎭 Mock: Created invite link', inviteLink);
      return inviteLink;
    } catch (error) {
      console.error('Mock: 创建邀请链接失败:', error);
      return null;
    }
  }

  static async getInvitationsByUser(userId: string): Promise<Invitation[]> {
    try {
      const invitations = mockInvitations.filter(inv => inv.inviter_id === userId);
      console.log('🎭 Mock: Get invitations for user', userId, invitations.length);
      return invitations;
    } catch (error) {
      console.error('Mock: 获取邀请列表失败:', error);
      return [];
    }
  }

  static async acceptInvitation(inviterWalletAddress: string, inviteeWalletAddress: string): Promise<boolean> {
    try {
      // 查找邀请人
      const inviter = mockUsers.find(u => u.wallet_address.toLowerCase() === inviterWalletAddress.toLowerCase());
      if (!inviter) {
        console.log('🎭 Mock: Inviter not found', inviterWalletAddress);
        return false;
      }

      // 获取新用户
      const newUser = mockUsers.find(u => u.wallet_address.toLowerCase() === inviteeWalletAddress.toLowerCase());
      if (!newUser) {
        console.log('🎭 Mock: New user not found', inviteeWalletAddress);
        return false;
      }

      // 更新用户的推荐关系
      const newUserIndex = mockUsers.findIndex(u => u.id === newUser.id);
      if (newUserIndex !== -1) {
        mockUsers[newUserIndex].referred_by = inviter.id;
        mockUsers[newUserIndex].updated_at = new Date().toISOString();
      }

      // 更新邀请记录
      const invitationIndex = mockInvitations.findIndex(
        inv => inv.inviter_id === inviter.id && inv.status === 'pending'
      );
      
      if (invitationIndex !== -1) {
        mockInvitations[invitationIndex] = {
          ...mockInvitations[invitationIndex],
          status: 'accepted',
          invitee_id: newUser.id,
          invitee_wallet_address: inviteeWalletAddress.toLowerCase(),
          accepted_at: new Date().toISOString(),
        };
      }

      // 处理多级奖励
      await this.processReferralRewards(newUser.id, inviter.referral_code);

      console.log('🎭 Mock: Accepted invitation', inviterWalletAddress);
      return true;
    } catch (error) {
      console.error('Mock: 接受邀请失败:', error);
      return false;
    }
  }

  static async getRewardRecords(userId: string): Promise<RewardRecord[]> {
    try {
      const records = mockRewardRecords.filter(r => r.user_id === userId);
      console.log('🎭 Mock: Get reward records for user', userId, records.length);
      return records;
    } catch (error) {
      console.error('Mock: 获取奖励记录失败:', error);
      return [];
    }
  }

  // 会话管理
  static async createSession(sessionData: Partial<UserSession>): Promise<UserSession | null> {
    try {
      const session: UserSession = {
        id: generateMockId(),
        user_id: sessionData.user_id || '',
        wallet_address: sessionData.wallet_address || '',
        session_token: sessionData.session_token || generateMockId(),
        expires_at: sessionData.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      };
      
      mockSessions.push(session);
      console.log('🎭 Mock: Created session', session.session_token);
      return session;
    } catch (error) {
      console.error('Mock: 创建会话失败:', error);
      return null;
    }
  }

  static async getSessionByToken(sessionToken: string): Promise<UserSession | null> {
    try {
      const session = mockSessions.find(s => s.session_token === sessionToken);
      console.log('🎭 Mock: Get session by token', sessionToken, session ? 'found' : 'not found');
      return session || null;
    } catch (error) {
      console.error('Mock: 获取会话失败:', error);
      return null;
    }
  }

  static async deleteSession(sessionToken: string): Promise<boolean> {
    try {
      const sessionIndex = mockSessions.findIndex(s => s.session_token === sessionToken);
      if (sessionIndex === -1) return false;
      
      mockSessions.splice(sessionIndex, 1);
      console.log('🎭 Mock: Deleted session', sessionToken);
      return true;
    } catch (error) {
      console.error('Mock: 删除会话失败:', error);
      return false;
    }
  }

  // 清理过期会话
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date().toISOString();
      const initialCount = mockSessions.length;
      
      // 移除过期会话
      for (let i = mockSessions.length - 1; i >= 0; i--) {
        if (mockSessions[i].expires_at < now) {
          mockSessions.splice(i, 1);
        }
      }
      
      const deletedCount = initialCount - mockSessions.length;
      console.log('🎭 Mock: Cleaned up expired sessions', deletedCount);
      return deletedCount;
    } catch (error) {
      console.error('Mock: 清理过期会话失败:', error);
      return 0;
    }
  }

  // 工具方法
  static generateReferralCode(): string {
    return generateReferralCode();
  }

  static generateInviteLink(walletAddress: string): string {
    return `${config.app.url}/invite/${walletAddress}`;
  }

  // 调试方法
  static getMockData() {
    return {
      users: mockUsers,
      invitations: mockInvitations,
      rewardRecords: mockRewardRecords,
      sessions: mockSessions,
    };
  }
} 
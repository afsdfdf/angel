// 本地存储后备数据库服务
// 当 Supabase 不可用时使用

import { User, Invitation, RewardRecord, UserSession, REWARD_CONFIG } from './database';

// 使用 localStorage 作为后备存储
class LocalStorageDB {
  private getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  private setItem(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  }

  // 用户相关方法
  async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const users = this.getItem<User[]>('users') || [];
      const newUser: User = {
        id: `user_${Date.now()}`,
        wallet_address: userData.wallet_address!.toLowerCase(),
        email: userData.email || '',
        username: userData.username || '',
        avatar_url: userData.avatar_url || '',
        angel_balance: REWARD_CONFIG.WELCOME_BONUS,
        referred_by: userData.referred_by || '',
        invites_count: 0,
        total_earned: REWARD_CONFIG.WELCOME_BONUS,
        level: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      users.push(newUser);
      this.setItem('users', users);
      
      // 记录欢迎奖励
      await this.recordWelcomeReward(newUser.id);
      
      return newUser;
    } catch (error) {
      console.error('创建用户失败:', error);
      return null;
    }
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    try {
      const users = this.getItem<User[]>('users') || [];
      return users.find(u => u.wallet_address === walletAddress.toLowerCase()) || null;
    } catch (error) {
      console.error('获取用户失败:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const users = this.getItem<User[]>('users') || [];
      const index = users.findIndex(u => u.id === userId);
      
      if (index === -1) return null;
      
      users[index] = {
        ...users[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      this.setItem('users', users);
      return users[index];
    } catch (error) {
      console.error('更新用户失败:', error);
      return null;
    }
  }

  // 邀请相关方法
  async getInvitationsByInviterWallet(inviterWallet: string): Promise<Invitation[]> {
    try {
      const invitations = this.getItem<Invitation[]>('invitations') || [];
      const user = await this.getUserByWalletAddress(inviterWallet);
      if (!user) return [];
      
      return invitations.filter(i => i.inviter_id === user.id);
    } catch (error) {
      console.error('获取邀请列表失败:', error);
      return [];
    }
  }

  // 奖励相关方法
  async recordWelcomeReward(userId: string): Promise<boolean> {
    try {
      const rewards = this.getItem<RewardRecord[]>('rewards') || [];
      const newReward: RewardRecord = {
        id: `reward_${Date.now()}`,
        user_id: userId,
        reward_type: 'welcome',
        amount: REWARD_CONFIG.WELCOME_BONUS,
        description: '新用户注册奖励',
        status: 'completed',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      };
      
      rewards.push(newReward);
      this.setItem('rewards', rewards);
      return true;
    } catch (error) {
      console.error('记录欢迎奖励失败:', error);
      return false;
    }
  }

  async getRewardRecords(userId: string): Promise<RewardRecord[]> {
    try {
      const rewards = this.getItem<RewardRecord[]>('rewards') || [];
      return rewards.filter(r => r.user_id === userId);
    } catch (error) {
      console.error('获取奖励记录失败:', error);
      return [];
    }
  }

  // 健康检查
  async isHealthy(): Promise<boolean> {
    return true; // localStorage 总是可用的
  }
}

// 导出本地存储数据库实例
export const localDB = new LocalStorageDB(); 
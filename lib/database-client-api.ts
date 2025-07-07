/**
 * 客户端API
 * 用于从客户端组件调用服务器端数据库函数
 */

import type { User, Invitation, RewardRecord } from './database-mongodb';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 客户端API服务
 * 通过API路由访问数据库
 */
export class DatabaseClientApi {
  private static apiBase = '/api';

  /**
   * 检查用户是否存在
   */
  static async isUserExists(walletAddress: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/users/exists?wallet=${walletAddress}`);
      const data = await response.json() as ApiResponse<boolean>;
      return data.success && data.data === true;
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
      const response = await fetch(`${this.apiBase}/users?wallet=${walletAddress}`);
      const data = await response.json() as ApiResponse<User>;
      return data.success ? data.data || null : null;
    } catch (error) {
      console.error('获取用户信息异常:', error);
      return null;
    }
  }
  
  /**
   * 创建用户
   */
  static async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const response = await fetch(`${this.apiBase}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json() as ApiResponse<User>;
      return data.success ? data.data || null : null;
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
      const response = await fetch(`${this.apiBase}/invites/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newUserWallet, inviterWallet }),
      });
      
      const data = await response.json() as ApiResponse<boolean>;
      return data.success && data.data === true;
    } catch (error) {
      console.error('处理邀请注册异常:', error);
      return false;
    }
  }
  
  /**
   * 生成邀请链接
   */
  static async generateInviteLink(walletAddress: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiBase}/invites/generate?wallet=${walletAddress}`);
      const data = await response.json() as ApiResponse<string>;
      return data.success && data.data ? data.data : '';
    } catch (error) {
      console.error('生成邀请链接异常:', error);
      return '';
    }
  }
  
  /**
   * 获取用户邀请列表
   */
  static async getUserInvitations(userId: string): Promise<Invitation[]> {
    try {
      const response = await fetch(`${this.apiBase}/invites?userId=${userId}`);
      const data = await response.json() as ApiResponse<Invitation[]>;
      return data.success && data.data ? data.data : [];
    } catch (error) {
      console.error('获取用户邀请列表异常:', error);
      return [];
    }
  }
  
  /**
   * 获取用户奖励记录
   */
  static async getUserRewards(userId: string): Promise<RewardRecord[]> {
    try {
      const response = await fetch(`${this.apiBase}/rewards?userId=${userId}`);
      const data = await response.json() as ApiResponse<RewardRecord[]>;
      return data.success && data.data ? data.data : [];
    } catch (error) {
      console.error('获取用户奖励记录异常:', error);
      return [];
    }
  }
  
  // 别名，与旧API兼容
  static getRewardRecords = this.getUserRewards;
  
  /**
   * 记录欢迎奖励
   */
  static async recordWelcomeReward(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/rewards/welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json() as ApiResponse<boolean>;
      return data.success && data.data === true;
    } catch (error) {
      console.error('记录欢迎奖励异常:', error);
      return false;
    }
  }
  
  /**
   * 获取所有用户
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${this.apiBase}/users/all`);
      const data = await response.json() as ApiResponse<User[]>;
      return data.success && data.data ? data.data : [];
    } catch (error) {
      console.error('获取所有用户异常:', error);
      return [];
    }
  }
  
  /**
   * 检查数据库连接是否正常
   */
  static async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/health`);
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('检查数据库连接异常:', error);
      return false;
    }
  }
} 
import { DatabaseService, User, Invitation } from '@/lib/database';

// NFT类型定义
export interface NFT {
  id: string;
  name: string;
  english_name?: string;
  description?: string;
  image_url?: string;
  rarity: string;
  rarity_score: number;
  attributes: any;
  creator_id?: string;
  owner_id?: string;
  price?: number;
  is_for_sale: boolean;
  created_at: string;
  updated_at: string;
}

// 土地类型定义
export interface Land {
  id: string;
  name: string;
  type: string;
  description?: string;
  image_url?: string;
  rarity: string;
  rarity_score: number;
  attributes: any;
  base_price: number;
  base_income: number;
  owner_id?: string;
  level: number;
  experience: number;
  is_for_sale: boolean;
  x_coordinate?: number;
  y_coordinate?: number;
  created_at: string;
  updated_at: string;
}

// 管理员功能类
export class AdminService {
  // 用户管理
  static async getAllUsers(): Promise<User[]> {
    try {
      return await DatabaseService.getAllUsers();
    } catch (error) {
      console.error('获取所有用户失败:', error);
      return [];
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      return await DatabaseService.updateUser(userId, updates);
    } catch (error) {
      console.error('更新用户失败:', error);
      return null;
    }
  }

  static async addTokensToUser(userId: string, amount: number): Promise<boolean> {
    try {
      const user = await DatabaseService.getUserById(userId);
      if (!user) return false;
      
      const updates = {
        angel_balance: (user.angel_balance || 0) + amount,
        total_earned: (user.total_earned || 0) + amount,
      };
      
      const result = await DatabaseService.updateUser(userId, updates);
      
      // 记录奖励
      if (result) {
        await DatabaseService.supabase()
          .from('reward_records')
          .insert([{
            user_id: userId,
            reward_type: 'bonus',
            amount: amount,
            description: '管理员发放奖励',
            status: 'completed',
            completed_at: new Date().toISOString(),
          }]);
      }
      
      return !!result;
    } catch (error) {
      console.error('添加代币失败:', error);
      return false;
    }
  }

  static async deductTokensFromUser(userId: string, amount: number): Promise<boolean> {
    try {
      const user = await DatabaseService.getUserById(userId);
      if (!user || (user.angel_balance || 0) < amount) return false;
      
      const updates = {
        angel_balance: (user.angel_balance || 0) - amount,
      };
      
      const result = await DatabaseService.updateUser(userId, updates);
      
      // 记录扣除
      if (result) {
        await DatabaseService.supabase()
          .from('reward_records')
          .insert([{
            user_id: userId,
            reward_type: 'bonus',
            amount: -amount,
            description: '管理员扣除代币',
            status: 'completed',
            completed_at: new Date().toISOString(),
          }]);
      }
      
      return !!result;
    } catch (error) {
      console.error('扣除代币失败:', error);
      return false;
    }
  }

  // NFT管理
  static async getAllNFTs(): Promise<NFT[]> {
    try {
      const { data, error } = await DatabaseService.supabase()
        .from('nfts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取所有NFT失败:', error);
      return [];
    }
  }

  static async getNFTById(nftId: string): Promise<NFT | null> {
    try {
      const { data, error } = await DatabaseService.supabase()
        .from('nfts')
        .select('*')
        .eq('id', nftId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('获取NFT失败:', error);
      return null;
    }
  }

  static async createNFT(nftData: Partial<NFT>): Promise<NFT | null> {
    try {
      const { data, error } = await DatabaseService.supabase()
        .from('nfts')
        .insert([{
          ...nftData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('创建NFT失败:', error);
      return null;
    }
  }

  static async updateNFT(nftId: string, updates: Partial<NFT>): Promise<NFT | null> {
    try {
      const { data, error } = await DatabaseService.supabase()
        .from('nfts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', nftId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('更新NFT失败:', error);
      return null;
    }
  }

  static async transferNFT(nftId: string, fromUserId: string, toUserId: string): Promise<boolean> {
    try {
      // 更新NFT所有者
      const { error: updateError } = await DatabaseService.supabase()
        .from('nfts')
        .update({
          owner_id: toUserId,
          is_for_sale: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', nftId)
        .eq('owner_id', fromUserId);
      
      if (updateError) throw updateError;
      
      // 记录交易历史
      const { error: historyError } = await DatabaseService.supabase()
        .from('nft_transactions')
        .insert([{
          nft_id: nftId,
          from_user_id: fromUserId,
          to_user_id: toUserId,
          price: 0, // 管理员转移，无价格
          transaction_type: 'admin_transfer',
          created_at: new Date().toISOString(),
        }]);
      
      if (historyError) throw historyError;
      
      return true;
    } catch (error) {
      console.error('转移NFT失败:', error);
      return false;
    }
  }

  // 土地管理
  static async getAllLands(): Promise<Land[]> {
    try {
      const { data, error } = await DatabaseService.supabase()
        .from('lands')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取所有土地失败:', error);
      return [];
    }
  }

  static async getLandById(landId: string): Promise<Land | null> {
    try {
      const { data, error } = await DatabaseService.supabase()
        .from('lands')
        .select('*')
        .eq('id', landId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('获取土地失败:', error);
      return null;
    }
  }

  static async createLand(landData: Partial<Land>): Promise<Land | null> {
    try {
      const { data, error } = await DatabaseService.supabase()
        .from('lands')
        .insert([{
          ...landData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('创建土地失败:', error);
      return null;
    }
  }

  static async updateLand(landId: string, updates: Partial<Land>): Promise<Land | null> {
    try {
      const { data, error } = await DatabaseService.supabase()
        .from('lands')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', landId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('更新土地失败:', error);
      return null;
    }
  }

  static async transferLand(landId: string, toUserId: string): Promise<boolean> {
    try {
      const { error } = await DatabaseService.supabase()
        .from('lands')
        .update({
          owner_id: toUserId,
          is_for_sale: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', landId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('转移土地失败:', error);
      return false;
    }
  }

  // 邀请系统管理
  static async getAllInvitations(): Promise<Invitation[]> {
    try {
      return await DatabaseService.getAllInvitations();
    } catch (error) {
      console.error('获取所有邀请失败:', error);
      return [];
    }
  }

  // 日志记录
  static async logAdminAction(adminId: string, action: string, details: any): Promise<boolean> {
    try {
      const { error } = await DatabaseService.supabase()
        .from('admin_logs')
        .insert([{
          admin_id: adminId,
          action,
          details,
          created_at: new Date().toISOString(),
        }]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('记录管理员操作失败:', error);
      return false;
    }
  }

  // 数据统计
  static async getDashboardStats(): Promise<any> {
    try {
      // 获取用户总数
      const { data: usersCount, error: usersError } = await DatabaseService.supabase()
        .from('users')
        .select('id', { count: 'exact', head: true });
      
      // 获取活跃用户数
      const { data: activeUsers, error: activeError } = await DatabaseService.supabase()
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);
      
      // 获取邀请总数
      const { data: invitationsCount, error: invitationsError } = await DatabaseService.supabase()
        .from('invitations')
        .select('id', { count: 'exact', head: true });
      
      // 获取代币总量
      const { data: tokensData, error: tokensError } = await DatabaseService.supabase()
        .from('users')
        .select('angel_balance');
      
      const totalTokens = tokensData?.reduce((sum: number, user: any) => sum + (user.angel_balance || 0), 0) || 0;
      
      // 获取NFT总数
      const { data: nftsCount, error: nftsError } = await DatabaseService.supabase()
        .from('nfts')
        .select('id', { count: 'exact', head: true });
      
      // 获取土地总数
      const { data: landsCount, error: landsError } = await DatabaseService.supabase()
        .from('lands')
        .select('id', { count: 'exact', head: true });
      
      if (usersError || activeError || invitationsError || tokensError || nftsError || landsError) {
        throw new Error('获取统计数据失败');
      }
      
      return {
        usersCount: usersCount?.count || 0,
        activeUsers: activeUsers?.count || 0,
        invitationsCount: invitationsCount?.count || 0,
        totalTokens,
        nftsCount: nftsCount?.count || 0,
        landsCount: landsCount?.count || 0,
      };
    } catch (error) {
      console.error('获取仪表板统计数据失败:', error);
      return {
        usersCount: 0,
        activeUsers: 0,
        invitationsCount: 0,
        totalTokens: 0,
        nftsCount: 0,
        landsCount: 0,
      };
    }
  }
} 
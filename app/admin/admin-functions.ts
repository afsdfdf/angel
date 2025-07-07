import { MongoClient, ObjectId } from 'mongodb';
import { mongodbConfig } from '@/lib/mongodb-config';
import { Invitation } from '@/lib/database-mongodb';

// Define the Land interface
interface Land {
  _id?: ObjectId;
  id?: string;
  name: string;
  description?: string;
  owner_id?: string;
  location?: {
    x: number;
    y: number;
  };
  size?: number;
  price?: number;
  status?: 'available' | 'owned' | 'reserved';
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

// Get MongoDB client
async function getMongoClient(): Promise<MongoClient> {
  const client = new MongoClient(mongodbConfig.uri);
  await client.connect();
  return client;
}

export class AdminService {
  // Land management
  static async createLand(landData: Partial<Land>): Promise<Land | null> {
    try {
      const client = await getMongoClient();
      const db = client.db(mongodbConfig.dbName);
      
      const now = new Date().toISOString();
      const newLand = {
        ...landData,
        created_at: now,
        updated_at: now
      };
      
      const result = await db.collection('lands').insertOne(newLand);
      
      if (result.acknowledged) {
        newLand._id = result.insertedId;
        newLand.id = result.insertedId.toString();
      }
      
      await client.close();
      return newLand as Land;
    } catch (error) {
      console.error('创建土地失败:', error);
      return null;
    }
  }

  static async updateLand(landId: string, updates: Partial<Land>): Promise<Land | null> {
    try {
      const client = await getMongoClient();
      const db = client.db(mongodbConfig.dbName);
      
      const now = new Date().toISOString();
      const result = await db.collection('lands').findOneAndUpdate(
        { _id: new ObjectId(landId) },
        { $set: { ...updates, updated_at: now } },
        { returnDocument: 'after' }
      );
      
      await client.close();
      
      if (result && result._id) {
        result.id = result._id.toString();
      }
      
      return result as unknown as Land;
    } catch (error) {
      console.error('更新土地失败:', error);
      return null;
    }
  }

  static async transferLand(landId: string, toUserId: string): Promise<boolean> {
    try {
      const client = await getMongoClient();
      const db = client.db(mongodbConfig.dbName);
      
      const updateResult = await db.collection('lands').updateOne(
        { _id: new ObjectId(landId) },
        { $set: { 
          owner_id: toUserId,
          updated_at: new Date().toISOString()
        } }
      );
      
      await client.close();
      return updateResult.modifiedCount > 0;
    } catch (error) {
      console.error('转移土地失败:', error);
      return false;
    }
  }

  // 邀请系统管理
  static async getAllInvitations(): Promise<Invitation[]> {
    try {
      const client = await getMongoClient();
      const db = client.db(mongodbConfig.dbName);
      const invitations = await db.collection('invitations').find({}).toArray();
      await client.close();
      return invitations as Invitation[];
    } catch (error) {
      console.error('获取所有邀请失败:', error);
      return [];
    }
  }

  // 日志记录
  static async logAdminAction(adminId: string, action: string, details: any): Promise<boolean> {
    try {
      const client = await getMongoClient();
      const db = client.db(mongodbConfig.dbName);
      const result = await db.collection('admin_logs').insertOne({
        admin_id: adminId,
        action: action,
        details: details,
        created_at: new Date().toISOString(),
      });
      
      await client.close();
      return result.acknowledged;
    } catch (error) {
      console.error('记录管理员操作失败:', error);
      return false;
    }
  }

  // 数据统计
  static async getDashboardStats(): Promise<{
    usersCount: number;
    activeUsers: number;
    invitationsCount: number;
    totalTokens: number;
    nftsCount: number;
    landsCount: number;
  }> {
    try {
      const client = await getMongoClient();
      const db = client.db(mongodbConfig.dbName);
      
      // 获取用户总数
      const usersCount = await db.collection('users').countDocuments();
      
      // 获取活跃用户数
      const activeUsersCount = await db.collection('users').countDocuments({ is_active: true });
      
      // 获取邀请总数
      const invitationsCount = await db.collection('invitations').countDocuments();
      
      // 获取代币总量
      const tokenAggregation = await db.collection('users').aggregate([
        { $group: { _id: null, total: { $sum: "$angel_balance" } } }
      ]).toArray();
      const totalTokens = tokenAggregation.length > 0 ? tokenAggregation[0].total : 0;
      
      // 获取NFT总数
      const nftsCount = await db.collection('nfts').countDocuments();
      
      // 获取土地总数
      const landsCount = await db.collection('lands').countDocuments();
      
      await client.close();
      
      return {
        usersCount: usersCount || 0,
        activeUsers: activeUsersCount || 0,
        invitationsCount: invitationsCount || 0,
        totalTokens,
        nftsCount: nftsCount || 0,
        landsCount: landsCount || 0
      };
    } catch (error) {
      console.error('获取仪表盘统计数据失败:', error);
      return {
        usersCount: 0,
        activeUsers: 0,
        invitationsCount: 0,
        totalTokens: 0,
        nftsCount: 0,
        landsCount: 0
      };
    }
  }
} 
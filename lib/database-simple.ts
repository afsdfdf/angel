/**
 * 简化版数据库服务
 * 专注于基本功能，移除复杂类型和错误处理
 */
import { createClient } from '@supabase/supabase-js'

// Supabase配置 - 硬编码凭据
const SUPABASE_URL = 'https://onfplwhsmtvmkssyisot.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnBsd2hzbXR2bWtzc3lpc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjM3NzksImV4cCI6MjA2MjAzOTc3OX0.HwC1mqTWDtwOCDm1zufyyA9Xrg2pgVOElxx2JX9z9Bs'

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// 用户接口
export interface SimpleUser {
  id: string
  wallet_address: string
  username?: string
  angel_balance?: number
  invites_count?: number
  created_at?: string
}

// 邀请接口
export interface SimpleInvitation {
  id: string
  inviter_id: string
  invitee_id?: string
  status: string
  created_at?: string
}

// 简化版数据库服务
export class SimpleDatabase {
  // 获取Supabase客户端
  static getClient() {
    return supabase
  }
  
  // 创建新的Supabase客户端（支持自定义URL和密钥）
  static createClient(url?: string, key?: string) {
    if (!url || !key) {
      return supabase
    }
    return createClient(url, key)
  }
  
  // 测试数据库连接
  static async testConnection(customClient?: ReturnType<typeof createClient>): Promise<boolean> {
    try {
      console.log('测试数据库连接...')
      const client = customClient || supabase
      const { data, error } = await client.from('users').select('count(*)', { count: 'exact', head: true })
      
      if (error) {
        console.error('连接测试失败:', error)
        return false
      }
      
      console.log('连接测试成功!')
      return true
    } catch (error) {
      console.error('连接测试异常:', error)
      return false
    }
  }
  
  // 获取用户
  static async getUser(walletAddress: string): Promise<SimpleUser | null> {
    try {
      console.log('获取用户:', walletAddress)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single()
      
      if (error) {
        console.error('获取用户失败:', error)
        return null
      }
      
      return data as SimpleUser
    } catch (error) {
      console.error('获取用户异常:', error)
      return null
    }
  }
  
  // 创建用户
  static async createUser(walletAddress: string): Promise<SimpleUser | null> {
    try {
      console.log('创建用户:', walletAddress)
      const { data, error } = await supabase
        .from('users')
        .insert([{
          wallet_address: walletAddress.toLowerCase(),
          angel_balance: 10000,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) {
        console.error('创建用户失败:', error)
        return null
      }
      
      return data as SimpleUser
    } catch (error) {
      console.error('创建用户异常:', error)
      return null
    }
  }
  
  // 获取邀请链接
  static async getInviteLink(walletAddress: string): Promise<string> {
    try {
      const user = await this.getUser(walletAddress)
      if (!user) {
        throw new Error('用户不存在')
      }
      
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://angelcoin.app'
      return `${baseUrl}/invite/${user.id}`
    } catch (error) {
      console.error('获取邀请链接失败:', error)
      return ''
    }
  }
  
  // 处理邀请
  static async processInvite(inviteeWallet: string, inviterId: string): Promise<boolean> {
    try {
      console.log('处理邀请:', { inviteeWallet, inviterId })
      
      // 检查被邀请人是否已存在
      const invitee = await this.getUser(inviteeWallet)
      if (invitee) {
        console.log('被邀请人已存在')
        return false
      }
      
      // 检查邀请人是否存在
      const { data: inviter, error: inviterError } = await supabase
        .from('users')
        .select('*')
        .eq('id', inviterId)
        .single()
      
      if (inviterError || !inviter) {
        console.error('邀请人不存在:', inviterError)
        return false
      }
      
      // 创建邀请记录
      const { error: inviteError } = await supabase
        .from('invitations')
        .insert([{
          inviter_id: inviterId,
          invitee_wallet_address: inviteeWallet.toLowerCase(),
          status: 'pending',
          created_at: new Date().toISOString()
        }])
      
      if (inviteError) {
        console.error('创建邀请记录失败:', inviteError)
        return false
      }
      
      return true
    } catch (error) {
      console.error('处理邀请异常:', error)
      return false
    }
  }
  
  // 获取所有用户
  static async getAllUsers(): Promise<SimpleUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('获取所有用户失败:', error)
        return []
      }
      
      return data as SimpleUser[]
    } catch (error) {
      console.error('获取所有用户异常:', error)
      return []
    }
  }
  
  // 获取所有邀请
  static async getAllInvitations(): Promise<SimpleInvitation[]> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('获取所有邀请失败:', error)
        return []
      }
      
      return data as SimpleInvitation[]
    } catch (error) {
      console.error('获取所有邀请异常:', error)
      return []
    }
  }
} 
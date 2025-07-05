'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { DatabaseService, User } from './database';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  generateInviteLink: () => string;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // 确保在客户端环境中运行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 生成推荐码
  const generateReferralCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ANGEL';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 登录函数
  const login = async (referralCode?: string) => {
    if (!address || !isConnected) {
      throw new Error('请先连接钱包');
    }

    setIsLoading(true);
    try {
      // 生成签名消息
      const message = `欢迎来到Angel Crypto App！\n\n请签名以验证您的身份。\n\n钱包地址: ${address}\n时间戳: ${Date.now()}`;
      
      // 请求用户签名
      const signature = await signMessageAsync({ message });
      
      // 检查用户是否已存在
      let existingUser = await DatabaseService.getUserByWalletAddress(address);
      
      if (!existingUser) {
        // 创建新用户
        const newUserData = {
          id: uuidv4(),
          wallet_address: address.toLowerCase(),
          referral_code: generateReferralCode(),
          referred_by: referralCode || undefined,
          total_referrals: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        existingUser = await DatabaseService.createUser(newUserData);
        
        if (!existingUser) {
          throw new Error('创建用户失败');
        }

        // 如果有推荐码，处理推荐关系
        if (referralCode) {
          const referrer = await DatabaseService.getUserByReferralCode(referralCode);
          if (referrer) {
            await DatabaseService.acceptInvitation(referrer.wallet_address, address.toLowerCase());
          }
        }
      }

      // 创建会话
      const sessionToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

      await DatabaseService.createSession({
        id: uuidv4(),
        user_id: existingUser.id,
        wallet_address: address.toLowerCase(),
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });

      // 保存会话到localStorage
      if (isClient && typeof window !== 'undefined') {
        localStorage.setItem('auth_session', sessionToken);
      }

      setUser(existingUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出函数
  const logout = async () => {
    setIsLoading(true);
    try {
      // 删除会话
      if (isClient && typeof window !== 'undefined') {
        const sessionToken = localStorage.getItem('auth_session');
        if (sessionToken) {
          await DatabaseService.deleteSession(sessionToken);
          localStorage.removeItem('auth_session');
        }
      }

      // 断开钱包连接
      disconnect();

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 生成邀请链接
  const generateInviteLink = (): string => {
    if (!user) return '';
    const baseUrl = isClient && typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}?ref=${user.referral_code}`;
  };

  // 刷新用户信息
  const refreshUser = async () => {
    if (!address) return;
    
    try {
      const updatedUser = await DatabaseService.getUserByWalletAddress(address);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  };

  // 检查现有会话
  const checkExistingSession = async () => {
    // 确保在客户端环境中运行
    if (!isClient || typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const sessionToken = localStorage.getItem('auth_session');
      if (!sessionToken) {
        setIsLoading(false);
        return;
      }

      const session = await DatabaseService.getSessionByToken(sessionToken);
      if (!session) {
        localStorage.removeItem('auth_session');
        setIsLoading(false);
        return;
      }

      const existingUser = await DatabaseService.getUserByWalletAddress(session.wallet_address);
      if (existingUser) {
        setUser(existingUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('检查会话失败:', error);
      if (isClient && typeof window !== 'undefined') {
        localStorage.removeItem('auth_session');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时检查现有会话
  useEffect(() => {
    if (isClient) {
      checkExistingSession();
    }
  }, [isClient]);

  // 监听钱包连接状态变化
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      // 钱包断开连接时自动登出
      logout();
    }
  }, [isConnected, isAuthenticated]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    generateInviteLink,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 
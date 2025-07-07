"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DatabaseClientApi } from './database-client-api'

// Define User type locally to avoid server imports
export interface User {
  _id?: string;
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

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (user: User) => void
  generateInviteLink: (walletAddress: string) => Promise<string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(!!user)
  }, [user])

  const login = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (userData: User) => {
    setUser(userData)
  }

  const generateInviteLink = async (walletAddress: string): Promise<string> => {
    if (!walletAddress) {
      console.error('钱包地址为空，无法生成邀请链接');
      return '';
    }
    
    try {
      console.log('生成邀请链接，钱包地址:', walletAddress);
      return await DatabaseClientApi.generateInviteLink(walletAddress);
    } catch (error) {
      console.error('生成邀请链接失败:', error);
      return '';
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
    generateInviteLink
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
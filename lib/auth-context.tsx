"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DatabaseService, type User } from './database'

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
    return await DatabaseService.generateInviteLink(walletAddress)
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
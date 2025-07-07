"use client";

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/database-hardcoded';
import type { User } from '@/lib/database-hardcoded';

export default function UserProfileHardcoded({ walletAddress }: { walletAddress: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      setError(null);
      
      try {
        // 方法1：使用 RPC 函数（推荐）
        const { data: userData, error: rpcError } = await supabaseClient.rpc(
          'get_user_data',
          { wallet_addr: walletAddress }
        );
        
        if (rpcError) {
          console.error('RPC 函数调用失败:', rpcError);
          
          // 方法2：使用服务器端 API（备选）
          const response = await fetch(`/api/users?wallet=${walletAddress}`);
          
          if (!response.ok) {
            throw new Error(`API 请求失败: ${response.status}`);
          }
          
          const { user: apiUser, error: apiError } = await response.json();
          
          if (apiError) {
            throw new Error(apiError);
          }
          
          setUser(apiUser);
        } else {
          setUser(userData as User);
        }
      } catch (err: any) {
        console.error('获取用户数据失败:', err);
        setError(err.message || '获取用户数据失败');
      } finally {
        setLoading(false);
      }
    }
    
    if (walletAddress) {
      fetchUserData();
    }
  }, [walletAddress]);

  // 更新用户资料
  async function updateProfile(updates: Partial<User>) {
    try {
      setLoading(true);
      
      if (!user) return;
      
      // 通过 API 更新用户资料
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          ...updates
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }
      
      const { user: updatedUser, error: apiError } = await response.json();
      
      if (apiError) {
        throw new Error(apiError);
      }
      
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      console.error('更新用户资料失败:', err);
      setError(err.message || '更新用户资料失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-4 text-center">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">错误: {error}</div>;
  }

  if (!user) {
    return <div className="p-4 text-center">用户不存在</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <h2 className="text-xl font-medium text-gray-900">{user.username || '未设置用户名'}</h2>
      
      <div className="mt-2">
        <p className="text-gray-500">钱包地址: {user.wallet_address}</p>
        <p className="text-gray-500">Angel 余额: {user.angel_balance || 0}</p>
        <p className="text-gray-500">邀请数量: {user.invites_count || 0}</p>
        <p className="text-gray-500">总收益: {user.total_earned || 0}</p>
        <p className="text-gray-500">等级: {user.level || 1}</p>
      </div>
      
      {/* 更多用户界面元素 */}
    </div>
  );
} 
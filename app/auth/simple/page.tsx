'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Shield, Users, Gift, Wallet, CheckCircle } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAuth } from '@/lib/auth-context';

export default function SimpleAuthPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  const handleConnect = async () => {
    if (connectors.length === 0) {
      alert('没有可用的钱包连接器');
      return;
    }

    setIsConnecting(true);
    try {
      await connect({ connector: connectors[0] });
    } catch (error) {
      console.error('连接钱包失败:', error);
      alert('连接钱包失败，请重试');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogin = async () => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }

    setIsLoggingIn(true);
    try {
      await login();
      alert('登录成功！');
    } catch (error) {
      console.error('登录失败:', error);
      alert('登录失败，请重试');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      alert('已登出');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-purple-600 mr-2" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Angel Crypto App
            </h1>
          </div>
          <p className="text-muted-foreground">
            天使加密生态系统 - 简化版认证测试
          </p>
        </div>

        {/* 状态显示 */}
        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle>当前状态</CardTitle>
            <CardDescription>钱包连接和认证状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">钱包连接:</span>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    已连接
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-1" />
                    未连接
                  </>
                )}
              </Badge>
            </div>
            
            {isConnected && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">钱包地址:</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">认证状态:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    已认证
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-1" />
                    未认证
                  </>
                )}
              </Badge>
            </div>

            {user && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">推荐码:</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {user.referral_code}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle>操作</CardTitle>
            <CardDescription>连接钱包和认证操作</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    连接中...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    连接钱包
                  </>
                )}
              </Button>
            ) : !isAuthenticated ? (
              <Button 
                onClick={handleLogin} 
                disabled={isLoggingIn}
                className="w-full"
              >
                {isLoggingIn ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    登录中...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    登录认证
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleLogout} 
                variant="destructive"
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                登出
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 功能介绍 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">钱包认证</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                支持 MetaMask、WalletConnect 等主流钱包
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">邀请系统</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                邀请朋友加入，获得推荐奖励
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Gift className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">数据库集成</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                使用 Supabase 第三方API数据库
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 说明 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
            <CardDescription>如何配置和使用认证系统</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. 环境配置</h4>
                <p className="text-sm text-muted-foreground">
                  确保已正确配置 .env.local 文件中的 Supabase 和 WalletConnect 配置
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. 数据库设置</h4>
                <p className="text-sm text-muted-foreground">
                  在 Supabase 中运行 scripts/init-database.sql 脚本创建必要的表
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">3. 测试流程</h4>
                <p className="text-sm text-muted-foreground">
                  连接钱包 → 登录认证 → 查看用户信息 → 测试邀请功能
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Shield, Users, Gift } from 'lucide-react';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 检查URL中的推荐码
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

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
            天使加密生态系统 - 安全、去中心化、社区驱动
          </p>
          
          {referralCode && (
            <div className="mt-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Gift className="h-4 w-4 mr-1" />
                邀请码: {referralCode}
              </Badge>
            </div>
          )}
        </div>

        {/* 认证系统提示 */}
        <div className="text-center mb-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>认证系统已集成</CardTitle>
              <CardDescription>
                钱包登录和邀请系统已完成开发
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                系统包含完整的钱包连接、用户认证、邀请系统等功能。
                请按照 AUTH_SETUP_GUIDE.md 文档配置环境变量后使用。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 功能介绍 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

        {/* 技术特性 */}
        <Card>
          <CardHeader>
            <CardTitle>已实现功能</CardTitle>
            <CardDescription>
              完整的认证和邀请系统
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">认证功能</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 钱包连接和签名认证</li>
                  <li>• 用户注册和登录</li>
                  <li>• 会话管理</li>
                  <li>• 自动登出</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">邀请系统</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 生成邀请码和链接</li>
                  <li>• 推荐关系追踪</li>
                  <li>• 奖励机制</li>
                  <li>• 邀请记录管理</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
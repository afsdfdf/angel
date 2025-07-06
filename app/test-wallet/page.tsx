'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Wallet, User, Database } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { useAuth } from '@/lib/auth-context';
import { SimpleWalletConnect } from '@/components/simple-wallet-connect';
import { WalletConnect } from '@/components/wallet-connect';

export default function TestWalletPage() {
  const { isConnected, account, isLoading, error } = useWallet();
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<{
    walletConnected: boolean;
    userAuthenticated: boolean;
    accountMatch: boolean;
    status: 'success' | 'warning' | 'error';
  }>({
    walletConnected: false,
    userAuthenticated: false,
    accountMatch: false,
    status: 'error'
  });

  useEffect(() => {
    const walletConnected = isConnected;
    const userAuthenticated = isAuthenticated;
    const accountMatch = walletConnected && userAuthenticated && 
      account?.toLowerCase() === user?.wallet_address?.toLowerCase();

    let status: 'success' | 'warning' | 'error' = 'error';
    if (walletConnected && userAuthenticated && accountMatch) {
      status = 'success';
    } else if (walletConnected || userAuthenticated) {
      status = 'warning';
    }

    setTestResults({
      walletConnected,
      userAuthenticated,
      accountMatch,
      status
    });
  }, [isConnected, isAuthenticated, account, user]);

  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">正常</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">部分连接</Badge>;
      case 'error':
        return <Badge variant="destructive">未连接</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">钱包连接状态测试</h1>
        <p className="text-muted-foreground">
          测试钱包连接状态在不同组件间的一致性
        </p>
      </div>

      <div className="grid gap-6">
        {/* 状态概览 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(testResults.status)}
              连接状态概览
              {getStatusBadge(testResults.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <span>钱包连接</span>
                </div>
                <Badge variant={testResults.walletConnected ? "default" : "destructive"}>
                  {testResults.walletConnected ? "已连接" : "未连接"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>用户认证</span>
                </div>
                <Badge variant={testResults.userAuthenticated ? "default" : "destructive"}>
                  {testResults.userAuthenticated ? "已认证" : "未认证"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>账户匹配</span>
                </div>
                <Badge variant={testResults.accountMatch ? "default" : "destructive"}>
                  {testResults.accountMatch ? "匹配" : "不匹配"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 详细信息 */}
        <Card>
          <CardHeader>
            <CardTitle>详细信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">钱包信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>连接状态:</span>
                    <Badge variant={isConnected ? "default" : "destructive"}>
                      {isConnected ? "已连接" : "未连接"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>加载状态:</span>
                    <Badge variant={isLoading ? "secondary" : "outline"}>
                      {isLoading ? "加载中" : "就绪"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>钱包地址:</span>
                    <span className="font-mono text-xs">
                      {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "未设置"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">用户信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>认证状态:</span>
                    <Badge variant={isAuthenticated ? "default" : "destructive"}>
                      {isAuthenticated ? "已认证" : "未认证"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>用户ID:</span>
                    <span className="font-mono text-xs">
                      {user?.id ? user.id.slice(0, 8) + "..." : "未设置"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>用户名:</span>
                    <span>{user?.username || "未设置"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>余额:</span>
                    <span>{user?.angel_balance?.toLocaleString() || "0"} ANGEL</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>钱包错误:</strong> {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 钱包连接组件测试 */}
        <Card>
          <CardHeader>
            <CardTitle>钱包连接组件测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">完整钱包连接组件</h3>
              <div className="flex justify-center">
                <WalletConnect />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">简化钱包连接组件</h3>
              <div className="flex justify-center">
                <SimpleWalletConnect />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 状态同步测试 */}
        <Card>
          <CardHeader>
            <CardTitle>状态同步测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">测试说明</h3>
                <ul className="text-sm space-y-1">
                  <li>• 点击上方任意钱包连接按钮</li>
                  <li>• 观察状态概览是否同步更新</li>
                  <li>• 检查两个组件是否显示相同的连接状态</li>
                  <li>• 验证钱包地址和用户信息是否匹配</li>
                </ul>
              </div>

              {testResults.status === 'success' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>测试通过！</strong><br />
                    钱包连接状态在所有组件间保持同步，用户认证正常。
                  </AlertDescription>
                </Alert>
              )}

              {testResults.status === 'warning' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>部分连接</strong><br />
                    钱包已连接或用户已认证，但状态不完全同步。请检查连接流程。
                  </AlertDescription>
                </Alert>
              )}

              {testResults.status === 'error' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>未连接</strong><br />
                    请先连接钱包以开始测试。
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
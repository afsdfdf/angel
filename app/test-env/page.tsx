'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Settings, Database, Wallet } from 'lucide-react';

export default function TestEnvironmentPage() {
  const [envVars, setEnvVars] = useState<{
    supabase: { url: boolean; anonKey: boolean; serviceKey: boolean };
    walletConnect: { projectId: boolean };
    nextAuth: { url: boolean; secret: boolean };
    app: { name: boolean; url: boolean };
  }>({
    supabase: { url: false, anonKey: false, serviceKey: false },
    walletConnect: { projectId: false },
    nextAuth: { url: false, secret: false },
    app: { name: false, url: false },
  });

  useEffect(() => {
    checkEnvironmentVariables();
  }, []);

  const checkEnvironmentVariables = () => {
    const vars = {
      supabase: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      walletConnect: {
        projectId: !!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
      },
      nextAuth: {
        url: !!process.env.NEXTAUTH_URL,
        secret: !!process.env.NEXTAUTH_SECRET,
      },
      app: {
        name: !!process.env.NEXT_PUBLIC_APP_NAME,
        url: !!process.env.NEXT_PUBLIC_APP_URL,
      },
    };

    setEnvVars(vars);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="default" className="bg-green-500">已设置</Badge>
    ) : (
      <Badge variant="destructive">未设置</Badge>
    );
  };

  const getSectionStatus = (section: Record<string, boolean>) => {
    const total = Object.keys(section).length;
    const set = Object.values(section).filter(Boolean).length;
    return { total, set, percentage: Math.round((set / total) * 100) };
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">环境变量检查</h1>
        <p className="text-muted-foreground">
          检查项目所需的环境变量配置状态
        </p>
      </div>

      <div className="grid gap-6">
        {/* Supabase 配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Supabase 配置
              {(() => {
                const status = getSectionStatus(envVars.supabase);
                return (
                  <Badge variant={status.percentage === 100 ? "default" : "destructive"}>
                    {status.set}/{status.total} ({status.percentage}%)
                  </Badge>
                );
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(envVars.supabase.url)}
                  <span>NEXT_PUBLIC_SUPABASE_URL</span>
                </div>
                {getStatusBadge(envVars.supabase.url)}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(envVars.supabase.anonKey)}
                  <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                </div>
                {getStatusBadge(envVars.supabase.anonKey)}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(envVars.supabase.serviceKey)}
                  <span>SUPABASE_SERVICE_ROLE_KEY</span>
                </div>
                {getStatusBadge(envVars.supabase.serviceKey)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WalletConnect 配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              WalletConnect 配置
              {(() => {
                const status = getSectionStatus(envVars.walletConnect);
                return (
                  <Badge variant={status.percentage === 100 ? "default" : "destructive"}>
                    {status.set}/{status.total} ({status.percentage}%)
                  </Badge>
                );
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(envVars.walletConnect.projectId)}
                  <span>NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID</span>
                </div>
                {getStatusBadge(envVars.walletConnect.projectId)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NextAuth 配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              NextAuth 配置
              {(() => {
                const status = getSectionStatus(envVars.nextAuth);
                return (
                  <Badge variant={status.percentage === 100 ? "default" : "destructive"}>
                    {status.set}/{status.total} ({status.percentage}%)
                  </Badge>
                );
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(envVars.nextAuth.url)}
                  <span>NEXTAUTH_URL</span>
                </div>
                {getStatusBadge(envVars.nextAuth.url)}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(envVars.nextAuth.secret)}
                  <span>NEXTAUTH_SECRET</span>
                </div>
                {getStatusBadge(envVars.nextAuth.secret)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 应用配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              应用配置
              {(() => {
                const status = getSectionStatus(envVars.app);
                return (
                  <Badge variant={status.percentage === 100 ? "default" : "destructive"}>
                    {status.set}/{status.total} ({status.percentage}%)
                  </Badge>
                );
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(envVars.app.name)}
                  <span>NEXT_PUBLIC_APP_NAME</span>
                </div>
                {getStatusBadge(envVars.app.name)}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(envVars.app.url)}
                  <span>NEXT_PUBLIC_APP_URL</span>
                </div>
                {getStatusBadge(envVars.app.url)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 配置建议 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              配置建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!envVars.supabase.url && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Supabase URL 未设置</strong><br />
                    请在 .env.local 文件中添加 NEXT_PUBLIC_SUPABASE_URL
                  </AlertDescription>
                </Alert>
              )}

              {!envVars.supabase.anonKey && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Supabase 匿名密钥未设置</strong><br />
                    请在 .env.local 文件中添加 NEXT_PUBLIC_SUPABASE_ANON_KEY
                  </AlertDescription>
                </Alert>
              )}

              {!envVars.walletConnect.projectId && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>WalletConnect 项目ID未设置</strong><br />
                    请在 .env.local 文件中添加 NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID<br />
                    您可以从 <a href="https://cloud.walletconnect.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">WalletConnect Cloud</a> 获取
                  </AlertDescription>
                </Alert>
              )}

              {!envVars.nextAuth.secret && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>NextAuth 密钥未设置</strong><br />
                    请在 .env.local 文件中添加 NEXTAUTH_SECRET<br />
                    可以使用命令生成: <code className="bg-gray-100 px-2 py-1 rounded">openssl rand -base64 32</code>
                  </AlertDescription>
                </Alert>
              )}

              {envVars.supabase.url && envVars.supabase.anonKey && envVars.walletConnect.projectId && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>配置完整！</strong><br />
                    所有必要的环境变量都已设置，应用应该可以正常运行。
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 环境变量模板 */}
        <Card>
          <CardHeader>
            <CardTitle>环境变量模板</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# WalletConnect 配置
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-wallet-connect-project-id

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# 应用配置
NEXT_PUBLIC_APP_NAME=Angel Crypto App
NEXT_PUBLIC_APP_URL=https://www.angelcoin.app`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
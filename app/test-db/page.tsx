'use client';

import { useState, useEffect } from 'react';
import { DatabaseService, isDatabaseAvailable } from '@/lib/database';
import { DatabaseDiagnostics } from '@/lib/database-diagnostics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Database, Users, Gift } from 'lucide-react';

export default function TestDatabasePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<{
    connection: boolean;
    tables: boolean;
    createUser: boolean;
    getUser: boolean;
    diagnostics: any | null;
    error?: string;
  }>({
    connection: false,
    tables: false,
    createUser: false,
    getUser: false,
    diagnostics: null,
  });

  useEffect(() => {
    runDatabaseTests();
  }, []);

  const runDatabaseTests = async () => {
    setIsLoading(true);
    const results: {
      connection: boolean;
      tables: boolean;
      createUser: boolean;
      getUser: boolean;
      diagnostics: any | null;
      error?: string;
    } = {
      connection: false,
      tables: false,
      createUser: false,
      getUser: false,
      diagnostics: null,
      error: undefined,
    };

    try {
      console.log('🔍 开始数据库测试...');

      // 1. 测试数据库连接
      console.log('1. 测试数据库连接...');
      results.connection = isDatabaseAvailable;
      console.log('数据库可用性:', results.connection);

      if (!results.connection) {
        results.error = '数据库配置无效或连接失败';
        setTestResults(results);
        setIsLoading(false);
        return;
      }

      // 运行完整诊断
      console.log('🔍 运行数据库完整诊断...');
      const diagnostics = await DatabaseDiagnostics.runFullDiagnostics();
      results.diagnostics = diagnostics;

      // 2. 测试数据库健康检查
      console.log('2. 测试数据库健康检查...');
      const isHealthy = await DatabaseService.isHealthy();
      console.log('数据库健康状态:', isHealthy);

      if (!isHealthy) {
        results.error = '数据库健康检查失败';
        setTestResults(results);
        setIsLoading(false);
        return;
      }

      // 3. 测试表结构
      console.log('3. 测试表结构...');
      try {
        // 尝试查询users表
        const testUser = await DatabaseService.getUserByWalletAddress('0x0000000000000000000000000000000000000000');
        results.tables = true;
        console.log('表结构测试通过');
      } catch (error) {
        console.error('表结构测试失败:', error);
        results.error = `表结构测试失败: ${error}`;
      }

      // 4. 测试创建用户
      console.log('4. 测试创建用户...');
      try {
        const testWallet = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
        const newUser = await DatabaseService.createUser({
          wallet_address: testWallet,
          username: `TestUser_${Date.now()}`,
        });
        
        if (newUser) {
          results.createUser = true;
          console.log('创建用户测试通过:', newUser.id);
          
          // 5. 测试获取用户
          console.log('5. 测试获取用户...');
          const retrievedUser = await DatabaseService.getUserByWalletAddress(testWallet);
          results.getUser = !!retrievedUser;
          console.log('获取用户测试:', results.getUser);
        } else {
          results.error = '创建用户返回null';
        }
      } catch (error) {
        console.error('创建用户测试失败:', error);
        results.error = `创建用户失败: ${error}`;
      }

    } catch (error) {
      console.error('数据库测试失败:', error);
      results.error = `测试失败: ${error}`;
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="default" className="bg-green-500">通过</Badge>
    ) : (
      <Badge variant="destructive">失败</Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">数据库连接测试</h1>
        <p className="text-muted-foreground">
          测试数据库连接、表结构和基本操作
        </p>
      </div>

      <div className="grid gap-6">
        {/* 测试控制 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              数据库测试控制
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runDatabaseTests} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '测试中...' : '重新运行测试'}
            </Button>
          </CardContent>
        </Card>

        {/* 测试结果 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              测试结果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>正在运行测试...</p>
              </div>
            ) : (
              <>
                {/* 连接测试 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(testResults.connection)}
                    <div>
                      <h3 className="font-semibold">数据库连接</h3>
                      <p className="text-sm text-muted-foreground">
                        检查Supabase配置和连接状态
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(testResults.connection)}
                </div>

                {/* 表结构测试 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(testResults.tables)}
                    <div>
                      <h3 className="font-semibold">表结构</h3>
                      <p className="text-sm text-muted-foreground">
                        检查users表是否存在和可访问
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(testResults.tables)}
                </div>

                {/* 创建用户测试 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(testResults.createUser)}
                    <div>
                      <h3 className="font-semibold">创建用户</h3>
                      <p className="text-sm text-muted-foreground">
                        测试用户创建功能
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(testResults.createUser)}
                </div>

                {/* 获取用户测试 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(testResults.getUser)}
                    <div>
                      <h3 className="font-semibold">获取用户</h3>
                      <p className="text-sm text-muted-foreground">
                        测试用户查询功能
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(testResults.getUser)}
                </div>

                {/* 错误信息 */}
                {testResults.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>错误详情:</strong> {testResults.error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* 诊断结果 */}
                {testResults.diagnostics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        数据库诊断结果
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {testResults.diagnostics.summary.issues.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-red-600 mb-2">发现的问题:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {testResults.diagnostics.summary.issues.map((issue: string, index: number) => (
                              <li key={index} className="text-red-600">{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {testResults.diagnostics.summary.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-blue-600 mb-2">建议:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {testResults.diagnostics.summary.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-blue-600">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {testResults.diagnostics.summary.success && (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            <strong>诊断通过！</strong><br />
                            数据库配置正常，所有检查都已通过。
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 总结 */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">测试总结</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {Object.values(testResults).filter(Boolean).length - 1}
                      </div>
                      <div className="text-muted-foreground">通过</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {Object.values(testResults).filter(v => v === false).length}
                      </div>
                      <div className="text-muted-foreground">失败</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {testResults.connection && testResults.tables && testResults.createUser && testResults.getUser ? '100%' : '部分'}
                      </div>
                      <div className="text-muted-foreground">完成度</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">
                        {testResults.error ? '需要修复' : '正常'}
                      </div>
                      <div className="text-muted-foreground">状态</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 环境变量检查 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              环境变量检查
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>NEXT_PUBLIC_SUPABASE_URL:</span>
                <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>SUPABASE_SERVICE_ROLE_KEY:</span>
                <Badge variant={process.env.SUPABASE_SERVICE_ROLE_KEY ? "default" : "destructive"}>
                  {process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
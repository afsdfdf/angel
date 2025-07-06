'use client';

import { useState, useEffect } from 'react';
import { DatabaseDiagnostics } from '@/lib/database-diagnostics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Database, RefreshCw } from 'lucide-react';

export default function TestDatabasePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [envInfo, setEnvInfo] = useState<any>(null);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 开始数据库完整诊断...');
      const diagnostics = await DatabaseDiagnostics.runFullDiagnostics();
      setResults(diagnostics);
      
      // 获取环境信息
      const env = await DatabaseDiagnostics.getEnvironmentInfo();
      setEnvInfo(env);
    } catch (error) {
      console.error('诊断失败:', error);
      setResults({
        summary: {
          success: false,
          total: 5,
          passed: 0,
          failed: 5,
          issues: [`诊断失败: ${error}`],
          recommendations: ['检查环境变量配置', '确认Supabase项目状态']
        }
      });
    }
    setIsLoading(false);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-500">通过</Badge>
    ) : (
      <Badge variant="destructive">失败</Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
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
              onClick={runTests} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  测试中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新运行测试
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 测试结果 */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                测试结果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 数据库连接 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">数据库连接</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      检查Supabase配置和连接状态
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(results.connection.success)}
                      <span className={results.connection.success ? 'text-green-600' : 'text-red-600'}>
                        {results.connection.success ? '通过' : '失败'}
                      </span>
                    </div>
                    {!results.connection.success && (
                      <p className="text-sm text-red-600 mt-2">{results.connection.error}</p>
                    )}
                  </CardContent>
                </Card>

                {/* 表结构 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">表结构</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      检查users表是否存在和可访问
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(results.tables.success)}
                      <span className={results.tables.success ? 'text-green-600' : 'text-red-600'}>
                        {results.tables.success ? '通过' : '失败'}
                      </span>
                    </div>
                    {!results.tables.success && (
                      <div className="mt-2">
                        {results.tables.missingTables?.length > 0 && (
                          <p className="text-sm text-red-600">缺少表: {results.tables.missingTables.join(', ')}</p>
                        )}
                        {results.tables.errors?.length > 0 && (
                          <p className="text-sm text-red-600">错误: {results.tables.errors.join('; ')}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 创建用户 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">创建用户</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      测试用户创建功能
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(results.createUser.success)}
                      <span className={results.createUser.success ? 'text-green-600' : 'text-red-600'}>
                        {results.createUser.success ? '通过' : '失败'}
                      </span>
                    </div>
                    {!results.createUser.success && (
                      <p className="text-sm text-red-600 mt-2">{results.createUser.error}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 获取用户 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">获取用户</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      测试用户查询功能
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(results.queryUsers.success)}
                      <span className={results.queryUsers.success ? 'text-green-600' : 'text-red-600'}>
                        {results.queryUsers.success ? '通过' : '失败'}
                      </span>
                    </div>
                    {!results.queryUsers.success && (
                      <p className="text-sm text-red-600 mt-2">{results.queryUsers.error}</p>
                    )}
                    {results.queryUsers.success && results.queryUsers.users && (
                      <p className="text-sm text-gray-600 mt-2">
                        找到 {results.queryUsers.users.length} 个用户
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* RLS策略 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">RLS策略</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      检查行级安全策略配置
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(results.policies.policies || {}).map(([table, policy]: [string, any]) => (
                        <div key={table} className="flex items-center justify-between">
                          <span className="text-sm">{table}</span>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${policy.can_select ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className={policy.can_select ? 'text-green-600' : 'text-red-600'}>
                              {policy.can_select ? '正常' : '失败'}
                            </span>
                    </div>
                  </div>
                ))}
                    </div>
                    {results.policies.errors?.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">错误详情:</p>
                        <ul className="text-sm text-red-600 mt-1">
                          {results.policies.errors.map((error: string, index: number) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
              </div>
            )}
                  </CardContent>
                </Card>
              </div>

              {/* 测试总结 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    测试总结
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{results.summary.total}</div>
                      <div className="text-sm text-muted-foreground">总测试</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{results.summary.passed}</div>
                      <div className="text-sm text-muted-foreground">通过</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{results.summary.failed}</div>
                      <div className="text-sm text-muted-foreground">失败</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round((results.summary.passed / results.summary.total) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">完成度</div>
                    </div>
                  </div>

                  {results.summary.issues.length > 0 && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>需要修复</strong>
                        <ul className="mt-2 list-disc list-inside">
                          {results.summary.issues.map((issue: string, index: number) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {results.summary.recommendations.length > 0 && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>建议:</strong>
                        <ul className="mt-2 list-disc list-inside">
                          {results.summary.recommendations.map((rec: string, index: number) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

        {/* 环境变量检查 */}
        {envInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                环境变量检查
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
                    <Badge variant={envInfo.supabaseUrl !== '未设置' ? 'default' : 'destructive'}>
                      {envInfo.supabaseUrl !== '未设置' ? '已设置' : '未设置'}
                    </Badge>
                  </div>
                  {envInfo.supabaseUrl !== '未设置' && (
                    <p className="text-xs text-muted-foreground truncate">{envInfo.supabaseUrl}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                    <Badge variant={envInfo.supabaseKey !== '未设置' ? 'default' : 'destructive'}>
                      {envInfo.supabaseKey !== '未设置' ? '已设置' : '未设置'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">SUPABASE_SERVICE_ROLE_KEY:</span>
                    <Badge variant={envInfo.serviceRoleKey !== '未设置' ? 'default' : 'destructive'}>
                      {envInfo.serviceRoleKey !== '未设置' ? '已设置' : '未设置'}
                    </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
        )}
      </div>
    </div>
  );
} 
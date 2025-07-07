'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DatabaseService } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Database, RefreshCw, Bug } from 'lucide-react';
import { WalletConnect } from '@/components/wallet-connect';
import { PageHeader } from '@/components/page-header';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { config } from '@/lib/config';

export default function DatabaseDiagnosticPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    test: string;
    status: 'success' | 'error' | 'pending';
    message: string;
  }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [supabaseConfig, setSupabaseConfig] = useState({
    url: '',
    anonKey: ''
  });

  useEffect(() => {
    // 显示Supabase配置（安全起见，只显示部分）
    setSupabaseConfig({
      url: config.supabase.url,
      anonKey: config.supabase.anonKey.substring(0, 10) + '...'
    });
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // 测试1: 基本连接
      setResults(prev => [...prev, {
        test: '基本连接',
        status: 'pending',
        message: '测试中...'
      }]);

      try {
        const supabase = createClientComponentClient();
        const { data, error } = await supabase.from('users').select('count(*)').limit(1);
        
        if (error) throw error;
        
        setResults(prev => prev.map(r => 
          r.test === '基本连接' ? {
            ...r,
            status: 'success',
            message: '连接成功'
          } : r
        ));
      } catch (error: any) {
        setResults(prev => prev.map(r => 
          r.test === '基本连接' ? {
            ...r,
            status: 'error',
            message: `连接失败: ${error.message || '未知错误'}`
          } : r
        ));
      }

      // 测试2: 用户表
      setResults(prev => [...prev, {
        test: '用户表',
        status: 'pending',
        message: '测试中...'
      }]);

      try {
        const users = await DatabaseService.getAllUsers();
        setResults(prev => prev.map(r => 
          r.test === '用户表' ? {
            ...r,
            status: 'success',
            message: `成功读取 ${users.length} 个用户`
          } : r
        ));
      } catch (error: any) {
        setResults(prev => prev.map(r => 
          r.test === '用户表' ? {
            ...r,
            status: 'error',
            message: `读取用户表失败: ${error.message || '未知错误'}`
          } : r
        ));
      }

      // 测试3: 邀请表
      setResults(prev => [...prev, {
        test: '邀请表',
        status: 'pending',
        message: '测试中...'
      }]);

      try {
        const invitations = await DatabaseService.getAllInvitations();
        setResults(prev => prev.map(r => 
          r.test === '邀请表' ? {
            ...r,
            status: 'success',
            message: `成功读取 ${invitations.length} 个邀请`
          } : r
        ));
      } catch (error: any) {
        setResults(prev => prev.map(r => 
          r.test === '邀请表' ? {
            ...r,
            status: 'error',
            message: `读取邀请表失败: ${error.message || '未知错误'}`
          } : r
        ));
      }

      // 测试4: 奖励记录表
      setResults(prev => [...prev, {
        test: '奖励记录表',
        status: 'pending',
        message: '测试中...'
      }]);

      try {
        const { data, error } = await DatabaseService.supabase()
          .from('reward_records')
          .select('count(*)');
        
        if (error) throw error;
        
        setResults(prev => prev.map(r => 
          r.test === '奖励记录表' ? {
            ...r,
            status: 'success',
            message: `奖励记录表存在`
          } : r
        ));
      } catch (error: any) {
        setResults(prev => prev.map(r => 
          r.test === '奖励记录表' ? {
            ...r,
            status: 'error',
            message: `读取奖励记录表失败: ${error.message || '未知错误'}`
          } : r
        ));
      }

      // 测试5: NFT表
      setResults(prev => [...prev, {
        test: 'NFT表',
        status: 'pending',
        message: '测试中...'
      }]);

      try {
        const { data, error } = await DatabaseService.supabase()
          .from('nfts')
          .select('count(*)');
        
        if (error) throw error;
        
        setResults(prev => prev.map(r => 
          r.test === 'NFT表' ? {
            ...r,
            status: 'success',
            message: `NFT表存在`
          } : r
        ));
      } catch (error: any) {
        setResults(prev => prev.map(r => 
          r.test === 'NFT表' ? {
            ...r,
            status: 'error',
            message: `读取NFT表失败: ${error.message || '未知错误'}`
          } : r
        ));
      }

      // 测试6: 土地表
      setResults(prev => [...prev, {
        test: '土地表',
        status: 'pending',
        message: '测试中...'
      }]);

      try {
        const { data, error } = await DatabaseService.supabase()
          .from('lands')
          .select('count(*)');
        
        if (error) throw error;
        
        setResults(prev => prev.map(r => 
          r.test === '土地表' ? {
            ...r,
            status: 'success',
            message: `土地表存在`
          } : r
        ));
      } catch (error: any) {
        setResults(prev => prev.map(r => 
          r.test === '土地表' ? {
            ...r,
            status: 'error',
            message: `读取土地表失败: ${error.message || '未知错误'}`
          } : r
        ));
      }

    } catch (error: any) {
      setError(`诊断过程中出错: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
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
      <Badge variant="default" className="bg-green-500">正常</Badge>
    ) : (
      <Badge variant="destructive">异常</Badge>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-8">
          <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">请先登录</h2>
          <p className="text-muted-foreground mb-6">需要登录后才能进行数据库诊断</p>
          
          <div className="flex justify-center">
            <WalletConnect />
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            连接钱包后即可开始数据库诊断
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="数据库诊断" 
        emoji="🔍" 
        showBalance={false}
      />
      
      <div className="container mx-auto px-4 pb-4 max-w-4xl pt-20">
        <Card>
          <CardHeader>
            <CardTitle>数据库连接诊断</CardTitle>
            <CardDescription>
              测试数据库连接和表结构是否正确
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Supabase 配置</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">URL:</div>
                <div>{supabaseConfig.url}</div>
                <div className="font-medium">匿名密钥:</div>
                <div>{supabaseConfig.anonKey}</div>
              </div>
            </div>

            <Button 
              onClick={runDiagnostics} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '诊断中...' : '运行诊断'}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {results.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-medium">诊断结果</h3>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.test}</span>
                        <Badge variant={
                          result.status === 'success' ? 'default' :
                          result.status === 'error' ? 'destructive' : 'outline'
                        }>
                          {result.status === 'success' ? '成功' : 
                           result.status === 'error' ? '失败' : '进行中'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
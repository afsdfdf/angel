'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@supabase/supabase-js';

export default function TestDbPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    const results = [];
    
    // 测试1：检查环境变量
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    results.push({
      test: '环境变量检查',
      status: url && key ? 'success' : 'error',
      details: {
        url: url ? '已设置' : '未设置',
        key: key ? '已设置' : '未设置'
      }
    });

    if (url && key) {
      // 测试2：创建客户端
      try {
        const supabase = createClient(url, key);
        results.push({
          test: 'Supabase 客户端创建',
          status: 'success',
          details: '客户端创建成功'
        });

        // 测试3：简单查询
        try {
          const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
          
          if (error) {
            results.push({
              test: '数据库查询',
              status: 'error',
              details: error.message
            });
          } else {
            results.push({
              test: '数据库查询',
              status: 'success',
              details: '查询成功'
            });
          }
        } catch (e: any) {
          results.push({
            test: '数据库查询',
            status: 'error',
            details: e.message
          });
        }

        // 测试4：检查网络连接
        try {
          const response = await fetch(url + '/rest/v1/', {
            headers: {
              'apikey': key,
              'Authorization': `Bearer ${key}`
            }
          });
          
          results.push({
            test: '网络连接测试',
            status: response.ok ? 'success' : 'error',
            details: `状态码: ${response.status}`
          });
        } catch (e: any) {
          results.push({
            test: '网络连接测试',
            status: 'error',
            details: e.message
          });
        }
      } catch (e: any) {
        results.push({
          test: 'Supabase 客户端创建',
          status: 'error',
          details: e.message
        });
      }
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>数据库连接测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={runTests} disabled={testing}>
              {testing ? '测试中...' : '运行测试'}
            </Button>

            {testResults.length > 0 && (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.test}</span>
                      <span className={`text-sm ${
                        result.status === 'success' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {result.status === 'success' ? '✓ 成功' : '✗ 失败'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {typeof result.details === 'object' 
                        ? JSON.stringify(result.details, null, 2)
                        : result.details}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
              <h3 className="font-semibold mb-2">Supabase 项目信息</h3>
              <div className="text-sm space-y-1">
                <p>项目 URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
                <p>项目 ID: czvsdszsbvkkiqagrmtp</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
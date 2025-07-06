'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestEnvPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 获取客户端可访问的环境变量
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '未设置',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30) + '...' : '未设置',
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || '未设置',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '未设置',
      NODE_ENV: process.env.NODE_ENV || '未设置',
    });
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>环境变量测试页面</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">运行环境</h3>
              <p className="text-sm text-muted-foreground">
                {isClient ? '客户端 (浏览器)' : '服务器端'}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">环境变量状态</h3>
              <div className="space-y-2">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="font-mono text-sm">{key}:</span>
                    <span className={`text-sm ${value === '未设置' ? 'text-red-500' : 'text-green-500'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">调试信息</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs">
                {JSON.stringify({
                  isClient,
                  windowDefined: typeof window !== 'undefined',
                  processEnvKeys: Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')),
                }, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
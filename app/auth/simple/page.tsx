'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export default function SimpleAuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <CardTitle>简易认证</CardTitle>
          <CardDescription>
            使用钱包连接进行简单认证
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            这是一个简化版的认证页面，用于快速测试钱包连接功能。
          </p>
          <div className="flex justify-center">
            <Button>
              连接钱包
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
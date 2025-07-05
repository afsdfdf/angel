'use client';

import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, LogOut, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export function LoginButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 处理钱包连接
  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
      setShowLoginDialog(true);
    } catch (error) {
      console.error('钱包连接失败:', error);
      toast.error('钱包连接失败');
    }
  };

  // 处理登录
  const handleLogin = async () => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(referralCode || undefined);
      setShowLoginDialog(false);
      setReferralCode('');
      toast.success('登录成功！');
    } catch (error: any) {
      console.error('登录失败:', error);
      toast.error(error.message || '登录失败');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 处理登出
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('已登出');
    } catch (error) {
      console.error('登出失败:', error);
      toast.error('登出失败');
    }
  };

  // 如果已认证，显示用户信息和登出按钮
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {user.username || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4 mr-2" />
          登出
        </Button>
      </div>
    );
  }

  // 如果钱包已连接但未认证，显示登录对话框
  if (isConnected && !isAuthenticated) {
    return (
      <>
        <Button
          onClick={() => setShowLoginDialog(true)}
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          登录
        </Button>

        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>登录到 Angel Crypto App</DialogTitle>
              <DialogDescription>
                请签名以验证您的身份。如果您有邀请码，请在下方输入。
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referral-code">邀请码（可选）</Label>
                <Input
                  id="referral-code"
                  placeholder="输入邀请码获得奖励"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="flex-1"
                >
                  {isLoggingIn ? '登录中...' : '确认登录'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => disconnect()}
                >
                  断开钱包
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // 如果钱包未连接，显示连接选项
  return (
    <>
      <Button
        onClick={() => setShowLoginDialog(true)}
      >
        <Wallet className="h-4 w-4 mr-2" />
        连接钱包
      </Button>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>连接钱包</DialogTitle>
            <DialogDescription>
              选择您的钱包来连接到 Angel Crypto App
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                variant="outline"
                onClick={() => handleConnect(connector)}
                disabled={isPending}
                className="w-full justify-start"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {connector.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
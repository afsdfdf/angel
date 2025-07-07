'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DatabaseService, Invitation } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Share2, Users, Gift, ExternalLink, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export function InviteSystem() {
  const { user, isAuthenticated, generateInviteLink } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 确保在客户端环境中运行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 加载邀请记录
  const loadInvitations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await DatabaseService.getInvitationsByUser(user.id);
      setInvitations(data);
    } catch (error) {
      console.error('加载邀请记录失败:', error);
      toast.error('加载邀请记录失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 生成邀请链接
  const generateLink = async () => {
    if (!user?.wallet_address) {
      console.error('❌ 无法生成邀请链接：用户未登录');
      return;
    }
    
    setIsGenerating(true);
    try {
      console.log('🔄 生成邀请链接，用户:', user);
      const link = await DatabaseService.generateInviteLink(user.wallet_address);
      
      if (!link) {
        console.error('❌ 生成邀请链接失败');
        setError('生成邀请链接失败，请稍后重试');
        return;
      }
      
      console.log('✅ 生成邀请链接成功:', link);
      setInviteLink(link);
    } catch (error) {
      console.error('❌ 生成邀请链接异常:', error);
      setError('生成邀请链接时发生错误');
    } finally {
      setIsGenerating(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    if (!isClient || typeof window === 'undefined') return;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败');
    }
  };

  // 分享邀请链接
  const shareInviteLink = async () => {
    if (!inviteLink || !isClient || typeof window === 'undefined') return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Angel Crypto App 邀请',
          text: '加入我的团队，一起探索天使加密世界！',
          url: inviteLink,
        });
      } catch (error) {
        console.error('分享失败:', error);
        copyToClipboard(inviteLink);
      }
    } else {
      copyToClipboard(inviteLink);
    }
  };

  // 打开邀请链接
  const openInviteLink = () => {
    if (inviteLink && isClient && typeof window !== 'undefined') {
      window.open(inviteLink, '_blank');
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && isClient) {
      loadInvitations();
      
      // 调用异步函数
      const loadInviteLink = async () => {
        await generateLink();
      };
      
      loadInviteLink();
    }
  }, [isAuthenticated, user, isClient]);

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>邀请系统</CardTitle>
          <CardDescription>
            加载中...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>邀请系统</CardTitle>
          <CardDescription>
            请先登录以使用邀请功能
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 邀请概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">我的钱包</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold font-mono">
              {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
            </div>
            <p className="text-xs text-muted-foreground">
              用于生成邀请链接
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">邀请统计</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.invites_count}</div>
            <p className="text-xs text-muted-foreground">
              已邀请的用户数量
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总奖励</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.total_earned?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              通过邀请获得的奖励
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 邀请功能 */}
      <Tabs defaultValue="invite" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invite">邀请朋友</TabsTrigger>
          <TabsTrigger value="history">邀请记录</TabsTrigger>
        </TabsList>

        <TabsContent value="invite" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>邀请朋友</CardTitle>
              <CardDescription>
                分享您的邀请链接，朋友注册后您将获得奖励
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet-address">我的钱包地址</Label>
                <div className="flex gap-2">
                  <Input
                    id="wallet-address"
                    value={user.wallet_address}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(user.wallet_address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-link">邀请链接</Label>
                <div className="flex gap-2">
                  <Input
                    id="invite-link"
                    value={inviteLink}
                    readOnly
                    className="flex-1 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(inviteLink)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={shareInviteLink}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={openInviteLink}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  预览邀请页面
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(inviteLink)}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  生成二维码
                </Button>
              </div>

              {/* 奖励说明 */}
              <div className="bg-gradient-to-r from-angel-primary/10 to-angel-secondary/10 rounded-lg p-4 border border-angel-primary/20">
                <h4 className="font-medium text-foreground mb-2">奖励机制</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-background/50 rounded p-2">
                    <p className="text-xs text-muted-foreground">新用户</p>
                    <p className="font-bold text-angel-primary">100</p>
                  </div>
                  <div className="bg-background/50 rounded p-2">
                    <p className="text-xs text-muted-foreground">一级邀请</p>
                    <p className="font-bold text-angel-success">50</p>
                  </div>
                  <div className="bg-background/50 rounded p-2">
                    <p className="text-xs text-muted-foreground">二级邀请</p>
                    <p className="font-bold text-angel-secondary">25</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  每成功邀请一位新用户，您将获得相应的ANGEL代币奖励
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>邀请记录</CardTitle>
              <CardDescription>
                查看您的邀请历史和奖励状态
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">加载中...</p>
                </div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    还没有邀请记录，快去邀请朋友吧！
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium font-mono">
                            {invitation.invitee_id ? `邀请ID: ${invitation.invitee_id.slice(0, 8)}` : '待接受'}
                          </span>
                          <Badge 
                            variant={invitation.status === 'accepted' ? 'default' : 'secondary'}
                          >
                            {invitation.status === 'accepted' ? '已接受' : '待接受'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {invitation.status === 'accepted' 
                            ? `接受时间: ${invitation.updated_at ? new Date(invitation.updated_at).toLocaleDateString() : '未知'}`
                            : `创建时间: ${invitation.created_at ? new Date(invitation.created_at).toLocaleDateString() : '未知'}`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          +{invitation.reward_amount || 0} ANGEL
                        </div>
                        <Badge 
                          variant={invitation.status === 'completed' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {invitation.status === 'completed' ? '已完成' : '未完成'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
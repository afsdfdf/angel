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
import { Copy, Share2, Users, Gift, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function InviteSystem() {
  const { user, isAuthenticated, generateInviteLink } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [isClient, setIsClient] = useState(false);

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
  const generateLink = () => {
    const link = generateInviteLink();
    setInviteLink(link);
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

  // 创建新邀请
  const createInvitation = async () => {
    if (!user || !isClient) return;

    try {
      const newInviteLink = await DatabaseService.createInviteLink(user.id);

      if (newInviteLink) {
        setInviteLink(newInviteLink);
        toast.success('邀请链接创建成功');
        // 重新加载邀请记录
        loadInvitations();
      }
    } catch (error) {
      console.error('创建邀请失败:', error);
      toast.error('创建邀请失败');
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && isClient) {
      loadInvitations();
      generateLink();
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
            <CardTitle className="text-sm font-medium">我的邀请码</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.referral_code}</div>
            <p className="text-xs text-muted-foreground">
              分享给朋友获得奖励
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功邀请</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.total_referrals}</div>
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
              {invitations.reduce((sum, inv) => sum + (inv.reward_amount || 0), 0)}
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
                分享您的邀请码或链接，朋友注册后您将获得奖励
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referral-code">我的邀请码</Label>
                <div className="flex gap-2">
                  <Input
                    id="referral-code"
                    value={user.referral_code}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(user.referral_code)}
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
                    className="flex-1"
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
                <Button onClick={createInvitation} className="flex-1">
                  创建新邀请
                </Button>
                <Button
                  variant="outline"
                  onClick={() => isClient && window.open(inviteLink, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  预览
                </Button>
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
                          <span className="text-sm font-medium">
                            {invitation.invitee_wallet_address 
                              ? `${invitation.invitee_wallet_address.slice(0, 6)}...${invitation.invitee_wallet_address.slice(-4)}`
                              : '待接受'
                            }
                          </span>
                          <Badge 
                            variant={invitation.status === 'accepted' ? 'default' : 'secondary'}
                          >
                            {invitation.status === 'accepted' ? '已接受' : '待接受'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(invitation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          +{invitation.reward_amount || 0} 奖励
                        </div>
                        <Badge 
                          variant={invitation.reward_claimed ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {invitation.reward_claimed ? '已领取' : '未领取'}
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
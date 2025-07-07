'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DatabaseService, REWARD_CONFIG } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Users, Coins, RefreshCw, Copy, Send, UserPlus } from 'lucide-react';
import { WalletConnect } from '@/components/wallet-connect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/page-header';

export default function TestInviteSimplePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    databaseConnected: boolean
    userExists: boolean
    inviteLinkGenerated: boolean
    message: string
  } | null>(null);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviterId, setInviterId] = useState('');
  const [inviterWallet, setInviterWallet] = useState('');
  const [inviteResult, setInviteResult] = useState<{success: boolean, message: string} | null>(null);
  const [userInvites, setUserInvites] = useState<any[]>([]);
  const [allInvites, setAllInvites] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [manualWallet, setManualWallet] = useState('');
  const [manualResult, setManualResult] = useState<{
    success: boolean
    message: string
  } | null>(null);

  useEffect(() => {
    loadInvites();
  }, [user, refreshTrigger]);

  const loadInvites = async () => {
    if (!user) return;

    try {
      // 加载当前用户的邀请记录
      const { data: userInvitesData } = await DatabaseService.supabase()
        .from('invites')
        .select('*, inviter:inviter_id(*), invited:invited_user_id(*)')
        .eq('inviter_id', user.id);

      setUserInvites(userInvitesData || []);

      // 加载所有邀请记录
      const { data: allInvitesData } = await DatabaseService.supabase()
        .from('invites')
        .select('*, inviter:inviter_id(*), invited:invited_user_id(*)')
        .order('created_at', { ascending: false })
        .limit(10);

      setAllInvites(allInvitesData || []);
    } catch (error) {
      console.error('加载邀请记录失败:', error);
    }
  };

  const runSimpleTest = async () => {
    if (!user) return;
    
    setLoading(true);
    setTestResults(null);

    try {
      console.log('🔍 开始简单测试...');
      
      // 测试1: 数据库连接
      const isHealthy = await DatabaseService.isHealthy();
      console.log('✅ 数据库连接:', isHealthy);
      
      // 测试2: 用户存在
      const userExists = await DatabaseService.isUserExists(user.wallet_address);
      console.log('✅ 用户存在:', userExists);
      
      // 测试3: 生成邀请链接
      let linkGenerated = false;
      try {
        const link = await DatabaseService.generateInviteLink(user.wallet_address);
        linkGenerated = !!link;
        console.log('✅ 邀请链接生成:', link);
      } catch (error) {
        console.error('❌ 邀请链接生成失败:', error);
      }
      
      // 设置测试结果
      setTestResults({
        databaseConnected: isHealthy,
        userExists: userExists,
        inviteLinkGenerated: linkGenerated,
        message: '测试完成'
      });
    } catch (error: any) {
      console.error('❌ 测试失败:', error);
      setTestResults({
        databaseConnected: false,
        userExists: false,
        inviteLinkGenerated: false,
        message: `测试失败: ${error?.message || '未知错误'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert('邀请链接已复制到剪贴板');
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
      <Badge variant="default" className="bg-green-500">通过</Badge>
    ) : (
      <Badge variant="destructive">失败</Badge>
    );
  };

  const handleDirectInvite = async () => {
    if (!user) {
      setInviteResult({
        success: false,
        message: '请先登录'
      });
      return;
    }

    setLoading(true);
    setInviteResult(null);

    try {
      let success = false;
      let message = '';

      if (inviterId) {
        // 使用ID邀请
        success = await DatabaseService.directInsertInvitationById(
          user.wallet_address,
          inviterId
        );
        message = success ? '使用ID邀请成功' : '使用ID邀请失败';
      } else if (inviterWallet) {
        // 使用钱包地址邀请
        const inviter = await DatabaseService.getUserByWalletAddress(inviterWallet);
        if (!inviter) {
          setInviteResult({
            success: false,
            message: '邀请人不存在'
          });
          setLoading(false);
          return;
        }

        success = await DatabaseService.directInsertInvitationById(
          user.wallet_address,
          inviter.id
        );
        message = success ? '使用钱包地址邀请成功' : '使用钱包地址邀请失败';
      } else {
        setInviteResult({
          success: false,
          message: '请输入邀请人ID或钱包地址'
        });
        setLoading(false);
        return;
      }

      setInviteResult({
        success,
        message
      });

      // 刷新邀请记录
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      setInviteResult({
        success: false,
        message: `邀请失败: ${error.message || '未知错误'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitesTable = async () => {
    setLoading(true);
    try {
      const result = await DatabaseService.supabase().rpc('create_invites_table');
      setInviteResult({
        success: true,
        message: '创建invites表成功'
      });
    } catch (error: any) {
      setInviteResult({
        success: false,
        message: `创建表失败: ${error.message || '未知错误'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessAllRewards = async () => {
    setLoading(true);
    try {
      const { data, error } = await DatabaseService.supabase().rpc('process_all_pending_rewards');
      
      if (error) {
        setInviteResult({
          success: false,
          message: `处理奖励失败: ${error.message}`
        });
      } else {
        setInviteResult({
          success: true,
          message: `成功处理了 ${data} 条未发放的奖励`
        });
        // 刷新邀请记录
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error: any) {
      setInviteResult({
        success: false,
        message: `处理奖励异常: ${error.message || '未知错误'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const link = await DatabaseService.generateInviteLink(user.wallet_address);
      setInviteLink(link);
    } catch (error: any) {
      console.error('生成邀请链接失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const testManualInvite = async () => {
    if (!user || !manualWallet) return;

    setLoading(true);
    setManualResult(null);

    try {
      console.log('🔍 开始手动测试邀请:', {
        inviter: user.wallet_address,
        invitee: manualWallet
      });
      
      // 检查被邀请用户是否已存在
      const inviteeExists = await DatabaseService.isUserExists(manualWallet);
      
      if (inviteeExists) {
        setManualResult({
          success: false,
          message: '被邀请用户已存在，无法完成邀请测试'
        });
        return;
      }
      
      // 测试直接插入邀请记录
      const success = await DatabaseService.directInsertInvitationById(
        manualWallet,
        user.id
      );
      
      setManualResult({
        success,
        message: success 
          ? '成功创建邀请记录，当被邀请用户注册时将触发奖励' 
          : '创建邀请记录失败'
      });
    } catch (error: any) {
      console.error('❌ 手动测试失败:', error);
      setManualResult({
        success: false,
        message: `测试失败: ${error?.message || '未知错误'}`
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">请先登录</h2>
          <p className="text-muted-foreground mb-6">需要登录后才能测试邀请奖励系统</p>
          
          <div className="flex justify-center">
            <WalletConnect />
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            连接钱包后即可开始测试邀请奖励系统
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="邀请系统简单测试" 
        emoji="🧪" 
        showBalance={false}
      />
      
      <div className="container mx-auto px-4 pb-8 max-w-4xl pt-20">
        {/* 登录提示 */}
        {!user && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">请先连接钱包</h3>
                <p className="text-muted-foreground mb-4">
                  您需要连接钱包才能测试邀请系统功能
                </p>
                <WalletConnect />
              </div>
            </CardContent>
          </Card>
        )}

        {user && (
          <>
            {/* 简单测试 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  简单功能测试
                </CardTitle>
                <CardDescription>
                  测试邀请系统的基本功能是否正常工作
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={runSimpleTest} 
                  disabled={loading}
                  className="w-full mb-4"
                >
                  {loading ? '测试中...' : '运行简单测试'}
                </Button>
                
                {testResults && (
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <span>数据库连接</span>
                        {testResults.databaseConnected ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <Badge variant={testResults.databaseConnected ? 'default' : 'destructive'}>
                        {testResults.databaseConnected ? '成功' : '失败'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <span>用户存在</span>
                        {testResults.userExists ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <Badge variant={testResults.userExists ? 'default' : 'destructive'}>
                        {testResults.userExists ? '成功' : '失败'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        <span>邀请链接生成</span>
                        {testResults.inviteLinkGenerated ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <Badge variant={testResults.inviteLinkGenerated ? 'default' : 'destructive'}>
                        {testResults.inviteLinkGenerated ? '成功' : '失败'}
                      </Badge>
                    </div>
                    
                    <Alert variant={
                      testResults.databaseConnected && testResults.userExists && testResults.inviteLinkGenerated
                        ? 'default'
                        : 'destructive'
                    }>
                      <AlertDescription>
                        {testResults.databaseConnected && testResults.userExists && testResults.inviteLinkGenerated
                          ? '✅ 所有测试通过，邀请系统基本功能正常'
                          : '❌ 部分测试失败，请检查错误信息'
                        }
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 邀请链接 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  邀请链接
                </CardTitle>
                <CardDescription>
                  生成并复制您的邀请链接
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={generateInviteLink} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? '生成中...' : '生成邀请链接'}
                  </Button>
                  
                  {inviteLink && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input 
                          value={inviteLink} 
                          readOnly 
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          onClick={copyInviteLink}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        分享此链接给朋友，当他们注册时您将获得奖励
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 手动测试 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  手动测试邀请
                </CardTitle>
                <CardDescription>
                  测试邀请特定钱包地址
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-wallet">被邀请钱包地址</Label>
                    <Input
                      id="manual-wallet"
                      placeholder="0x..."
                      value={manualWallet}
                      onChange={(e) => setManualWallet(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      输入一个尚未注册的钱包地址进行测试
                    </p>
                  </div>
                  
                  <Button 
                    onClick={testManualInvite} 
                    disabled={loading || !manualWallet}
                    className="w-full"
                  >
                    {loading ? '测试中...' : '测试邀请'}
                  </Button>
                  
                  {manualResult && (
                    <Alert variant={manualResult.success ? 'default' : 'destructive'}>
                      <AlertDescription>
                        {manualResult.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
} 
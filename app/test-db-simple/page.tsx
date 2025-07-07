'use client'

import { useState, useEffect } from 'react'
import { SimpleDatabase } from '@/lib/database-simple'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Database, RefreshCw, Search, UserPlus, Copy } from 'lucide-react'

export default function TestDbSimplePage() {
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<{
    connectionStatus: boolean
    message: string
  } | null>(null)
  const [walletAddress, setWalletAddress] = useState('')
  const [userData, setUserData] = useState<any>(null)
  const [createResult, setCreateResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [inviteLink, setInviteLink] = useState('')
  const [inviteResult, setInviteResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [inviterWallet, setInviterWallet] = useState('')
  const [inviteeWallet, setInviteeWallet] = useState('')

  // 测试数据库连接
  const testConnection = async () => {
    setLoading(true)
    setTestResults(null)

    try {
      const success = await SimpleDatabase.testConnection()
      
      setTestResults({
        connectionStatus: success,
        message: success ? '数据库连接成功' : '数据库连接失败'
      })
    } catch (error: any) {
      setTestResults({
        connectionStatus: false,
        message: `连接测试异常: ${error.message || '未知错误'}`
      })
    } finally {
      setLoading(false)
    }
  }

  // 查询用户
  const searchUser = async () => {
    if (!walletAddress) return

    setLoading(true)
    setUserData(null)

    try {
      const user = await SimpleDatabase.getUser(walletAddress)
      setUserData(user)
      
      if (user) {
        const link = await SimpleDatabase.getInviteLink(walletAddress)
        setInviteLink(link)
      }
    } catch (error) {
      console.error('查询用户失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 创建用户
  const createUser = async () => {
    if (!walletAddress) return

    setLoading(true)
    setCreateResult(null)

    try {
      const user = await SimpleDatabase.createUser(walletAddress)
      
      if (user) {
        setCreateResult({
          success: true,
          message: `成功创建用户: ${user.id}`
        })
        setUserData(user)
        
        const link = await SimpleDatabase.getInviteLink(walletAddress)
        setInviteLink(link)
      } else {
        setCreateResult({
          success: false,
          message: '创建用户失败'
        })
      }
    } catch (error: any) {
      setCreateResult({
        success: false,
        message: `创建用户异常: ${error.message || '未知错误'}`
      })
    } finally {
      setLoading(false)
    }
  }
  
  // 处理邀请
  const processInvite = async () => {
    if (!inviterWallet || !inviteeWallet) return
    
    setLoading(true)
    setInviteResult(null)
    
    try {
      const success = await SimpleDatabase.processInvite(inviteeWallet, inviterWallet)
      
      setInviteResult({
        success,
        message: success ? '邀请处理成功' : '邀请处理失败'
      })
    } catch (error: any) {
      setInviteResult({
        success: false,
        message: `处理邀请异常: ${error.message || '未知错误'}`
      })
    } finally {
      setLoading(false)
    }
  }
  
  // 复制邀请链接
  const copyInviteLink = () => {
    if (!inviteLink) return
    
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        alert('邀请链接已复制到剪贴板')
      })
      .catch(err => {
        console.error('复制失败:', err)
      })
  }

  // 测试连接
  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">简化数据库测试</h1>
      
      {/* 连接测试 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            数据库连接测试
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testConnection} 
            disabled={loading}
            className="w-full mb-4"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                测试中...
              </>
            ) : '测试数据库连接'}
          </Button>
          
          {testResults && (
            <Alert variant={testResults.connectionStatus ? 'default' : 'destructive'}>
              <div className="flex items-center gap-2">
                {testResults.connectionStatus ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {testResults.message}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* 用户查询 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            用户查询
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="wallet-address" className="mb-2 block">
                  钱包地址
                </Label>
                <Input
                  id="wallet-address"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={searchUser} 
                  disabled={loading || !walletAddress}
                >
                  {loading ? '查询中...' : '查询'}
                </Button>
              </div>
            </div>
            
            {userData === null ? (
              <div className="text-center py-4 text-muted-foreground">
                {loading ? '查询中...' : '未查询到用户'}
              </div>
            ) : (
              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">用户信息</h3>
                  <Badge>ID: {userData.id}</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div><strong>钱包地址:</strong> {userData.wallet_address}</div>
                  <div><strong>用户名:</strong> {userData.username || '未设置'}</div>
                  <div><strong>代币余额:</strong> {userData.angel_balance || 0} ANGEL</div>
                  <div><strong>邀请数量:</strong> {userData.invites_count || 0}</div>
                  <div><strong>创建时间:</strong> {userData.created_at ? new Date(userData.created_at).toLocaleString() : '未知'}</div>
                </div>
                
                {inviteLink && (
                  <div className="mt-4">
                    <Label className="mb-1 block">邀请链接</Label>
                    <div className="flex gap-2">
                      <Input value={inviteLink} readOnly />
                      <Button size="icon" onClick={copyInviteLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* 创建用户 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            创建用户
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={createUser} 
              disabled={loading || !walletAddress}
              className="w-full"
            >
              {loading ? '创建中...' : '创建用户'}
            </Button>
            
            {createResult && (
              <Alert variant={createResult.success ? 'default' : 'destructive'}>
                <div className="flex items-center gap-2">
                  {createResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {createResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}
            
            <div className="text-xs text-muted-foreground">
              注意: 创建用户将使用上方输入框中的钱包地址
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 处理邀请 */}
      <Card>
        <CardHeader>
          <CardTitle>处理邀请</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inviter-wallet" className="mb-1 block">
                邀请人钱包地址
              </Label>
              <Input
                id="inviter-wallet"
                placeholder="0x..."
                value={inviterWallet}
                onChange={(e) => setInviterWallet(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="invitee-wallet" className="mb-1 block">
                被邀请人钱包地址
              </Label>
              <Input
                id="invitee-wallet"
                placeholder="0x..."
                value={inviteeWallet}
                onChange={(e) => setInviteeWallet(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={processInvite} 
              disabled={loading || !inviterWallet || !inviteeWallet}
              className="w-full"
            >
              {loading ? '处理中...' : '处理邀请'}
            </Button>
            
            {inviteResult && (
              <Alert variant={inviteResult.success ? 'default' : 'destructive'}>
                <div className="flex items-center gap-2">
                  {inviteResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {inviteResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
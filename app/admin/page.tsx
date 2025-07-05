'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  UserPlus, 
  Coins, 
  TrendingUp, 
  Shield, 
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import { DatabaseService, User, Invitation } from '@/lib/database'
import { PageHeader } from '@/components/page-header'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalInvitations: number
  totalTokensDistributed: number
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalInvitations: 0,
    totalTokensDistributed: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [tokenAmount, setTokenAmount] = useState('')
  const [message, setMessage] = useState('')

  // 检查认证状态
  useEffect(() => {
    const checkAuth = () => {
      const adminSession = localStorage.getItem('admin_session')
      const loginTime = localStorage.getItem('admin_login_time')
      const adminUser = localStorage.getItem('admin_user')
      
      if (adminSession && loginTime && adminUser) {
        const now = Date.now()
        const loginTimestamp = parseInt(loginTime)
        const sessionDuration = 4 * 60 * 60 * 1000 // 4小时会话
        
        if (now - loginTimestamp < sessionDuration) {
          // 验证token格式
          try {
            const decodedToken = atob(adminSession)
            if (decodedToken.startsWith(adminUser + ':')) {
              setIsAuthenticated(true)
            } else {
              throw new Error('Invalid token format')
            }
          } catch (error) {
            console.warn('管理员token验证失败:', error)
            clearAdminSession()
          }
        } else {
          // 会话过期
          console.log('管理员会话已过期')
          clearAdminSession()
        }
      } else {
        router.push('/admin/login')
      }
    }
    
    const clearAdminSession = () => {
      localStorage.removeItem('admin_session')
      localStorage.removeItem('admin_login_time')
      localStorage.removeItem('admin_user')
      router.push('/admin/login')
    }
    
    checkAuth()
  }, [router])

  // 加载数据
  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const loadData = async () => {
    setLoading(true)
    try {
      // 模拟数据加载
      const mockUsers: User[] = [
        {
          id: '1',
          wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
          email: 'user1@example.com',
          username: 'Angel用户1',
          angel_balance: 1500,
          referral_code: 'ANGEL001',
          referred_by: '',
          total_referrals: 5,
          total_earned: 2500,
          is_active: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T15:30:00Z'
        },
        {
          id: '2',
          wallet_address: '0xabcdef1234567890abcdef1234567890abcdef12',
          email: 'user2@example.com',
          username: 'Angel用户2',
          angel_balance: 800,
          referral_code: 'ANGEL002',
          referred_by: 'ANGEL001',
          total_referrals: 2,
          total_earned: 1200,
          is_active: true,
          created_at: '2024-01-16T11:00:00Z',
          updated_at: '2024-01-21T16:30:00Z'
        },
        {
          id: '3',
          wallet_address: '0x9876543210fedcba9876543210fedcba98765432',
          email: 'user3@example.com',
          username: 'Angel用户3',
          angel_balance: 300,
          referral_code: 'ANGEL003',
          referred_by: 'ANGEL001',
          total_referrals: 0,
          total_earned: 300,
          is_active: false,
          created_at: '2024-01-17T12:00:00Z',
          updated_at: '2024-01-22T17:30:00Z'
        }
      ]

      const mockInvitations: Invitation[] = [
        {
          id: '1',
          inviter_id: '1',
          invitee_id: '2',
          invitee_wallet_address: '0xabcdef1234567890abcdef1234567890abcdef12',
          referral_code: 'ANGEL001',
          invite_link: 'https://angel.app?ref=ANGEL001',
          status: 'accepted',
          level: 1,
          reward_amount: 500,
          reward_claimed: true,
          created_at: '2024-01-16T10:00:00Z',
          accepted_at: '2024-01-16T11:00:00Z',
          expires_at: '2024-02-16T10:00:00Z'
        },
        {
          id: '2',
          inviter_id: '1',
          invitee_id: '3',
          invitee_wallet_address: '0x9876543210fedcba9876543210fedcba98765432',
          referral_code: 'ANGEL001',
          invite_link: 'https://angel.app?ref=ANGEL001',
          status: 'accepted',
          level: 1,
          reward_amount: 500,
          reward_claimed: true,
          created_at: '2024-01-17T10:00:00Z',
          accepted_at: '2024-01-17T12:00:00Z',
          expires_at: '2024-02-17T10:00:00Z'
        }
      ]

      setUsers(mockUsers)
      setInvitations(mockInvitations)
      
      // 计算统计数据
      const totalUsers = mockUsers.length
      const activeUsers = mockUsers.filter(user => user.is_active).length
      const totalInvitations = mockInvitations.length
      const totalTokensDistributed = mockUsers.reduce((sum, user) => sum + user.angel_balance, 0)

      setStats({
        totalUsers,
        activeUsers,
        totalInvitations,
        totalTokensDistributed
      })
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 添加代币
  const handleAddTokens = async () => {
    if (!selectedUser || !tokenAmount) {
      setMessage('请选择用户并输入代币数量')
      return
    }

    try {
      const amount = parseFloat(tokenAmount)
      if (isNaN(amount) || amount <= 0) {
        setMessage('请输入有效的代币数量')
        return
      }

      // 更新用户余额
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, angel_balance: user.angel_balance + amount }
          : user
      )
      setUsers(updatedUsers)
      setSelectedUser(null)
      setTokenAmount('')
      setMessage(`成功为用户 ${selectedUser.username} 添加 ${amount} ANGEL 代币`)
    } catch (error) {
      setMessage('添加代币失败')
    }
  }

  // 登出功能
  const handleLogout = () => {
    localStorage.removeItem('admin_session')
    localStorage.removeItem('admin_login_time')
    localStorage.removeItem('admin_user')
    console.log('管理员已登出')
    router.push('/admin/login')
  }

  // 过滤用户
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 如果未认证，显示加载页面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">验证管理员权限...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="后台管理" 
        emoji="🛠️" 
        showBalance={false}
      />
      
      {/* 管理员工具栏 */}
      <div className="fixed top-4 right-4 z-50">
        <Button 
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="bg-white shadow-md"
        >
          登出
        </Button>
      </div>
      
      <div className="container mx-auto px-4 pb-4 max-w-7xl pt-20">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                活跃用户: {stats.activeUsers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">邀请总数</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvitations}</div>
              <p className="text-xs text-muted-foreground">
                成功邀请数量
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">代币分发</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTokensDistributed}</div>
              <p className="text-xs text-muted-foreground">
                ANGEL 代币总量
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">系统状态</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">正常</div>
              <p className="text-xs text-muted-foreground">
                所有服务运行正常
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 管理面板 */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="invitations">邀请关系</TabsTrigger>
            <TabsTrigger value="tokens">代币管理</TabsTrigger>
          </TabsList>

          {/* 用户管理 */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>管理所有注册用户</CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索用户..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={loadData} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    刷新
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">加载中...</div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{user.username || '未设置用户名'}</h4>
                            <Badge variant={user.is_active ? "default" : "secondary"}>
                              {user.is_active ? '活跃' : '非活跃'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {user.wallet_address.slice(0, 10)}...{user.wallet_address.slice(-8)}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>余额: {user.angel_balance} ANGEL</span>
                            <span>邀请: {user.total_referrals} 人</span>
                            <span>收益: {user.total_earned} ANGEL</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            编辑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 邀请关系 */}
          <TabsContent value="invitations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>邀请关系</CardTitle>
                <CardDescription>查看所有邀请关系和奖励分发</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitations.map((invitation) => {
                    const inviter = users.find(u => u.id === invitation.inviter_id)
                    const invitee = users.find(u => u.id === invitation.invitee_id)
                    
                    return (
                      <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{inviter?.username || '未知用户'}</span>
                            <span className="text-muted-foreground">邀请了</span>
                            <span className="font-medium">{invitee?.username || '未知用户'}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            推荐码: {invitation.referral_code}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>状态: {invitation.status}</span>
                            <span>奖励: {invitation.reward_amount} ANGEL</span>
                            <span>等级: L{invitation.level}</span>
                            <span>创建时间: {new Date(invitation.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge variant={invitation.status === 'accepted' ? "default" : "secondary"}>
                          {invitation.status === 'accepted' ? '已接受' : '待处理'}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 代币管理 */}
          <TabsContent value="tokens" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>代币管理</CardTitle>
                <CardDescription>为用户添加或扣除代币</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-select">选择用户</Label>
                    <select
                      id="user-select"
                      className="w-full p-2 border rounded-md"
                      value={selectedUser?.id || ''}
                      onChange={(e) => {
                        const user = users.find(u => u.id === e.target.value)
                        setSelectedUser(user || null)
                      }}
                    >
                      <option value="">请选择用户</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.username || user.wallet_address.slice(0, 10) + '...'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="token-amount">代币数量</Label>
                    <Input
                      id="token-amount"
                      type="number"
                      placeholder="输入代币数量"
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                    />
                  </div>
                </div>

                {selectedUser && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">选中用户信息</h4>
                    <div className="space-y-1 text-sm">
                      <p>用户名: {selectedUser.username || '未设置'}</p>
                      <p>钱包地址: {selectedUser.wallet_address}</p>
                      <p>当前余额: {selectedUser.angel_balance} ANGEL</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleAddTokens} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    添加代币
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Trash2 className="h-4 w-4 mr-2" />
                    扣除代币
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
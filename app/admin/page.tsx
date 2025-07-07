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
  RefreshCw,
  Map,
  Image,
  Award,
  BarChart,
  Settings,
  FileText,
  Database
} from 'lucide-react'
import { DatabaseService, User, Invitation } from '@/lib/database'
import { PageHeader } from '@/components/page-header'
import { AdminService, NFT, Land } from './admin-functions'

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalInvitations: number;
  totalTokensDistributed: number;
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalInvitations: 0,
    totalTokensDistributed: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [tokenAmount, setTokenAmount] = useState('')
  const [message, setMessage] = useState('')
  const [nfts, setNfts] = useState<NFT[]>([])
  const [lands, setLands] = useState<Land[]>([])
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null)
  const [selectedLand, setSelectedLand] = useState<Land | null>(null)
  const [dashboardStats, setDashboardStats] = useState({
    usersCount: 0,
    activeUsers: 0,
    invitationsCount: 0,
    totalTokens: 0,
    nftsCount: 0,
    landsCount: 0
  })

  // 检查认证状态
  useEffect(() => {
    const checkAuth = () => {
      // 简单认证检查，实际项目中应使用更安全的方式
      const isAdmin = localStorage.getItem('admin_user') !== null
      setIsAuthenticated(isAdmin)
      setLoading(false)
    }

    checkAuth()
  }, [])

  // 加载数据
  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const loadData = async () => {
    setLoading(true)
    try {
      // 使用真实的数据库服务
      const allUsers = await DatabaseService.getAllUsers()
      const allInvitations = await DatabaseService.getAllInvitations()
      const allNfts = await AdminService.getAllNFTs()
      const allLands = await AdminService.getAllLands()
      const stats = await AdminService.getDashboardStats()
      
      setUsers(allUsers)
      setInvitations(allInvitations)
      setNfts(allNfts)
      setLands(allLands)
      setDashboardStats(stats)
      
      // 计算统计数据
      const totalUsers = allUsers.length
      const activeUsers = allUsers.filter(user => user.is_active === true).length
      const totalInvitations = allInvitations.length
      const totalTokensDistributed = allUsers.reduce((sum, user) => sum + (user.angel_balance || 0), 0)

      setStats({
        totalUsers,
        activeUsers,
        totalInvitations,
        totalTokensDistributed
      })
    } catch (error) {
      console.error('加载数据失败:', error)
      // 如果数据库连接失败，显示空数据
      setUsers([])
      setInvitations([])
      setNfts([])
      setLands([])
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalInvitations: 0,
        totalTokensDistributed: 0
      })
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

      // 调用管理员服务添加代币
      const success = await AdminService.addTokensToUser(selectedUser.id, amount)
      
      if (success) {
        // 更新用户列表
        const updatedUsers = await DatabaseService.getAllUsers()
        setUsers(updatedUsers)
        
        setSelectedUser(null)
        setTokenAmount('')
        setMessage(`成功为用户 ${selectedUser.username || selectedUser.wallet_address} 添加 ${amount} ANGEL 代币`)
        
        // 记录管理员操作
        const adminId = localStorage.getItem('admin_user')
        if (adminId) {
          await AdminService.logAdminAction(adminId, 'add_tokens', {
            userId: selectedUser.id,
            amount,
            timestamp: new Date().toISOString()
          })
        }
      } else {
        setMessage('添加代币失败，请重试')
      }
    } catch (error) {
      setMessage('添加代币失败')
      console.error(error)
    }
  }

  // 扣除代币
  const handleDeductTokens = async () => {
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

      if ((selectedUser.angel_balance || 0) < amount) {
        setMessage('用户余额不足')
        return
      }

      // 调用管理员服务扣除代币
      const success = await AdminService.deductTokensFromUser(selectedUser.id, amount)
      
      if (success) {
        // 更新用户列表
        const updatedUsers = await DatabaseService.getAllUsers()
        setUsers(updatedUsers)
        
        setSelectedUser(null)
        setTokenAmount('')
        setMessage(`成功从用户 ${selectedUser.username || selectedUser.wallet_address} 扣除 ${amount} ANGEL 代币`)
        
        // 记录管理员操作
        const adminId = localStorage.getItem('admin_user')
        if (adminId) {
          await AdminService.logAdminAction(adminId, 'deduct_tokens', {
            userId: selectedUser.id,
            amount,
            timestamp: new Date().toISOString()
          })
        }
      } else {
        setMessage('扣除代币失败，请重试')
      }
    } catch (error) {
      setMessage('扣除代币失败')
      console.error(error)
    }
  }

  // 创建NFT
  const handleCreateNFT = async (nftData: Partial<NFT>) => {
    try {
      const newNFT = await AdminService.createNFT(nftData)
      if (newNFT) {
        const updatedNfts = await AdminService.getAllNFTs()
        setNfts(updatedNfts)
        setMessage('NFT创建成功')
        
        // 记录管理员操作
        const adminId = localStorage.getItem('admin_user')
        if (adminId) {
          await AdminService.logAdminAction(adminId, 'create_nft', {
            nftId: newNFT.id,
            timestamp: new Date().toISOString()
          })
        }
      } else {
        setMessage('NFT创建失败')
      }
    } catch (error) {
      console.error('创建NFT失败:', error)
      setMessage('创建NFT失败')
    }
  }

  // 转移NFT
  const handleTransferNFT = async (nftId: string, toUserId: string) => {
    try {
      const nft = nfts.find(n => n.id === nftId)
      if (!nft || !nft.owner_id) {
        setMessage('无效的NFT或所有者')
        return
      }
      
      const success = await AdminService.transferNFT(nftId, nft.owner_id, toUserId)
      if (success) {
        const updatedNfts = await AdminService.getAllNFTs()
        setNfts(updatedNfts)
        setMessage('NFT转移成功')
        
        // 记录管理员操作
        const adminId = localStorage.getItem('admin_user')
        if (adminId) {
          await AdminService.logAdminAction(adminId, 'transfer_nft', {
            nftId,
            fromUserId: nft.owner_id,
            toUserId,
            timestamp: new Date().toISOString()
          })
        }
      } else {
        setMessage('NFT转移失败')
      }
    } catch (error) {
      console.error('转移NFT失败:', error)
      setMessage('转移NFT失败')
    }
  }

  // 创建土地
  const handleCreateLand = async (landData: Partial<Land>) => {
    try {
      const newLand = await AdminService.createLand(landData)
      if (newLand) {
        const updatedLands = await AdminService.getAllLands()
        setLands(updatedLands)
        setMessage('土地创建成功')
        
        // 记录管理员操作
        const adminId = localStorage.getItem('admin_user')
        if (adminId) {
          await AdminService.logAdminAction(adminId, 'create_land', {
            landId: newLand.id,
            timestamp: new Date().toISOString()
          })
        }
      } else {
        setMessage('土地创建失败')
      }
    } catch (error) {
      console.error('创建土地失败:', error)
      setMessage('创建土地失败')
    }
  }

  // 转移土地
  const handleTransferLand = async (landId: string, toUserId: string) => {
    try {
      const success = await AdminService.transferLand(landId, toUserId)
      if (success) {
        const updatedLands = await AdminService.getAllLands()
        setLands(updatedLands)
        setMessage('土地转移成功')
        
        // 记录管理员操作
        const adminId = localStorage.getItem('admin_user')
        if (adminId) {
          await AdminService.logAdminAction(adminId, 'transfer_land', {
            landId,
            toUserId,
            timestamp: new Date().toISOString()
          })
        }
      } else {
        setMessage('土地转移失败')
      }
    } catch (error) {
      console.error('转移土地失败:', error)
      setMessage('转移土地失败')
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
              <div className="text-2xl font-bold">{dashboardStats.usersCount}</div>
              <p className="text-xs text-muted-foreground">
                活跃用户: {dashboardStats.activeUsers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">邀请总数</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.invitationsCount}</div>
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
              <div className="text-2xl font-bold">{dashboardStats.totalTokens.toLocaleString()}</div>
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="invitations">邀请关系</TabsTrigger>
            <TabsTrigger value="tokens">代币管理</TabsTrigger>
            <TabsTrigger value="nfts">NFT管理</TabsTrigger>
            <TabsTrigger value="lands">土地管理</TabsTrigger>
            <TabsTrigger value="system">系统设置</TabsTrigger>
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
                            <span>邀请: {user.invites_count || 0} 人</span>
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
                            邀请人钱包: {inviter?.wallet_address?.slice(0, 6)}...{inviter?.wallet_address?.slice(-4)}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>状态: {invitation.status}</span>
                            <span>奖励: {invitation.reward_amount} ANGEL</span>
                            <span>创建时间: {invitation.created_at ? new Date(invitation.created_at).toLocaleDateString() : 'N/A'}</span>
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
                  <Button onClick={handleDeductTokens} className="flex-1">
                    <Trash2 className="h-4 w-4 mr-2" />
                    扣除代币
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NFT管理 */}
          <TabsContent value="nfts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>NFT管理</CardTitle>
                <CardDescription>管理系统中的所有NFT</CardDescription>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => setSelectedNft({ 
                    id: '', 
                    name: '', 
                    rarity: '普通', 
                    rarity_score: 1, 
                    attributes: {}, 
                    is_for_sale: false, 
                    created_at: '', 
                    updated_at: '' 
                  })}>
                    <Plus className="h-4 w-4 mr-2" />
                    创建NFT
                  </Button>
                  <Button onClick={loadData} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    刷新
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">加载中...</div>
                ) : (
                  <div className="space-y-4">
                    {nfts.map((nft) => (
                      <div key={nft.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {nft.image_url && (
                            <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                              <img 
                                src={nft.image_url} 
                                alt={nft.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{nft.name}</h4>
                              <Badge variant="outline">{nft.rarity}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {nft.description || '无描述'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>所有者: {users.find(u => u.id === nft.owner_id)?.username || '无'}</span>
                              <span>价格: {nft.price || 0} ANGEL</span>
                              <span>出售状态: {nft.is_for_sale ? '在售' : '未出售'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedNft(nft)}
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 土地管理 */}
          <TabsContent value="lands" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>土地管理</CardTitle>
                <CardDescription>管理系统中的所有虚拟土地</CardDescription>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => setSelectedLand({ 
                    id: '', 
                    name: '', 
                    type: '', 
                    rarity: '普通', 
                    rarity_score: 1, 
                    attributes: {}, 
                    base_price: 100, 
                    base_income: 10, 
                    level: 1, 
                    experience: 0, 
                    is_for_sale: false, 
                    created_at: '', 
                    updated_at: '' 
                  })}>
                    <Plus className="h-4 w-4 mr-2" />
                    创建土地
                  </Button>
                  <Button onClick={loadData} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    刷新
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">加载中...</div>
                ) : (
                  <div className="space-y-4">
                    {lands.map((land) => (
                      <div key={land.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {land.image_url && (
                            <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                              <img 
                                src={land.image_url} 
                                alt={land.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{land.name}</h4>
                              <Badge variant="outline">{land.rarity}</Badge>
                              <Badge variant="secondary">等级 {land.level}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {land.description || '无描述'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>类型: {land.type}</span>
                              <span>收益: {land.base_income} ANGEL/天</span>
                              <span>所有者: {users.find(u => u.id === land.owner_id)?.username || '无'}</span>
                              <span>坐标: {land.x_coordinate || '?'},{land.y_coordinate || '?'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLand(land)}
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 系统设置 */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>系统设置</CardTitle>
                <CardDescription>管理系统配置和执行维护任务</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">数据库维护</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full">
                        <Database className="h-4 w-4 mr-2" />
                        处理土地收益
                      </Button>
                      <Button className="w-full">
                        <Database className="h-4 w-4 mr-2" />
                        处理质押奖励
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        数据库诊断
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">系统报告</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        导出用户报告
                      </Button>
                      <Button className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        导出邀请报告
                      </Button>
                      <Button className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        导出交易报告
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">管理员日志</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 overflow-y-auto border rounded-md p-4 bg-gray-50">
                      <p className="text-sm text-muted-foreground">管理员日志将在这里显示...</p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
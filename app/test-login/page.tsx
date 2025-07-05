"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { MemeBackground } from "@/components/meme-background"
import { WalletConnect } from "@/components/wallet-connect"
import { DatabaseService, type User } from "@/lib/database"
import { Web3Service } from "@/lib/web3"
import { CheckCircle, XCircle, AlertCircle, Database, Wallet, Users, RefreshCw } from "lucide-react"

export default function TestLoginPage() {
  const [user, setUser] = useState<User | null>(null)
  const [testResults, setTestResults] = useState<{
    webInstalled: boolean
    databaseConnection: boolean
    userCreation: boolean
    userRetrieval: boolean
    referralSystem: boolean
  }>({
    webInstalled: false,
    databaseConnection: false,
    userCreation: false,
    userRetrieval: false,
    referralSystem: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    runInitialTests()
  }, [])

  const runInitialTests = async () => {
    setIsLoading(true)
    addLog("开始系统测试...")

    // 测试1: 检查钱包安装
    const web3Service = Web3Service.getInstance()
    const walletInstalled = web3Service.isWalletInstalled()
    addLog(`钱包检测: ${walletInstalled ? '✅ 已安装' : '❌ 未安装'}`)

    // 测试2: 数据库连接测试
    let dbConnectionOk = false
    try {
      // 尝试创建一个测试用户
      const testUser = await DatabaseService.createUser({
        wallet_address: '0x0000000000000000000000000000000000000000',
        referral_code: 'TEST123',
        total_referrals: 0,
        is_active: true,
      })
      
      if (testUser) {
        dbConnectionOk = true
        addLog("数据库连接: ✅ 正常")
        
        // 清理测试数据
        // 注意：在实际生产环境中，你可能需要实现删除用户的方法
        addLog("测试用户创建成功，ID: " + testUser.id)
      } else {
        addLog("数据库连接: ❌ 创建用户失败")
      }
    } catch (error) {
      addLog("数据库连接: ❌ 连接失败 - " + (error as Error).message)
    }

    // 测试3: 用户检索测试
    let userRetrievalOk = false
    try {
      const retrievedUser = await DatabaseService.getUserByWalletAddress('0x0000000000000000000000000000000000000000')
      if (retrievedUser) {
        userRetrievalOk = true
        addLog("用户检索: ✅ 正常")
      } else {
        addLog("用户检索: ❌ 未找到用户")
      }
    } catch (error) {
      addLog("用户检索: ❌ 检索失败 - " + (error as Error).message)
    }

    // 测试4: 推荐系统测试
    let referralSystemOk = false
    try {
      const referralUser = await DatabaseService.getUserByReferralCode('TEST123')
      if (referralUser) {
        referralSystemOk = true
        addLog("推荐系统: ✅ 正常")
      } else {
        addLog("推荐系统: ❌ 推荐码查询失败")
      }
    } catch (error) {
      addLog("推荐系统: ❌ 测试失败 - " + (error as Error).message)
    }

    setTestResults({
      webInstalled: walletInstalled,
      databaseConnection: dbConnectionOk,
      userCreation: dbConnectionOk,
      userRetrieval: userRetrievalOk,
      referralSystem: referralSystemOk
    })

    setIsLoading(false)
    addLog("系统测试完成")
  }

  const handleUserChange = (newUser: User | null) => {
    setUser(newUser)
    if (newUser) {
      addLog(`用户登录成功: ${newUser.wallet_address}`)
      addLog(`用户ID: ${newUser.id}`)
      addLog(`推荐码: ${newUser.referral_code}`)
      addLog(`推荐人数: ${newUser.total_referrals}`)
    } else {
      addLog("用户已登出")
    }
  }

  const TestResultBadge = ({ result, label }: { result: boolean; label: string }) => (
    <Badge className={`${result ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
      {result ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
      {label}
    </Badge>
  )

  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader title="登录系统测试" emoji="🧪" />

      <div className="container mx-auto px-4 pb-4 max-w-md">
        <div className="space-y-6">
          
          {/* 钱包连接测试 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-angel-primary" />
                钱包连接测试
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <WalletConnect onUserChange={handleUserChange} />
                </div>
                
                {user && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <h4 className="font-bold text-green-400 mb-2">登录成功！</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">钱包地址:</span> {user.wallet_address}</p>
                      <p><span className="text-muted-foreground">用户ID:</span> {user.id}</p>
                      <p><span className="text-muted-foreground">推荐码:</span> {user.referral_code}</p>
                      <p><span className="text-muted-foreground">推荐人数:</span> {user.total_referrals}</p>
                      <p><span className="text-muted-foreground">创建时间:</span> {new Date(user.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 系统测试结果 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-angel-secondary" />
                系统测试结果
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={runInitialTests}
                  disabled={isLoading}
                  className="ml-auto w-8 h-8"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <TestResultBadge result={testResults.webInstalled} label="钱包检测" />
                <TestResultBadge result={testResults.databaseConnection} label="数据库连接" />
                <TestResultBadge result={testResults.userCreation} label="用户创建" />
                <TestResultBadge result={testResults.userRetrieval} label="用户检索" />
                <TestResultBadge result={testResults.referralSystem} label="推荐系统" />
              </div>
            </CardContent>
          </Card>

          {/* 测试日志 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-angel-accent" />
                测试日志
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/20 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="space-y-1 text-xs font-mono">
                  {logs.map((log, index) => (
                    <div key={index} className="text-muted-foreground">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 数据库状态 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-angel-gold" />
                数据库状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-secondary/30 rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground mb-1">配置状态</p>
                  <p className="font-bold text-foreground">
                    {process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co' ? '模拟模式' : '生产模式'}
                  </p>
                </div>
                <div className="text-center p-3 bg-secondary/30 rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground mb-1">环境</p>
                  <p className="font-bold text-foreground">
                    {process.env.NODE_ENV || 'development'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MemeBackground>
  )
} 
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { MemeBackground } from "@/components/meme-background"
import { AlertCircle, CheckCircle, Search } from "lucide-react"

export default function TestInviteDiagnosePage() {
  const [walletAddress, setWalletAddress] = useState("")
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostic = async () => {
    if (!walletAddress) {
      setError("请输入钱包地址")
      return
    }

    setIsLoading(true)
    setError(null)
    setDiagnosticResult(null)

    try {
      const response = await fetch(`/api/invites/diagnose?wallet=${walletAddress}`)
      const data = await response.json()

      if (!data.success) {
        setError(data.error || "诊断失败")
        return
      }

      setDiagnosticResult(data.data)
    } catch (error) {
      console.error("诊断请求失败:", error)
      setError("诊断请求失败，请稍后再试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MemeBackground variant="premium" overlay={true}>
      <PageHeader title="邀请系统诊断" emoji="🔍" />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>诊断工具</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="输入钱包地址"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={runDiagnostic} 
                disabled={isLoading}
                className="bg-angel-primary hover:bg-angel-primary/90"
              >
                {isLoading ? "诊断中..." : "开始诊断"}
                {!isLoading && <Search className="ml-2 h-4 w-4" />}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md flex items-center gap-2 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {diagnosticResult && (
          <div className="space-y-6">
            {/* 用户信息 */}
            <Card>
              <CardHeader>
                <CardTitle>用户信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">钱包地址</p>
                    <p className="font-mono text-sm break-all">{diagnosticResult.user.wallet_address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">用户名</p>
                    <p>{diagnosticResult.user.username || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">天使代币余额</p>
                    <p className="font-bold text-angel-primary">{diagnosticResult.user.angel_balance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">累计收益</p>
                    <p className="font-bold text-angel-primary">{diagnosticResult.user.total_earned}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">邀请人数</p>
                    <p>{diagnosticResult.user.invites_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">注册时间</p>
                    <p>{new Date(diagnosticResult.user.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 邀请人信息 */}
            <Card>
              <CardHeader>
                <CardTitle>邀请关系</CardTitle>
              </CardHeader>
              <CardContent>
                {diagnosticResult.inviter ? (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">邀请人</h3>
                    <div className="bg-green-500/10 p-3 rounded-md border border-green-500/30">
                      <p className="text-sm">
                        <span className="text-muted-foreground">用户名:</span> {diagnosticResult.inviter.username}
                      </p>
                      <p className="text-sm font-mono break-all">
                        <span className="text-muted-foreground">钱包地址:</span> {diagnosticResult.inviter.wallet_address}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">邀请人</h3>
                    <p className="text-muted-foreground">无邀请人（直接注册）</p>
                  </div>
                )}

                <h3 className="text-lg font-semibold mb-2">被邀请用户 ({diagnosticResult.invitedUsers.length})</h3>
                {diagnosticResult.invitedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {diagnosticResult.invitedUsers.map((user: any) => (
                      <div key={user.id} className="bg-blue-500/10 p-3 rounded-md border border-blue-500/30">
                        <p className="text-sm">
                          <span className="text-muted-foreground">用户名:</span> {user.username}
                        </p>
                        <p className="text-sm font-mono break-all">
                          <span className="text-muted-foreground">钱包地址:</span> {user.wallet_address}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">注册时间:</span> {new Date(user.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">暂无邀请用户</p>
                )}
              </CardContent>
            </Card>

            {/* 奖励记录 */}
            <Card>
              <CardHeader>
                <CardTitle>奖励记录</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">奖励统计</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-angel-primary/10 p-3 rounded-md border border-angel-primary/30 text-center">
                      <p className="text-sm text-muted-foreground">总奖励记录</p>
                      <p className="font-bold text-lg">{diagnosticResult.stats.totalRewards}</p>
                    </div>
                    <div className="bg-angel-primary/10 p-3 rounded-md border border-angel-primary/30 text-center">
                      <p className="text-sm text-muted-foreground">邀请奖励记录</p>
                      <p className="font-bold text-lg">{diagnosticResult.stats.totalReferralRewards}</p>
                    </div>
                    <div className="bg-angel-primary/10 p-3 rounded-md border border-angel-primary/30 text-center">
                      <p className="text-sm text-muted-foreground">邀请奖励总额</p>
                      <p className="font-bold text-lg">{diagnosticResult.stats.referralRewardAmount}</p>
                    </div>
                    <div className="bg-angel-primary/10 p-3 rounded-md border border-angel-primary/30 text-center">
                      <p className="text-sm text-muted-foreground">邀请总人数</p>
                      <p className="font-bold text-lg">{diagnosticResult.stats.totalInvitedUsers}</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2">奖励详情</h3>
                {diagnosticResult.rewards.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-1">类型</th>
                          <th className="text-left py-2 px-1">金额</th>
                          <th className="text-left py-2 px-1">描述</th>
                          <th className="text-left py-2 px-1">时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnosticResult.rewards.map((reward: any) => (
                          <tr key={reward.id} className="border-b">
                            <td className="py-2 px-1">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                reward.reward_type === 'welcome' 
                                  ? 'bg-green-500/20 text-green-700' 
                                  : reward.reward_type === 'referral_l1'
                                  ? 'bg-blue-500/20 text-blue-700'
                                  : reward.reward_type === 'referral_l2'
                                  ? 'bg-purple-500/20 text-purple-700'
                                  : 'bg-orange-500/20 text-orange-700'
                              }`}>
                                {reward.reward_type === 'welcome' && '注册奖励'}
                                {reward.reward_type === 'referral_l1' && '一级邀请'}
                                {reward.reward_type === 'referral_l2' && '二级邀请'}
                                {reward.reward_type === 'referral_l3' && '三级邀请'}
                              </span>
                            </td>
                            <td className="py-2 px-1 font-bold">{reward.amount}</td>
                            <td className="py-2 px-1">{reward.description}</td>
                            <td className="py-2 px-1">{new Date(reward.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">暂无奖励记录</p>
                )}
              </CardContent>
            </Card>

            {/* 问题诊断 */}
            {diagnosticResult.issues.length > 0 && (
              <Card className="border-red-500/50">
                <CardHeader className="bg-red-500/10">
                  <CardTitle className="text-red-500">发现问题</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {diagnosticResult.issues.map((issue: any, index: number) => (
                      <div key={index} className={`p-3 rounded-md border ${
                        issue.severity === 'high' 
                          ? 'bg-red-500/10 border-red-500/30' 
                          : issue.severity === 'medium'
                          ? 'bg-orange-500/10 border-orange-500/30'
                          : 'bg-yellow-500/10 border-yellow-500/30'
                      }`}>
                        <div className="flex items-center gap-2">
                          <AlertCircle className={`h-5 w-5 ${
                            issue.severity === 'high' 
                              ? 'text-red-500' 
                              : issue.severity === 'medium'
                              ? 'text-orange-500'
                              : 'text-yellow-500'
                          }`} />
                          <p className="font-semibold">{issue.type}</p>
                        </div>
                        <p className="mt-1 text-sm">{issue.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 一切正常 */}
            {diagnosticResult.issues.length === 0 && (
              <Card className="border-green-500/50">
                <CardHeader className="bg-green-500/10">
                  <CardTitle className="text-green-500 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    系统正常
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>邀请系统运行正常，未发现任何问题。</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </MemeBackground>
  )
} 
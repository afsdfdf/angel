"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { AngelLogo, AngelBrand } from "@/components/angel-logo"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function TestPage() {
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({})

  const runTest = (testName: string, testFn: () => boolean) => {
    try {
      const result = testFn()
      setTestResults(prev => ({ ...prev, [testName]: result }))
      return result
    } catch (error) {
      console.error(`Test ${testName} failed:`, error)
      setTestResults(prev => ({ ...prev, [testName]: false }))
      return false
    }
  }

  const runAllTests = () => {
    const tests = [
      {
        name: "React 渲染",
        test: () => typeof React !== 'undefined'
      },
      {
        name: "Tailwind CSS",
        test: () => {
          const testEl = document.createElement('div')
          testEl.className = 'bg-red-500'
          document.body.appendChild(testEl)
          const styles = window.getComputedStyle(testEl)
          const result = styles.backgroundColor === 'rgb(239, 68, 68)'
          document.body.removeChild(testEl)
          return result
        }
      },
      {
        name: "本地存储",
        test: () => {
          try {
            localStorage.setItem('test', 'value')
            const result = localStorage.getItem('test') === 'value'
            localStorage.removeItem('test')
            return result
          } catch {
            return false
          }
        }
      },
      {
        name: "窗口对象",
        test: () => typeof window !== 'undefined'
      },
      {
        name: "导航 API",
        test: () => typeof window !== 'undefined' && 'history' in window
      }
    ]

    tests.forEach(({ name, test }) => {
      runTest(name, test)
    })
  }

  const getTestIcon = (testName: string) => {
    if (!(testName in testResults)) {
      return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
    return testResults[testName] ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />
  }

  const getTestStatus = (testName: string) => {
    if (!(testName in testResults)) return "未测试"
    return testResults[testName] ? "通过" : "失败"
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="系统测试" 
        emoji="🧪"
        showBack={true}
      />
      
      <div className="container mx-auto px-4 pb-4 max-w-md">
        <div className="space-y-6">
          
          {/* 测试控制 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🔧</span>
                系统测试
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runAllTests}
                className="w-full bg-gradient-primary text-white hover:opacity-90"
              >
                运行所有测试
              </Button>
            </CardContent>
          </Card>

          {/* 组件测试 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🎨</span>
                组件测试
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Angel Logo</span>
                <AngelLogo size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span>Angel Brand</span>
                <AngelBrand size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span>渐变按钮</span>
                <Button className="bg-gradient-secondary text-white">
                  测试按钮
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 测试结果 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                测试结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "React 渲染",
                  "Tailwind CSS", 
                  "本地存储",
                  "窗口对象",
                  "导航 API"
                ].map((testName) => (
                  <div key={testName} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <span className="text-sm font-medium">{testName}</span>
                    <div className="flex items-center gap-2">
                      {getTestIcon(testName)}
                      <span className="text-sm">{getTestStatus(testName)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 样式测试 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🎨</span>
                样式测试
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-primary rounded-lg text-white text-center">
                  主渐变
                </div>
                <div className="p-4 bg-gradient-secondary rounded-lg text-white text-center">
                  次渐变
                </div>
                <div className="p-4 bg-gradient-gold rounded-lg text-white text-center">
                  金色渐变
                </div>
                <div className="p-4 glass-effect rounded-lg text-center">
                  玻璃效果
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 环境信息 */}
          <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">ℹ️</span>
                环境信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>用户代理:</span>
                  <span className="text-xs text-muted-foreground">
                    {typeof window !== 'undefined' ? 
                      window.navigator.userAgent.slice(0, 30) + '...' : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>屏幕尺寸:</span>
                  <span className="text-xs text-muted-foreground">
                    {typeof window !== 'undefined' ? 
                      `${window.innerWidth}x${window.innerHeight}` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>时间:</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
} 
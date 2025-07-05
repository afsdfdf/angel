'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Settings, ExternalLink } from 'lucide-react'

interface FallbackUIProps {
  title?: string
  description?: string
  showConfigHelp?: boolean
}

export function FallbackUI({ 
  title = "配置缺失", 
  description = "应用程序需要配置才能正常运行",
  showConfigHelp = true
}: FallbackUIProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              应用程序正在使用模拟模式运行。部分功能可能无法正常工作。
            </AlertDescription>
          </Alert>

          {showConfigHelp && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                需要配置的环境变量:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <code className="text-xs font-mono text-gray-700">
                    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
                  </code>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <code className="text-xs font-mono text-gray-700">
                    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
                  </code>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <code className="text-xs font-mono text-gray-700">
                    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id
                  </code>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
              variant="default"
            >
              刷新页面
            </Button>
            
            <Button 
              onClick={() => window.open('https://github.com/afsdfdf/angel', '_blank')}
              className="w-full"
              variant="outline"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              查看文档
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
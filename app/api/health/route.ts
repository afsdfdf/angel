import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient, checkDatabaseHealth } from '@/lib/database-hardcoded';

// 定义RPC状态类型
interface RpcStatus {
  success: boolean;
  message: string;
  result?: any;
}

export async function GET(request: NextRequest) {
  try {
    // 检查数据库健康状况
    const isHealthy = await checkDatabaseHealth();
    
    // 测试 RPC 函数
    let rpcStatus: RpcStatus = { success: false, message: '未测试' };
    try {
      const { data, error } = await supabaseClient.rpc('check_database_health');
      if (error) {
        rpcStatus = { success: false, message: `RPC 错误: ${error.message}` };
      } else {
        rpcStatus = { success: true, message: '成功', result: data };
      }
    } catch (error: any) {
      rpcStatus = { success: false, message: `RPC 异常: ${error.message || '未知错误'}` };
    }
    
    // 返回健康状态
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: isHealthy,
        rpc: rpcStatus
      },
      environment: process.env.NODE_ENV || 'unknown'
    });
  } catch (error: any) {
    console.error('健康检查失败:', error);
    return NextResponse.json({
      status: 'error',
      message: `健康检查失败: ${error.message || '未知错误'}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
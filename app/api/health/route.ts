import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient, checkDatabaseHealth } from '@/lib/database-hardcoded';
import { DatabaseServiceFixed } from '@/lib/database-fixed';

// 定义RPC状态类型
interface RpcStatus {
  success: boolean;
  message: string;
  result?: any;
}

/**
 * 数据库健康检查API
 */
export async function GET() {
  try {
    const startTime = Date.now();
    const isHealthy = await DatabaseServiceFixed.isHealthy();
    const responseTime = Date.now() - startTime;
    
    if (isHealthy) {
      return NextResponse.json({
        status: 'ok',
        message: '数据库连接正常',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      }, { status: 200 });
    } else {
      return NextResponse.json({
        status: 'error',
        message: '数据库连接失败',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: `发生错误: ${error.message}`,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// 原始的健康检查代码已被移除，因为Next.js不允许非标准HTTP方法名
// 如果需要保留原始功能，可以将其移动到单独的文件中 
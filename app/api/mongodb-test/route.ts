import { NextResponse } from 'next/server';
import { isHealthy } from '@/lib/database-mongodb';

/**
 * MongoDB测试API
 */
export async function GET() {
  try {
    const healthy = await isHealthy();
    
    return NextResponse.json({
      success: true,
      healthy: healthy,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MongoDB test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
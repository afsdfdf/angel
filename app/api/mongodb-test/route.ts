import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database-mongodb';

/**
 * MongoDB测试API
 */
export async function GET() {
  try {
    const isHealthy = await DatabaseService.isHealthy();
    
    if (isHealthy) {
      return NextResponse.json({
        success: true,
        message: 'MongoDB connection is healthy',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'MongoDB connection failed',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('MongoDB test error:', error);
    return NextResponse.json({
      success: false,
      message: 'MongoDB test error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
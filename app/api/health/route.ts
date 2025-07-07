import { NextResponse } from 'next/server';
import { isHealthy } from '@/lib/database-mongodb';

export async function GET() {
  try {
    const healthy = await isHealthy();
    
    if (healthy) {
      return NextResponse.json({
        success: true,
        message: 'Database connection is healthy',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      success: false,
      message: 'Health check error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database-mongodb';

/**
 * 检查用户是否存在API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    
    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: 'Missing wallet address parameter'
      }, { status: 400 });
    }
    
    const exists = await DatabaseService.isUserExists(wallet);
    
    return NextResponse.json({
      success: true,
      data: exists
    });
  } catch (error) {
    console.error('检查用户是否存在失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
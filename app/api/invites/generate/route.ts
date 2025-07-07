import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database-mongodb';

/**
 * 生成邀请链接API
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
    
    const inviteLink = await DatabaseService.generateInviteLink(wallet);
    
    return NextResponse.json({
      success: true,
      data: inviteLink
    });
  } catch (error) {
    console.error('生成邀请链接失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
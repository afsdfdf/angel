import { NextRequest, NextResponse } from 'next/server';
import { generateInviteLink } from '@/lib/database-mongodb';

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
        error: 'Missing wallet parameter'
      }, { status: 400 });
    }
    
    const inviteLink = await generateInviteLink(wallet);
    
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
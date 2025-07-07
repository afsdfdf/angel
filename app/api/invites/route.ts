import { NextRequest, NextResponse } from 'next/server';
import { getUserInvitations } from '@/lib/database-mongodb';

/**
 * 获取用户邀请记录API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId parameter'
      }, { status: 400 });
    }
    
    const invitations = await getUserInvitations(userId);
    
    return NextResponse.json({
      success: true,
      data: invitations
    });
  } catch (error) {
    console.error('获取邀请记录失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database-mongodb';

/**
 * 处理邀请注册
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newUserWallet, inviterWallet } = body;
    
    if (!newUserWallet || !inviterWallet) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters'
      }, { status: 400 });
    }
    
    const result = await DatabaseService.processInviteRegistration(
      newUserWallet,
      inviterWallet
    );
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('处理邀请注册失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
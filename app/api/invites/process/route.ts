import { NextRequest, NextResponse } from 'next/server';
import { processInviteRegistration, getUserByWalletAddress } from '@/lib/database-mongodb';

/**
 * 处理邀请注册API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newUserWallet, inviterWallet } = body;
    
    console.log('📝 处理邀请注册API被调用:', { newUserWallet, inviterWallet });
    
    if (!newUserWallet || !inviterWallet) {
      console.error('❌ 缺少必需参数:', { newUserWallet, inviterWallet });
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters'
      }, { status: 400 });
    }
    
    // 获取邀请人和新用户信息，用于日志记录
    const inviter = await getUserByWalletAddress(inviterWallet);
    const newUser = await getUserByWalletAddress(newUserWallet);
    
    console.log('📊 处理前用户信息:', {
      inviter: inviter ? {
        id: inviter.id,
        wallet: inviter.wallet_address,
        balance: inviter.angel_balance,
        invites_count: inviter.invites_count
      } : null,
      newUser: newUser ? {
        id: newUser.id,
        wallet: newUser.wallet_address,
        referred_by: newUser.referred_by
      } : null
    });
    
    const result = await processInviteRegistration(
      newUserWallet.toLowerCase(),
      inviterWallet.toLowerCase()
    );
    
    // 获取处理后的用户信息，用于验证更改
    const updatedInviter = await getUserByWalletAddress(inviterWallet);
    const updatedNewUser = await getUserByWalletAddress(newUserWallet);
    
    console.log('📊 处理后用户信息:', {
      result,
      inviter: updatedInviter ? {
        id: updatedInviter.id,
        wallet: updatedInviter.wallet_address,
        balance: updatedInviter.angel_balance,
        invites_count: updatedInviter.invites_count
      } : null,
      newUser: updatedNewUser ? {
        id: updatedNewUser.id,
        wallet: updatedNewUser.wallet_address,
        referred_by: updatedNewUser.referred_by
      } : null
    });
    
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
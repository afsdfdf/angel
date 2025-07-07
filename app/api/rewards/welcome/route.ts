import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService, REWARD_CONFIG } from '@/lib/database-mongodb';

/**
 * 记录欢迎奖励API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId parameter'
      }, { status: 400 });
    }
    
    // 检查用户是否存在
    const user = await DatabaseService.getUserById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    // 创建欢迎奖励记录
    const now = new Date().toISOString();
    const rewardRecord = {
      user_id: userId,
      reward_type: 'welcome',
      amount: REWARD_CONFIG.WELCOME_BONUS, // 使用配置定义的奖励金额
      description: '新用户欢迎奖励',
      status: 'completed',
      created_at: now
    };
    
    const recordId = await DatabaseService.createRewardRecord(rewardRecord);
    
    if (!recordId) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create reward record'
      }, { status: 500 });
    }
    
    // 更新用户的代币余额
    const updateResult = await DatabaseService.updateUser(userId, {
      angel_balance: (user.angel_balance || 0) + REWARD_CONFIG.WELCOME_BONUS,
      total_earned: (user.total_earned || 0) + REWARD_CONFIG.WELCOME_BONUS
    });
    
    return NextResponse.json({
      success: true,
      data: true,
      recordId: recordId
    });
  } catch (error) {
    console.error('记录欢迎奖励失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
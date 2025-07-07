import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database-mongodb';

/**
 * 通过钱包地址获取用户
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
    
    const user = await DatabaseService.getUserByWalletAddress(wallet);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * 创建用户
 */
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    if (!userData.wallet_address) {
      return NextResponse.json({
        success: false,
        error: 'Wallet address is required'
      }, { status: 400 });
    }
    
    const user = await DatabaseService.createUser(userData);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create user'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: user
    }, { status: 201 });
  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 更新用户API
export async function PATCH(request: NextRequest) {
  try {
    // 检查授权
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取请求体
    const body = await request.json();
    const { id, ...updates } = body;
    
    // 验证参数
    if (!id) {
      return NextResponse.json(
        { error: '缺少id参数' },
        { status: 400 }
      );
    }
    
    // 移除不允许更新的字段
    delete updates.wallet_address; // 不允许更新钱包地址
    delete updates.id; // 不允许更新ID
    
    // 更新用户
    const updatedUser = await DatabaseService.updateUser(id, updates);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: '用户不存在或更新失败' },
        { status: 404 }
      );
    }
    
    // 返回更新后的用户
    return NextResponse.json({
      message: '用户更新成功',
      user: updatedUser,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('更新用户API错误:', error);
    return NextResponse.json({
      error: '更新用户失败',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
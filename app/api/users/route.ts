import { NextRequest, NextResponse } from 'next/server';
import { DatabaseServiceFixed } from '@/lib/database-fixed';

/**
 * 获取所有用户
 */
export async function GET(request: NextRequest) {
  try {
    // 检查授权（在实际应用中应该使用更安全的授权机制）
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取用户数据
    const users = await DatabaseServiceFixed.getAllUsers();
    
    // 过滤敏感信息
    const safeUsers = users.map(user => ({
      id: user.id,
      wallet_address: user.wallet_address,
      username: user.username,
      invites_count: user.invites_count,
      angel_balance: user.angel_balance,
      is_active: user.is_active,
      created_at: user.created_at
    }));
    
    return NextResponse.json({
      count: safeUsers.length,
      data: safeUsers,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      error: '获取用户数据失败',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * 创建新用户
 */
export async function POST(request: NextRequest) {
  try {
    // 检查授权
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取请求数据
    const requestData = await request.json();
    
    // 验证必要字段
    if (!requestData.wallet_address) {
      return NextResponse.json({ error: '缺少必要字段 wallet_address' }, { status: 400 });
    }
    
    // 检查用户是否已存在
    const existingUser = await DatabaseServiceFixed.getUserByWalletAddress(requestData.wallet_address);
    if (existingUser) {
      return NextResponse.json({ 
        error: '用户已存在', 
        user: existingUser 
      }, { status: 409 });
    }
    
    // 创建新用户
    const newUser = await DatabaseServiceFixed.createUser({
      wallet_address: requestData.wallet_address,
      username: requestData.username,
      email: requestData.email,
      avatar_url: requestData.avatar_url
    });
    
    if (!newUser) {
      return NextResponse.json({ error: '创建用户失败' }, { status: 500 });
    }
    
    return NextResponse.json({
      message: '用户创建成功',
      user: newUser,
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      error: '创建用户失败',
      message: error.message,
      timestamp: new Date().toISOString()
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
    const updatedUser = await DatabaseServiceFixed.updateUser(id, updates);
    
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
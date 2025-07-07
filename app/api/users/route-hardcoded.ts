import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/database-hardcoded';

// 获取用户信息API
export async function GET(request: NextRequest) {
  try {
    // 从URL参数中获取wallet地址
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    
    // 验证参数
    if (!wallet) {
      return NextResponse.json(
        { error: '缺少wallet参数' },
        { status: 400 }
      );
    }
    
    // 使用硬编码的服务端客户端查询用户数据
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', wallet)
      .single();
    
    if (error) {
      console.error('获取用户数据失败:', error);
      return NextResponse.json(
        { error: '获取用户数据失败', details: error.message },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 返回用户数据
    return NextResponse.json({ user: data });
  } catch (err: any) {
    console.error('用户API错误:', err);
    return NextResponse.json(
      { error: '服务器内部错误', details: err.message },
      { status: 500 }
    );
  }
}

// 创建用户API
export async function POST(request: NextRequest) {
  try {
    // 获取请求体
    const body = await request.json();
    const { walletAddress, username } = body;
    
    // 验证参数
    if (!walletAddress) {
      return NextResponse.json(
        { error: '缺少walletAddress参数' },
        { status: 400 }
      );
    }
    
    // 检查用户是否已存在
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (existingUser) {
      return NextResponse.json(
        { error: '用户已存在', userId: existingUser.id },
        { status: 409 }
      );
    }
    
    // 创建新用户
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        { 
          wallet_address: walletAddress,
          username: username || `用户_${walletAddress.slice(0, 6)}`,
          is_active: true,
          angel_balance: 0,
          total_earned: 0,
          invites_count: 0
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('创建用户失败:', error);
      return NextResponse.json(
        { error: '创建用户失败', details: error.message },
        { status: 500 }
      );
    }
    
    // 返回创建的用户
    return NextResponse.json({ user: data }, { status: 201 });
  } catch (err: any) {
    console.error('创建用户API错误:', err);
    return NextResponse.json(
      { error: '服务器内部错误', details: err.message },
      { status: 500 }
    );
  }
}

// 更新用户API
export async function PATCH(request: NextRequest) {
  try {
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
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('更新用户失败:', error);
      return NextResponse.json(
        { error: '更新用户失败', details: error.message },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 返回更新后的用户
    return NextResponse.json({ user: data });
  } catch (err: any) {
    console.error('更新用户API错误:', err);
    return NextResponse.json(
      { error: '服务器内部错误', details: err.message },
      { status: 500 }
    );
  }
} 
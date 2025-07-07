import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/database-mongodb';

/**
 * 获取所有用户API
 */
export async function GET() {
  try {
    const users = await getAllUsers();
    
    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('获取所有用户失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
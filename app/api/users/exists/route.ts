import { NextResponse } from 'next/server';
import { isUserExists } from '@/lib/database-mongodb';

/**
 * 检查用户是否存在API
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    
    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: 'Wallet address is required'
      }, { status: 400 });
    }
    
    const exists = await isUserExists(wallet);
    
    return NextResponse.json({
      success: true,
      data: exists
    });
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
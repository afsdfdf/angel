import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByWalletAddress, 
  getUserInvitations, 
  getUserRewards,
  connectToDatabase
} from '@/lib/database-mongodb';
import { ObjectId } from 'mongodb';

/**
 * 诊断邀请系统API
 */
export async function GET(request: NextRequest) {
  try {
    // 获取钱包地址参数
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('wallet');
    
    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing wallet address parameter'
      }, { status: 400 });
    }
    
    console.log('🔍 开始诊断邀请系统:', { walletAddress });
    
    // 获取用户信息
    const user = await getUserByWalletAddress(walletAddress);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    // 获取数据库连接
    const { db } = await connectToDatabase();
    
    // 获取用户邀请记录
    const invitations = await getUserInvitations(user.id!);
    
    // 获取用户奖励记录
    const rewards = await getUserRewards(user.id!);
    
    // 获取被该用户邀请的用户
    const invitedUsers = await db.collection('users')
      .find({ referred_by: user.id })
      .toArray();
    
    // 获取邀请该用户的用户
    let inviter = null;
    if (user.referred_by) {
      inviter = await db.collection('users')
        .findOne({ _id: new ObjectId(user.referred_by) });
    }
    
    // 获取邀请记录详情
    const invitationDetails = await Promise.all(invitations.map(async (invitation) => {
      const invitee = invitation.invitee_id 
        ? await db.collection('users').findOne({ _id: new ObjectId(invitation.invitee_id) })
        : null;
      
      return {
        ...invitation,
        invitee: invitee ? {
          id: invitee._id.toString(),
          wallet_address: invitee.wallet_address,
          username: invitee.username,
          referred_by: invitee.referred_by
        } : null
      };
    }));
    
    // 定义问题类型
    interface Issue {
      type: string;
      message: string;
      severity: string;
    }
    
    // 诊断结果
    const diagnosticResult = {
      user: {
        id: user.id,
        wallet_address: user.wallet_address,
        username: user.username,
        angel_balance: user.angel_balance,
        total_earned: user.total_earned,
        invites_count: user.invites_count,
        referred_by: user.referred_by,
        created_at: user.created_at
      },
      inviter: inviter ? {
        id: inviter._id.toString(),
        wallet_address: inviter.wallet_address,
        username: inviter.username
      } : null,
      invitedUsers: invitedUsers.map(u => ({
        id: u._id.toString(),
        wallet_address: u.wallet_address,
        username: u.username,
        created_at: u.created_at
      })),
      invitations: invitationDetails,
      rewards: rewards.map(r => ({
        id: r.id,
        reward_type: r.reward_type,
        amount: r.amount,
        description: r.description,
        status: r.status,
        created_at: r.created_at
      })),
      stats: {
        totalInvitations: invitations.length,
        totalInvitedUsers: invitedUsers.length,
        totalRewards: rewards.length,
        totalReferralRewards: rewards.filter(r => r.reward_type.startsWith('referral')).length,
        referralRewardAmount: rewards
          .filter(r => r.reward_type.startsWith('referral'))
          .reduce((sum, r) => sum + r.amount, 0)
      },
      issues: [] as Issue[]
    };
    
    // 检查问题
    const issues: Issue[] = [];
    
    // 检查邀请计数是否正确
    if (user.invites_count !== invitedUsers.length) {
      issues.push({
        type: 'invites_count_mismatch',
        message: `邀请计数不匹配: 用户记录 ${user.invites_count}, 实际邀请用户数 ${invitedUsers.length}`,
        severity: 'medium'
      });
    }
    
    // 检查奖励总额是否正确
    const totalReferralRewards = rewards
      .filter(r => r.reward_type.startsWith('referral'))
      .reduce((sum, r) => sum + r.amount, 0);
    
    if (totalReferralRewards > 0 && user.total_earned < totalReferralRewards) {
      issues.push({
        type: 'reward_amount_mismatch',
        message: `奖励总额不匹配: 用户总收入 ${user.total_earned}, 邀请奖励总额 ${totalReferralRewards}`,
        severity: 'high'
      });
    }
    
    // 检查邀请记录和被邀请用户是否匹配
    const inviteeIds = invitations.map(inv => inv.invitee_id).filter(Boolean);
    const invitedUserIds = invitedUsers.map(u => u._id.toString());
    
    const missingInvitees = inviteeIds.filter(id => !invitedUserIds.includes(id!));
    if (missingInvitees.length > 0) {
      issues.push({
        type: 'missing_invited_users',
        message: `邀请记录中的用户不存在: ${missingInvitees.join(', ')}`,
        severity: 'high'
      });
    }
    
    // 检查被邀请用户是否都有对应的邀请记录
    const missingInvitations = invitedUserIds.filter(id => 
      !inviteeIds.some(inviteeId => inviteeId === id)
    );
    
    if (missingInvitations.length > 0) {
      issues.push({
        type: 'missing_invitation_records',
        message: `被邀请用户没有对应的邀请记录: ${missingInvitations.join(', ')}`,
        severity: 'high'
      });
    }
    
    diagnosticResult.issues = issues;
    
    return NextResponse.json({
      success: true,
      data: diagnosticResult
    });
  } catch (error) {
    console.error('诊断邀请系统失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 
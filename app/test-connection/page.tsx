"use client";

import { useState, useEffect } from 'react';
import { DatabaseServiceFixed, User, Invitation, RewardRecord } from '@/lib/database-fixed';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  useEffect(() => {
    // 页面加载时自动运行健康检查
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setStatus('loading');
      setMessage('检查数据库连接中...');
      
      const isHealthy = await DatabaseServiceFixed.isHealthy();
      
      if (isHealthy) {
        setStatus('success');
        setMessage('数据库连接正常！');
      } else {
        setStatus('error');
        setMessage('数据库连接失败！');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`发生错误：${error.message}`);
      console.error('连接测试错误:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setStatus('loading');
      setMessage('加载用户数据中...');
      
      const allUsers = await DatabaseServiceFixed.getAllUsers();
      
      setUsers(allUsers);
      setStatus('success');
      setMessage(`已加载 ${allUsers.length} 个用户`);
    } catch (error: any) {
      setStatus('error');
      setMessage(`加载用户失败：${error.message}`);
      console.error('加载用户错误:', error);
    }
  };

  const loadInvitations = async () => {
    try {
      setStatus('loading');
      setMessage('加载邀请数据中...');
      
      const allInvitations = await DatabaseServiceFixed.getAllInvitations();
      
      setInvitations(allInvitations);
      setStatus('success');
      setMessage(`已加载 ${allInvitations.length} 条邀请记录`);
    } catch (error: any) {
      setStatus('error');
      setMessage(`加载邀请记录失败：${error.message}`);
      console.error('加载邀请记录错误:', error);
    }
  };

  const runDiagnostics = async () => {
    try {
      setStatus('loading');
      setMessage('正在进行数据库诊断...');
      
      const results = await DatabaseServiceFixed.diagnoseDatabase();
      
      setDiagnosticResult(results);
      setStatus('success');
      setMessage('诊断完成');
    } catch (error: any) {
      setStatus('error');
      setMessage(`诊断失败：${error.message}`);
      console.error('诊断错误:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">数据库连接测试</h1>
      
      <div className="mb-8">
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={checkConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={status === 'loading'}
          >
            检查连接
          </button>
          
          <button 
            onClick={loadUsers}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={status === 'loading'}
          >
            加载用户
          </button>
          
          <button 
            onClick={loadInvitations}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            disabled={status === 'loading'}
          >
            加载邀请
          </button>
          
          <button 
            onClick={runDiagnostics}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            disabled={status === 'loading'}
          >
            运行诊断
          </button>
        </div>
        
        <div className={`p-4 rounded mb-4 ${
          status === 'idle' ? 'bg-gray-100' : 
          status === 'loading' ? 'bg-blue-100' : 
          status === 'success' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <p className="font-semibold">状态: {status}</p>
          <p>{message}</p>
        </div>
      </div>
      
      {diagnosticResult && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">诊断结果</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(diagnosticResult, null, 2)}
          </pre>
        </div>
      )}
      
      {users.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">用户数据 ({users.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">钱包地址</th>
                  <th className="border p-2">邀请数量</th>
                  <th className="border p-2">Angel 余额</th>
                  <th className="border p-2">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="border p-2 text-xs">{user.id}</td>
                    <td className="border p-2 text-xs">{user.wallet_address}</td>
                    <td className="border p-2">{user.invites_count}</td>
                    <td className="border p-2">{user.angel_balance}</td>
                    <td className="border p-2 text-xs">{user.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {invitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">邀请记录 ({invitations.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">邀请人</th>
                  <th className="border p-2">被邀请人</th>
                  <th className="border p-2">状态</th>
                  <th className="border p-2">奖励金额</th>
                  <th className="border p-2">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map(invitation => (
                  <tr key={invitation.id}>
                    <td className="border p-2 text-xs">{invitation.id}</td>
                    <td className="border p-2 text-xs">{invitation.inviter_id}</td>
                    <td className="border p-2 text-xs">{invitation.invitee_id}</td>
                    <td className="border p-2">{invitation.status}</td>
                    <td className="border p-2">{invitation.reward_amount}</td>
                    <td className="border p-2 text-xs">{invitation.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 
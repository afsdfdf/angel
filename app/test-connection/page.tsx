"use client";

import { useState, useEffect } from 'react';
import { supabaseClient, checkDatabaseHealth } from '@/lib/database-hardcoded';

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('测试连接中...');
  const [rpcResult, setRpcResult] = useState<any>(null);
  const [apiResult, setApiResult] = useState<any>(null);
  const [rpcError, setRpcError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // 测试连接
  useEffect(() => {
    async function testConnection() {
      try {
        setConnectionStatus('loading');
        setMessage('检查数据库连接...');
        
        // 检查数据库健康状况
        const isHealthy = await checkDatabaseHealth();
        
        if (isHealthy) {
          setConnectionStatus('success');
          setMessage('数据库连接成功!');
        } else {
          setConnectionStatus('error');
          setMessage('数据库连接失败');
        }
      } catch (error: any) {
        console.error('连接测试失败:', error);
        setConnectionStatus('error');
        setMessage(`连接测试失败: ${error.message || '未知错误'}`);
      }
    }
    
    testConnection();
  }, []);

  // 测试 RPC 函数
  async function testRpcFunction() {
    try {
      setRpcResult(null);
      setRpcError(null);
      
      // 调用健康检查 RPC 函数
      const { data, error } = await supabaseClient.rpc('check_database_health');
      
      if (error) {
        console.error('RPC 函数调用失败:', error);
        setRpcError(`RPC 调用失败: ${error.message}`);
        return;
      }
      
      setRpcResult(data);
    } catch (error: any) {
      console.error('RPC 测试失败:', error);
      setRpcError(`RPC 测试异常: ${error.message || '未知错误'}`);
    }
  }

  // 测试 API 端点
  async function testApiEndpoint() {
    try {
      setApiResult(null);
      setApiError(null);
      
      // 调用 API 健康检查端点
      const response = await fetch('/api/health');
      
      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      setApiResult(data);
    } catch (error: any) {
      console.error('API 测试失败:', error);
      setApiError(`API 测试失败: ${error.message || '未知错误'}`);
    }
  }

  // 状态颜色
  const statusColor = 
    connectionStatus === 'success' ? 'text-green-500' :
    connectionStatus === 'error' ? 'text-red-500' :
    'text-yellow-500';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase 连接测试</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">连接状态</h2>
        <p className={`text-lg ${statusColor} font-medium`}>{message}</p>
        
        <div className="mt-4 space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          >
            重新测试
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">RPC 函数测试</h2>
          
          <button
            onClick={testRpcFunction}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none mb-4"
          >
            测试 RPC 函数
          </button>
          
          {rpcError && (
            <div className="text-red-500 mb-2">{rpcError}</div>
          )}
          
          {rpcResult !== null && (
            <div className="bg-gray-50 p-4 rounded">
              <p>结果: {String(rpcResult)}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">API 端点测试</h2>
          
          <button
            onClick={testApiEndpoint}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none mb-4"
          >
            测试 API 端点
          </button>
          
          {apiError && (
            <div className="text-red-500 mb-2">{apiError}</div>
          )}
          
          {apiResult && (
            <div className="bg-gray-50 p-4 rounded">
              <pre>{JSON.stringify(apiResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
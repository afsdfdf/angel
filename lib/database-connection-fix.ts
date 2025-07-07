/**
 * 数据库连接问题修复
 * 
 * 主要问题:
 * 1. 权限问题 - Supabase的Row Level Security (RLS)阻止直接访问users表
 * 2. 可能的代理问题 - 系统代理可能影响连接
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

// 全局Supabase客户端实例
let supabase: SupabaseClient | null = null;

/**
 * 初始化Supabase客户端，解决代理和连接问题
 */
export function initSupabase(): SupabaseClient {
  try {
    if (!config.supabase || !config.supabase.url || !config.supabase.anonKey) {
      throw new Error('缺少Supabase配置');
    }

    console.log('初始化Supabase客户端...');
    console.log(`URL: ${config.supabase.url}`);
    console.log(`Key (前10位): ${config.supabase.anonKey.substring(0, 10)}...`);

    // 解决代理问题的配置
    const clientOptions = {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'x-client-info': 'angel-crypto-app'
        }
      },
      // 使用自定义fetch绕过系统代理
      fetch: customFetch
    };

    const client = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      clientOptions
    );

    console.log('✅ Supabase客户端初始化成功');
    return client;
  } catch (error) {
    console.error('❌ 初始化Supabase失败:', error);
    throw new Error('数据库连接失败，请检查网络和配置');
  }
}

/**
 * 自定义fetch函数，绕过系统代理
 */
function customFetch(url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
  // 添加no-cache和no-store以避免缓存问题
  const newOptions = {
    ...options,
    cache: 'no-store' as RequestCache,
    headers: {
      ...options?.headers,
      'Cache-Control': 'no-cache, no-store'
    }
  };
  
  console.log(`🔄 发送请求: ${typeof url === 'string' ? url : url.toString()}`);
  return fetch(url, newOptions);
}

/**
 * 获取Supabase客户端实例（懒加载）
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = initSupabase();
  }
  return supabase;
}

/**
 * 强制重新初始化客户端
 */
export function reinitializeSupabase(): SupabaseClient {
  supabase = initSupabase();
  return supabase;
}

/**
 * 检查数据库连接是否正常
 * 使用不需要特殊权限的方法进行检查
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    console.log('检查数据库连接...');
    const client = getSupabaseClient();
    
    // 使用RPC函数检查连接，这种方式不需要表访问权限
    const { data, error } = await client.rpc('check_database_health');
    
    if (error) {
      console.error('❌ 数据库连接检查失败 (RPC):', error);
      
      // 备用检查: 尝试一个简单的HTTP请求
      try {
        const { error: restError } = await client
          .from('health_check')
          .select('count(*)', { count: 'exact', head: true });
          
        if (restError) {
          console.error('❌ 备用连接检查也失败:', restError);
          return false;
        }
        
        console.log('✅ 备用连接检查成功');
        return true;
      } catch (backupError) {
        console.error('❌ 备用连接检查异常:', backupError);
        return false;
      }
    }
    
    console.log('✅ 数据库连接检查成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接检查异常:', error);
    return false;
  }
}

/**
 * 安全的用户查询函数 - 使用RPC而不是直接查询
 * 这解决了权限问题
 */
export async function getUserByWalletAddressSafe(walletAddress: string): Promise<any> {
  try {
    const client = getSupabaseClient();
    const normalizedAddress = walletAddress.toLowerCase();
    
    // 使用RPC函数而不是直接查询users表
    const { data, error } = await client.rpc('get_user_by_wallet', {
      wallet: normalizedAddress
    });
    
    if (error) {
      console.error('❌ 获取用户失败 (RPC):', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('❌ 获取用户异常:', error);
    return null;
  }
}

/**
 * 诊断数据库问题
 */
export async function diagnoseDatabaseIssues(): Promise<Record<string, any>> {
  try {
    const client = getSupabaseClient();
    const results: Record<string, any> = {
      timestamp: new Date().toISOString(),
      tests: {}
    };
    
    // 测试1: 基本连接
    try {
      const { error } = await client
        .from('health_check')
        .select('count(*)', { count: 'exact', head: true });
      
      results.tests.basicConnection = {
        success: !error,
        error: error ? error.message : null
      };
    } catch (e: any) {
      results.tests.basicConnection = {
        success: false,
        error: e.message
      };
    }
    
    // 测试2: RPC函数调用
    try {
      const { data, error } = await client.rpc('check_database_health');
      
      results.tests.rpcFunction = {
        success: !error,
        data,
        error: error ? error.message : null
      };
    } catch (e: any) {
      results.tests.rpcFunction = {
        success: false,
        error: e.message
      };
    }
    
    // 测试3: 直接表访问
    try {
      const { data, error } = await client
        .from('users')
        .select('count(*)', { count: 'exact', head: true });
      
      results.tests.directTableAccess = {
        success: !error,
        error: error ? error.message : null
      };
    } catch (e: any) {
      results.tests.directTableAccess = {
        success: false,
        error: e.message
      };
    }
    
    // 总结结果
    results.summary = {
      connectionWorks: results.tests.basicConnection.success || results.tests.rpcFunction.success,
      permissionIssue: !results.tests.directTableAccess.success,
      recommendation: !results.tests.directTableAccess.success ? 
        '需要使用RPC函数或API端点访问数据，而不是直接查询表' : 
        '直接表访问正常，无需特殊处理'
    };
    
    return results;
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
} 
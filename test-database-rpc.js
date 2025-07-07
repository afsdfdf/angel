// 测试基于RPC的数据库连接
const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const SUPABASE_URL = 'https://onfplwhsmtvmkssyisot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnBsd2hzbXR2bWtzc3lpc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjM3NzksImV4cCI6MjA2MjAzOTc3OX0.HwC1mqTWDtwOCDm1zufyyA9Xrg2pgVOElxx2JX9z9Bs';

// 自定义fetch函数，绕过系统代理
function customFetch(url, options) {
  const newOptions = {
    ...options,
    cache: 'no-store',
    headers: {
      ...options?.headers,
      'Cache-Control': 'no-cache, no-store'
    }
  };
  
  console.log(`🔄 发送请求: ${url}`);
  return fetch(url, newOptions);
}

// 初始化Supabase客户端
function initSupabase() {
  try {
    console.log('初始化Supabase客户端...');
    console.log(`URL: ${SUPABASE_URL}`);
    console.log(`Key (前10位): ${SUPABASE_KEY.substring(0, 10)}...`);

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
      SUPABASE_URL,
      SUPABASE_KEY,
      clientOptions
    );

    console.log('✅ Supabase客户端初始化成功');
    return client;
  } catch (error) {
    console.error('❌ 初始化Supabase失败:', error);
    throw new Error('数据库连接失败，请检查网络和配置');
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试基于RPC的数据库连接...\n');
  
  // 初始化客户端
  const supabase = initSupabase();
  
  // 测试1: 健康检查RPC
  console.log('\n=== 测试1: 健康检查RPC ===');
  try {
    const { data, error } = await supabase.rpc('check_database_health');
    
    if (error) {
      console.error('❌ 健康检查失败:', error);
    } else {
      console.log('✅ 健康检查成功:', data);
    }
  } catch (e) {
    console.error('❌ 健康检查异常:', e);
  }
  
  // 测试2: 直接表访问（应该失败）
  console.log('\n=== 测试2: 直接表访问 ===');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.log('✅ 预期的权限错误:', error.message);
    } else {
      console.log('⚠️ 意外成功:', data);
    }
  } catch (e) {
    console.error('❌ 直接表访问异常:', e);
  }
  
  // 测试3: 获取用户RPC
  console.log('\n=== 测试3: 获取用户RPC ===');
  try {
    const { data, error } = await supabase.rpc('get_user_by_wallet', { 
      wallet: '0x0000000000000000000000000000000000000001' 
    });
    
    if (error) {
      console.error('❌ 获取用户失败:', error);
    } else {
      console.log('✅ 获取用户成功:', data ? '找到用户' : '未找到用户');
    }
  } catch (e) {
    console.error('❌ 获取用户异常:', e);
  }
  
  // 测试4: 处理邀请RPC
  console.log('\n=== 测试4: 处理邀请RPC ===');
  try {
    const { data, error } = await supabase.rpc('process_invite_registration', {
      new_user_wallet: '0x0000000000000000000000000000000000000001',
      inviter_wallet: '0x0000000000000000000000000000000000000002'
    });
    
    if (error) {
      console.log('⚠️ 处理邀请失败 (可能是测试用户不存在):', error.message);
    } else {
      console.log('✅ 处理邀请成功:', data);
    }
  } catch (e) {
    console.error('❌ 处理邀请异常:', e);
  }
  
  console.log('\n测试完成');
}

// 执行测试
runTests().catch(err => {
  console.error('测试过程中出错:', err);
}); 
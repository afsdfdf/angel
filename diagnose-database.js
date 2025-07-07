// 数据库诊断脚本
const { createClient } = require('@supabase/supabase-js');

// 硬编码的Supabase凭据
const SUPABASE_URL = 'https://onfplwhsmtvmkssyisot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnBsd2hzbXR2bWtzc3lpc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjM3NzksImV4cCI6MjA2MjAzOTc3OX0.HwC1mqTWDtwOCDm1zufyyA9Xrg2pgVOElxx2JX9z9Bs';

// 创建Supabase客户端
console.log('创建Supabase客户端...');
console.log('URL:', SUPABASE_URL);
console.log('Key (前10位):', SUPABASE_KEY.substring(0, 10) + '...');

// 检查URL和Key格式
console.log('\n=== 检查配置格式 ===');
console.log('URL格式有效:', SUPABASE_URL.startsWith('https://') && SUPABASE_URL.includes('.supabase.co'));
console.log('Key格式有效:', SUPABASE_KEY.includes('.') && SUPABASE_KEY.length > 50);

// 创建客户端，添加更多选项
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: require('cross-fetch')
  }
});

// 测试数据库连接
async function testConnection() {
  console.log('\n=== 测试数据库连接 ===');
  try {
    console.log('尝试简单查询...');
    const { data, error, status, statusText } = await supabase.from('users').select('count(*)', { count: 'exact', head: true });
    
    console.log('状态码:', status);
    console.log('状态文本:', statusText);
    console.log('数据:', data);
    
    if (error) {
      console.error('❌ 连接失败:', error);
      return false;
    }
    
    console.log('✅ 连接成功!');
    return true;
  } catch (error) {
    console.error('❌ 连接异常:', error);
    if (error.stack) {
      console.error('堆栈:', error.stack);
    }
    return false;
  }
}

// 尝试直接的HTTP请求
async function testDirectHttp() {
  console.log('\n=== 测试直接HTTP请求 ===');
  try {
    console.log('尝试直接HTTP请求到Supabase...');
    const fetch = require('cross-fetch');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    console.log('HTTP状态码:', response.status);
    console.log('HTTP状态文本:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('响应数据:', data);
      console.log('✅ HTTP请求成功!');
      return true;
    } else {
      const text = await response.text();
      console.error('❌ HTTP请求失败:', text);
      return false;
    }
  } catch (error) {
    console.error('❌ HTTP请求异常:', error);
    if (error.stack) {
      console.error('堆栈:', error.stack);
    }
    return false;
  }
}

// 检查网络连接
async function checkNetwork() {
  console.log('\n=== 检查网络连接 ===');
  try {
    console.log('尝试连接到google.com...');
    const fetch = require('cross-fetch');
    const response = await fetch('https://www.google.com');
    console.log('Google状态码:', response.status);
    console.log('✅ 网络连接正常!');
    return true;
  } catch (error) {
    console.error('❌ 网络连接异常:', error);
    return false;
  }
}

// 检查表结构
async function checkTables() {
  console.log('\n=== 检查数据库表 ===');
  const tables = ['users', 'invitations', 'nfts', 'lands', 'reward_records'];
  
  for (const table of tables) {
    try {
      console.log(`检查表 "${table}"...`);
      const { data, error } = await supabase.from(table).select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ 表 "${table}" 不存在或无法访问:`, error);
      } else {
        console.log(`✅ 表 "${table}" 存在并可访问`);
      }
    } catch (error) {
      console.error(`❌ 检查表 "${table}" 时出错:`, error);
    }
  }
}

// 检查RLS策略
async function checkRLS() {
  console.log('\n=== 检查RLS策略 ===');
  try {
    // 尝试插入测试数据
    const testData = {
      wallet_address: `test_${Date.now()}`,
      username: 'Test User',
      created_at: new Date().toISOString()
    };
    
    console.log('尝试插入测试数据...');
    const { data, error } = await supabase.from('users').insert([testData]).select();
    
    if (error) {
      if (error.code === 'PGRST301') {
        console.log('⚠️ RLS策略阻止了插入操作 (这可能是正常的，取决于您的安全设置)');
      } else {
        console.error('❌ 插入测试数据失败:', error);
      }
    } else {
      console.log('✅ 成功插入测试数据');
      
      // 删除测试数据
      if (data && data.length > 0) {
        const { error: deleteError } = await supabase.from('users').delete().eq('id', data[0].id);
        if (deleteError) {
          console.error('❌ 删除测试数据失败:', deleteError);
        } else {
          console.log('✅ 成功删除测试数据');
        }
      }
    }
  } catch (error) {
    console.error('❌ 检查RLS策略时出错:', error);
  }
}

// 检查数据库函数
async function checkFunctions() {
  console.log('\n=== 检查数据库函数 ===');
  const functions = ['process_invite_registration', 'is_new_user'];
  
  for (const func of functions) {
    try {
      console.log(`检查函数 "${func}"...`);
      
      // 尝试调用函数（使用无效参数，只是为了检查函数是否存在）
      const { data, error } = await supabase.rpc(func, {
        new_user_wallet: '0x0000000000000000000000000000000000000000',
        inviter_wallet: '0x0000000000000000000000000000000000000000'
      });
      
      if (error && error.code === 'PGRST301') {
        console.log(`⚠️ 函数 "${func}" 存在但RLS策略阻止了调用 (这可能是正常的)`);
      } else if (error && error.message && error.message.includes('does not exist')) {
        console.error(`❌ 函数 "${func}" 不存在`);
      } else if (error) {
        console.log(`✅ 函数 "${func}" 存在 (返回了预期的错误，这通常表示函数存在但参数无效)`);
      } else {
        console.log(`✅ 函数 "${func}" 存在并可调用`);
      }
    } catch (error) {
      console.error(`❌ 检查函数 "${func}" 时出错:`, error);
    }
  }
}

// 运行所有测试
async function runDiagnostics() {
  console.log('开始数据库诊断...\n');
  
  await checkNetwork();
  await testDirectHttp();
  const isConnected = await testConnection();
  
  if (isConnected) {
    await checkTables();
    await checkRLS();
    await checkFunctions();
  }
  
  console.log('\n诊断完成');
}

// 安装依赖
try {
  require('cross-fetch');
} catch (error) {
  console.log('正在安装cross-fetch...');
  require('child_process').execSync('npm install cross-fetch');
  console.log('cross-fetch安装完成');
}

runDiagnostics().catch(error => {
  console.error('诊断过程中出错:', error);
  process.exit(1);
}); 
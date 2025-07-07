// 禁用代理的 Supabase 连接测试脚本
const https = require('https');
const dns = require('dns');

// Supabase 配置
const SUPABASE_URL = 'https://onfplwhsmtvmkssyisot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnBsd2hzbXR2bWtzc3lpc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjM3NzksImV4cCI6MjA2MjAzOTc3OX0.HwC1mqTWDtwOCDm1zufyyA9Xrg2pgVOElxx2JX9z9Bs';

// 从 URL 中提取主机名
const SUPABASE_HOST = SUPABASE_URL.replace('https://', '').replace('http://', '').split('/')[0];

// 清除所有代理环境变量
function clearProxySettings() {
  console.log('清除代理环境变量...');
  
  // 清除常见的代理环境变量
  const proxyEnvVars = [
    'HTTP_PROXY', 
    'HTTPS_PROXY', 
    'NO_PROXY',
    'http_proxy',
    'https_proxy',
    'no_proxy'
  ];
  
  proxyEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`清除环境变量: ${varName}=${process.env[varName]}`);
      delete process.env[varName];
    }
  });
  
  console.log('代理环境变量已清除');
}

// DNS 解析测试
async function testDnsResolution() {
  console.log(`\n=== DNS 解析测试 ===`);
  console.log(`正在解析 DNS: ${SUPABASE_HOST}`);
  
  return new Promise((resolve) => {
    dns.lookup(SUPABASE_HOST, { family: 4, hints: dns.ADDRCONFIG }, (err, address) => {
      if (err) {
        console.error(`❌ DNS 解析失败: ${err.message}`);
        resolve({ success: false, error: err.message });
      } else {
        console.log(`✅ DNS 解析成功: ${address}`);
        resolve({ success: true, address });
      }
    });
  });
}

// HTTP 请求测试（不带认证）
async function testHttpRequest() {
  console.log(`\n=== HTTP 请求测试（不带认证）===`);
  
  return new Promise((resolve) => {
    const options = {
      hostname: SUPABASE_HOST,
      port: 443,
      path: '/rest/v1/',
      method: 'GET',
      timeout: 10000,
      // 明确设置为不使用代理
      agent: new https.Agent({ keepAlive: true, keepAliveMsecs: 1000, maxSockets: 5 })
    };
    
    console.log('发送请求到:', `https://${SUPABASE_HOST}/rest/v1/`);
    
    const req = https.request(options, (res) => {
      console.log(`✅ 响应状态码: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('响应数据:', data);
        resolve({ success: true, statusCode: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ 请求失败: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      console.error(`❌ 请求超时`);
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
    
    req.end();
  });
}

// HTTP 请求测试（带认证）
async function testAuthenticatedRequest() {
  console.log(`\n=== HTTP 请求测试（带认证）===`);
  
  return new Promise((resolve) => {
    const options = {
      hostname: SUPABASE_HOST,
      port: 443,
      path: '/rest/v1/users?select=id',
      method: 'GET',
      timeout: 10000,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      // 明确设置为不使用代理
      agent: new https.Agent({ keepAlive: true, keepAliveMsecs: 1000, maxSockets: 5 })
    };
    
    console.log('发送请求到:', `https://${SUPABASE_HOST}/rest/v1/users?select=id`);
    
    const req = https.request(options, (res) => {
      console.log(`✅ 响应状态码: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('响应数据:', data);
        resolve({ success: true, statusCode: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ 请求失败: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      console.error(`❌ 请求超时`);
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
    
    req.end();
  });
}

// 测试 RPC 函数调用
async function testRpcFunction() {
  console.log(`\n=== RPC 函数调用测试 ===`);
  
  return new Promise((resolve) => {
    const options = {
      hostname: SUPABASE_HOST,
      port: 443,
      path: '/rest/v1/rpc/process_invite_registration',
      method: 'POST',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      // 明确设置为不使用代理
      agent: new https.Agent({ keepAlive: true, keepAliveMsecs: 1000, maxSockets: 5 })
    };
    
    const data = JSON.stringify({
      new_user_wallet: '0x0000000000000000000000000000000000000001',
      inviter_wallet: '0x0000000000000000000000000000000000000002'
    });
    
    console.log('发送 RPC 请求到:', `https://${SUPABASE_HOST}/rest/v1/rpc/process_invite_registration`);
    console.log('请求数据:', data);
    
    const req = https.request(options, (res) => {
      console.log(`✅ 响应状态码: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('响应数据:', responseData);
        resolve({ success: true, statusCode: res.statusCode, data: responseData });
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ 请求失败: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      console.error(`❌ 请求超时`);
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
    
    req.write(data);
    req.end();
  });
}

// 运行所有测试
async function runTests() {
  console.log('开始无代理 Supabase 连接测试...\n');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Supabase Key (前10位): ${SUPABASE_KEY.substring(0, 10)}...`);
  
  // 清除代理设置
  clearProxySettings();
  
  // 运行测试
  await testDnsResolution();
  await testHttpRequest();
  await testAuthenticatedRequest();
  await testRpcFunction();
  
  console.log('\n测试完成');
}

// 执行测试
runTests().catch(err => {
  console.error('测试过程中出错:', err);
}); 
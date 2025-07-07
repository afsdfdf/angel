// Supabase 连接测试脚本
const https = require('https');
const dns = require('dns');
const { exec } = require('child_process');

// Supabase 配置
const SUPABASE_URL = 'https://onfplwhsmtvmkssyisot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnBsd2hzbXR2bWtzc3lpc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjM3NzksImV4cCI6MjA2MjAzOTc3OX0.HwC1mqTWDtwOCDm1zufyyA9Xrg2pgVOElxx2JX9z9Bs';

// 从 URL 中提取主机名
const SUPABASE_HOST = SUPABASE_URL.replace('https://', '').replace('http://', '').split('/')[0];

// DNS 解析测试
async function testDnsResolution() {
  console.log(`\n=== DNS 解析测试 ===`);
  console.log(`正在解析 DNS: ${SUPABASE_HOST}`);
  
  return new Promise((resolve) => {
    dns.lookup(SUPABASE_HOST, (err, address) => {
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

// Ping 测试
async function pingTest() {
  console.log(`\n=== Ping 测试 ===`);
  console.log(`正在 ping ${SUPABASE_HOST}...`);
  
  return new Promise((resolve) => {
    const pingCmd = process.platform === 'win32' 
      ? `ping -n 4 ${SUPABASE_HOST}`
      : `ping -c 4 ${SUPABASE_HOST}`;
    
    exec(pingCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Ping 失败: ${error.message}`);
        resolve({ success: false, error: error.message });
        return;
      }
      
      console.log(`✅ Ping 结果:`);
      console.log(stdout);
      resolve({ success: true, output: stdout });
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
    };
    
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
      }
    };
    
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

// 检查网络接口
async function checkNetworkInterfaces() {
  console.log(`\n=== 网络接口信息 ===`);
  
  return new Promise((resolve) => {
    exec('ipconfig', (error, stdout, stderr) => {
      if (error) {
        console.error(`执行 ipconfig 出错: ${error.message}`);
        resolve({ success: false, error: error.message });
        return;
      }
      
      // 只显示包含 IPv4 的行
      const ipv4Lines = stdout.split('\n')
        .filter(line => line.includes('IPv4') || line.includes('适配器'))
        .join('\n');
      
      console.log(ipv4Lines);
      resolve({ success: true });
    });
  });
}

// 检查代理设置
async function checkProxySettings() {
  console.log(`\n=== 代理设置检查 ===`);
  
  const proxyEnvVars = [
    'HTTP_PROXY', 
    'HTTPS_PROXY', 
    'NO_PROXY',
    'http_proxy',
    'https_proxy',
    'no_proxy'
  ];
  
  let hasProxy = false;
  
  proxyEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`发现代理设置: ${varName}=${process.env[varName]}`);
      hasProxy = true;
    }
  });
  
  if (!hasProxy) {
    console.log('未发现环境变量中的代理设置');
  }
  
  // 在 Windows 上检查系统代理设置
  if (process.platform === 'win32') {
    return new Promise((resolve) => {
      exec('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable', (error, stdout, stderr) => {
        if (error) {
          console.log('无法检查 Windows 代理设置');
          resolve({ success: false, error: error.message });
          return;
        }
        
        const proxyEnabled = stdout.includes('0x1');
        
        if (proxyEnabled) {
          console.log('⚠️ Windows 系统代理已启用，这可能会影响连接');
          
          exec('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer', (error, stdout, stderr) => {
            if (!error && stdout) {
              const match = stdout.match(/ProxyServer\s+REG_SZ\s+(.*)/);
              if (match && match[1]) {
                console.log(`系统代理服务器: ${match[1]}`);
              }
            }
            resolve({ success: true, proxyEnabled });
          });
        } else {
          console.log('✅ Windows 系统代理未启用');
          resolve({ success: true, proxyEnabled: false });
        }
      });
    });
  }
  
  return Promise.resolve({ success: true, proxyEnabled: false });
}

// 运行所有测试
async function runTests() {
  console.log('开始 Supabase 连接测试...\n');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Supabase Key (前10位): ${SUPABASE_KEY.substring(0, 10)}...`);
  
  await checkNetworkInterfaces();
  await checkProxySettings();
  await testDnsResolution();
  await pingTest();
  await testHttpRequest();
  await testAuthenticatedRequest();
  
  console.log('\n测试完成');
}

// 执行测试
runTests().catch(err => {
  console.error('测试过程中出错:', err);
}); 
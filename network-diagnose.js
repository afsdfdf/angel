// 网络诊断脚本
const https = require('https');
const dns = require('dns');
const { exec } = require('child_process');

// 测试的目标
const targets = [
  { name: 'Supabase API', host: 'onfplwhsmtvmkssyisot.supabase.co', path: '/rest/v1/' },
  { name: 'Google', host: 'www.google.com', path: '/' },
  { name: 'Cloudflare DNS', host: '1.1.1.1', path: '/' },
  { name: 'GitHub', host: 'api.github.com', path: '/' }
];

// DNS 解析测试
function testDnsResolution(hostname) {
  return new Promise((resolve) => {
    console.log(`正在解析 DNS: ${hostname}`);
    dns.lookup(hostname, (err, address) => {
      if (err) {
        console.error(`❌ DNS 解析失败 ${hostname}: ${err.message}`);
        resolve({ success: false, error: err.message });
      } else {
        console.log(`✅ DNS 解析成功 ${hostname}: ${address}`);
        resolve({ success: true, address });
      }
    });
  });
}

// HTTP 请求测试
function testHttpRequest(target) {
  return new Promise((resolve) => {
    console.log(`正在测试 HTTP 请求: ${target.name} (${target.host})`);
    
    const options = {
      hostname: target.host,
      port: 443,
      path: target.path,
      method: 'GET',
      timeout: 10000,
    };
    
    const req = https.request(options, (res) => {
      console.log(`✅ ${target.name} 响应状态码: ${res.statusCode}`);
      resolve({ success: true, statusCode: res.statusCode });
    });
    
    req.on('error', (error) => {
      console.error(`❌ ${target.name} 请求失败: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      console.error(`❌ ${target.name} 请求超时`);
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
    
    req.end();
  });
}

// Ping 测试
function pingTest(host) {
  return new Promise((resolve) => {
    console.log(`正在 ping ${host}...`);
    
    // 根据操作系统选择合适的 ping 命令
    const pingCmd = process.platform === 'win32' 
      ? `ping -n 4 ${host}`
      : `ping -c 4 ${host}`;
    
    exec(pingCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Ping ${host} 失败: ${error.message}`);
        resolve({ success: false, error: error.message });
        return;
      }
      
      console.log(`✅ Ping ${host} 结果:`);
      console.log(stdout);
      resolve({ success: true, output: stdout });
    });
  });
}

// 运行所有测试
async function runNetworkDiagnostics() {
  console.log('开始网络诊断...\n');
  
  // 检查网络接口
  console.log('=== 网络接口信息 ===');
  exec('ipconfig', (error, stdout, stderr) => {
    if (error) {
      console.error(`执行 ipconfig 出错: ${error.message}`);
      return;
    }
    
    // 只显示包含 IPv4 的行
    const ipv4Lines = stdout.split('\n')
      .filter(line => line.includes('IPv4') || line.includes('适配器'))
      .join('\n');
    
    console.log(ipv4Lines);
  });
  
  // DNS 解析测试
  console.log('\n=== DNS 解析测试 ===');
  for (const target of targets) {
    await testDnsResolution(target.host);
  }
  
  // Ping 测试
  console.log('\n=== Ping 测试 ===');
  for (const target of targets) {
    await pingTest(target.host);
  }
  
  // HTTP 请求测试
  console.log('\n=== HTTP 请求测试 ===');
  for (const target of targets) {
    await testHttpRequest(target);
  }
  
  console.log('\n诊断完成');
}

// 运行诊断
runNetworkDiagnostics().catch(err => {
  console.error('诊断过程中出错:', err);
}); 
// 检查Supabase项目是否存在
const https = require('https');

// Supabase项目ID和API密钥 - 硬编码凭据
const projectRef = 'onfplwhsmtvmkssyisot';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnBsd2hzbXR2bWtzc3lpc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjM3NzksImV4cCI6MjA2MjAzOTc3OX0.HwC1mqTWDtwOCDm1zufyyA9Xrg2pgVOElxx2JX9z9Bs';

// 发送HTTP请求检查项目是否存在
function checkProjectExists(projectRef) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/',
      method: 'GET',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`状态码: ${res.statusCode}`);
      
      // 收集响应数据
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // 响应结束
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 401) {
          // 401是正常的，因为我们没有提供API密钥
          console.log('✅ Supabase项目存在!');
          resolve(true);
        } else {
          console.log(`❌ 项目检查失败: ${res.statusCode}`);
          console.log('响应数据:', data);
          resolve(false);
        }
      });
    });
    
    // 错误处理
    req.on('error', (error) => {
      console.error(`❌ 请求错误: ${error.message}`);
      if (error.code === 'ENOTFOUND') {
        console.error('项目不存在或域名无法解析');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('请求超时，可能是网络问题');
      }
      resolve(false);
    });
    
    // 设置超时
    req.on('timeout', () => {
      console.error('请求超时');
      req.destroy();
      resolve(false);
    });
    
    // 发送请求
    req.end();
  });
}

// 检查API密钥是否有效
function checkApiKey(projectRef, apiKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/users?select=count',
      method: 'GET',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    };

    const req = https.request(options, (res) => {
      console.log(`API密钥检查状态码: ${res.statusCode}`);
      
      // 收集响应数据
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // 响应结束
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ API密钥有效!');
          resolve(true);
        } else {
          console.log(`❌ API密钥无效: ${res.statusCode}`);
          console.log('响应数据:', data);
          resolve(false);
        }
      });
    });
    
    // 错误处理
    req.on('error', (error) => {
      console.error(`❌ API密钥检查错误: ${error.message}`);
      resolve(false);
    });
    
    // 设置超时
    req.on('timeout', () => {
      console.error('API密钥检查超时');
      req.destroy();
      resolve(false);
    });
    
    // 发送请求
    req.end();
  });
}

// 运行检查
async function runChecks() {
  console.log('检查Supabase项目...');
  console.log(`项目ID: ${projectRef}`);
  console.log(`API密钥 (前10位): ${apiKey.substring(0, 10)}...`);
  
  const projectExists = await checkProjectExists(projectRef);
  
  if (projectExists) {
    await checkApiKey(projectRef, apiKey);
  }
  
  console.log('检查完成');
}

runChecks(); 
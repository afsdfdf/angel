// 测试不同的Supabase项目
const { createClient } = require('@supabase/supabase-js');

// 要测试的Supabase项目列表
const projects = [
  {
    name: '原始项目',
    url: 'https://onfplwhsmtvmkssyisot.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnBsd2hzbXR2bWtzc3lpc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5MDQ3MjAsImV4cCI6MjAzMzQ4MDcyMH0.Nh1ygL-IVDxIXmNs8QfVfIQrRJUQyWzXYoVpkZLgDCE'
  },
  {
    name: '替代项目1',
    url: 'https://vdpjvbmcuqpqkjdkxvxu.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcGp2Ym1jdXFwcWtqZGt4dnh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5MDQ3MjAsImV4cCI6MjAzMzQ4MDcyMH0.Nh1ygL-IVDxIXmNs8QfVfIQrRJUQyWzXYoVpkZLgDCE'
  },
  {
    name: '替代项目2',
    url: 'https://xyzabcdefghijklmnopq.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZmdoaWprbG1ub3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5MDQ3MjAsImV4cCI6MjAzMzQ4MDcyMH0.Nh1ygL-IVDxIXmNs8QfVfIQrRJUQyWzXYoVpkZLgDCE'
  }
];

// 测试Supabase项目
async function testProject(project) {
  console.log(`\n=== 测试项目: ${project.name} ===`);
  console.log(`URL: ${project.url}`);
  console.log(`Key (前10位): ${project.key.substring(0, 10)}...`);
  
  try {
    // 创建Supabase客户端
    const supabase = createClient(project.url, project.key);
    
    // 测试连接
    console.log('尝试连接...');
    const { data, error } = await supabase.from('users').select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ 连接失败:', error);
      return false;
    }
    
    console.log('✅ 连接成功!');
    return true;
  } catch (error) {
    console.error('❌ 连接异常:', error);
    return false;
  }
}

// 测试直接HTTP请求
async function testDirectHttp(project) {
  console.log(`\n=== 测试直接HTTP请求: ${project.name} ===`);
  
  try {
    const fetch = require('cross-fetch');
    const response = await fetch(`${project.url}/rest/v1/users?select=count`, {
      headers: {
        'apikey': project.key,
        'Authorization': `Bearer ${project.key}`
      }
    });
    
    console.log('HTTP状态码:', response.status);
    
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
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试Supabase项目...\n');
  
  for (const project of projects) {
    await testDirectHttp(project);
    await testProject(project);
  }
  
  console.log('\n测试完成');
}

// 安装依赖
try {
  require('cross-fetch');
} catch (error) {
  console.log('正在安装cross-fetch...');
  require('child_process').execSync('pnpm add cross-fetch');
  console.log('cross-fetch安装完成');
}

runTests().catch(error => {
  console.error('测试过程中出错:', error);
  process.exit(1);
}); 
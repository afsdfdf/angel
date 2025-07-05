const fs = require('fs');
const path = require('path');

// 环境变量模板
const envTemplate = `# 数据库配置 (使用Supabase作为第三方API数据库)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 钱包连接配置
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# NextAuth配置
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# 应用配置
NEXT_PUBLIC_APP_NAME=Angel Crypto App
NEXT_PUBLIC_APP_URL=http://localhost:3001
`;

// 检查.env.local是否存在
const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local 文件已存在');
  console.log('请确保已填入正确的环境变量值');
} else {
  console.log('📝 创建 .env.local 文件...');
  try {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ .env.local 文件已创建');
    console.log('📋 请编辑 .env.local 文件并填入以下信息：');
    console.log('');
    console.log('1. Supabase 配置:');
    console.log('   - 访问 https://supabase.com/ 创建项目');
    console.log('   - 获取项目 URL 和 API 密钥');
    console.log('   - 填入 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('');
    console.log('2. WalletConnect 配置:');
    console.log('   - 访问 https://cloud.walletconnect.com/ 创建项目');
    console.log('   - 获取 Project ID');
    console.log('   - 填入 NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');
    console.log('');
    console.log('3. NextAuth 配置:');
    console.log('   - 生成一个随机的 NEXTAUTH_SECRET');
    console.log('   - 可以使用: openssl rand -base64 32');
    console.log('');
  } catch (error) {
    console.error('❌ 创建 .env.local 文件失败:', error.message);
  }
}

console.log('');
console.log('🚀 设置完成后，运行以下命令启动开发服务器：');
console.log('   npm run dev');
console.log('');
console.log('📖 更多详细信息请查看 AUTH_SETUP_GUIDE.md'); 
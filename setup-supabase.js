// Supabase项目设置指南
console.log(`
==============================================
          Supabase项目设置指南
==============================================

1. 访问 https://supabase.com 并登录您的账户

2. 创建新项目:
   - 点击 "New Project"
   - 选择组织
   - 输入项目名称 (例如: "angel-crypto-app")
   - 设置数据库密码 (请妥善保存)
   - 选择离您最近的区域
   - 点击 "Create new project"

3. 等待项目创建完成 (约需1-2分钟)

4. 获取API凭据:
   - 在项目仪表板中，点击左侧导航栏中的 "Settings"
   - 点击 "API"
   - 复制 "Project URL" 和 "anon public" 密钥

5. 更新项目配置:
   - 创建 .env.local 文件 (复制 env.example)
   - 填入您的Supabase URL和anon key
   - 或者直接更新 lib/config.ts 文件

6. 运行数据库初始化脚本:
   - 在Supabase仪表板中，点击 "SQL Editor"
   - 创建新查询
   - 粘贴并运行 database-setup.sql 文件中的内容

7. 测试连接:
   - 运行 node check-supabase.js
   - 确保显示 "API密钥有效!"

==============================================
`);

// 创建示例.env.local文件内容
const fs = require('fs');

const envExample = `# Supabase配置
# 请替换为您的实际Supabase项目URL和密钥
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 区块链配置
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_NETWORK_NAME=BSC Testnet
`;

// 写入示例.env.local文件
try {
  if (!fs.existsSync('.env.local')) {
    fs.writeFileSync('.env.local.example', envExample);
    console.log('已创建示例配置文件: .env.local.example');
    console.log('请将其复制为.env.local并填入您的实际Supabase凭据');
  } else {
    console.log('文件.env.local已存在，未覆盖');
  }
} catch (error) {
  console.error('创建示例配置文件失败:', error);
} 
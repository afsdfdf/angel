/**
 * Supabase 连接问题修复脚本
 * 
 * 此脚本用于解决与 Supabase 的连接问题，尤其是在存在代理的环境中
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 检查代理设置
function checkProxySettings() {
  console.log('\n=== 检查代理设置 ===');
  
  // 检查环境变量中的代理设置
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
      console.log(`发现代理环境变量: ${varName}=${process.env[varName]}`);
      hasProxy = true;
    }
  });
  
  if (!hasProxy) {
    console.log('未在环境变量中发现代理设置');
  }
  
  // 在 Windows 上检查系统代理设置
  if (process.platform === 'win32') {
    try {
      const stdout = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable').toString();
      const proxyEnabled = stdout.includes('0x1');
      
      if (proxyEnabled) {
        console.log('⚠️ Windows 系统代理已启用，这可能会影响连接');
        
        try {
          const proxyServerStdout = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer').toString();
          const match = proxyServerStdout.match(/ProxyServer\s+REG_SZ\s+(.*)/);
          if (match && match[1]) {
            console.log(`系统代理服务器: ${match[1]}`);
          }
        } catch (e) {
          console.log('无法获取代理服务器地址');
        }
        
        return { hasProxy: true, proxyEnabled };
      } else {
        console.log('✅ Windows 系统代理未启用');
      }
    } catch (e) {
      console.log('无法检查 Windows 代理设置:', e.message);
    }
  }
  
  return { hasProxy, proxyEnabled: false };
}

// 创建 SQL 文件
function createSqlFiles() {
  console.log('\n=== 创建必要的 SQL 函数 ===');
  
  const healthCheckSql = `
-- 创建数据库健康检查函数
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS BOOLEAN AS $$
BEGIN
  -- 简单返回 true 表示数据库连接正常
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  -- 如果发生任何错误，返回 false
  RETURN false;
END;
$$ LANGUAGE plpgsql;
`;

  const userExistsSql = `
-- 创建检查用户是否存在的函数
CREATE OR REPLACE FUNCTION is_user_exists(wallet TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- 检查用户是否存在
  SELECT EXISTS (
    SELECT 1 FROM users WHERE wallet_address = wallet
  ) INTO user_exists;
  
  RETURN user_exists;
EXCEPTION WHEN OTHERS THEN
  -- 如果发生任何错误，返回 false
  RETURN false;
END;
$$ LANGUAGE plpgsql;
`;

  const getUserDataSql = `
-- 创建安全的用户数据获取函数
CREATE OR REPLACE FUNCTION get_user_data(wallet_addr TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'wallet_address', wallet_address,
    'username', username,
    'email', email,
    'avatar_url', avatar_url,
    'referred_by', referred_by,
    'invites_count', invites_count,
    'angel_balance', angel_balance,
    'total_earned', total_earned,
    'level', level,
    'is_active', is_active,
    'is_admin', is_admin,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result
  FROM users
  WHERE wallet_address = wallet_addr;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

  try {
    fs.writeFileSync('check-database-health.sql', healthCheckSql);
    fs.writeFileSync('is-user-exists.sql', userExistsSql);
    fs.writeFileSync('get-user-data.sql', getUserDataSql);
    console.log('✅ SQL 函数文件已创建');
  } catch (err) {
    console.error('❌ 创建 SQL 文件失败:', err);
  }
}

// 修复连接问题
function fixConnectionIssues() {
  console.log('\n=== 修复 Supabase 连接问题 ===');
  
  // 1. 检测代理问题
  const { hasProxy, proxyEnabled } = checkProxySettings();
  
  // 2. 创建必要的 SQL 函数
  createSqlFiles();
  
  // 3. 提供解决方案
  console.log('\n=== 解决方案 ===');
  
  if (proxyEnabled) {
    console.log(`
1. 代理问题解决:
   - 临时方案: 使用应用程序时禁用系统代理
     * 打开 Windows 设置 > 网络和 Internet > 代理
     * 关闭"使用代理服务器"选项
     
   - 长期方案: 将 Supabase 域名添加到代理排除列表
     * 打开 Windows 设置 > 网络和 Internet > 代理
     * 在"不将代理服务器用于本地地址"框中勾选
     * 添加 *.supabase.co 到排除列表
    `);
  }
  
  console.log(`
2. 安全访问模式:
   - 上传创建的 SQL 函数到 Supabase SQL 编辑器并运行
   - 修改前端代码，使用 RPC 函数而非直接查询 users 表
   - 对于管理功能，实现服务器端 API 并使用 service_role 密钥
  `);
  
  console.log(`
3. 更新环境配置:
   - 确保 .env.local 文件包含正确的 Supabase URL 和 API 密钥
   - 确保 service_role 密钥仅在服务器端使用，不要在客户端暴露
  `);
  
  console.log('\n要应用这些解决方案吗? (y/n)');
}

// 主函数
function main() {
  console.log('Supabase 连接问题修复工具');
  console.log('=========================\n');
  
  fixConnectionIssues();
  
  rl.question('', (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('\n正在应用解决方案...');
      
      // 检查是否已安装必要的依赖
      try {
        console.log('检查依赖...');
        execSync('npm list @supabase/supabase-js');
        console.log('✅ Supabase 依赖已安装');
      } catch (e) {
        console.log('❌ Supabase 依赖未安装，正在安装...');
        execSync('npm install @supabase/supabase-js');
      }
      
      console.log(`
解决方案应用完成。请按照以下步骤操作:

1. 上传 SQL 函数到 Supabase:
   - 登录 Supabase 管理控制台
   - 转到 "SQL Editor" 选项
   - 依次运行创建的 SQL 函数文件

2. 修改前端代码:
   - 使用 RPC 函数而不是直接查询敏感表
   - 实现服务器端 API 进行特权操作

3. 如果使用系统代理，请暂时禁用或配置排除规则
`);
    } else {
      console.log('\n已取消应用解决方案。');
    }
    
    rl.close();
  });
}

// 运行主函数
main(); 
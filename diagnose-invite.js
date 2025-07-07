// 邀请系统诊断脚本
require('dotenv').config();
const { DatabaseService } = require('./lib/database');

async function diagnoseInviteSystem() {
  console.log('🔍 开始诊断邀请系统...');
  
  try {
    // 1. 检查数据库连接
    console.log('\n1. 检查数据库连接');
    const isHealthy = await DatabaseService.isHealthy();
    console.log(`数据库连接状态: ${isHealthy ? '✅ 正常' : '❌ 异常'}`);
    
    if (!isHealthy) {
      console.log('❌ 数据库连接失败，无法继续诊断');
      return;
    }
    
    // 2. 运行邀请函数诊断
    console.log('\n2. 诊断邀请函数');
    const result = await DatabaseService.diagnoseInviteFunction();
    
    console.log('\n📊 诊断结果摘要:');
    console.log(`- 数据库连接: ${result.summary?.databaseConnected ? '✅ 正常' : '❌ 异常'}`);
    console.log(`- 函数存在: ${result.summary?.functionExists ? '✅ 是' : '❌ 否'}`);
    console.log(`- 函数可调用: ${result.summary?.functionCallable ? '✅ 是' : '❌ 否'}`);
    console.log(`- 相关表存在: ${result.summary?.tablesExist ? '✅ 是' : '❌ 否'}`);
    
    // 3. 检查详细信息
    if (!result.summary?.functionExists) {
      console.log('\n❌ 邀请处理函数不存在，这是邀请系统无法工作的主要原因');
      console.log('建议: 运行数据库初始化脚本 database-update-invite-system.sql');
    }
    
    if (!result.summary?.functionCallable && result.summary?.functionExists) {
      console.log('\n❌ 邀请处理函数存在但无法调用，可能是权限问题或函数定义有误');
      console.log('函数调用错误:', result.testCallError);
    }
    
    // 4. 输出完整诊断结果
    console.log('\n📋 完整诊断结果:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error);
  }
}

// 执行诊断
diagnoseInviteSystem().catch(console.error); 
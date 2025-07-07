/**
 * MongoDB初始化脚本
 * 用于创建集合和索引，导入初始数据
 */
const { MongoClient } = require('mongodb');

// 从临时环境文件获取配置
const config = require('../temp-env');

// 从环境变量获取MongoDB连接URI
const uri = config.MONGODB_URI || "mongodb://localhost:27017/angel-crypto";
const dbName = config.MONGODB_DB_NAME || "angel-crypto";

console.log('使用连接字符串:', uri.replace(/\/\/([^:]+):[^@]+@/, '//\$1:****@'));
console.log('数据库名称:', dbName);

async function initializeDatabase() {
  console.log('开始初始化MongoDB数据库...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ 成功连接到MongoDB');
    
    const db = client.db(dbName);
    
    // 创建集合（相当于SQL中的表）
    console.log('创建集合...');
    
    try {
      await db.createCollection('users');
      console.log('- 创建users集合成功');
    } catch (err) {
      if (err.codeName === 'NamespaceExists') {
        console.log('- users集合已存在');
      } else {
        throw err;
      }
    }
    
    try {
      await db.createCollection('invitations');
      console.log('- 创建invitations集合成功');
    } catch (err) {
      if (err.codeName === 'NamespaceExists') {
        console.log('- invitations集合已存在');
      } else {
        throw err;
      }
    }
    
    try {
      await db.createCollection('reward_records');
      console.log('- 创建reward_records集合成功');
    } catch (err) {
      if (err.codeName === 'NamespaceExists') {
        console.log('- reward_records集合已存在');
      } else {
        throw err;
      }
    }
    
    // 创建索引
    console.log('\n创建索引...');
    
    // users集合索引
    console.log('为users集合创建索引...');
    await db.collection('users').createIndex({ "wallet_address": 1 }, { unique: true });
    console.log('- wallet_address唯一索引创建成功');
    
    await db.collection('users').createIndex({ "referred_by": 1 });
    console.log('- referred_by索引创建成功');
    
    // invitations集合索引
    console.log('\n为invitations集合创建索引...');
    await db.collection('invitations').createIndex({ "inviter_id": 1 });
    console.log('- inviter_id索引创建成功');
    
    await db.collection('invitations').createIndex({ "invitee_id": 1 });
    console.log('- invitee_id索引创建成功');
    
    await db.collection('invitations').createIndex({ "inviter_wallet_address": 1 });
    console.log('- inviter_wallet_address索引创建成功');
    
    await db.collection('invitations').createIndex({ "invitee_wallet_address": 1 });
    console.log('- invitee_wallet_address索引创建成功');
    
    // reward_records集合索引
    console.log('\n为reward_records集合创建索引...');
    await db.collection('reward_records').createIndex({ "user_id": 1 });
    console.log('- user_id索引创建成功');
    
    await db.collection('reward_records').createIndex({ "related_user_id": 1 });
    console.log('- related_user_id索引创建成功');
    
    // 创建示例管理员用户（如果不存在）
    console.log('\n检查管理员用户...');
    const adminWallet = '0xadmin';
    const adminExists = await db.collection('users').findOne({ wallet_address: adminWallet });
    
    if (!adminExists) {
      console.log('创建管理员用户...');
      const now = new Date().toISOString();
      
      await db.collection('users').insertOne({
        wallet_address: adminWallet,
        username: '管理员',
        email: 'admin@example.com',
        invites_count: 0,
        angel_balance: 1000,
        total_earned: 1000,
        level: 10,
        is_active: true,
        is_admin: true,
        created_at: now,
        updated_at: now
      });
      
      console.log('✅ 管理员用户创建成功');
    } else {
      console.log('管理员用户已存在，跳过创建');
    }
    
    console.log('\n✨ 数据库初始化完成');
    
  } catch (err) {
    console.error('❌ 数据库初始化失败:', err);
  } finally {
    await client.close();
    console.log('已关闭数据库连接');
  }
}

// 执行初始化
initializeDatabase()
  .catch(console.error); 
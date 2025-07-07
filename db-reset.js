// 数据库重置和初始化脚本
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 从环境变量或.env文件获取连接信息
// 请替换为您的Supabase数据库连接信息
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:your_password@db.onfplwhsmtvmkssyisot.supabase.co:5432/postgres';

// 创建连接池
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// 读取SQL文件
const readSqlFile = (filename) => {
  return fs.readFileSync(path.join(__dirname, filename), 'utf8');
};

// 执行SQL
const executeSql = async (sql) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('SQL执行成功');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('SQL执行失败:', err);
    throw err;
  } finally {
    client.release();
  }
};

// 主函数
const main = async () => {
  try {
    console.log('开始重置数据库...');
    
    // 执行重置脚本
    const resetSql = readSqlFile('reset-database.sql');
    await executeSql(resetSql);
    console.log('数据库重置完成');
    
    // 执行初始化脚本
    const initSql = readSqlFile('angel-crypto-database-complete.sql');
    await executeSql(initSql);
    console.log('数据库初始化完成');
    
    // 验证表是否创建成功
    const client = await pool.connect();
    try {
      const { rows } = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log('创建的表:');
      rows.forEach(row => console.log(`- ${row.table_name}`));
      
      // 验证函数是否创建成功
      const { rows: functions } = await client.query(`
        SELECT proname 
        FROM pg_proc 
        WHERE proname LIKE '%invite%'
      `);
      console.log('\n创建的邀请函数:');
      functions.forEach(func => console.log(`- ${func.proname}`));
      
    } finally {
      client.release();
    }
    
  } catch (err) {
    console.error('执行过程中出错:', err);
  } finally {
    await pool.end();
  }
};

// 执行主函数
main(); 
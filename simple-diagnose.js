// 简单诊断脚本
const { createClient } = require('@supabase/supabase-js');

// 硬编码的 Supabase 配置
const config = {
  supabase: {
    url: 'https://onfplwhsmtvmkssyisot.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnBsd2hzbXR2bWtzc3lpc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjM3NzksImV4cCI6MjA2MjAzOTc3OX0.HwC1mqTWDtwOCDm1zufyyA9Xrg2pgVOElxx2JX9z9Bs'
  }
};

console.log('Current directory:', __dirname);

async function simpleDiagnose() {
  console.log('Starting simple diagnostic...');
  
  // 检查配置
  console.log('Supabase URL:', config.supabase.url ? 'Exists' : 'Missing');
  console.log('Supabase Key:', config.supabase.anonKey ? 'Exists' : 'Missing');
  
  // 如果配置存在，尝试连接
  if (config.supabase.url && config.supabase.anonKey) {
    try {
      const supabase = createClient(config.supabase.url, config.supabase.anonKey);
      console.log('Supabase client created');
      
      // 尝试简单查询 - 使用正确的查询语法
      const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Database query error:', error);
        
        // 尝试另一种方式查询
        console.log('Trying alternative query...');
        const { data: data2, error: error2 } = await supabase.from('users').select('id').limit(1);
        
        if (error2) {
          console.error('Alternative query error:', error2);
        } else {
          console.log('Alternative query successful');
          console.log('Query result:', data2);
        }
      } else {
        console.log('Database connected successfully');
        console.log('User count:', count);
        
        // 检查函数是否存在
        try {
          console.log('Checking if process_invite_registration function exists...');
          const { data: funcData, error: funcError } = await supabase.rpc('process_invite_registration', {
            new_user_wallet: '0x0000000000000000000000000000000000000001',
            inviter_wallet: '0x0000000000000000000000000000000000000002'
          });
          
          if (funcError) {
            console.error('Function error:', funcError);
          } else {
            console.log('Function exists and returned:', funcData);
          }
        } catch (funcErr) {
          console.error('Function test error:', funcErr);
        }
      }
    } catch (err) {
      console.error('Error connecting to Supabase:', err);
    }
  } else {
    console.log('Supabase configuration is missing or incomplete');
  }
  
  console.log('Diagnostic complete');
}

try {
  simpleDiagnose().catch(err => console.error('Top level error:', err));
} catch (err) {
  console.error('Error starting diagnostic:', err);
} 
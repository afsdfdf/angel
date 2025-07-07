/**
 * Supabase 配置文件 - 硬编码环境变量
 * 
 * 注意: 在实际生产环境中，应该使用环境变量而不是硬编码敏感信息
 * 这里仅用于临时解决连接问题
 */

export const supabaseConfig = {
  // Supabase URLs
  url: "https://onfplwhsmtvmkssyisot.supabase.co",
  
  // API Keys
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnBsd2hzbXR2bWtzc3lpc290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjM3NzksImV4cCI6MjA2MjAzOTc3OX0.HwC1mqTWDtwOCDm1zufyyA9Xrg2pgVOElxx2JX9z9Bs",
  serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnBsd2hzbXR2bWtzc3lpc290Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQ2Mzc3OSwiZXhwIjoyMDYyMDM5Nzc5fQ.xM932YAR42tU6Qb2dDIsjom8UPB7IHfM24tLXJNUPKA",
  jwtSecret: "TN4DqSx2NA5YciF1AZe5w2EYFTW4qiI9aJiJ7FopBRcyiUeHel6w8Xfb6IvUnJc2aO2Ch5CdeR92+HSClonnUg==",
  
  // PostgreSQL 连接信息
  postgres: {
    host: "db.onfplwhsmtvmkssyisot.supabase.co",
    user: "postgres",
    password: "28aafccCAweapmpy",
    database: "postgres",
    url: "postgres://postgres.onfplwhsmtvmkssyisot:28aafccCAweapmpy@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x",
    prismaUrl: "postgres://postgres.onfplwhsmtvmkssyisot:28aafccCAweapmpy@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x",
    nonPoolingUrl: "postgres://postgres.onfplwhsmtvmkssyisot:28aafccCAweapmpy@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
  },
  
  // 客户端连接选项 - 解决代理问题
  clientOptions: {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-client-info': 'angel-crypto-app'
      }
    }
  }
}; 
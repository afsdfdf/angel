import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// 数据库诊断工具
export class DatabaseDiagnostics {
  private static supabase = createClient(
    config.supabase.url,
    config.supabase.anonKey
  );

  // 检查数据库连接
  static async checkConnection(): Promise<{
    success: boolean;
    error?: string;
    details?: any;
  }> {
    try {
      console.log('🔍 检查数据库连接...');
      
      // 测试基本连接
      const { data, error } = await this.supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        return {
          success: false,
          error: error.message,
          details: {
            code: error.code,
            details: error.details,
            hint: error.hint
          }
        };
      }
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        details: { stack: error.stack }
      };
    }
  }

  // 检查表结构
  static async checkTableStructure(): Promise<{
    success: boolean;
    tables: string[];
    missingTables: string[];
    errors: string[];
  }> {
    const requiredTables = ['users', 'invitations', 'reward_records', 'user_sessions'];
    const results = {
      success: true,
      tables: [] as string[],
      missingTables: [] as string[],
      errors: [] as string[]
    };

    for (const tableName of requiredTables) {
      try {
        const { error } = await this.supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === '42P01') {
            // 表不存在
            results.missingTables.push(tableName);
            results.success = false;
          } else {
            results.errors.push(`${tableName}: ${error.message}`);
            results.success = false;
          }
        } else {
          results.tables.push(tableName);
        }
      } catch (error: any) {
        results.errors.push(`${tableName}: ${error.message}`);
        results.success = false;
      }
    }

    return results;
  }

  // 检查RLS策略
  static async checkRLSPolicies(): Promise<{
    success: boolean;
    policies: Record<string, any>;
    errors: string[];
  }> {
    const results = {
      success: true,
      policies: {} as Record<string, any>,
      errors: [] as string[]
    };

    const tables = ['users', 'invitations', 'reward_records', 'user_sessions'];

    for (const tableName of tables) {
      try {
        // 测试查询权限
        const { data: selectData, error: selectError } = await this.supabase
          .from(tableName)
          .select('*')
          .limit(1);

        // 测试插入权限（仅对users表）
        let insertResult = null;
        if (tableName === 'users') {
          const testUser = {
            wallet_address: 'test_wallet_' + Date.now(),
            username: 'test_user_' + Date.now()
          };
          
          const { data: insertData, error: insertError } = await this.supabase
            .from(tableName)
            .insert(testUser)
            .select()
            .single();
          
          insertResult = { data: insertData, error: insertError };
          
          // 清理测试数据
          if (insertData) {
            await this.supabase.from(tableName).delete().eq('id', insertData.id);
          }
        }

        results.policies[tableName] = {
          can_select: !selectError,
          can_insert: tableName === 'users' ? !insertResult?.error : 'not_tested',
          select_error: selectError?.message,
          insert_error: tableName === 'users' ? insertResult?.error?.message : null
        };

        if (selectError) {
          results.errors.push(`${tableName} 查询失败: ${selectError.message}`);
          results.success = false;
        }
        
        if (tableName === 'users' && insertResult?.error) {
          results.errors.push(`${tableName} 插入失败: ${insertResult.error.message}`);
          results.success = false;
        }
      } catch (error: any) {
        results.errors.push(`${tableName}: ${error.message}`);
        results.success = false;
      }
    }

    return results;
  }

  // 测试用户创建功能
  static async testUserCreation(): Promise<{
    success: boolean;
    user?: any;
    error?: string;
  }> {
    try {
      const testWallet = 'test_wallet_' + Date.now();
      const testUser = {
        wallet_address: testWallet,
        username: 'test_user_' + Date.now(),
        angel_balance: 100.00
      };
      
      const { data, error } = await this.supabase
        .from('users')
        .insert(testUser)
        .select()
        .single();
      
      if (error) {
        return { 
          success: false, 
          error: `创建用户失败: ${error.message}` 
        };
      }
      
      if (!data) {
        return { 
          success: false, 
          error: '创建用户返回null' 
        };
      }
      
      // 清理测试数据
      await this.supabase.from('users').delete().eq('id', data.id);
      
      return { success: true, user: data };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }

  // 测试用户查询功能
  static async testUserQuery(): Promise<{
    success: boolean;
    users?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .limit(5);
      
      if (error) {
        return { 
          success: false, 
          error: `查询用户失败: ${error.message}` 
        };
      }
      
      return { success: true, users: data || [] };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }

  // 运行完整诊断
  static async runFullDiagnostics(): Promise<{
    connection: any;
    tables: any;
    policies: any;
    createUser: any;
    queryUsers: any;
    summary: {
      success: boolean;
      total: number;
      passed: number;
      failed: number;
      issues: string[];
      recommendations: string[];
    };
  }> {
    console.log('🔍 开始数据库完整诊断...');

    const connection = await this.checkConnection();
    const tables = await this.checkTableStructure();
    const policies = await this.checkRLSPolicies();
    const createUser = await this.testUserCreation();
    const queryUsers = await this.testUserQuery();

    const issues: string[] = [];
    const recommendations: string[] = [];
    let passed = 0;
    let failed = 0;

    // 分析连接问题
    if (connection.success) {
      passed++;
    } else {
      failed++;
      issues.push(`连接失败: ${connection.error}`);
      recommendations.push('检查环境变量配置');
      recommendations.push('确认Supabase项目状态');
    }

    // 分析表结构问题
    if (tables.success) {
      passed++;
    } else {
      failed++;
      if (tables.missingTables.length > 0) {
        issues.push(`缺少表: ${tables.missingTables.join(', ')}`);
        recommendations.push('运行数据库初始化脚本');
      }
      if (tables.errors.length > 0) {
        issues.push(`表错误: ${tables.errors.join('; ')}`);
      }
    }

    // 分析权限问题
    if (policies.success) {
      passed++;
    } else {
      failed++;
      issues.push(`权限问题: ${policies.errors.join('; ')}`);
      recommendations.push('检查RLS策略配置');
      recommendations.push('考虑临时禁用RLS进行测试');
    }

    // 分析用户创建测试
    if (createUser.success) {
      passed++;
    } else {
      failed++;
      issues.push(`用户创建失败: ${createUser.error}`);
      recommendations.push('检查users表的RLS策略');
      recommendations.push('确认表结构完整性');
    }

    // 分析用户查询测试
    if (queryUsers.success) {
      passed++;
    } else {
      failed++;
      issues.push(`用户查询失败: ${queryUsers.error}`);
      recommendations.push('检查users表的查询权限');
    }

    const summary = {
      success: connection.success && tables.success && policies.success && createUser.success && queryUsers.success,
      total: 5,
      passed,
      failed,
      issues,
      recommendations
    };

    console.log('📊 诊断结果:', {
      connection: connection.success ? '✅ 正常' : '❌ 失败',
      tables: tables.success ? '✅ 正常' : '❌ 失败',
      policies: policies.success ? '✅ 正常' : '❌ 失败',
      createUser: createUser.success ? '✅ 正常' : '❌ 失败',
      queryUsers: queryUsers.success ? '✅ 正常' : '❌ 失败',
      passed,
      failed,
      issues: issues.length,
      recommendations: recommendations.length
    });

    return {
      connection,
      tables,
      policies,
      createUser,
      queryUsers,
      summary
    };
  }

  // 获取环境信息
  static getEnvironmentInfo(): {
    supabaseUrl: string;
    supabaseKey: string;
    serviceRoleKey: string;
  } {
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '未设置',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置'
    };
  }
} 
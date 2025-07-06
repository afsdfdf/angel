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
    policies: Record<string, boolean>;
    errors: string[];
  }> {
    const results = {
      success: true,
      policies: {} as Record<string, boolean>,
      errors: [] as string[]
    };

    const tables = ['users', 'invitations', 'reward_records', 'user_sessions'];

    for (const tableName of tables) {
      try {
        // 尝试插入一条测试数据
        const { error } = await this.supabase
          .from(tableName)
          .insert([{
            // 最小化的测试数据
            ...(tableName === 'users' && {
              wallet_address: '0x0000000000000000000000000000000000000000',
              username: 'test_user'
            }),
            ...(tableName === 'invitations' && {
              inviter_id: '00000000-0000-0000-0000-000000000000',
              inviter_wallet_address: '0x0000000000000000000000000000000000000000'
            }),
            ...(tableName === 'reward_records' && {
              user_id: '00000000-0000-0000-0000-000000000000',
              reward_type: 'welcome',
              amount: 0
            }),
            ...(tableName === 'user_sessions' && {
              user_id: '00000000-0000-0000-0000-000000000000',
              wallet_address: '0x0000000000000000000000000000000000000000',
              session_token: 'test_token',
              expires_at: new Date(Date.now() + 3600000).toISOString()
            })
          }]);

        if (error) {
          if (error.code === '42501') {
            // 权限被拒绝 - RLS可能过于严格
            results.policies[tableName] = false;
            results.errors.push(`${tableName}: 权限被拒绝 - 可能需要调整RLS策略`);
          } else {
            results.policies[tableName] = true;
          }
        } else {
          results.policies[tableName] = true;
        }
      } catch (error: any) {
        results.errors.push(`${tableName}: ${error.message}`);
        results.success = false;
      }
    }

    return results;
  }

  // 运行完整诊断
  static async runFullDiagnostics(): Promise<{
    connection: any;
    tables: any;
    policies: any;
    summary: {
      success: boolean;
      issues: string[];
      recommendations: string[];
    };
  }> {
    console.log('🔍 开始数据库完整诊断...');

    const connection = await this.checkConnection();
    const tables = await this.checkTableStructure();
    const policies = await this.checkRLSPolicies();

    const issues: string[] = [];
    const recommendations: string[] = [];

    // 分析连接问题
    if (!connection.success) {
      issues.push(`连接失败: ${connection.error}`);
      recommendations.push('检查环境变量配置');
      recommendations.push('确认Supabase项目状态');
    }

    // 分析表结构问题
    if (!tables.success) {
      if (tables.missingTables.length > 0) {
        issues.push(`缺少表: ${tables.missingTables.join(', ')}`);
        recommendations.push('运行数据库初始化脚本');
      }
      if (tables.errors.length > 0) {
        issues.push(`表错误: ${tables.errors.join('; ')}`);
      }
    }

    // 分析权限问题
    const failedPolicies = Object.entries(policies.policies)
      .filter(([_, enabled]) => !enabled)
      .map(([table]) => table);

    if (failedPolicies.length > 0) {
      issues.push(`权限问题: ${failedPolicies.join(', ')}`);
      recommendations.push('检查RLS策略配置');
      recommendations.push('考虑临时禁用RLS进行测试');
    }

    const summary = {
      success: connection.success && tables.success && policies.success,
      issues,
      recommendations
    };

    console.log('📊 诊断结果:', {
      connection: connection.success ? '✅ 正常' : '❌ 失败',
      tables: tables.success ? '✅ 正常' : '❌ 失败',
      policies: policies.success ? '✅ 正常' : '❌ 失败',
      issues: issues.length,
      recommendations: recommendations.length
    });

    return {
      connection,
      tables,
      policies,
      summary
    };
  }
} 
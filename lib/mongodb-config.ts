// @ts-nocheck

/**
 * MongoDB Atlas 配置文件
 * 直接使用硬编码连接信息
 */

export const mongodbConfig = {
  // MongoDB连接URI (硬编码连接字符串)
  uri: "mongodb+srv://fortunaeduardo364:changcheng@cluster0.m6dnajo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  
  // 数据库名称
  dbName: "angel-crypto",
  
  // 连接选项
  options: {
    // 自动重连
    retryWrites: true,
    // 写入保证
    w: "majority",
    // 其他选项
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
}; 
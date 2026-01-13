/**
 * Config Center SDK 使用示例
 */

const ConfigClient = require('./index');

async function main() {
  // 初始化配置客户端
  const client = new ConfigClient({
    serverUrl: 'http://localhost:3000',
    serviceName: 'user-service',
    environment: 'dev'
  });
  
  try {
    // 初始化并加载配置
    await client.init();
    console.log('配置加载完成');
    
    // 获取配置值
    const dbHost = client.get('database.host', 'localhost');
    const dbPort = client.get('database.port', 3306);
    console.log(`数据库连接: ${dbHost}:${dbPort}`);
    
    // 获取所有配置
    const allConfigs = client.getAll();
    console.log('所有配置:', allConfigs);
    
    // 监听特定配置变更
    const unsubscribe = client.onChange('database.pool_size', (newValue, oldValue) => {
      console.log(`连接池大小变更: ${oldValue} -> ${newValue}`);
      // 在这里可以动态调整连接池
    });
    
    // 监听所有配置变更
    client.on('change', (event) => {
      console.log(`配置变更: ${event.key} = ${event.newValue}`);
    });
    
    // 保持程序运行以接收实时更新
    console.log('监听配置变更中... (Ctrl+C 退出)');
    
    // 模拟应用运行
    setInterval(() => {
      // 定期读取配置（配置会自动更新）
      const currentPoolSize = client.get('database.pool_size', 10);
      console.log(`当前连接池大小: ${currentPoolSize}`);
    }, 30000);
    
  } catch (error) {
    console.error('初始化失败:', error.message);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭...');
  process.exit(0);
});

main();

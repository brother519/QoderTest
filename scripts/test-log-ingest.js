const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1/logs/ingest';

const services = ['user-service', 'auth-service', 'payment-service', 'order-service'];
const levels = ['info', 'info', 'info', 'warn', 'error']; // info出现更频繁
const messages = [
  'User logged in successfully',
  'Database query completed',
  'Cache miss, fetching from database',
  'API request processed',
  'Connection timeout',
  'Database connection failed',
  'Payment processing error',
  'Authentication failed',
  'Invalid input data',
  'Service unavailable'
];

async function sendTestLog() {
  const log = {
    service: services[Math.floor(Math.random() * services.length)],
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    metadata: {
      host: `server-${Math.floor(Math.random() * 3) + 1}`,
      env: 'test'
    }
  };

  try {
    await axios.post(API_URL, log);
    console.log(`✓ 发送日志: [${log.level}] ${log.service} - ${log.message}`);
  } catch (error) {
    console.error(`✗ 发送失败:`, error.message);
  }
}

async function runTest() {
  console.log('开始生成测试日志...\n');

  // 发送100条日志
  for (let i = 0; i < 100; i++) {
    await sendTestLog();
    // 间隔100ms，避免过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n✓ 测试完成！已发送100条日志');
  console.log('请访问 http://localhost:8080 查看日志');
}

runTest().catch(console.error);

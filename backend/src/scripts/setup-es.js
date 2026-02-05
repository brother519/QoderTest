require('dotenv').config();
const esClient = require('../config/elasticsearch');
const fs = require('fs');
const path = require('path');

const logger = console;

async function setupElasticsearch() {
  try {
    logger.log('开始初始化Elasticsearch...');

    // 1. 创建ILM策略
    logger.log('创建ILM策略...');
    const ilmPolicy = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../elasticsearch/ilm-policies/logs-retention.json'), 'utf8')
    );
    
    await esClient.ilm.putLifecycle({
      name: 'logs-retention-policy',
      body: ilmPolicy
    });
    logger.log('✓ ILM策略创建成功');

    // 2. 创建日志索引模板
    logger.log('创建日志索引模板...');
    const logsTemplate = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../elasticsearch/index-templates/logs-template.json'), 'utf8')
    );
    
    await esClient.indices.putIndexTemplate({
      name: 'logs-template',
      body: logsTemplate
    });
    logger.log('✓ 日志索引模板创建成功');

    // 3. 创建告警规则索引模板
    logger.log('创建告警规则索引模板...');
    const alertsTemplate = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../elasticsearch/index-templates/alert-rules-template.json'), 'utf8')
    );
    
    await esClient.indices.putIndexTemplate({
      name: 'alert-rules-template',
      body: alertsTemplate
    });
    logger.log('✓ 告警规则索引模板创建成功');

    // 4. 创建初始日志索引
    logger.log('创建初始日志索引...');
    const indexExists = await esClient.indices.exists({ index: 'logs-000001' });
    
    if (!indexExists) {
      await esClient.indices.create({
        index: 'logs-000001',
        body: {
          aliases: {
            'logs-write': {
              is_write_index: true
            }
          }
        }
      });
      logger.log('✓ 初始日志索引创建成功');
    } else {
      logger.log('初始日志索引已存在，跳过');
    }

    // 5. 创建告警规则索引
    logger.log('创建告警规则索引...');
    const alertIndexExists = await esClient.indices.exists({ index: 'alert-rules' });
    
    if (!alertIndexExists) {
      await esClient.indices.create({ index: 'alert-rules' });
      logger.log('✓ 告警规则索引创建成功');
    } else {
      logger.log('告警规则索引已存在，跳过');
    }

    logger.log('\n✓ Elasticsearch初始化完成！');
    process.exit(0);
  } catch (error) {
    logger.error('Elasticsearch初始化失败:', error);
    process.exit(1);
  }
}

setupElasticsearch();

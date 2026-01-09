const esClient = require('../config/elasticsearch');
const logger = require('../utils/logger');

class ElasticsearchService {
  // 搜索日志
  async searchLogs(filters) {
    const {
      from,
      to,
      service,
      level,
      query,
      page = 1,
      size = 50
    } = filters;

    const must = [];

    // 时间范围过滤
    if (from || to) {
      const range = { '@timestamp': {} };
      if (from) range['@timestamp'].gte = from;
      if (to) range['@timestamp'].lte = to;
      must.push({ range });
    }

    // 服务名过滤
    if (service) {
      must.push({ term: { service } });
    }

    // 日志级别过滤
    if (level) {
      must.push({ term: { level } });
    }

    // 全文搜索
    if (query) {
      must.push({ match: { message: query } });
    }

    try {
      const result = await esClient.search({
        index: 'logs-*',
        body: {
          query: must.length > 0 ? { bool: { must } } : { match_all: {} },
          sort: [{ '@timestamp': 'desc' }],
          from: (page - 1) * size,
          size: Math.min(size, 1000)
        }
      });

      return {
        total: result.hits.total.value,
        logs: result.hits.hits.map(hit => ({ ...hit._source, _id: hit._id })),
        page,
        size
      };
    } catch (error) {
      logger.error('ES查询失败:', error);
      throw error;
    }
  }

  // 日志统计
  async getStats(filters) {
    const { from, to, service } = filters;

    const must = [];
    if (from || to) {
      const range = { '@timestamp': {} };
      if (from) range['@timestamp'].gte = from;
      if (to) range['@timestamp'].lte = to;
      must.push({ range });
    }
    if (service) {
      must.push({ term: { service } });
    }

    try {
      const result = await esClient.search({
        index: 'logs-*',
        body: {
          query: must.length > 0 ? { bool: { must } } : { match_all: {} },
          size: 0,
          aggs: {
            logs_over_time: {
              date_histogram: {
                field: '@timestamp',
                fixed_interval: '1h'
              }
            },
            by_level: {
              terms: { field: 'level' }
            },
            by_service: {
              terms: { field: 'service', size: 10 }
            }
          }
        }
      });

      return {
        timeline: result.aggregations.logs_over_time.buckets,
        byLevel: result.aggregations.by_level.buckets,
        byService: result.aggregations.by_service.buckets
      };
    } catch (error) {
      logger.error('ES统计查询失败:', error);
      throw error;
    }
  }

  // 获取所有告警规则
  async getAlertRules() {
    try {
      const result = await esClient.search({
        index: 'alert-rules',
        body: {
          query: { match_all: {} },
          size: 1000
        }
      });

      return result.hits.hits.map(hit => ({ ...hit._source, _id: hit._id }));
    } catch (error) {
      logger.error('获取告警规则失败:', error);
      return [];
    }
  }

  // 创建告警规则
  async createAlertRule(rule) {
    try {
      const result = await esClient.index({
        index: 'alert-rules',
        id: rule.rule_id,
        body: {
          ...rule,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });

      return result;
    } catch (error) {
      logger.error('创建告警规则失败:', error);
      throw error;
    }
  }

  // 更新告警规则
  async updateAlertRule(id, updates) {
    try {
      const result = await esClient.update({
        index: 'alert-rules',
        id,
        body: {
          doc: {
            ...updates,
            updated_at: new Date().toISOString()
          }
        }
      });

      return result;
    } catch (error) {
      logger.error('更新告警规则失败:', error);
      throw error;
    }
  }

  // 删除告警规则
  async deleteAlertRule(id) {
    try {
      await esClient.delete({
        index: 'alert-rules',
        id
      });
    } catch (error) {
      logger.error('删除告警规则失败:', error);
      throw error;
    }
  }
}

module.exports = new ElasticsearchService();

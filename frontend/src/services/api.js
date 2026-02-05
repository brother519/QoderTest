import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10000
})

export default {
  // 日志搜索
  searchLogs(params) {
    return apiClient.get('/logs/search', { params })
  },

  // 日志统计
  getStats(params) {
    return apiClient.get('/logs/stats', { params })
  },

  // 获取告警规则
  getAlertRules() {
    return apiClient.get('/alerts/rules')
  },

  // 创建告警规则
  createAlertRule(rule) {
    return apiClient.post('/alerts/rules', rule)
  },

  // 更新告警规则
  updateAlertRule(id, rule) {
    return apiClient.put(`/alerts/rules/${id}`, rule)
  },

  // 删除告警规则
  deleteAlertRule(id) {
    return apiClient.delete(`/alerts/rules/${id}`)
  },

  // 接收单条日志
  ingestLog(log) {
    return apiClient.post('/logs/ingest', log)
  }
}

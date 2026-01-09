<template>
  <div class="realtime-logs">
    <el-card>
      <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px">
        <el-select v-model="filters.service" placeholder="选择服务" multiple clearable style="width: 300px">
          <el-option label="user-service" value="user-service" />
          <el-option label="auth-service" value="auth-service" />
          <el-option label="payment-service" value="payment-service" />
        </el-select>
        <el-select v-model="filters.level" placeholder="选择级别" multiple clearable style="width: 200px">
          <el-option label="信息" value="info" />
          <el-option label="警告" value="warn" />
          <el-option label="错误" value="error" />
        </el-select>
        <el-input v-model="filters.keyword" placeholder="关键词过滤" clearable style="width: 200px" />
        <el-button type="primary" @click="startStreaming" :disabled="streaming">开始</el-button>
        <el-button @click="stopStreaming" :disabled="!streaming">停止</el-button>
        <el-button @click="clearLogs">清空</el-button>
        <el-switch v-model="autoScroll" active-text="自动滚动" />
      </div>
    </el-card>

    <el-card style="margin-top: 20px">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px">
        <span>共 {{ logs.length }} 条日志</span>
        <el-tag :type="streaming ? 'success' : 'info'">
          {{ streaming ? '连接中' : '已断开' }}
        </el-tag>
      </div>
      
      <div ref="logContainer" class="log-container">
        <div v-for="(log, index) in logs" :key="index" class="log-item" :class="`log-${log.level}`">
          <span class="log-time">{{ formatTime(log['@timestamp']) }}</span>
          <el-tag :type="getLevelType(log.level)" size="small" class="log-level">{{ log.level }}</el-tag>
          <span class="log-service">[{{ log.service }}]</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        <div v-if="logs.length === 0" class="empty-logs">
          等待日志数据...
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import ws from '../services/websocket'
import dayjs from 'dayjs'

const logs = ref([])
const streaming = ref(false)
const autoScroll = ref(true)
const logContainer = ref(null)

const filters = reactive({
  service: [],
  level: [],
  keyword: ''
})

const startStreaming = () => {
  logs.value = []
  streaming.value = true

  const subscribeFilters = {
    service: filters.service.length > 0 ? filters.service : undefined,
    level: filters.level.length > 0 ? filters.level : undefined,
    keyword: filters.keyword || undefined
  }

  ws.subscribe(subscribeFilters, (log) => {
    logs.value.push(log)
    
    // 限制最多显示1000条
    if (logs.value.length > 1000) {
      logs.value.shift()
    }

    if (autoScroll.value) {
      nextTick(() => scrollToBottom())
    }
  })

  ElMessage.success('已开始实时日志流')
}

const stopStreaming = () => {
  streaming.value = false
  ws.unsubscribe()
  ElMessage.info('已停止实时日志流')
}

const clearLogs = () => {
  logs.value = []
}

const scrollToBottom = () => {
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
}

const formatTime = (timestamp) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

const getLevelType = (level) => {
  const map = {
    info: 'info',
    warn: 'warning',
    error: 'danger'
  }
  return map[level] || 'info'
}

onUnmounted(() => {
  if (streaming.value) {
    ws.unsubscribe()
  }
})
</script>

<style scoped>
.realtime-logs {
  width: 100%;
}

.log-container {
  height: 600px;
  overflow-y: auto;
  background: #1e1e1e;
  padding: 15px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.log-item {
  padding: 5px 0;
  border-bottom: 1px solid #333;
  color: #ccc;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #888;
  margin-right: 10px;
}

.log-level {
  margin-right: 10px;
}

.log-service {
  color: #61afef;
  margin-right: 10px;
}

.log-message {
  color: #abb2bf;
}

.log-error .log-message {
  color: #e06c75;
}

.log-warn .log-message {
  color: #e5c07b;
}

.empty-logs {
  text-align: center;
  color: #666;
  padding: 50px;
  font-size: 16px;
}
</style>

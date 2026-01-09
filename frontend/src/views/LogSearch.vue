<template>
  <div class="log-search">
    <el-card>
      <el-form :model="filters" inline>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            @change="onDateRangeChange"
          />
        </el-form-item>
        <el-form-item label="服务名">
          <el-input v-model="filters.service" placeholder="请输入服务名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="日志级别">
          <el-select v-model="filters.level" placeholder="选择级别" clearable style="width: 150px">
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warn" />
            <el-option label="错误" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filters.query" placeholder="搜索关键词" clearable style="width: 250px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px">
      <el-table :data="logs" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="@timestamp" label="时间" width="180" />
        <el-table-column prop="service" label="服务名" width="150" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="消息" show-overflow-tooltip />
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @current-change="search"
        @size-change="search"
        style="margin-top: 20px"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../services/api'

const dateRange = ref([])
const filters = reactive({
  from: '',
  to: '',
  service: '',
  level: '',
  query: ''
})

const logs = ref([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  size: 50,
  total: 0
})

const onDateRangeChange = (val) => {
  if (val) {
    filters.from = val[0].toISOString()
    filters.to = val[1].toISOString()
  } else {
    filters.from = ''
    filters.to = ''
  }
}

const search = async () => {
  loading.value = true
  try {
    const params = {
      ...filters,
      page: pagination.page,
      size: pagination.size
    }
    
    // 移除空值
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key]
    })

    const { data } = await api.searchLogs(params)
    logs.value = data.logs
    pagination.total = data.total
  } catch (error) {
    ElMessage.error('搜索失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const reset = () => {
  dateRange.value = []
  filters.from = ''
  filters.to = ''
  filters.service = ''
  filters.level = ''
  filters.query = ''
  pagination.page = 1
  search()
}

const getLevelType = (level) => {
  const map = {
    info: 'info',
    warn: 'warning',
    error: 'danger'
  }
  return map[level] || 'info'
}

// 初始加载
search()
</script>

<style scoped>
.log-search {
  width: 100%;
}
</style>

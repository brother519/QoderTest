<template>
  <div class="alert-rules">
    <el-card>
      <el-button type="primary" @click="showCreateDialog">创建告警规则</el-button>
    </el-card>

    <el-card style="margin-top: 20px">
      <el-table :data="rules" stripe v-loading="loading">
        <el-table-column prop="name" label="规则名称" width="200" />
        <el-table-column label="条件" min-width="300">
          <template #default="{ row }">
            <div>
              <el-tag size="small">级别: {{ row.conditions.level || '全部' }}</el-tag>
              <el-tag size="small" style="margin-left: 5px">模式: {{ row.conditions.pattern || '无' }}</el-tag>
              <el-tag size="small" style="margin-left: 5px">阈值: {{ row.conditions.threshold }}次/{{ row.conditions.window }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="editRule(row)">编辑</el-button>
            <el-popconfirm title="确定删除此规则吗？" @confirm="deleteRule(row._id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑规则' : '创建规则'" width="600px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="规则名称">
          <el-input v-model="form.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="日志级别">
          <el-select v-model="form.conditions.level" placeholder="选择级别" clearable>
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warn" />
            <el-option label="错误" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务名">
          <el-input v-model="form.conditions.service" placeholder="服务名（可选）" clearable />
        </el-form-item>
        <el-form-item label="消息模式">
          <el-input v-model="form.conditions.pattern" placeholder="正则表达式，如：database.*error" />
        </el-form-item>
        <el-form-item label="阈值（次数）">
          <el-input-number v-model="form.conditions.threshold" :min="1" />
        </el-form-item>
        <el-form-item label="时间窗口">
          <el-select v-model="form.conditions.window">
            <el-option label="1分钟" value="1m" />
            <el-option label="5分钟" value="5m" />
            <el-option label="10分钟" value="10m" />
            <el-option label="30分钟" value="30m" />
            <el-option label="1小时" value="1h" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知邮箱">
          <el-input v-model="form.actions.email" placeholder="多个邮箱用逗号分隔" type="textarea" />
        </el-form-item>
        <el-form-item label="启用规则">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../services/api'

const rules = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref(null)

const form = reactive({
  name: '',
  enabled: true,
  conditions: {
    level: '',
    service: '',
    pattern: '',
    threshold: 1,
    window: '5m'
  },
  actions: {
    email: ''
  }
})

const loadRules = async () => {
  loading.value = true
  try {
    const { data } = await api.getAlertRules()
    rules.value = data.rules
  } catch (error) {
    ElMessage.error('加载规则失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const editRule = (rule) => {
  isEdit.value = true
  editingId.value = rule._id
  Object.assign(form, {
    name: rule.name,
    enabled: rule.enabled,
    conditions: { ...rule.conditions },
    actions: { ...rule.actions }
  })
  dialogVisible.value = true
}

const saveRule = async () => {
  try {
    if (isEdit.value) {
      await api.updateAlertRule(editingId.value, form)
      ElMessage.success('规则更新成功')
    } else {
      await api.createAlertRule(form)
      ElMessage.success('规则创建成功')
    }
    dialogVisible.value = false
    loadRules()
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  }
}

const deleteRule = async (id) => {
  try {
    await api.deleteAlertRule(id)
    ElMessage.success('规则删除成功')
    loadRules()
  } catch (error) {
    ElMessage.error('删除失败: ' + error.message)
  }
}

const resetForm = () => {
  form.name = ''
  form.enabled = true
  form.conditions = {
    level: '',
    service: '',
    pattern: '',
    threshold: 1,
    window: '5m'
  }
  form.actions = {
    email: ''
  }
}

onMounted(() => {
  loadRules()
})
</script>

<style scoped>
.alert-rules {
  width: 100%;
}
</style>

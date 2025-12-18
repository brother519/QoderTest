<script setup lang="ts">
import { ref } from 'vue'
import DraggableList from '@/components/business/DraggableList/index.vue'
import VirtualScroller from '@/components/business/VirtualScroller/index.vue'
import InfiniteScroll from '@/components/business/InfiniteScroll/index.vue'
import CaptchaInput from '@/components/business/CaptchaInput/index.vue'
import CodeEditor from '@/components/business/CodeEditor/index.vue'
import QrGenerator from '@/components/business/QrCode/QrGenerator.vue'
import QrScanner from '@/components/business/QrCode/QrScanner.vue'

const activeTab = ref('draggable')

const draggableItems = ref([
  { id: 1, name: '商品 A', price: 99 },
  { id: 2, name: '商品 B', price: 199 },
  { id: 3, name: '商品 C', price: 299 },
  { id: 4, name: '商品 D', price: 399 },
  { id: 5, name: '商品 E', price: 499 },
])

const virtualItems = ref(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `虚拟商品 ${i + 1}`,
    price: Math.floor(Math.random() * 1000),
  }))
)

const infiniteItems = ref<{ id: number; name: string }[]>([])
const infiniteLoading = ref(false)
const infiniteFinished = ref(false)
let infinitePage = 0

const loadMore = async () => {
  infiniteLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const newItems = Array.from({ length: 20 }, (_, i) => ({
    id: infinitePage * 20 + i + 1,
    name: `无限加载商品 ${infinitePage * 20 + i + 1}`,
  }))
  infiniteItems.value.push(...newItems)
  infinitePage++
  infiniteLoading.value = false
  if (infinitePage >= 5) infiniteFinished.value = true
}

const captchaValue = ref('')
const handleCaptchaComplete = (value: string) => {
  ElMessage.success(`验证码: ${value}`)
}

const codeValue = ref(`{
  "name": "商品配置",
  "price": 99.99,
  "tags": ["热销", "新品"],
  "enabled": true
}`)

const qrValue = ref('https://example.com/product/123')

const handleQrScanned = (value: string) => {
  ElMessage.success(`扫描结果: ${value}`)
}
</script>

<template>
  <div class="product-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品后台管理 - 功能演示</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="拖拽排序" name="draggable">
          <div class="demo-section">
            <h4>拖拽调整商品排序</h4>
            <DraggableList v-model="draggableItems">
              <template #default="{ element }">
                <el-card shadow="hover" class="draggable-card">
                  <div class="product-item">
                    <el-icon class="drag-handle"><Rank /></el-icon>
                    <span class="product-name">{{ element.name }}</span>
                    <span class="product-price">¥{{ element.price }}</span>
                  </div>
                </el-card>
              </template>
            </DraggableList>
          </div>
        </el-tab-pane>

        <el-tab-pane label="虚拟滚动" name="virtual">
          <div class="demo-section">
            <h4>10000 条数据虚拟滚动</h4>
            <VirtualScroller
              :items="virtualItems"
              :item-height="50"
              height="400px"
            >
              <template #default="{ item, index }">
                <div class="virtual-item">
                  <span class="item-index">#{{ index + 1 }}</span>
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-price">¥{{ item.price }}</span>
                </div>
              </template>
            </VirtualScroller>
          </div>
        </el-tab-pane>

        <el-tab-pane label="无限滚动" name="infinite">
          <div class="demo-section">
            <h4>滚动加载更多商品</h4>
            <div class="infinite-container">
              <InfiniteScroll
                :loading="infiniteLoading"
                :finished="infiniteFinished"
                @load="loadMore"
              >
                <div
                  v-for="item in infiniteItems"
                  :key="item.id"
                  class="infinite-item"
                >
                  {{ item.name }}
                </div>
              </InfiniteScroll>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="验证码输入" name="captcha">
          <div class="demo-section">
            <h4>验证码输入（用于敏感操作验证）</h4>
            <CaptchaInput
              v-model="captchaValue"
              :length="6"
              type="number"
              @complete="handleCaptchaComplete"
            />
            <p class="captcha-tip">当前输入: {{ captchaValue }}</p>
          </div>
        </el-tab-pane>

        <el-tab-pane label="代码编辑器" name="editor">
          <div class="demo-section">
            <h4>商品配置 JSON 编辑器</h4>
            <CodeEditor
              v-model="codeValue"
              language="json"
              theme="vs"
              height="300px"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="二维码" name="qrcode">
          <div class="demo-section">
            <h4>商品二维码生成与扫描</h4>
            <el-row :gutter="40">
              <el-col :span="12">
                <div class="qr-section">
                  <h5>生成二维码</h5>
                  <el-input v-model="qrValue" placeholder="输入链接或文本" />
                  <QrGenerator :value="qrValue" :size="200" />
                </div>
              </el-col>
              <el-col :span="12">
                <div class="qr-section">
                  <h5>扫描二维码</h5>
                  <QrScanner @scanned="handleQrScanned" />
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.product-page {
  .card-header {
    font-size: 18px;
    font-weight: 600;
  }

  .demo-section {
    padding: 20px 0;

    h4 {
      margin-bottom: 16px;
      color: #303133;
    }

    h5 {
      margin-bottom: 12px;
      color: #606266;
    }
  }

  .draggable-card {
    margin-bottom: 8px;

    .product-item {
      display: flex;
      align-items: center;
      gap: 16px;

      .drag-handle {
        cursor: grab;
        color: #909399;
      }

      .product-name {
        flex: 1;
      }

      .product-price {
        color: #f56c6c;
        font-weight: 500;
      }
    }
  }

  .virtual-item {
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #ebeef5;
    height: 100%;

    .item-index {
      width: 60px;
      color: #909399;
    }

    .item-name {
      flex: 1;
    }

    .item-price {
      color: #f56c6c;
    }
  }

  .infinite-container {
    height: 400px;
    overflow-y: auto;
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }

  .infinite-item {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
  }

  .captcha-tip {
    margin-top: 16px;
    color: #909399;
  }

  .qr-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
}
</style>

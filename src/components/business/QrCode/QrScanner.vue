<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useQrScanner } from './useQrCode'
import type { QrScannerProps } from './types'

const props = withDefaults(defineProps<QrScannerProps>(), {
  width: 300,
  height: 300,
  fps: 10,
})

const emit = defineEmits<{
  scanned: [value: string]
  error: [error: Error]
}>()

const scannerId = `qr-scanner-${Date.now()}`
const result = ref('')

const { scanning, start, stop } = useQrScanner(
  (value) => {
    result.value = value
    emit('scanned', value)
  },
  (error) => {
    emit('error', error)
  }
)

const handleStart = () => {
  result.value = ''
  start(scannerId)
}

const handleStop = () => {
  stop()
}

onUnmounted(stop)

defineExpose({ start: handleStart, stop: handleStop })
</script>

<template>
  <div class="qr-scanner">
    <div
      :id="scannerId"
      class="qr-scanner__viewport"
      :style="{ width: `${width}px`, height: `${height}px` }"
    />
    <div class="qr-scanner__actions">
      <el-button v-if="!scanning" type="primary" @click="handleStart">
        <el-icon><VideoCamera /></el-icon>
        开始扫描
      </el-button>
      <el-button v-else type="danger" @click="handleStop">
        <el-icon><VideoPause /></el-icon>
        停止扫描
      </el-button>
    </div>
    <div v-if="result" class="qr-scanner__result">
      <el-tag>扫描结果: {{ result }}</el-tag>
    </div>
  </div>
</template>

<style scoped lang="scss">
.qr-scanner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  &__viewport {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
    background: #000;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__result {
    margin-top: 8px;
  }
}
</style>

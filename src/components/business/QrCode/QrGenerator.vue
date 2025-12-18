<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useQrCode } from './useQrCode'
import type { QrGeneratorProps } from './types'

const props = withDefaults(defineProps<QrGeneratorProps>(), {
  size: 200,
  level: 'M',
  margin: 2,
  darkColor: '#000000',
  lightColor: '#ffffff',
  logoSize: 40,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { generate, download: downloadQr } = useQrCode()

const renderQrCode = async () => {
  if (!canvasRef.value || !props.value) return
  await generate(canvasRef.value, {
    value: props.value,
    size: props.size,
    level: props.level,
    margin: props.margin,
    darkColor: props.darkColor,
    lightColor: props.lightColor,
    logo: props.logo,
    logoSize: props.logoSize,
  })
}

const handleDownload = () => {
  downloadQr({
    value: props.value,
    size: props.size,
    level: props.level,
    margin: props.margin,
    darkColor: props.darkColor,
    lightColor: props.lightColor,
    logo: props.logo,
    logoSize: props.logoSize,
  })
}

watch(() => props, renderQrCode, { deep: true })
onMounted(renderQrCode)

defineExpose({ download: handleDownload })
</script>

<template>
  <div class="qr-generator">
    <canvas ref="canvasRef" :width="size" :height="size" />
    <slot name="actions">
      <el-button size="small" @click="handleDownload">
        <el-icon><Download /></el-icon>
        下载
      </el-button>
    </slot>
  </div>
</template>

<style scoped lang="scss">
.qr-generator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  canvas {
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }
}
</style>

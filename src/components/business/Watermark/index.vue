<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWatermark } from './useWatermark'
import type { WatermarkProps } from './types'

const props = withDefaults(defineProps<WatermarkProps>(), {
  fontSize: 16,
  fontColor: 'rgba(0,0,0,0.15)',
  rotate: -22,
  gapX: 100,
  gapY: 100,
  zIndex: 9999,
})

const containerRef = ref<HTMLElement | null>(null)

const options = computed(() => ({
  text: props.text,
  fontSize: props.fontSize,
  fontColor: props.fontColor,
  rotate: props.rotate,
  gapX: props.gapX,
  gapY: props.gapY,
}))

useWatermark(containerRef, options)
</script>

<template>
  <div ref="containerRef" class="watermark-container">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.watermark-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<script setup lang="ts">
import type { InfiniteScrollProps } from './types'

withDefaults(defineProps<InfiniteScrollProps>(), {
  distance: 100,
  delay: 200,
})

const emit = defineEmits<{
  load: []
}>()

const handleLoad = () => {
  emit('load')
}
</script>

<template>
  <div
    v-infinite-scroll="handleLoad"
    :infinite-scroll-disabled="loading || finished"
    :infinite-scroll-distance="distance"
    :infinite-scroll-delay="delay"
    class="infinite-scroll"
  >
    <slot />
    <div v-if="loading" class="infinite-scroll__loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    <div v-else-if="finished" class="infinite-scroll__finished">
      <span>没有更多了</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.infinite-scroll {
  &__loading,
  &__finished {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    color: #909399;
    font-size: 14px;
    gap: 8px;
  }

  &__loading .el-icon {
    font-size: 16px;
  }
}
</style>

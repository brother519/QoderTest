<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useVirtualScroll } from './useVirtualScroll'
import type { VirtualScrollProps } from './types'

const props = withDefaults(defineProps<VirtualScrollProps>(), {
  overscan: 5,
  height: '400px',
})

defineEmits<{
  scroll: [scrollTop: number]
}>()

const containerRef = ref<HTMLElement | null>(null)
const itemsRef = toRef(props, 'items')

const {
  totalHeight,
  visibleItems,
  handleScroll,
  scrollToIndex,
} = useVirtualScroll(itemsRef, props.itemHeight, containerRef, props.overscan)

defineExpose({ scrollToIndex })
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-scroller"
    :style="{ height: typeof height === 'number' ? `${height}px` : height }"
    @scroll="handleScroll"
  >
    <div class="virtual-scroller__spacer" :style="{ height: `${totalHeight}px` }">
      <div
        v-for="{ item, index, style } in visibleItems"
        :key="index"
        class="virtual-scroller__item"
        :style="style"
      >
        <slot :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.virtual-scroller {
  overflow-y: auto;
  position: relative;

  &__spacer {
    position: relative;
  }

  &__item {
    left: 0;
    right: 0;
  }
}
</style>

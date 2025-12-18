import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export function useVirtualScroll<T>(
  items: Ref<T[]>,
  itemHeight: number,
  containerRef: Ref<HTMLElement | null>,
  overscan: number = 5
) {
  const scrollTop = ref(0)
  const containerHeight = ref(0)

  const totalHeight = computed(() => items.value.length * itemHeight)

  const visibleRange = computed(() => {
    const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight.value / itemHeight)
    const end = Math.min(items.value.length, start + visibleCount + overscan * 2)
    return { start, end }
  })

  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value
    return items.value.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
      style: {
        position: 'absolute' as const,
        top: `${(start + index) * itemHeight}px`,
        height: `${itemHeight}px`,
        width: '100%',
      },
    }))
  })

  const offsetY = computed(() => visibleRange.value.start * itemHeight)

  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  const scrollToIndex = (index: number) => {
    if (containerRef.value) {
      containerRef.value.scrollTop = index * itemHeight
    }
  }

  onMounted(() => {
    if (containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight
      const resizeObserver = new ResizeObserver((entries) => {
        containerHeight.value = entries[0].contentRect.height
      })
      resizeObserver.observe(containerRef.value)
    }
  })

  return {
    totalHeight,
    visibleItems,
    offsetY,
    handleScroll,
    scrollToIndex,
    scrollTop,
  }
}

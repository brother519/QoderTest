import { ref, computed } from 'vue'

export function useInfiniteScroll(loadFn: () => Promise<boolean>) {
  const loading = ref(false)
  const finished = ref(false)
  const error = ref(false)
  const page = ref(1)

  const status = computed(() => {
    if (loading.value) return 'loading'
    if (finished.value) return 'finished'
    if (error.value) return 'error'
    return 'idle'
  })

  const loadMore = async () => {
    if (loading.value || finished.value) return

    loading.value = true
    error.value = false

    try {
      const hasMore = await loadFn()
      if (!hasMore) {
        finished.value = true
      } else {
        page.value++
      }
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    loading.value = false
    finished.value = false
    error.value = false
    page.value = 1
  }

  const retry = () => {
    error.value = false
    loadMore()
  }

  return {
    loading,
    finished,
    error,
    page,
    status,
    loadMore,
    reset,
    retry,
  }
}

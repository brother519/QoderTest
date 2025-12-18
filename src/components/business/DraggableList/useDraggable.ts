import { ref } from 'vue'
import type { Ref } from 'vue'
import type { DraggableItem } from './types'

export function useDraggable<T extends DraggableItem>(
  items: Ref<T[]>,
  onUpdate?: (newItems: T[]) => void
) {
  const isDragging = ref(false)
  const draggedItem = ref<T | null>(null)

  const onStart = (event: any) => {
    isDragging.value = true
    draggedItem.value = items.value[event.oldIndex]
  }

  const onEnd = (event: any) => {
    isDragging.value = false
    draggedItem.value = null

    if (event.oldIndex !== event.newIndex) {
      const newItems = [...items.value]
      const [movedItem] = newItems.splice(event.oldIndex, 1)
      newItems.splice(event.newIndex, 0, movedItem)
      onUpdate?.(newItems)
    }
  }

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= items.value.length) return
    if (toIndex < 0 || toIndex >= items.value.length) return

    const newItems = [...items.value]
    const [movedItem] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, movedItem)
    onUpdate?.(newItems)
  }

  return {
    isDragging,
    draggedItem,
    onStart,
    onEnd,
    moveItem,
  }
}

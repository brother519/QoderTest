<script setup lang="ts">
import draggable from 'vuedraggable'
import type { DraggableListProps, DraggableItem } from './types'

const props = withDefaults(defineProps<DraggableListProps>(), {
  animation: 200,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: DraggableItem[]]
  change: [value: DraggableItem[]]
  start: [event: any]
  end: [event: any]
}>()

const list = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('change', value)
  },
})

const onStart = (event: any) => {
  emit('start', event)
}

const onEnd = (event: any) => {
  emit('end', event)
}
</script>

<template>
  <draggable
    v-model="list"
    :animation="animation"
    :disabled="disabled"
    :handle="handle"
    item-key="id"
    ghost-class="draggable-ghost"
    chosen-class="draggable-chosen"
    drag-class="draggable-drag"
    @start="onStart"
    @end="onEnd"
  >
    <template #item="{ element, index }">
      <div class="draggable-item">
        <slot :element="element" :index="index" />
      </div>
    </template>
  </draggable>
</template>

<style scoped lang="scss">
.draggable-item {
  cursor: move;
}

:deep(.draggable-ghost) {
  opacity: 0.5;
  background: #c8ebfb;
}

:deep(.draggable-chosen) {
  background: #f5f7fa;
}

:deep(.draggable-drag) {
  opacity: 0.8;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>

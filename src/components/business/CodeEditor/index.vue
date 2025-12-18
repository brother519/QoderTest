<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCodeEditor } from './useCodeEditor'
import type { CodeEditorProps } from './types'

const props = withDefaults(defineProps<CodeEditorProps>(), {
  language: 'javascript',
  theme: 'vs',
  readonly: false,
  minimap: false,
  lineNumbers: 'on',
  fontSize: 14,
  tabSize: 2,
  height: '400px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  save: [value: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
const value = computed(() => props.modelValue)
const options = computed(() => ({
  language: props.language,
  theme: props.theme,
  readonly: props.readonly,
  minimap: props.minimap,
  lineNumbers: props.lineNumbers,
  fontSize: props.fontSize,
  tabSize: props.tabSize,
}))

const { format, getValue, setValue } = useCodeEditor(
  containerRef,
  value,
  options,
  (newValue) => {
    emit('update:modelValue', newValue)
    emit('change', newValue)
  },
  (value) => {
    emit('save', value)
  }
)

defineExpose({ format, getValue, setValue })
</script>

<template>
  <div class="code-editor">
    <div class="code-editor__toolbar">
      <el-button size="small" @click="format">
        <el-icon><MagicStick /></el-icon>
        格式化
      </el-button>
      <el-select
        :model-value="language"
        size="small"
        style="width: 120px"
        @update:model-value="$emit('update:modelValue', modelValue)"
      >
        <el-option label="JavaScript" value="javascript" />
        <el-option label="TypeScript" value="typescript" />
        <el-option label="JSON" value="json" />
        <el-option label="HTML" value="html" />
        <el-option label="CSS" value="css" />
      </el-select>
    </div>
    <div
      ref="containerRef"
      class="code-editor__container"
      :style="{ height: typeof height === 'number' ? `${height}px` : height }"
    />
  </div>
</template>

<style scoped lang="scss">
.code-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;

  &__toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;
  }

  &__container {
    width: 100%;
  }
}
</style>

<script setup lang="ts">
import { watch } from 'vue'
import { useCaptcha } from './useCaptcha'
import type { CaptchaInputProps } from './types'

const props = withDefaults(defineProps<CaptchaInputProps>(), {
  length: 6,
  type: 'number',
  separator: '',
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  complete: [value: string]
  change: [value: string]
}>()

const {
  values,
  code,
  handleInput,
  handleKeydown,
  handlePaste,
  clear,
  focus,
  setInputRef,
} = useCaptcha(props.length, props.type, (value) => {
  emit('complete', value)
})

watch(code, (newCode) => {
  emit('update:modelValue', newCode)
  emit('change', newCode)
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== code.value) {
      newValue.split('').forEach((char, i) => {
        if (i < props.length) values.value[i] = char
      })
    }
  },
  { immediate: true }
)

defineExpose({ clear, focus })
</script>

<template>
  <div class="captcha-input" @paste="handlePaste">
    <template v-for="(_, index) in props.length" :key="index">
      <input
        :ref="(el) => setInputRef(el, index)"
        :value="values[index]"
        type="text"
        maxlength="1"
        class="captcha-input__item"
        :class="{ 'captcha-input__item--filled': values[index] }"
        @input="handleInput(index, $event)"
        @keydown="handleKeydown(index, $event)"
      />
      <span
        v-if="separator && index < props.length - 1 && (index + 1) % 3 === 0"
        class="captcha-input__separator"
      >
        {{ separator }}
      </span>
    </template>
  </div>
</template>

<style scoped lang="scss">
.captcha-input {
  display: flex;
  align-items: center;
  gap: 8px;

  &__item {
    width: 44px;
    height: 48px;
    text-align: center;
    font-size: 20px;
    font-weight: 500;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }

    &--filled {
      border-color: #67c23a;
    }
  }

  &__separator {
    font-size: 20px;
    color: #909399;
  }
}
</style>

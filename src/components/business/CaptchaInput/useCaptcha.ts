import { ref, computed } from 'vue'
import type { Ref } from 'vue'

export function useCaptcha(
  length: number,
  type: 'number' | 'text' | 'mixed',
  onComplete?: (value: string) => void
) {
  const values = ref<string[]>(Array(length).fill(''))
  const inputRefs = ref<HTMLInputElement[]>([])

  const code = computed(() => values.value.join(''))

  const isComplete = computed(() => values.value.every((v) => v !== ''))

  const validateInput = (char: string): boolean => {
    if (type === 'number') return /^\d$/.test(char)
    if (type === 'text') return /^[a-zA-Z]$/.test(char)
    return /^[a-zA-Z0-9]$/.test(char)
  }

  const handleInput = (index: number, event: Event) => {
    const target = event.target as HTMLInputElement
    const value = target.value.slice(-1)

    if (value && !validateInput(value)) {
      target.value = values.value[index]
      return
    }

    values.value[index] = value

    if (value && index < length - 1) {
      inputRefs.value[index + 1]?.focus()
    }

    if (isComplete.value) {
      onComplete?.(code.value)
    }
  }

  const handleKeydown = (index: number, event: KeyboardEvent) => {
    if (event.key === 'Backspace' && !values.value[index] && index > 0) {
      inputRefs.value[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.value[index - 1]?.focus()
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      inputRefs.value[index + 1]?.focus()
    }
  }

  const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault()
    const pastedData = event.clipboardData?.getData('text') || ''
    const chars = pastedData.split('').filter(validateInput).slice(0, length)

    chars.forEach((char, i) => {
      values.value[i] = char
    })

    const nextIndex = Math.min(chars.length, length - 1)
    inputRefs.value[nextIndex]?.focus()

    if (isComplete.value) {
      onComplete?.(code.value)
    }
  }

  const clear = () => {
    values.value = Array(length).fill('')
    inputRefs.value[0]?.focus()
  }

  const focus = () => {
    const emptyIndex = values.value.findIndex((v) => !v)
    inputRefs.value[emptyIndex >= 0 ? emptyIndex : 0]?.focus()
  }

  const setInputRef = (el: any, index: number) => {
    if (el) inputRefs.value[index] = el
  }

  return {
    values,
    code,
    isComplete,
    handleInput,
    handleKeydown,
    handlePaste,
    clear,
    focus,
    setInputRef,
  }
}

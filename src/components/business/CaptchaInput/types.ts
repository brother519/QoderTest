export interface CaptchaInputProps {
  length?: number
  type?: 'number' | 'text' | 'mixed'
  separator?: string
  modelValue?: string
}

export interface CaptchaInputEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'complete', value: string): void
  (e: 'change', value: string): void
}

export interface CodeEditorProps {
  modelValue: string
  language?: string
  theme?: 'vs' | 'vs-dark' | 'hc-black'
  readonly?: boolean
  minimap?: boolean
  lineNumbers?: 'on' | 'off' | 'relative'
  fontSize?: number
  tabSize?: number
  height?: string | number
}

export interface CodeEditorEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'save', value: string): void
}

export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'html'
  | 'css'
  | 'markdown'
  | 'python'
  | 'java'
  | 'go'
  | 'rust'

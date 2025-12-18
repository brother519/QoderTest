import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'
import * as monaco from 'monaco-editor'

interface EditorOptions {
  language?: string
  theme?: 'vs' | 'vs-dark' | 'hc-black'
  readonly?: boolean
  minimap?: boolean
  lineNumbers?: 'on' | 'off' | 'relative'
  fontSize?: number
  tabSize?: number
}

export function useCodeEditor(
  containerRef: Ref<HTMLElement | null>,
  value: Ref<string>,
  options: Ref<EditorOptions>,
  onChange?: (value: string) => void,
  onSave?: (value: string) => void
) {
  const editor = ref<monaco.editor.IStandaloneCodeEditor | null>(null)
  const isReady = ref(false)

  const createEditor = () => {
    if (!containerRef.value) return

    const {
      language = 'javascript',
      theme = 'vs',
      readonly = false,
      minimap = false,
      lineNumbers = 'on',
      fontSize = 14,
      tabSize = 2,
    } = options.value

    editor.value = monaco.editor.create(containerRef.value, {
      value: value.value,
      language,
      theme,
      readOnly: readonly,
      minimap: { enabled: minimap },
      lineNumbers,
      fontSize,
      tabSize,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      folding: true,
      formatOnPaste: true,
      formatOnType: true,
    })

    editor.value.onDidChangeModelContent(() => {
      const newValue = editor.value?.getValue() || ''
      if (newValue !== value.value) {
        onChange?.(newValue)
      }
    })

    editor.value.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.(editor.value?.getValue() || '')
    })

    isReady.value = true
  }

  const destroyEditor = () => {
    editor.value?.dispose()
    editor.value = null
    isReady.value = false
  }

  const getValue = (): string => {
    return editor.value?.getValue() || ''
  }

  const setValue = (newValue: string) => {
    if (editor.value && editor.value.getValue() !== newValue) {
      editor.value.setValue(newValue)
    }
  }

  const format = async () => {
    await editor.value?.getAction('editor.action.formatDocument')?.run()
  }

  const setLanguage = (language: string) => {
    const model = editor.value?.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, language)
    }
  }

  const setTheme = (theme: 'vs' | 'vs-dark' | 'hc-black') => {
    monaco.editor.setTheme(theme)
  }

  watch(
    () => value.value,
    (newValue) => {
      setValue(newValue)
    }
  )

  watch(
    () => options.value.language,
    (newLanguage) => {
      if (newLanguage) setLanguage(newLanguage)
    }
  )

  watch(
    () => options.value.theme,
    (newTheme) => {
      if (newTheme) setTheme(newTheme)
    }
  )

  onMounted(createEditor)
  onBeforeUnmount(destroyEditor)

  return {
    editor,
    isReady,
    getValue,
    setValue,
    format,
    setLanguage,
    setTheme,
  }
}

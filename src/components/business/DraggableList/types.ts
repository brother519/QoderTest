export interface DraggableItem {
  id: string | number
  [key: string]: any
}

export interface DraggableListProps {
  modelValue: DraggableItem[]
  handle?: string
  animation?: number
  disabled?: boolean
}

export interface DraggableListEmits {
  (e: 'update:modelValue', value: DraggableItem[]): void
  (e: 'change', value: DraggableItem[]): void
  (e: 'start', event: any): void
  (e: 'end', event: any): void
}

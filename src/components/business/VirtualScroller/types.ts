export interface VirtualScrollProps {
  items: any[]
  itemHeight: number
  overscan?: number
  height?: string | number
}

export interface VirtualScrollEmits {
  (e: 'scroll', scrollTop: number): void
}

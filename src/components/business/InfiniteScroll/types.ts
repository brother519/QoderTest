export interface InfiniteScrollProps {
  loading: boolean
  finished: boolean
  distance?: number
  delay?: number
}

export interface InfiniteScrollEmits {
  (e: 'load'): void
}

export type LoadStatus = 'loading' | 'finished' | 'error' | 'idle'

export interface QrGeneratorProps {
  value: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
  margin?: number
  darkColor?: string
  lightColor?: string
  logo?: string
  logoSize?: number
}

export interface QrScannerProps {
  width?: number
  height?: number
  fps?: number
}

export interface QrScannerEmits {
  (e: 'scanned', value: string): void
  (e: 'error', error: Error): void
}

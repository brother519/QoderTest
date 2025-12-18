import { ref, onUnmounted } from 'vue'
import QRCode from 'qrcode'

interface GenerateOptions {
  value: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
  margin?: number
  darkColor?: string
  lightColor?: string
  logo?: string
  logoSize?: number
}

export function useQrCode() {
  const generating = ref(false)
  const error = ref<Error | null>(null)

  const generate = async (
    canvas: HTMLCanvasElement,
    options: GenerateOptions
  ): Promise<void> => {
    const {
      value,
      size = 200,
      level = 'M',
      margin = 2,
      darkColor = '#000000',
      lightColor = '#ffffff',
      logo,
      logoSize = 40,
    } = options

    generating.value = true
    error.value = null

    try {
      await QRCode.toCanvas(canvas, value, {
        width: size,
        margin,
        errorCorrectionLevel: level,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      })

      if (logo) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              const x = (size - logoSize) / 2
              const y = (size - logoSize) / 2
              ctx.fillStyle = lightColor
              ctx.fillRect(x - 2, y - 2, logoSize + 4, logoSize + 4)
              ctx.drawImage(img, x, y, logoSize, logoSize)
              resolve()
            }
            img.onerror = reject
            img.src = logo
          })
        }
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      generating.value = false
    }
  }

  const toDataURL = async (options: GenerateOptions): Promise<string> => {
    const canvas = document.createElement('canvas')
    await generate(canvas, options)
    return canvas.toDataURL('image/png')
  }

  const download = async (options: GenerateOptions, filename = 'qrcode.png') => {
    const dataUrl = await toDataURL(options)
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
  }

  return {
    generating,
    error,
    generate,
    toDataURL,
    download,
  }
}

export function useQrScanner(
  onScanned: (value: string) => void,
  onError?: (error: Error) => void
) {
  const scanning = ref(false)
  let scanner: any = null

  const start = async (elementId: string) => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      scanner = new Html5Qrcode(elementId)

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          onScanned(decodedText)
        },
        () => {}
      )

      scanning.value = true
    } catch (e) {
      onError?.(e as Error)
    }
  }

  const stop = async () => {
    if (scanner) {
      await scanner.stop()
      scanner.clear()
      scanner = null
      scanning.value = false
    }
  }

  onUnmounted(stop)

  return {
    scanning,
    start,
    stop,
  }
}

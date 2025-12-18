import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { Ref } from 'vue'

interface WatermarkOptions {
  text: string | string[]
  fontSize?: number
  fontColor?: string
  rotate?: number
  gapX?: number
  gapY?: number
}

export function useWatermark(
  containerRef: Ref<HTMLElement | null>,
  options: Ref<WatermarkOptions>
) {
  const watermarkDiv = ref<HTMLDivElement | null>(null)
  let observer: MutationObserver | null = null

  const createWatermarkUrl = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    const { text, fontSize = 16, fontColor = 'rgba(0,0,0,0.15)', rotate = -22, gapX = 100, gapY = 100 } = options.value
    const texts = Array.isArray(text) ? text : [text]

    const lineHeight = fontSize * 1.5
    const totalHeight = texts.length * lineHeight

    canvas.width = 200 + gapX
    canvas.height = totalHeight + gapY

    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotate * Math.PI) / 180)
    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
    ctx.fillStyle = fontColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    texts.forEach((t, i) => {
      const y = (i - (texts.length - 1) / 2) * lineHeight
      ctx.fillText(t, 0, y)
    })

    return canvas.toDataURL()
  }

  const render = () => {
    if (!containerRef.value) return

    if (watermarkDiv.value) {
      watermarkDiv.value.remove()
    }

    const div = document.createElement('div')
    div.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background-image: url(${createWatermarkUrl()});
      background-repeat: repeat;
      z-index: 9999;
    `

    containerRef.value.style.position = 'relative'
    containerRef.value.appendChild(div)
    watermarkDiv.value = div

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const removed = Array.from(mutation.removedNodes).includes(div)
          if (removed) {
            render()
            return
          }
        }
        if (mutation.type === 'attributes' && mutation.target === div) {
          render()
          return
        }
      }
    })

    observer.observe(containerRef.value, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    })
  }

  const destroy = () => {
    observer?.disconnect()
    watermarkDiv.value?.remove()
    watermarkDiv.value = null
  }

  watch(options, render, { deep: true })

  onMounted(render)
  onUnmounted(destroy)

  return { render, destroy }
}

declare module 'vuedraggable' {
  import { DefineComponent } from 'vue'
  const draggable: DefineComponent<any, any, any>
  export default draggable
}

declare module 'qrcode' {
  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: any
  ): Promise<void>
  export function toDataURL(text: string, options?: any): Promise<string>
}

declare module 'html5-qrcode' {
  export class Html5Qrcode {
    constructor(elementId: string)
    start(
      config: any,
      options: any,
      onSuccess: (text: string) => void,
      onError: (error: any) => void
    ): Promise<void>
    stop(): Promise<void>
    clear(): void
  }
}

declare module 'watermark-dom' {
  export function init(options: any): void
  export function load(options: any): void
  export function remove(): void
}

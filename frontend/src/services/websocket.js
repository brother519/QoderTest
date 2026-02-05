import { io } from 'socket.io-client'

class WebSocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }

  connect() {
    if (this.socket) return

    this.socket = io('/', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    this.socket.on('connect', () => {
      console.log('WebSocket连接成功')
      this.connected = true
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket断开连接')
      this.connected = false
    })

    this.socket.on('error', (error) => {
      console.error('WebSocket错误:', error)
    })
  }

  subscribe(filters, onLog) {
    if (!this.socket) this.connect()

    this.socket.emit('subscribe', filters)
    this.socket.on('log', onLog)

    // 心跳
    this.heartbeatInterval = setInterval(() => {
      if (this.connected) {
        this.socket.emit('ping')
      }
    }, 30000)
  }

  unsubscribe() {
    if (this.socket) {
      this.socket.off('log')
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }
}

export default new WebSocketService()

import { WS_URL } from '../lib/constants'

const REQUEST_TIMEOUT_MS = 10000

class WsClient {
  constructor(url) {
    this.url = url
    this.socket = null
    this.connecting = null
    this.pending = new Map()
  }

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return Promise.resolve(this.socket)
    }
    if (this.connecting) return this.connecting

    this.connecting = new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url)

      socket.onopen = () => {
        this.socket = socket
        this.connecting = null
        resolve(socket)
      }

      socket.onerror = (err) => {
        this.connecting = null
        reject(err)
      }

      socket.onclose = () => {
        this.socket = null
        this.connecting = null
        for (const { reject: rej, timer } of this.pending.values()) {
          clearTimeout(timer)
          rej(new Error('WebSocket closed before response arrived'))
        }
        this.pending.clear()
      }

      socket.onmessage = (event) => {
        let envelope
        try {
          envelope = JSON.parse(event.data)
        } catch {
          return
        }
        const entry = this.pending.get(envelope.CorrelationId)
        if (!entry) return
        clearTimeout(entry.timer)
        this.pending.delete(envelope.CorrelationId)
        entry.resolve(envelope)
      }
    })

    return this.connecting
  }

  async send(command, payload) {
    const socket = await this.connect()
    const correlationId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const envelope = {
      CorrelationId: correlationId,
      Command: command,
      Payload: JSON.stringify(payload),
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(correlationId)
        reject(new Error(`Request '${command}' timed out`))
      }, REQUEST_TIMEOUT_MS)

      this.pending.set(correlationId, { resolve, reject, timer })
      socket.send(JSON.stringify(envelope))
    })
  }
}

const wsClient = new WsClient(WS_URL)

export default wsClient

import { WS_URL } from '../lib/constants'

const REQUEST_TIMEOUT_MS = 10000

class WsClient {
  constructor(url) {
    this.url = url
    this.socket = null
    this.connecting = null
    this.pending = new Map()
    this.listeners = new Map()
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
        if (envelope.CorrelationId) {
          const entry = this.pending.get(envelope.CorrelationId)
          if (entry) {
            clearTimeout(entry.timer)
            this.pending.delete(envelope.CorrelationId)
            entry.resolve(envelope)
            return
          }
        }
        const set = this.listeners.get(envelope.Command)
        if (set) {
          for (const cb of set) {
            try { cb(envelope) } catch (err) { console.error('ws listener error:', err) }
          }
        }
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

  subscribe(command, callback) {
    let set = this.listeners.get(command)
    if (!set) {
      set = new Set()
      this.listeners.set(command, set)
    }
    set.add(callback)
    return () => {
      const s = this.listeners.get(command)
      if (!s) return
      s.delete(callback)
      if (s.size === 0) this.listeners.delete(command)
    }
  }
}

const wsClient = new WsClient(WS_URL)

export default wsClient

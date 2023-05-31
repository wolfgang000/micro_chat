import { Socket, Channel } from 'phoenix'
import environment from './env'

class SocketConnection {
  socket: Socket | undefined
  #onOpenRef: string | undefined
  #connectionRequestTimeout = 5000

  connect(params: any): Promise<void> {
    if (this.socket && this.socket.connectionState() in ['connecting', 'open']) {
      this.socket.disconnect()
    }

    const socket = new Socket(environment.websocket_base_url + '/socket', {
      params: params
    })

    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject()
        socket.disconnect()
      }, this.#connectionRequestTimeout)

      socket.connect()
      this.#onOpenRef = socket.onOpen(() => {
        clearTimeout(timeoutId)
        resolve()
        if (this.#onOpenRef) {
          socket.off([this.#onOpenRef])
        }
        this.socket = socket
      })
    })
  }
}

export const socketConnection = new SocketConnection()

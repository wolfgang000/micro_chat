import { Socket, Channel } from 'phoenix'
import environment from './env'

// TODO: Replace this class in the future with a FSM for better handling of the connection state
class SocketConnection {
  socket: Socket | undefined
  #onOpenRef: string | undefined
  #connectionRequestTimeout = 5000
  #channels = new Map<string, Channel>()

  connect(params: any): Promise<void> {
    if (this.socket) {
      // Todo: This doesn't seem to be working, check later
      this.#channels.clear()
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

  getOrCreateChannel(name: string): Channel {
    // here we have a race condition if we don't wait for the connect() promise
    // It should work for now
    const channel = this.#channels.get(name)
    if (channel) {
      return channel
    } else {
      const channel = this.socket!.channel(name)
      this.#channels.set(name, channel)
      return channel
    }
  }

  deleteChannel(name: string): void {
    const channel = this.#channels.get(name)
    if (channel) {
      channel.leave()
      this.#channels.delete(name)
    }
  }
}

export const socketConnection = new SocketConnection()

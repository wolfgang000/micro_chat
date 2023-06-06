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

  channelOn(topic: string, event: string, callback: (response?: any) => void): void {
    const channel = this.#channels.get(topic) as Channel
    channel.on(event, callback)
  }

  channelJoin(topic: string): Promise<void> {
    const channel = this.#channels.get(topic) as Channel

    return new Promise<void>((resolve, reject) => {
      channel
        .join()
        .receive('ok', (resp: any): void => {
          resolve()
          console.log('Joined successfully', resp)
        })
        .receive('error', (resp: any): void => {
          // TODO: handle failure
          reject()
          console.log('Unable to join', resp)
        })
    })
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

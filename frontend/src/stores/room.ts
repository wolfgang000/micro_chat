import type { IConnectedUser } from '@/models'
import { reactive } from 'vue'

export let roomPresences = {}
export const roomStore = reactive({
  connectedUsers: [] as IConnectedUser[],
  setRoomPresences(value: any) {
    roomPresences = value
  },
  setConnectedUsers(value: IConnectedUser[]) {
    this.connectedUsers = value
  }
})

import { socketConnection } from '@/api'
import { ChatListItemType, type IChatListItem, type IConnectedUser, type IMessage } from '@/models'
import dateFormat from 'dateformat'
import { Presence } from 'phoenix'
import { reactive } from 'vue'
import { userStore } from './user'

export let roomPresences = {}
export const roomStore = reactive({
  roomTopic: '',
  roomName: '',
  connectedUsers: [] as IConnectedUser[],
  listItems: [] as IChatListItem[],
  setConnectedUsers(value: IConnectedUser[]) {
    this.connectedUsers = value
  },
  setRoomName(value: string) {
    this.roomName = value
  },
  setListItems(value: IChatListItem[]) {
    this.listItems = value
  },
  unshiftListItems(value: IChatListItem) {
    this.listItems.unshift(value)
  },
  setRoomTopic(value: string) {
    this.roomTopic = value
  }
})

const dateFormatWithFormat = (value: string | Date): string => {
  return dateFormat(value, 'dddd, mmmm d, yyyy | h:MM TT')
}

const onJoin = (id: any, current: any, newPres: any) => {
  if (!current) {
    roomStore.unshiftListItems({
      type: ChatListItemType.ChatEvent,
      meta: {
        body: `${newPres.metas[0].username} has join the room`,
        created_at: dateFormatWithFormat(Date())
      }
    })
  }
}

const onLeave = (id: any, current: any, leftPres: any) => {
  if (current.metas.length === 0) {
    roomStore.unshiftListItems({
      type: ChatListItemType.ChatEvent,
      meta: {
        body: `${leftPres.metas[0].username} has left the room`,
        created_at: dateFormatWithFormat(Date())
      }
    })
  }
}

export const setupChannelPresenceCallbacks = (channelTopic: string) => {
  socketConnection.channelOn(channelTopic, 'server.new_message', (message: IMessage) => {
    message.created_at = dateFormatWithFormat(message.created_at)

    const itemType =
      message.username === userStore.username
        ? ChatListItemType.MessageSent
        : ChatListItemType.MessageReceived

    roomStore.unshiftListItems({ type: itemType, meta: message })
  })

  socketConnection.channelOn(channelTopic, 'presence_state', (state) => {
    roomPresences = {}
    roomPresences = Presence.syncState(roomPresences, state)
    const connectedUsers = Presence.list(roomPresences, (_id, { metas: [user, ...rest] }) => {
      return user
    })
    roomStore.setConnectedUsers(connectedUsers)
  })

  socketConnection.channelOn(channelTopic, 'presence_diff', (diff) => {
    const presences = Presence.syncDiff(roomPresences, diff, onJoin, onLeave)
    const connectedUsers = Presence.list(presences, (_id, { metas: [user, ...rest] }) => {
      return user
    })
    roomStore.setConnectedUsers(connectedUsers)
  })
}

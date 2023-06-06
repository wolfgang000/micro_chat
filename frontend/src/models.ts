export interface IMessage {
  body: string
  created_at: string
  username: string
}

export interface IChatEvent {
  body: string
  created_at: string
}

export enum ChatListItemType {
  MessageSent,
  MessageReceived,
  ChatEvent
}

export interface IChatListItem {
  meta: IMessage | IChatEvent
  type: ChatListItemType
}

export interface IConnectedUser {
  phx_ref: string
  username: string
  id_typing: boolean
}

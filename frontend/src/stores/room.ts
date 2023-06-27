import { socketConnection } from '@/api'
import { ChatListItemType, type IChatListItem, type IConnectedUser, type IMessage } from '@/models'
import dateFormat from 'dateformat'
import { Presence } from 'phoenix'
import { nextTick, reactive } from 'vue'
import { userStore } from './user'

export let roomPresences = {}
export let localMediaStream: MediaStream
export const roomStore = reactive({
  iceServersPromise: null as unknown as Promise<any>,
  roomTopic: '',
  roomName: '',
  connectedUsers: [] as IConnectedUser[],
  peers: [] as {
    pc: RTCPeerConnection
    user_id: string
    username: string
    element_id: string
  }[],
  listItems: [] as IChatListItem[],
  isVideoChatActivated: false,
  setConnectedUsers(value: IConnectedUser[]) {
    this.connectedUsers = value
  },
  setRoomName(value: string) {
    this.roomName = value
  },
  setListItems(value: IChatListItem[]) {
    this.listItems = value
  },
  setPeers(value: any[]) {
    this.peers = value
  },
  unshiftListItems(value: IChatListItem) {
    this.listItems.unshift(value)
  },
  setRoomTopic(value: string) {
    this.roomTopic = value
  },
  startCall() {
    this.requestMediaPermissions().then((webCamMediaStream) => {
      localMediaStream = webCamMediaStream!
      this.isVideoChatActivated = true
      const channel = socketConnection.getOrCreateChannel(this.roomTopic)
      const ice_servers_promise = new Promise((resolve, reject) => {
        channel
          .push('user:start_call', {})
          .receive('ok', (ice_servers) => {
            resolve(ice_servers)
          })
          .receive('error', (reasons) => reject(reasons))
          .receive('timeout', () => reject('Networking issue...'))
      })

      this.iceServersPromise = ice_servers_promise

      channel.on(`call:peer_ice_candidate_created:${userStore.userId}`, peer_ice_candidate_created)
      channel.on(`call:peer_answer_created:${userStore.userId}`, peer_answer_created)
      channel.on(`call:peer_offer_created:${userStore.userId}`, peer_offer_created_callback)
      channel.on('call:user_joined', user_joined_callback)
      channel.on(`call:user_left`, (user) => {
        const newPeers = roomStore.peers.filter((peer) => peer.user_id !== user.user_id)
        roomStore.setPeers(newPeers)
      })
    })
  },
  joinCall() {
    this.requestMediaPermissions().then((webCamMediaStream) => {
      localMediaStream = webCamMediaStream!
      this.isVideoChatActivated = true
      const channel = socketConnection.getOrCreateChannel(this.roomTopic)
      const ice_servers_promise = new Promise((resolve, reject) => {
        channel
          .push('user:join_call', {})
          .receive('ok', (ice_servers) => {
            resolve(ice_servers)
          })
          .receive('error', (reasons) => reject(reasons))
          .receive('timeout', () => reject('Networking issue...'))
      })
      this.iceServersPromise = ice_servers_promise

      channel.on(`call:peer_ice_candidate_created:${userStore.userId}`, peer_ice_candidate_created)
      channel.on(`call:peer_answer_created:${userStore.userId}`, peer_answer_created)
      channel.on(`call:peer_offer_created:${userStore.userId}`, peer_offer_created_callback)
      channel.on('call:user_joined', user_joined_callback)
      channel.on(`call:user_left`, (user) => {
        const newPeers = roomStore.peers.filter((peer) => peer.user_id !== user.user_id)
        roomStore.setPeers(newPeers)
      })
    })
  },
  leaveCall() {
    this.isVideoChatActivated = false
    localMediaStream.getTracks().forEach((track) => {
      track.stop()
    })
    const channel = socketConnection.getOrCreateChannel(this.roomTopic)
    channel.off(`call:peer_ice_candidate_created:${userStore.userId}`)
    channel.off(`call:peer_answer_created:${userStore.userId}`)
    channel.off(`call:peer_offer_created:${userStore.userId}`)
    channel.off('call:user_joined')
    channel.off('call:user_left')
    channel.push('user:leave_call', {})
  },
  requestMediaPermissions() {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch((error) => {
      console.error('error', error)
    })
  },
  setVideoElementCurrentUser(value: HTMLVideoElement) {
    value.srcObject = localMediaStream
  },
  pushPeers(value: any) {
    this.peers.push(value)
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

const user_joined_callback = async (user: any) => {
  if (user.user_id === userStore.userId) return

  const channel = socketConnection.getOrCreateChannel(roomStore.roomTopic)
  const ice_servers_resp = await roomStore.iceServersPromise

  const RTCPeerConfig = {
    iceServers: ice_servers_resp.ice_servers
  }

  const peer = {
    pc: new RTCPeerConnection(RTCPeerConfig),
    user_id: user.user_id,
    username: user.username,
    element_id: `remote-user-${user.user_id}`
  }
  roomStore.pushPeers(peer)
  await nextTick()

  // Send ice_candidate to peer
  peer.pc.onicecandidate = (event) => {
    if (event.candidate) {
      channel.push(`user:create_peer_ice_candidate:${peer.user_id}`, {
        ice_candidate: event.candidate
      })
    }
  }

  const videoRemoteUserElement = document.getElementById(peer.element_id) as HTMLVideoElement
  // Show video from peer
  peer.pc.ontrack = (event) => {
    const stream = event.streams[0]
    if (!videoRemoteUserElement.srcObject) {
      videoRemoteUserElement.srcObject = stream
    }
  }
  // Send video to peer
  localMediaStream.getTracks().forEach((track) => peer.pc.addTrack(track, localMediaStream))

  const offerDescription = await peer.pc.createOffer()
  await peer.pc.setLocalDescription(offerDescription)
  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type
  }
  channel.push(`user:create_peer_offer:${peer.user_id}`, { offer: offer })
}

const peer_offer_created_callback = async (payload: any) => {
  const channel = socketConnection.getOrCreateChannel(roomStore.roomTopic)
  const ice_servers_resp = await roomStore.iceServersPromise

  const RTCPeerConfig = {
    iceServers: ice_servers_resp.ice_servers
  }

  const peer = {
    pc: new RTCPeerConnection(RTCPeerConfig),
    user_id: payload.user_id,
    username: payload.username,
    element_id: `remote-user-${payload.user_id}`
  }
  roomStore.pushPeers(peer)
  await nextTick()

  // Send ice_candidate to peer
  peer.pc.onicecandidate = (event) => {
    if (event.candidate) {
      channel.push(`user:create_peer_ice_candidate:${peer.user_id}`, {
        ice_candidate: event.candidate
      })
    }
  }

  const videoRemoteUserElement = document.getElementById(peer.element_id) as HTMLVideoElement
  // Show video from peer
  peer.pc.ontrack = (event) => {
    const stream = event.streams[0]
    if (!videoRemoteUserElement.srcObject) {
      videoRemoteUserElement.srcObject = stream
    }
  }
  // Send video to peer
  localMediaStream.getTracks().forEach((track) => peer.pc.addTrack(track, localMediaStream))

  await peer.pc.setRemoteDescription(new RTCSessionDescription(payload.offer))
  const answerDescription = await peer.pc.createAnswer()
  await peer.pc.setLocalDescription(answerDescription)

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp
  }

  channel.push(`user:create_peer_answer:${peer.user_id}`, { answer })
}

const peer_answer_created = async (payload: any) => {
  const peer = roomStore.peers.find((peer) => peer.user_id === payload.user_id)
  const answerDescription = new RTCSessionDescription(payload.answer)
  peer!.pc.setRemoteDescription(answerDescription)
}

const peer_ice_candidate_created = async (payload: any) => {
  const peer = roomStore.peers.find((peer) => peer.user_id === payload.user_id)
  const ice_candidate = new RTCIceCandidate(payload.ice_candidate)
  peer!.pc.addIceCandidate(ice_candidate)
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
  socketConnection.channelOn(channelTopic, 'message.created', (message: IMessage) => {
    message.created_at = dateFormatWithFormat(message.created_at)

    const itemType =
      message.user_id === userStore.userId
        ? ChatListItemType.MessageSent
        : ChatListItemType.MessageReceived

    roomStore.unshiftListItems({ type: itemType, meta: message })
  })

  socketConnection.channelOn(channelTopic, 'presence_state', (state) => {
    roomPresences = {}
    roomPresences = Presence.syncState(roomPresences, state)
    const connectedUsers = Presence.list(roomPresences, (id, { metas: [user, ...rest] }) => {
      user.user_id = id
      return user
    })
    roomStore.setConnectedUsers(connectedUsers)
  })

  socketConnection.channelOn(channelTopic, 'presence_diff', (diff) => {
    const presences = Presence.syncDiff(roomPresences, diff, onJoin, onLeave)
    const connectedUsers = Presence.list(presences, (id, { metas: [user, ...rest] }) => {
      user.user_id = id
      return user
    })
    roomStore.setConnectedUsers(connectedUsers)
  })
}

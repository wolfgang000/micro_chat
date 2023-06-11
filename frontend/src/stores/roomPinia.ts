import { socketConnection } from '@/api'
import { defineStore } from 'pinia'
import { userStore } from './user'

export const useRoomStore = defineStore('room', {
  state: () => {
    const videoElementCurrentUser: any = null

    return {
      roomName: '',
      roomTopic: '',
      isVideoChatActivated: false,
      wasVideoActivateByCurrentUser: false,
      videoElementCurrentUser: videoElementCurrentUser as HTMLVideoElement,
      peerConnectionConfig: null as any
    }
  },
  actions: {
    setPeerConnectionConfig(value: any) {
      this.peerConnectionConfig = value
    },
    setRoomName(value: string) {
      this.roomName = value
    },
    setRoomTopic(value: string) {
      this.roomTopic = value
    },
    startCallAsCaller() {
      this.activateVideoChat().then(() => {
        this.isVideoChatActivated = true
        this.wasVideoActivateByCurrentUser = true
      })
    },
    joinCallAsCallee() {
      this.activateVideoChat().then(() => {
        this.isVideoChatActivated = true
        this.wasVideoActivateByCurrentUser = false
      })
    },
    leaveCall() {
      const channel = socketConnection.getOrCreateChannel(this.roomTopic)
      channel.off('a_user_has_left_the_call')
      channel.off(`offer:${userStore.username}`)
      channel.off(`answer:${userStore.username}`)
      channel.off(`ice_candidate:${userStore.username}`)
      channel.push('leave_call', {})
      this.isVideoChatActivated = false
      this.wasVideoActivateByCurrentUser = false
    },
    activateVideoChat() {
      return navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(() => {})
        .catch((error) => {
          console.log('error', error)
        })
    },
    setVideoElementCurrentUser(value: HTMLVideoElement) {
      this.videoElementCurrentUser = value

      return navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((localStream) => {
          this.videoElementCurrentUser.srcObject = localStream
          this.videoElementCurrentUser.muted = true
          return localStream
        })
    },
    fetchAndSetPeerConnectionConfig() {
      const channel = socketConnection.getOrCreateChannel(this.roomTopic)

      return new Promise((resolve, reject) => {
        return channel
          .push('get_ice_servers', {})
          .receive('ok', (ice_servers) => {
            console.log(ice_servers)
            resolve(ice_servers)
          })
          .receive('error', (reasons) => reject(reasons))
          .receive('timeout', () => reject('Networking issue...'))
      })
    }
  }
})

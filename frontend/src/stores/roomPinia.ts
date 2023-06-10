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
      videoElementCurrentUser: videoElementCurrentUser as HTMLVideoElement
    }
  },
  actions: {
    setRoomName(value: string) {
      this.roomName = value
    },
    setRoomTopic(value: string) {
      this.roomTopic = value
    },
    startCallAsCallerPart1() {
      this.activateVideoChat().then(() => {
        this.isVideoChatActivated = true
        this.wasVideoActivateByCurrentUser = true
      })
    },
    joinCallAsCalleePart1() {
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
    }
  }
})

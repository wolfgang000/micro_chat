import { socketConnection } from '@/api'
import { defineStore } from 'pinia'

export const useRoomStore = defineStore('room', {
  state: () => {
    const videoElementCurrentUser: any = null

    return {
      roomTopic: '',
      isVideoChatActivated: false,
      wasVideoActivateByCurrentUser: false,
      videoElementCurrentUser: videoElementCurrentUser as HTMLVideoElement
    }
  },
  actions: {
    setRoomTopic(value: string) {
      this.roomTopic = value
    },
    startCallAsCallerPart1() {
      this.activateVideoChat().then(() => {
        this.isVideoChatActivated = true
        this.wasVideoActivateByCurrentUser = true
      })
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

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(async (localStream) => {
          this.videoElementCurrentUser.srcObject = localStream
          this.videoElementCurrentUser.muted = true
        })
    }
  }
})

import { defineStore } from 'pinia'

export const useRoomStore = defineStore('room', {
  state: () => {
    const videoElementCurrentUser: any = null

    return {
      isVideoChatActivated: false,
      videoElementCurrentUser: videoElementCurrentUser as HTMLVideoElement
    }
  },
  actions: {
    activateVideoChat() {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(() => {
          this.isVideoChatActivated = true
        })
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

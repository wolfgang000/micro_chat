<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoomStore } from '@/stores/roomPinia'
import { socketConnection } from '@/api'
import { userStore } from '@/stores/user'

const peers = ref([] as any[])

const roomStorePinia = useRoomStore()
const videoCurrentUser = ref<HTMLVideoElement>()

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
    }
  ],
  iceCandidatePoolSize: 10
}
// Global State
let pc = new RTCPeerConnection(servers)
// let localStream = null
// let remoteStream: MediaStream | null = null

onMounted(async () => {
  const channel = socketConnection.getOrCreateChannel(roomStorePinia.roomTopic)
  const promise = roomStorePinia.setVideoElementCurrentUser(videoCurrentUser.value!)

  if (roomStorePinia.wasVideoActivateByCurrentUser) {
    channel.push('start_call', {})

    channel.on(
      'a_user_has_joined_the_call',
      async ({
        offer: offer,
        ice_candidates: peerIceCandidates,
        username: username
      }: {
        offer: any
        ice_candidates: any[]
        username: string
      }) => {
        // asume 1 connection
        const localStream = await promise
        const peer = {
          remoteStream: new MediaStream(),
          username,
          pc: new RTCPeerConnection(servers),
          element_id: `remote-user-${username}`
        }

        // Push tracks from your local stream to the peer connection
        localStream.getTracks().forEach((track) => {
          peer.pc.addTrack(track, localStream)
        })

        // Set up an event listener to pull tracks from the remote peer stream when they are available

        peer.pc.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            peer.remoteStream.addTrack(track)
          })
        }

        peers.value.push(peer)
        await nextTick()
        const videoRemoteUser = document.getElementById(peer.element_id) as HTMLVideoElement
        if (videoRemoteUser) {
          videoRemoteUser.srcObject = peer.remoteStream
        }

        const iceCandidatesPromise = new Promise<RTCIceCandidate[]>((resolve, reject) => {
          const candidates: RTCIceCandidate[] = []
          peer.pc.onicecandidate = (event) => {
            if (event.candidate) {
              candidates.push(event.candidate)
            } else {
              resolve(candidates)
            }
          }
        })

        await peer.pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answerDescription = await peer.pc.createAnswer()
        await peer.pc.setLocalDescription(answerDescription)

        // Create an object which contains the SDP answer data
        const iceCandidates = await iceCandidatesPromise
        const answer = {
          type: answerDescription.type,
          sdp: answerDescription.sdp
        }

        // Send the answer to the signaling server which further sends it to the caller
        channel.push(`answer:${peer.username}`, { answer, ice_candidates: iceCandidates })
        console.log('push answer:${userStore.username')

        peerIceCandidates.forEach((candidate) => {
          console.log('Adding caller ice candidate', candidate)
          const ice_candidate = new RTCIceCandidate(candidate)
          peer.pc.addIceCandidate(ice_candidate)
        })
      }
    )
  } else {
    // asume 1 connection
    const localStream = await promise
    // Push tracks from your local stream to the peer connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream)
    })

    // Set up an event listener to pull tracks from the remote peer stream when they are available
    // pc.ontrack = (event) => {
    //   event.streams[0].getTracks().forEach((track) => {
    //     remoteStream!.addTrack(track)
    //   })
    // }

    const iceCandidatesPromise = new Promise<RTCIceCandidate[]>((resolve, reject) => {
      const candidates: RTCIceCandidate[] = []
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          candidates.push(event.candidate)
        } else {
          resolve(candidates)
        }
      }
    })

    const offerDescription = await pc.createOffer()
    await pc.setLocalDescription(offerDescription)
    const iceCandidates = await iceCandidatesPromise
    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type
    }

    channel.push('join_call', { offer: offer, ice_candidates: iceCandidates })

    channel.on(
      `answer:${userStore.username}`,
      ({ answer, ice_candidates: peerIceCandidates }: { answer: any; ice_candidates: any[] }) => {
        console.log('On answer:${userStore.username')

        console.log('Received answer from callee', answer)

        peerIceCandidates.forEach((candidate) => {
          const ice_candidate = new RTCIceCandidate(candidate)
          pc.addIceCandidate(ice_candidate)
        })

        const answerDescription = new RTCSessionDescription(answer)
        pc.setRemoteDescription(answerDescription)
      }
    )
  }
})
</script>

<template>
  <div class="video-chat-container">
    <span>
      <h3>Local Stream</h3>
      <video id="currentUserVideoElement" ref="videoCurrentUser" autoplay playsinline></video>
    </span>
    <div id="remoteUsersVideoContainer">
      <span v-for="(peer, index) in peers">
        <h3>Local Stream</h3>
        <video :id="peer.element_id" class="remote-user" autoplay playsinline></video>
      </span>
    </div>
  </div>
</template>

<style scoped>
video {
  width: 400px;
  height: 400px;
  margin: 2rem;
  background: #2c3e50;
}
.videos {
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-chat-container {
  height: 100%;
  overflow-y: auto;
}
</style>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoomStore } from '@/stores/roomPinia'
import { socketConnection } from '@/api'
import { userStore } from '@/stores/user'
import { roomStore } from '@/stores/room'

const peers = ref(
  [] as {
    remoteStream: any
    username: string
    pc: RTCPeerConnection
    element_id: string
  }[]
)

const createPeer = (username: string) => {
  const peer = {
    remoteStream: new MediaStream(),
    username: username,
    pc: new RTCPeerConnection(servers),
    element_id: `remote-user-${username}`
  }
  return peer
}

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

onMounted(async () => {
  const channel = socketConnection.getOrCreateChannel(roomStorePinia.roomTopic)
  const promise = roomStorePinia.setVideoElementCurrentUser(videoCurrentUser.value!)

  if (roomStorePinia.wasVideoActivateByCurrentUser) {
    channel.push('start_call', {})
  } else {
    const localStream = await promise
    const inCallUsers = roomStore.connectedUsers.filter((user) => user.is_in_call)
    channel.push('join_call', {})

    inCallUsers.forEach(async (user) => {
      const peer =
        peers.value.find((peer) => peer.username === user.username) || createPeer(user.username)

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
      peer.pc.onconnectionstatechange = (event) => {
        switch (peer.pc.connectionState) {
          // The connection has become fully connected
          case 'connected':
            console.log('RTCPeerConnection: Connected')
            break

          case 'disconnected':
            console.log('RTCPeerConnection: Disconnected')
            peers.value = peers.value.filter((p) => p.username !== peer.username)
            break

          // One or more transports has terminated unexpectedly or in an error
          case 'failed':
            console.log('RTCPeerConnection: Failed')
            break

          // The connection has been closed
          case 'closed':
            console.log('RTCPeerConnection: Closed')
            break
        }
      }
      await nextTick()
      const videoRemoteUser = document.getElementById(peer.element_id) as HTMLVideoElement
      if (videoRemoteUser) {
        videoRemoteUser.srcObject = peer.remoteStream
      }

      peer.pc.onicecandidate = (event) => {
        if (event.candidate) {
          channel.push(`ice_candidate:${peer.username}`, { ice_candidate: event.candidate })
        }
      }

      const offerDescription = await peer.pc.createOffer()
      await peer.pc.setLocalDescription(offerDescription)
      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type
      }

      channel.push(`offer:${peer.username}`, { offer: offer })
    })
  }

  channel.on(
    `offer:${userStore.username}`,
    async ({ offer: offer, username: username }: { offer: any; username: string }) => {
      // asume 1 connection
      const localStream = await promise
      const peer = peers.value.find((peer) => peer.username === username) || createPeer(username)

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
      peer.pc.onconnectionstatechange = (event) => {
        switch (peer.pc.connectionState) {
          // The connection has become fully connected
          case 'connected':
            console.log('RTCPeerConnection: Connected')
            break

          case 'disconnected':
            console.log('RTCPeerConnection: Disconnected')
            peers.value = peers.value.filter((p) => p.username !== peer.username)
            break

          // One or more transports has terminated unexpectedly or in an error
          case 'failed':
            console.log('RTCPeerConnection: Failed')
            break

          // The connection has been closed
          case 'closed':
            console.log('RTCPeerConnection: Closed')
            break
        }
      }
      await nextTick()
      const videoRemoteUser = document.getElementById(peer.element_id) as HTMLVideoElement
      if (videoRemoteUser) {
        videoRemoteUser.srcObject = peer.remoteStream
      }

      peer.pc.onicecandidate = (event) => {
        if (event.candidate) {
          channel.push(`ice_candidate:${peer.username}`, { ice_candidate: event.candidate })
        }
      }

      await peer.pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answerDescription = await peer.pc.createAnswer()
      await peer.pc.setLocalDescription(answerDescription)

      // Create an object which contains the SDP answer data
      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp
      }

      // Send the answer to the signaling server which further sends it to the caller
      channel.push(`answer:${peer.username}`, { answer })
    }
  )

  channel.on(
    `answer:${userStore.username}`,
    ({ answer, username }: { answer: any; username: string }) => {
      const peer = peers.value.find((peer) => peer.username === username) || createPeer(username)

      const answerDescription = new RTCSessionDescription(answer)
      peer.pc.setRemoteDescription(answerDescription)
    }
  )

  channel.on(
    `ice_candidate:${userStore.username}`,
    ({ ice_candidate: iceCandidate, username }: { ice_candidate: any; username: string }) => {
      const peer = peers.value.find((peer) => peer.username === username) || createPeer(username)
      const ice_candidate = new RTCIceCandidate(iceCandidate)
      peer.pc.addIceCandidate(ice_candidate)
    }
  )
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

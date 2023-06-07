<script setup lang="ts">
import { roomStore } from '@/stores/room'
import IconPhone from '../icons/IconPhone.vue'

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
let localStream = null
let remoteStream: MediaStream | null = null

pc.onconnectionstatechange = (event) => {
  switch (pc.connectionState) {
    // The connection has become fully connected
    case 'connected':
      console.log('RTCPeerConnection: Connected')
      break

    case 'disconnected':
      console.log('RTCPeerConnection: Disconnected')
      alert('Call Ended !')
      location.reload()
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

const onCallButtonClick = async () => {
  const webcamVideo = document.getElementById('webcamVideo') as any
  const remoteVideo = document.getElementById('remoteVideo') as any

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then(async (localStream) => {
      remoteStream = new MediaStream()

      // Push tracks from your local stream to the peer connection
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream)
      })

      // Set up an event listener to pull tracks from the remote peer stream when they are available
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream!.addTrack(track)
        })
      }

      webcamVideo.srcObject = localStream
      webcamVideo.muted = true
      remoteVideo.srcObject = remoteStream

      pc.onicecandidate = (event) => {
        console.log('event', event)
        if (event.candidate) {
          // channel.push('ice_candidate', { ice_candidate: event.candidate, type: 'caller' }, 10000)
          console.log('Pushed caller ice candidate', event.candidate)
        }
      }

      const offerDescription = await pc.createOffer()

      // Set the offer Description as the local Description for the RTCPeerConnection
      // This triggers the pc.onicecandidate that generates to ice candidates
      await pc.setLocalDescription(offerDescription)

      // Create a JS object which contains the SDP offer data
      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type
      }

      // Send the offer to the remote peer via the signaling server
      // channel.push('offer', { offer }, 10000)
      console.log('Pushed offer from caller', offer)
    })
    .catch((error) => console.error('error', error))
}
</script>

<template>
  <div>
    <div class="contact-header d-flex align-items-center">
      <div class="d-flex justify-content-between" style="width: 100%; margin-right: 0.5rem">
        <div class="d-flex align-items-center ms-2">
          <a href="#"
            ><strong>{{ roomStore.roomName }}</strong></a
          >
        </div>
        <div>
          <button type="button" class="btn btn-light me-2" @click="onCallButtonClick">
            <IconPhone />
          </button>
          <button
            type="button"
            class="btn btn-light"
            data-bs-toggle="modal"
            data-bs-target="#membersOnlineModal"
            id="membersOnlinebutton"
          >
            <span style="color: green" class="me-1">●</span>
            {{ roomStore.connectedUsers.length }} Members online
          </button>
        </div>
      </div>
    </div>
    <!-- Modal -->
    <div
      class="modal fade"
      id="membersOnlineModal"
      tabindex="-1"
      aria-labelledby="membersOnlineModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="membersOnlineModalLabel">Members online</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <ul class="list-group list-group-flush">
              <li class="list-group-item" v-for="user in roomStore.connectedUsers">
                {{ user.username }}
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-header {
  color: black;
  width: 100%;
  height: 50px;
  background: rgba(247, 249, 250, 1);
  box-shadow: 0 10px 6px -6px #ccc;
  z-index: 1;
}
</style>

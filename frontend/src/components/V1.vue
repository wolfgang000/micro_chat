<script setup lang="ts">
import { roomStore } from '@/stores/room'
import { onMounted } from 'vue'
import { socketConnection } from '@/api'
import { userStore } from '@/stores/user'

onMounted(async () => {
  // @ts-ignore
  const drone = new ScaleDrone('yiS12Ts5RdNhebyM')
  const roomName = 'observable-' + roomStore.roomTopic
  const channel = socketConnection.getOrCreateChannel(roomStore.roomTopic)

  const ice_servers = await new Promise((resolve, reject) => {
    return channel
      .push('get_ice_servers', {})
      .receive('ok', (ice_servers) => {
        resolve(ice_servers)
      })
      .receive('error', (reasons) => reject(reasons))
      .receive('timeout', () => reject('Networking issue...'))
  })

  const configuration = {
    iceServers: ice_servers as any
  }
  let room: any
  let pc: RTCPeerConnection

  function onSuccess() {}
  function onError(error: any) {
    console.error(error)
  }

  drone.on('open', (error: any) => {
    if (error) {
      return console.error(error)
    }
    room = drone.subscribe(roomName)
    room.on('open', (error: any) => {
      if (error) {
        onError(error)
      }
    })
    // We're connected to the room and received an array of 'members'
    // connected to the room (including us). Signaling server is ready.
    room.on('members', (members: any) => {
      console.log('MEMBERS', members)
      // If we are the second user to connect to the room we will be creating the offer
      const isOfferer = members.length === 2
      startWebRTC(isOfferer)
    })
  })

  // Send signaling data via Scaledrone
  function sendMessage(message: any) {
    channel.push(`data`, message)
  }

  function startWebRTC(isOfferer: boolean) {
    pc = new RTCPeerConnection(configuration)

    // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
    // message to the other peer through the signaling server
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({ candidate: event.candidate })
      }
    }

    // If user is offerer let the 'negotiationneeded' event create the offer
    if (isOfferer) {
      pc.onnegotiationneeded = () => {
        pc.createOffer().then(localDescCreated).catch(onError)
      }
    }

    // When a remote stream arrives display it in the #remoteVideo element
    const localVideo = document.getElementById('localVideo') as HTMLVideoElement
    const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement
    pc.ontrack = (event) => {
      const stream = event.streams[0]
      if (!remoteVideo.srcObject) {
        remoteVideo.srcObject = stream
      }
    }

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true
      })
      .then((stream) => {
        // Display your local video in #localVideo element
        localVideo.srcObject = stream
        // Add your stream to be sent to the conneting peer
        stream.getTracks().forEach((track) => pc.addTrack(track, stream))
      }, onError)

    // Listen to signaling data from Scaledrone

    channel.on(`data`, (message: any) => {
      if (userStore.username === message.username) {
        return
      }
      console.log()

      if (message.sdp) {
        // This is called after receiving an offer or answer from another peer
        pc.setRemoteDescription(new RTCSessionDescription(message))
          .then(() => {
            // When receiving an offer lets answer it
            if (pc.remoteDescription!.type === 'offer') {
              pc.createAnswer().then(localDescCreated).catch(onError)
            }
          })
          .catch(onError)
      } else if (message.candidate) {
        // Add the new ICE candidate to our connections remote description
        pc.addIceCandidate(new RTCIceCandidate(message.candidate)).catch(onError)
      }
    })

    // room.on('data', (message: any, client: any) => {
    //   // Message was sent by us
    //   if (client.id === drone.clientId) {
    //     return
    //   }

    //   if (message.sdp) {
    //     // This is called after receiving an offer or answer from another peer
    //     pc.setRemoteDescription(new RTCSessionDescription(message))
    //       .then(() => {
    //         // When receiving an offer lets answer it
    //         if (pc.remoteDescription!.type === 'offer') {
    //           pc.createAnswer().then(localDescCreated).catch(onError)
    //         }
    //       })
    //       .catch(onError)
    //   } else if (message.candidate) {
    //     // Add the new ICE candidate to our connections remote description
    //     pc.addIceCandidate(new RTCIceCandidate(message.candidate)).catch(onError)
    //   }
    // })
  }

  function localDescCreated(desc: RTCLocalSessionDescriptionInit) {
    pc.setLocalDescription(desc)
      .then(() => sendMessage(desc))
      .catch(onError)
  }
})
</script>

<template>
  <div>
    <video id="localVideo" autoplay muted></video>
    <video id="remoteVideo" autoplay></video>
  </div>
</template>

<style scoped>
video {
  max-width: calc(50% - 100px);
  margin: 0 50px;
  box-sizing: border-box;
  border-radius: 2px;
  padding: 0;
  box-shadow: rgba(156, 172, 172, 0.2) 0px 2px 2px, rgba(156, 172, 172, 0.2) 0px 4px 4px,
    rgba(156, 172, 172, 0.2) 0px 8px 8px, rgba(156, 172, 172, 0.2) 0px 16px 16px,
    rgba(156, 172, 172, 0.2) 0px 32px 32px, rgba(156, 172, 172, 0.2) 0px 64px 64px;
}
</style>

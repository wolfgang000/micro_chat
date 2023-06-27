<script setup lang="ts">
import { socketConnection } from '@/api'
import { localMediaStream, roomStore } from '@/stores/room'
import { userStore } from '@/stores/user'

import { ref, onMounted, nextTick } from 'vue'

onMounted(async () => {
  const channel = socketConnection.getOrCreateChannel(roomStore.roomTopic)
  roomStore.setVideoElementCurrentUser(
    document.getElementById('currentUserVideoElement') as HTMLVideoElement
  )
  if (!roomStore.wasVideoActivateByCurrentUser) {
    const inCallUsers = roomStore.connectedUsers.filter(
      (user) => user.is_in_call && user.user_id !== userStore.userId
    )
    const ice_servers_resp = await roomStore.iceServersPromise

    const RTCPeerConfig = {
      iceServers: ice_servers_resp.ice_servers
    }

    inCallUsers.forEach(async (user) => {
      const pc = new RTCPeerConnection(RTCPeerConfig)
      roomStore.pushPeers({
        pc: pc,
        user_id: user.user_id,
        username: user.username,
        element_id: `remote-user-${user.user_id}`
      })

      localMediaStream.getTracks().forEach((track) => pc.addTrack(track, localMediaStream))
    })
  }
})
</script>

<template>
  <video class="video" id="currentUserVideoElement" autoplay muted></video>

  <video
    style=""
    class="video remote-user"
    autoplay
    v-for="peer in roomStore.peers"
    :id="peer.element_id"
  ></video>
</template>
<style scoped>
.video {
  width: 100% !important;
  height: auto !important;
  background: #202124;
}
</style>

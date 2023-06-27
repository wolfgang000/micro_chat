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

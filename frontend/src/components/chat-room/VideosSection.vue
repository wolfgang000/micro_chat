<script setup lang="ts">
import { socketConnection } from '@/api'
import { roomStore } from '@/stores/room'
import { onMounted } from 'vue'

onMounted(async () => {
  const channel = socketConnection.getOrCreateChannel(roomStore.roomTopic)
  roomStore.setVideoElementCurrentUser(
    document.getElementById('currentUserVideoElement') as HTMLVideoElement
  )
})
</script>

<template>
  <div class="video-chat-container">
    <video class="video" id="currentUserVideoElement" autoplay muted></video>

    <video
      style=""
      class="video remote-user"
      autoplay
      v-for="peer in roomStore.peers"
      :id="peer.element_id"
    ></video>
  </div>
</template>
<style scoped>
.video-chat-container {
  height: 100%;
  overflow-y: auto;
  background: #202124;
}
.video {
  width: 100% !important;
  height: auto !important;
  background: #202124;
}
</style>

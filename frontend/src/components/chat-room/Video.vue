<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoomStore } from '@/stores/roomPinia'
import { socketConnection } from '@/api'
const roomStorePinia = useRoomStore()
const videoCurrentUser = ref<HTMLVideoElement>()

onMounted(() => {
  roomStorePinia.setVideoElementCurrentUser(videoCurrentUser.value!)
  console.log(roomStorePinia.wasVideoActivateByCurrentUser)
  if (roomStorePinia.wasVideoActivateByCurrentUser) {
    const channel = socketConnection.getOrCreateChannel(roomStorePinia.roomTopic)
    channel.push('start_call', {})
  }
})
</script>

<template>
  <div class="video-chat-container">
    <span>
      <h3>Local Stream</h3>
      <video id="currentUserVideoElement" ref="videoCurrentUser" autoplay playsinline></video>
    </span>
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

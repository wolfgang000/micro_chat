<script setup lang="ts">
import { onUnmounted } from 'vue'
import { socketConnection } from '../api'
import { useRoute } from 'vue-router'
import {
  roomStore,
  setupChannelPresenceCallbacks as setupRoomChannelCallbacks
} from '@/stores/room'

import ChatList from '@/components/chat-room/List.vue'
import ChatHeader from '@/components/chat-room/Header.vue'
import TypingIndicator from '@/components/chat-room/TypingIndicator.vue'
import InputBox from '@/components/chat-room/InputBox.vue'

const route = useRoute()

const roomId = route.params.roomId
const channelTopic = `room:${roomId}`
roomStore.setRoomTopic(channelTopic)

socketConnection.getOrCreateChannel(channelTopic)
setupRoomChannelCallbacks(channelTopic)

// handle race condition here
socketConnection.channelJoin(channelTopic).then(() => {
  roomStore.setRoomName(`#${roomId}`)
  document.title = `Room #${roomId}`
})

onUnmounted(() => {
  socketConnection.deleteChannel(channelTopic)
})
</script>

<template>
  <div class="d-flex flex-row justify-content-between">
    <div class="">
      <div class="videos">
        <span>
          <h3>Local Stream</h3>
          <video id="webcamVideo" autoplay playsinline></video>
        </span>
        <span>
          <h3>Remote Stream</h3>
          <video id="remoteVideo" autoplay playsinline></video>
        </span>
      </div>
    </div>

    <div class="chat-room-main-container d-flex flex-column flex-grow-1" style="height: 100vh">
      <ChatHeader />
      <ChatList />
      <TypingIndicator />
      <InputBox />
    </div>
  </div>
</template>

<style scoped>
.chat-room-main-container {
  background: #f7f9fa;
}

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
</style>

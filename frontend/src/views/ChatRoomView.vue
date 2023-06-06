<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
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

socketConnection.channelJoin(channelTopic).then(() => {
  roomStore.setRoomName(`#${roomId}`)
  document.title = `Room #${roomId}`
})

onUnmounted(() => {
  socketConnection.deleteChannel(channelTopic)
})
</script>

<template>
  <div class="chat-room-main-container d-flex flex-column" style="height: 100vh">
    <ChatHeader />
    <ChatList />
    <TypingIndicator />
    <InputBox />
  </div>
</template>

<style scoped>
.chat-room-main-container {
  background: #f7f9fa;
}
</style>

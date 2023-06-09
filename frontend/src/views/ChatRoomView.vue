<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue'
import { socketConnection } from '../api'
import { useRoute } from 'vue-router'
import {
  roomStore,
  setupChannelPresenceCallbacks as setupRoomChannelCallbacks
} from '@/stores/room'

import VideoContainer from '@/components/chat-room/VideoContainer.vue'
import ChatList from '@/components/chat-room/List.vue'
import ChatHeader from '@/components/chat-room/Header.vue'
import TypingIndicator from '@/components/chat-room/TypingIndicator.vue'
import InCallIndicator from '@/components/chat-room/InCallIndicator.vue'
import InputBox from '@/components/chat-room/InputBox.vue'
import { useRoomStore } from '@/stores/roomPinia'

const roomStorePinia = useRoomStore()

const route = useRoute()
const hasJoinedTheChannel = ref(false)
const roomId = route.params.roomId
const channelTopic = `room:${roomId}`
roomStorePinia.setRoomTopic(channelTopic)

socketConnection.getOrCreateChannel(channelTopic)
setupRoomChannelCallbacks(channelTopic)

onBeforeMount(async () => {
  await socketConnection.channelJoin(channelTopic).then(() => {
    roomStore.setRoomName(`#${roomId}`)
    document.title = `Room #${roomId}`
    hasJoinedTheChannel.value = true
  })
})

onUnmounted(() => {
  socketConnection.deleteChannel(channelTopic)
})
</script>

<template>
  <div class="d-flex flex-row justify-content-between" v-if="hasJoinedTheChannel">
    <div v-if="roomStorePinia.isVideoChatActivated" style="height: 100vh">
      <VideoContainer />
    </div>
    <div class="chat-room-main-container d-flex flex-column flex-grow-1" style="height: 100vh">
      <ChatHeader />
      <InCallIndicator />
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
</style>

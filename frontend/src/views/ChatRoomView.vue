<script setup lang="ts">
import { onBeforeMount, onUnmounted, ref } from 'vue'
import { socketConnection } from '../api'
import { useRoute } from 'vue-router'
import {
  roomStore,
  setupChannelPresenceCallbacks as setupRoomChannelCallbacks
} from '@/stores/room'
import { userStore } from '@/stores/user'

import ChatHeader from '@/components/chat-room/Header.vue'
import MessagesSection from '@/components/chat-room/MessagesSection.vue'
import VideosSection from '@/components/chat-room/VideosSection.vue'

const route = useRoute()
const hasJoinedTheChannel = ref(false)
const roomId = route.params.roomId
const channelTopic = `room:${roomId}`
roomStore.setRoomTopic(channelTopic)

socketConnection.getOrCreateChannel(channelTopic)
setupRoomChannelCallbacks(channelTopic)

onBeforeMount(async () => {
  await socketConnection.channelJoin(channelTopic).then((resp) => {
    roomStore.setRoomName(`#${roomId}`)
    userStore.userId = resp.user_id
    document.title = `Room #${roomId}`
    hasJoinedTheChannel.value = true
  })
})

onUnmounted(() => {
  socketConnection.deleteChannel(channelTopic)
})
</script>

<template>
  <div class="d-flex">
    <div style="width: 50%" v-if="roomStore.isVideoChatActivated">
      <VideosSection />
    </div>
    <div class="chat-room-main-container d-flex flex-column" v-if="hasJoinedTheChannel">
      <ChatHeader />
      <MessagesSection />
    </div>
  </div>
</template>

<style scoped>
.chat-room-main-container {
  background: #f7f9fa;
  height: 100vh;
  width: 100%;
}
</style>

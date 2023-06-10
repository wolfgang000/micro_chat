<script setup lang="ts">
import { onBeforeMount, onUnmounted, ref } from 'vue'
import { socketConnection } from '../api'
import { useRoute } from 'vue-router'
import { setupChannelPresenceCallbacks } from '@/stores/room'

import VideosSection from '@/components/chat-room/VideosSection.vue'
import MessagesSection from '@/components/chat-room/MessagesSection.vue'
import ChatHeader from '@/components/chat-room/Header.vue'
import { useRoomStore } from '@/stores/roomPinia'

const roomStore = useRoomStore()
const route = useRoute()
const hasJoinedTheChannel = ref(false)
const roomId = route.params.roomId
const channelTopic = `room:${roomId}`
roomStore.setRoomTopic(channelTopic)

socketConnection.getOrCreateChannel(channelTopic)
setupChannelPresenceCallbacks(channelTopic)

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
  <div class="d-flex flex-column" style="height: 100vh" v-if="hasJoinedTheChannel">
    <ChatHeader />
    <div class="d-flex flex-row" style="height: calc(100% - 50px)">
      <VideosSection v-if="roomStore.isVideoChatActivated" />
      <MessagesSection />
    </div>
  </div>
</template>

<style scoped></style>

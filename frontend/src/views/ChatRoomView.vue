<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue'
import { socketConnection } from '../api'
import { useRoute } from 'vue-router'
import {
  roomStore,
  setupChannelPresenceCallbacks as setupRoomChannelCallbacks
} from '@/stores/room'

import ChatHeader from '@/components/chat-room/Header.vue'
import MessagesSection from '@/components/chat-room/MessagesSection.vue'

const route = useRoute()
const hasJoinedTheChannel = ref(false)
const roomId = route.params.roomId
const channelTopic = `room:${roomId}`
roomStore.setRoomTopic(channelTopic)

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
  <div class="chat-room-main-container d-flex flex-column" v-if="hasJoinedTheChannel">
    <ChatHeader />
    <MessagesSection />
  </div>
</template>

<style scoped>
.chat-room-main-container {
  background: #f7f9fa;
  height: 100vh;
}
</style>

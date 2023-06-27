<script setup lang="ts">
import { socketConnection } from '@/api'
import { roomStore } from '@/stores/room'
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

    inCallUsers.forEach(async (user) => {
      roomStore.pushPeers({
        user_id: user.user_id,
        username: user.username,
        element_id: `remote-user-${user.user_id}`
      })
    })
  }
})
</script>

<template>
  <video
    style="width: 100% !important; height: auto !important"
    id="currentUserVideoElement"
    autoplay
    muted
  ></video>

  <video
    style="width: 100% !important; height: auto !important"
    class="remote-user"
    autoplay
    v-for="peer in roomStore.peers"
    :id="peer.element_id"
  ></video>
</template>
<VideoIteam :element_id="peer.element_id" class="remote-user" />
<style scoped></style>

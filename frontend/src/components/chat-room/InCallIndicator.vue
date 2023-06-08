<script setup lang="ts">
import { computed } from 'vue'
import { roomStore } from '@/stores/room'

import { useRoomStore } from '@/stores/roomPinia'
const roomStorePinia = useRoomStore()

const inCallUsers = computed(() => {
  return roomStore.connectedUsers.filter((user) => user.is_in_call)
})

const inCallUsersText = computed(() => {
  const inCall = roomStore.connectedUsers.filter((user) => user.is_in_call)
  return inCall.length > 1 ? ' are in call' : ' is in call'
})
</script>
<template>
  <div id="InCallIndicatorContainer" class="ps-3 pb-2" v-if="inCallUsers.length > 0">
    <div>
      <span class="time_date" v-for="(user, index) in inCallUsers"
        ><strong>{{ user.username }}</strong>
        <span v-if="index == inCallUsers.length - 1"></span>
        <span v-else>,</span>
      </span>
      {{ inCallUsersText }}
    </div>
  </div>
</template>

<style scoped>
.contact {
  box-shadow: 0 10px 6px -6px #ccc;
  z-index: 1;
}
</style>

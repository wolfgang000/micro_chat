<script setup lang="ts">
import { computed } from 'vue'
import { roomStore } from '@/stores/room'
import { userStore } from '@/stores/user'

const typingUsers = computed(() => {
  return roomStore.connectedUsers.filter(
    (user) => user.is_typing && user.username !== userStore.username
  )
})
</script>
<template>
  <div class="ps-3 pb-2" id="typingIndicatorContainer">
    <div v-for="user in typingUsers">
      <span class="time_date"
        ><strong>{{ user.username }}</strong> is typing...
      </span>
    </div>
  </div>
</template>

<style scoped>
@import './list-item/base.css';
</style>

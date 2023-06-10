<script setup lang="ts">
import { roomStore } from '@/stores/room'
import ListItem from './MessageListItem.vue'
</script>

<template>
  <div id="message_list" class="msg_history d-flex flex-column-reverse">
    <ListItem v-for="(item, index) in roomStore.listItems" v-bind:key="index" :item="item" />
  </div>
</template>

<style scoped>
.msg_history {
  height: 100%;
  overflow-y: auto;
}

::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(226, 221, 221, 0.8);
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgb(255, 255, 255, 0.8);
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
</style>

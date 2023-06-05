<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { socketConnection } from '../api'
import { useRoute } from 'vue-router'
import { ChatListItemType } from '@/models'
import type { IMessage } from '@/models'
import { userStore } from '@/stores/user'
import { roomStore, setupChannelPresenceCallbacks } from '@/stores/room'

import ChatList from '@/components/chat-room/List.vue'
import ChatHeader from '@/components/chat-room/Header.vue'
import dateFormat from 'dateformat'

const message = ref('')
const route = useRoute()

const roomId = route.params.roomId
const channelTopic = `room:${roomId}`
const channel = socketConnection.getOrCreateChannel(channelTopic)

const dateFormatWithFormat = (value: string | Date): string => {
  return dateFormat(value, 'dddd, mmmm d, yyyy | h:MM TT')
}

socketConnection.channelOn(channelTopic, 'server.new_message', (message: IMessage) => {
  message.created_at = dateFormatWithFormat(message.created_at)

  const itemType =
    message.username === userStore.username
      ? ChatListItemType.MessageSent
      : ChatListItemType.MessageReceived

  roomStore.unshiftListItems({ type: itemType, meta: message })
})

setupChannelPresenceCallbacks(channelTopic)

channel
  .join()
  .receive('ok', (resp: any): void => {
    roomStore.setRoomName(`#${roomId}`)
    document.title = `Room #${roomId}`
    console.log('Joined successfully', resp)
  })
  .receive('error', (resp: any): void => {
    // TODO: handle failure
    console.log('Unable to join', resp)
  })

onUnmounted(() => {
  socketConnection.deleteChannel(channelTopic)
})

const onSubmit = () => {
  channel.push('client.new_message', { body: message.value })
  message.value = ''
}
</script>

<template>
  <div class="chat-room-main-container d-flex flex-column" style="height: 100vh">
    <ChatHeader />
    <ChatList :items="roomStore.listItems" />
    <form @submit.prevent="onSubmit" autocomplete="off">
      <div class="input-group mb-3 px-3">
        <input
          id="msg_field"
          type="text"
          class="form-control"
          placeholder="Message"
          v-model="message"
          aria-describedby="send_msg_button"
          required
        />
        <button id="send_msg_button" class="btn btn-primary" type="submit">Send</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.chat-room-main-container {
  background: #f7f9fa;
}
</style>

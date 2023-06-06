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

const message = ref('')
const route = useRoute()

const roomId = route.params.roomId
const channelTopic = `room:${roomId}`
const channel = socketConnection.getOrCreateChannel(channelTopic)

//--------------\

const typingTimeout = 2000
var typingTimer: number | undefined
let isUserTyping = false

const userStartsTyping = function () {
  if (isUserTyping) {
    return
  }

  isUserTyping = true
  channel.push('user:typing', { typing: true })
}

const userStopsTyping = function () {
  clearTimeout(typingTimer)
  isUserTyping = false
  channel.push('user:typing', { typing: false })
}

const onKeyUp = () => {
  clearTimeout(typingTimer)
  typingTimer = setTimeout(userStopsTyping, typingTimeout)
}

const onKeyDown = () => {
  console.log('onKeyDown')
  userStartsTyping()
  clearTimeout(typingTimer)
}

//---------------

setupRoomChannelCallbacks(channelTopic)

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
  userStopsTyping()
  channel.push('client.new_message', { body: message.value })
  message.value = ''
}
</script>

<template>
  <div class="chat-room-main-container d-flex flex-column" style="height: 100vh">
    <ChatHeader />
    <ChatList :items="roomStore.listItems" />
    <TypingIndicator />
    <form @submit.prevent="onSubmit" autocomplete="off">
      <div class="input-group mb-3 px-3">
        <input
          id="msg_field"
          type="text"
          class="form-control"
          placeholder="Message"
          v-model="message"
          aria-describedby="send_msg_button"
          @keydown="onKeyDown"
          @keyup="onKeyUp"
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

<script setup lang="ts">
import { ref } from 'vue'
import { roomStore } from '@/stores/room'
import { socketConnection } from '@/api'

const message = ref('')
const channel = socketConnection.getOrCreateChannel(roomStore.roomTopic)

const typingTimeout = 2000
let typingTimer = setTimeout(() => {})
let isUserTyping = false

const userStartsTyping = () => {
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
  userStartsTyping()
  clearTimeout(typingTimer)
}

const onSubmit = () => {
  userStopsTyping()
  channel.push('message.create', { body: message.value })
  message.value = ''
}
</script>

<template>
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
</template>

<style scoped></style>

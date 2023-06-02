<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { socketConnection } from '../api'
import { useRoute } from 'vue-router'
import type { IMessage } from '@/models'
import ChatMessage from '@/components/chat-room/ChatMessage.vue'

const message = ref('')
const messages = ref([] as IMessage[])

const route = useRoute()
const roomId = route.params.roomId
const channelName = `room:${roomId}`
const channel = socketConnection.getOrCreateChannel(channelName)

channel.on('server.new_message', (message: IMessage) => {
  messages.value.unshift(message)
})

channel
  .join()
  .receive('ok', (resp: any): void => {
    console.log('Joined successfully', resp)
  })
  .receive('error', (resp: any): void => {
    // TODO: handle failure
    console.log('Unable to join', resp)
  })

onUnmounted(() => {
  socketConnection.deleteChannel(channelName)
})

const onSubmit = () => {
  channel.push('client.new_message', { body: message.value })
  message.value = ''
}
</script>

<template>
  <div class="chat-room-main-container container d-flex flex-column" style="height: 100vh">
    <div id="message_list" class="msg_history d-flex flex-column-reverse">
      <ChatMessage v-for="(msg, index) in messages" v-bind:key="index" :message="msg" />
    </div>
    <form @submit.prevent="onSubmit">
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
.msg_history {
  height: 100%;
  overflow-y: auto;
}
</style>
